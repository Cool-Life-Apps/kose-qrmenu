
'use client';

import { useParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Spinner from '@/app/components/Spinner';
import { Playfair_Display, Bebas_Neue } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], weight: ["400", "500", "600"] });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ["400"] });

export default function ProductDetailPage() {
  const { business, categoryId, itemIndex } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (business && categoryId && itemIndex !== undefined) {
        setLoading(true);
        try {
          const categoryRef = doc(db, `menus/${business}/categories`, categoryId as string);
          const categorySnap = await getDoc(categoryRef);

          if (categorySnap.exists()) {
            const categoryData = categorySnap.data();
            const items = categoryData.items || [];
            if (itemIndex !== undefined && items[parseInt(itemIndex as string)]) {
              setItem(items[parseInt(itemIndex as string)]);
            } else {
              console.error("Item not found at index:", itemIndex);
            }
          } else {
            console.error("Category not found:", categoryId);
          }
        } catch (error) {
          console.error("Error fetching item:", error);
        }
        setLoading(false);
      }
    };

    fetchItem();
  }, [business, categoryId, itemIndex]);

  if (loading) {
    return <Spinner />;
  }

  if (!item) {
    return <div className="text-center py-8">Ürün bulunamadı.</div>;
  }

  const isPastane = business === 'pastane';
  const mainBg = isPastane ? 'bg-[#5a232b]/95' : 'bg-[#18181b]/95';
  const headerText = 'text-[#fff0f3]';
  const headerFont = isPastane ? playfair.className : bebas.className;
  const cardBg = isPastane ? 'bg-[#fff0f3]' : 'bg-[#232323]';
  const cardText = isPastane ? 'text-[#5a232b]' : 'text-gray-100';
  const priceColor = isPastane ? 'text-[#a97b7b]' : 'text-orange-400';
  const backBtnBg = isPastane ? 'bg-[#fff0f3] hover:bg-[#f8d7dd]' : 'bg-[#232323] hover:bg-[#333]';
  const backBtnIcon = isPastane ? '#5a232b' : '#F97316';

  return (
    <div className={`${mainBg} min-h-screen w-full md:max-w-md md:mx-auto md:shadow-lg md:rounded-xl overflow-hidden relative`}>
      {/* Sol üstte ok butonu */}
      <button
        onClick={() => router.back()}
        className={`absolute top-4 left-4 z-10 p-2 rounded-full shadow transition-colors ${backBtnBg}`}
        aria-label="Geri"
      >
        <svg width="24" height="24" fill="none" stroke={backBtnIcon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="relative w-full" style={{ aspectRatio: '1 / 1', maxWidth: '100vw' }}>
        {item.imageUrl && (
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill
            style={{ objectFit: 'cover' }}
            className="!rounded-none w-full h-full"
            sizes="100vw"
            priority
          />
        )}
      </div>
      <div className={`p-6 ${cardBg} ${cardText}`}>
        <div className="flex items-center justify-between mb-2">
          <h1 className={`text-3xl font-bold ${headerFont} text-black`}>{item.name}</h1>
          <span className="text-2xl font-normal text-black">₺{item.price}</span>
        </div>
        {isPastane && (typeof item.glutenFree !== 'undefined') && (
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${item.glutenFree ? 'bg-green-200 text-green-800 border border-green-400' : 'bg-red-200 text-red-800 border border-red-400'}`}>{item.glutenFree ? 'Glutensiz' : 'Glutenli'}</span>
        )}
        <p className="mb-4 text-base opacity-90">{item.description}</p>
      </div>
    </div>
  );
}