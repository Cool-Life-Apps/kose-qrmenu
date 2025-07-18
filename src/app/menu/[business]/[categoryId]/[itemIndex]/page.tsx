
'use client';

import { useParams, useRouter } from 'next/navigation';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Image from 'next/image';

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
    return <div className="text-center py-8">Yükleniyor...</div>;
  }

  if (!item) {
    return <div className="text-center py-8">Ürün bulunamadı.</div>;
  }

  return (
    <div className="bg-white min-h-screen max-w-md mx-auto shadow-lg rounded-xl overflow-hidden">
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
        <button
          onClick={() => router.back()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Geri
        </button>
      </div>
    </div>
  );
}
