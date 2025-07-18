
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import Spinner from '@/app/components/Spinner';

export default function MenuPage() {
  const { business } = useParams();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const categoryRefs = useRef<any>({});
  const tabListRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');

  const handleTabClick = (id: string, idx: number) => {
    setActiveCategory(idx);
    const ref = categoryRefs.current[id];
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Scroll ile aktif kategori güncelleme
  useEffect(() => {
    const handleScroll = () => {
      const entries = Object.entries(categoryRefs.current);
      for (let i = 0; i < entries.length; i++) {
        const [key, el] = entries[i];
        if (el && typeof (el as HTMLElement).getBoundingClientRect === 'function') {
          const rect = (el as HTMLElement).getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom > 120) {
            setActiveCategory(i);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  useEffect(() => {
    const fetchMenu = async () => {
      if (business) {
        setLoading(true);
        const categoriesCollection = collection(db, `menus/${business}/categories`);
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenu({ name: `${business.toString().charAt(0).toUpperCase() + business.toString().slice(1)} Menu`, categories: categoriesList });
        setLoading(false);
      }
    };
    fetchMenu();
  }, [business]);

  if (loading) {
    return <Spinner />;
  }

  if (!menu) {
    return <div>Menü bulunamadı</div>;
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto shadow-lg rounded-xl overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-black text-4xl tracking-tight">Köse QR Menu</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-black">TR</span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-400">EN</span>
        </div>
      </div>
      {/* Search */}
      <div className="px-4 pb-2">
        <div className="flex items-center bg-gray-100 rounded-full px-3 py-2">
          <FiSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Ara"
            className="bg-transparent outline-none flex-1 text-sm"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <div className="text-xs text-gray-500 mt-1 ml-2">Arama: <span className="font-semibold text-black">{search}</span></div>
        )}
      </div>
      {/* Kategoriler */}
      <div className="flex gap-4 px-4 pt-2 pb-4" ref={tabListRef}>
        {menu.categories.map((category: any, idx: number) => (
          <button
            key={category.id}
            className={`flex-1 text-center pb-1 font-semibold text-base border-b-2 transition-colors ${activeCategory === idx ? 'text-orange-600 border-orange-600' : 'text-gray-700 border-transparent'}`}
            onClick={() => handleTabClick(category.id, idx)}
          >
            {category.name}
          </button>
        ))}
      </div>
      {/* İçerik */}
      <div className="bg-white px-4 pb-8">
        {menu.categories.map((category: any, idx: number) => {
          const filteredItems = category.items.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
          );
          if (filteredItems.length === 0) return null;
          return (
            <div key={category.id} className="mb-8" ref={el => { categoryRefs.current[category.id] = el; }}>
              <h2 className="text-2xl font-bold text-center mb-6 mt-4">{category.name}</h2>
              <div className="flex flex-col gap-4">
                {filteredItems.map((item: any, index: number) => (
                  <Link href={`/menu/${business}/${category.id}/${index}`} key={item.name} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 shadow-sm border border-gray-100">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{item.name} <span className="text-orange-500">*</span></h3>
                      </div>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">{item.description}</p>
                      <p className="text-base font-semibold mt-2">{item.price} ₺</p>
                    </div>
                    {item.imageUrl && (
                      <div className="ml-4 w-20 h-20 relative rounded-lg overflow-hidden border border-gray-200">
                        <Image src={item.imageUrl} alt={item.name} fill style={{objectFit:'cover'}} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {/* Dekoratif yıldız */}
      <div className="absolute right-2 top-1/3 text-orange-300 text-7xl select-none pointer-events-none rotate-12" style={{zIndex:0}}>*</div>
    </div>
  );
}
