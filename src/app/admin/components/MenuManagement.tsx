
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';

export default function MenuManagement() {
  const [menu, setMenu] = useState('pastane');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', imageUrl: '' });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const categoriesCollection = collection(db, `menus/${menu}/categories`);
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(categoriesList);
    setLoading(false);
  }, [menu]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = newCategory.trim();
    if (!categoryName) {
      alert('Lütfen bir kategori adı girin.');
      return;
    }

    try {
      await addDoc(collection(db, `menus/${menu}/categories`), { name: categoryName, items: [] });
      setNewCategory('');
      fetchCategories();
    } catch (error) {
      console.error("Error adding category: ", error);
      alert('Kategori eklenemedi. Detaylar için konsola bakın.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteDoc(doc(db, `menus/${menu}/categories`, categoryId));
    fetchCategories();
  };

  const handleAddItem = async (categoryId: string) => {
    if (!newItem.name.trim() || !newItem.price.trim()) return;
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    await updateDoc(categoryRef, {
      items: arrayUnion({ ...newItem, price: `${newItem.price}` })
    });
    setNewItem({ name: '', description: '', price: '', imageUrl: '' });
    fetchCategories();
  };

  const handleDeleteItem = async (categoryId: string, item: any) => {
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    await updateDoc(categoryRef, {
      items: arrayRemove(item)
    });
    fetchCategories();
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setNewItem({ ...newItem, price: value });
    }
  };

  if (loading) {
    return <div>Menü yükleniyor...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <label htmlFor="menu-select" className="block text-sm font-medium text-gray-700 mb-2">Menü Seç:</label>
        <select id="menu-select" value={menu} onChange={(e) => setMenu(e.target.value)} className="p-2 border rounded-md w-full">
          <option value="pastane">Pastane</option>
          <option value="kuafor">Kuaför</option>
        </select>
      </div>

      <div className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Yeni Kategori Ekle</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Kategori Adı"
            className="p-2 border rounded-md flex-grow"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Kategori Ekle</button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Kategorileri Yönet</h2>
        {categories.map(category => (
          <div key={category.id} className="p-4 border rounded-lg mb-6 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <button onClick={() => handleDeleteCategory(category.id)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Sil</button>
            </div>
            
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Yeni Ürün Ekle</h4>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Adı" className="p-2 border rounded-md flex-grow" />
                <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} placeholder="Açıklama" className="p-2 border rounded-md flex-grow" />
                <input type="text" value={newItem.price} onChange={handlePriceChange} placeholder="Fiyat" className="p-2 border rounded-md flex-grow" />
                <input type="text" value={newItem.imageUrl} onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})} placeholder="Resim URL'si" className="p-2 border rounded-md flex-grow" />
              </div>
              <button onClick={() => handleAddItem(category.id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">Ürün Ekle</button>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">Ürünler</h4>
              {category.items && category.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 border-b">
                  <div>
                    <p className="font-semibold">{item.name} - <span className="font-normal">{item.price} TL</span></p>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mt-2" />}
                  </div>
                  <button onClick={() => handleDeleteItem(category.id, item)} className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600">Sil</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

