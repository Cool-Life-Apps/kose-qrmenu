
'use client';

import { useParams } from 'next/navigation';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function MenuPage() {
  const { business } = useParams();
  const [menu, setMenu] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
    return <div>Loading...</div>;
  }

  if (!menu) {
    return <div>Menu not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{menu.name}</h1>
      <div>
        {menu.categories.map((category: any) => (
          <div key={category.id} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item: any) => (
                <div key={item.name} className="border rounded-lg p-4">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-600">{item.description}</p>
                  <p className="text-lg font-semibold mt-2">{item.price}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
