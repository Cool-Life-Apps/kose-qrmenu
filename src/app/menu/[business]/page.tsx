
'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Spinner from '@/app/components/Spinner';
import { Playfair_Display, Bebas_Neue } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], weight: ["400", "500", "600"] });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ["400"] });

export default function MenuPage() {
  const { business } = useParams();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const categoryRefs = useRef<any>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const categoryWidth = 96 + 16; // w-24 (96px) + gap-4 (16px)
      const scrollAmount = direction === 'left' ? -categoryWidth : categoryWidth;
      const newScrollLeft = container.scrollLeft + scrollAmount;

      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };
  const [search, setSearch] = useState('');

  const handleTabClick = (id: string) => {
    setActiveCategory(id);
  };

  

  useEffect(() => {
    const fetchMenu = async () => {
      if (business) {
        setLoading(true);
        const categoriesCollection = collection(db, `menus/${business}/categories`);
        const categoriesSnapshot = await getDocs(categoriesCollection);
        const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMenu({ name: `${business.toString().charAt(0).toUpperCase() + business.toString().slice(1)} Menu`, categories: categoriesList });
        if (categoriesList.length > 0) {
          setActiveCategory(categoriesList[0].id);
        }
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

  // Renk ve font ayarları
  const isPastane = business === 'pastane';
  const mainBg = isPastane ? 'bg-[#5a232b]/95' : 'bg-[#18181b]/95';
  const headerText = 'text-[#fff0f3]';
  const headerFont = isPastane ? playfair.className : bebas.className;
  const tabActive = isPastane ? 'text-[#a97b7b] border-[#a97b7b]' : 'text-gray-200 border-gray-400';
  const tabInactive = isPastane ? 'text-gray-300 border-transparent' : 'text-gray-500 border-transparent';
  const cardBg = isPastane ? 'bg-[#fff0f3]' : 'bg-[#232323]';
  const cardText = isPastane ? 'text-[#5a232b]' : 'text-gray-100';

  return (
    <div className={`${mainBg} min-h-screen w-full md:max-w-md md:mx-auto md:shadow-lg md:rounded-xl overflow-hidden relative`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <span className={`${headerFont} ${headerText} text-3xl font-bold tracking-tight`}>{isPastane ? 'Curlique Eatery Menü' : (<span className="flex flex-col leading-tight"><span className="text-2xl font-extrabold tracking-widest">RAMAZAN</span><span className="text-xl font-semibold tracking-wider">KARAHAN</span><span className="text-base font-normal tracking-wide">Kuaför Menü</span></span>)}</span>
        </div>
      </div>
      {/* Search */}
      <div className="px-4 pb-2">
        <div className={`flex items-center ${isPastane ? 'bg-[#fff0f3]' : 'bg-[#232323]'} rounded-full px-3 py-2`}>
          <FiSearch className={isPastane ? 'text-[#a97b7b] mr-2' : 'text-gray-400 mr-2'} />
          <input
            type="text"
            placeholder="Ara"
            className={`bg-transparent outline-none flex-1 text-sm ${cardText}`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>
      {/* Kategoriler */}
      <div className="relative flex items-center">
        <button onClick={() => handleScroll('left')} className="absolute left-2 z-10 p-2 bg-white text-black rounded-full shadow-md top-1/2 -translate-y-1/2"><FiChevronLeft /></button>
        <div ref={scrollContainerRef} className="flex gap-4 px-4 pt-2 pb-4 overflow-x-auto scroll-smooth scrollbar-hide whitespace-nowrap">
          {menu.categories.map((category: any) => (
            <button
              key={category.id}
              ref={el => { categoryRefs.current[category.id] = el; }}
              className={`flex-shrink-0 flex flex-col items-center gap-2 text-center pb-1 font-semibold text-base transition-colors ${activeCategory === category.id ? 'text-white' : 'text-gray-400'}`}
              onClick={() => handleTabClick(category.id)}
            >
              {category.imageUrl && (
                <div className={`w-29 h-29 relative rounded-lg overflow-hidden border-2 ${activeCategory === category.id ? 'border-white' : 'border-transparent'}`}>
                  <Image src={category.imageUrl} alt={category.name} fill style={{objectFit:'cover'}} />
                </div>
              )}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
        <button onClick={() => handleScroll('right')} className="absolute right-2 z-10 p-2 bg-white text-black rounded-full shadow-md top-1/2 -translate-y-1/2"><FiChevronRight /></button>
      </div>
      {/* İçerik */}
      <div className="px-4 pb-8">
        {menu.categories.filter((category: any) => category.id === activeCategory).map((category: any, idx: number) => {
          const filteredItems = category.items.filter((item: any) =>
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase())
          );
          if (filteredItems.length === 0 && search.trim() === '') {
            return (
              <div key={category.id} className="text-center py-8">
                <p className={`${cardText}`}>Bu kategoride henüz ürün bulunmamaktadır.</p>
              </div>
            );
          }
          return (
            <div key={category.id} className="mb-8" ref={el => { categoryRefs.current[category.id] = el; }}>
              <h2 className={`text-2xl font-bold text-center mb-6 mt-4 ${headerFont} ${headerText}`}>{category.name}</h2>
              <div className="flex flex-col gap-4">
                {filteredItems.map((item: any, index: number) => (
                  <Link href={`/menu/${business}/${category.id}/${index}`} key={item.name} className={`flex items-center justify-between ${cardBg} ${cardText} rounded-lg p-3 shadow-sm border border-gray-100`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{item.name} <span className={isPastane ? 'text-[#a97b7b]' : 'text-orange-500'}>*</span></h3>
                      </div>
                      <p className="text-sm mt-1 line-clamp-2">{item.description}</p>
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
    </div>
  );
}
