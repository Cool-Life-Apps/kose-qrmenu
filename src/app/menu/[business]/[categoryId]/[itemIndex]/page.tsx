
'use client';

import { useParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Spinner from '@/app/components/Spinner';

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

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto shadow-lg rounded-xl overflow-hidden relative">
      {/* Sol üstte ok butonu */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white shadow hover:bg-gray-100"
        aria-label="Geri"
      >
        <svg width="24" height="24" fill="none" stroke="#F97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <div className="relative h-64 w-full">
        {item.imageUrl && (
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            fill 
            style={{objectFit:'cover'}} 
            className="rounded-t-xl"
          />
        )}
      </div>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
        <p className="text-gray-600 mb-4">{item.description}</p>
        <p className="text-2xl font-semibold text-orange-600 mb-6">{item.price} ₺</p>
        {/* Eski geri butonu kaldırıldı */}
      </div>
    </div>
  );
}
