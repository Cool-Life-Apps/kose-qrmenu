
'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

export default function MenuManagement() {
  const [menu, setMenu] = useState('pastane');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const categoriesCollection = collection(db, `menus/${menu}/categories`);
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(categoriesList);
      setLoading(false);
    };

    fetchCategories();
  }, [menu]);

  const addCategory = async (categoryName: string) => {
    await addDoc(collection(db, `menus/${menu}/categories`), { name: categoryName, items: [] });
    // Refresh categories
  };

  // Add functions for updating, deleting categories and items

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="menu-select" className="mr-2">Select Menu:</label>
        <select id="menu-select" value={menu} onChange={(e) => setMenu(e.target.value)} className="p-2 border rounded">
          <option value="pastane">Pastane</option>
          <option value="kuafor">Kuaför</option>
        </select>
      </div>

      {/* UI for adding/editing categories and items */}
      <div>
        {categories.map(category => (
          <div key={category.id} className="p-4 border rounded mb-4">
            <h3 className="text-xl font-bold">{category.name}</h3>
            {/* Item management UI */}
          </div>
        ))}
      </div>
    </div>
  );
}
