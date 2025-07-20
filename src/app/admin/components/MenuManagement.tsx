
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import AdminSpinner from '@/app/components/AdminSpinner';
import { Montserrat } from 'next/font/google';
import { v4 as uuidv4 } from 'uuid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/solid';
const montserrat = Montserrat({ subsets: ['latin'], weight: ["400", "500", "600"] });

export default function MenuManagement() {
  const [menu, setMenu] = useState('pastane');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', imageUrl: '' });
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', imageUrl: '', glutenFree: false, subcategory: '' });
  const [editIndex, setEditIndex] = useState<{[key: string]: number | null}>({});
  const [editItem, setEditItem] = useState<any>({});
  const [imageUploading, setImageUploading] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});
  const [newSubcategory, setNewSubcategory] = useState('');
  const [editingSubcategories, setEditingSubcategories] = useState<{[key: string]: boolean}>({});
  const showSnackbar = (message: string) => {
    setSnackbar({open: true, message});
    setTimeout(() => setSnackbar({open: false, message: ''}), 2500);
  };
  const [editCategory, setEditCategory] = useState<{id: string, name: string, imageUrl?: string} | null>(null);
  const [categoryImageUploading, setCategoryImageUploading] = useState(false);
  const handleEditCategory = (cat: any) => setEditCategory({ id: cat.id, name: cat.name, imageUrl: cat.imageUrl });
  const handleCancelEditCategory = () => setEditCategory(null);
  const handleSaveCategory = async () => {
    if (!editCategory) return;
    if (!editCategory.name.trim()) {
      showSnackbar('Kategori ismi boş olamaz');
      return;
    }
    if (!editCategory.imageUrl) {
      showSnackbar('Kategoriye görsel eklemelisin');
      return;
    }
    const categoryRef = doc(db, `menus/${menu}/categories`, editCategory.id);
    await updateDoc(categoryRef, { name: editCategory.name, imageUrl: editCategory.imageUrl });
    setCategories(prev => prev.map(cat => cat.id === editCategory.id ? { ...cat, name: editCategory.name, imageUrl: editCategory.imageUrl } : cat));
    setEditCategory(null);
    showSnackbar('Kategori başarıyla güncellendi');
  };
  const handleCategoryImageUpload = async (file: File) => {
    setCategoryImageUploading(true);
    const url = await uploadImageToImgbb(file);
    setEditCategory(prev => prev ? { ...prev, imageUrl: url } : prev);
    setCategoryImageUploading(false);
  };

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const categoriesCollection = collection(db, `menus/${menu}/categories`);
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesList = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Sıralamaya göre sırala
    categoriesList.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    setCategories(categoriesList);
    setLoading(false);
  }, [menu]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const categoryName = newCategory.name.trim();
    if (!categoryName) {
      alert('Lütfen bir kategori adı girin.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, `menus/${menu}/categories`), { 
        name: categoryName, 
        imageUrl: newCategory.imageUrl, 
        items: [],
        subcategories: []
      });
      setCategories(prev => [...prev, { id: docRef.id, name: categoryName, imageUrl: newCategory.imageUrl, items: [], subcategories: [] }]);
      setNewCategory({ name: '', imageUrl: '' });
      showSnackbar('Kategori başarıyla eklendi');
    } catch (error) {
      console.error("Error adding category: ", error);
      alert('Kategori eklenemedi. Detaylar için konsola bakın.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    await deleteDoc(doc(db, `menus/${menu}/categories`, categoryId));
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    showSnackbar('Kategori başarıyla silindi');
  };

  const handleAddItem = async (categoryId: string) => {
    if (!newItem.name.trim() || !newItem.price.trim()) return;
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    
    // Undefined değerleri temizle
    const cleanNewItem: any = {
      name: newItem.name.trim(),
      description: newItem.description.trim() || '',
      price: newItem.price.trim(),
      imageUrl: newItem.imageUrl.trim() || '',
      subcategory: newItem.subcategory.trim() || '',
      id: uuidv4()
    };
    
    // Sadece pastane menüsü için glutenFree ekle
    if (menu === 'pastane') {
      cleanNewItem.glutenFree = !!newItem.glutenFree;
    }
    
    const newProduct = cleanNewItem;
    await updateDoc(categoryRef, {
      items: arrayUnion(newProduct)
    });
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: [...(cat.items || []), newProduct] } : cat));
    setNewItem({ name: '', description: '', price: '', imageUrl: '', glutenFree: false, subcategory: '' });
    showSnackbar('Ürün başarıyla eklendi');
  };

  const handleDeleteItem = async (categoryId: string, item: any) => {
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    await updateDoc(categoryRef, {
      items: arrayRemove(item)
    });
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: (cat.items || []).filter((it: any) => it.id ? it.id !== item.id : it !== item) } : cat));
    showSnackbar('Ürün başarıyla silindi');
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!newSubcategory.trim()) {
      showSnackbar('Alt kategori adı boş olamaz');
      return;
    }
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    await updateDoc(categoryRef, {
      subcategories: arrayUnion(newSubcategory.trim())
    });
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory.trim()] }
        : cat
    ));
    setNewSubcategory('');
    showSnackbar('Alt kategori başarıyla eklendi');
  };

  const handleDeleteSubcategory = async (categoryId: string, subcategoryName: string) => {
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    await updateDoc(categoryRef, {
      subcategories: arrayRemove(subcategoryName)
    });
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, subcategories: (cat.subcategories || []).filter((sub: string) => sub !== subcategoryName) }
        : cat
    ));
    showSnackbar('Alt kategori başarıyla silindi');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers
    if (/^\d*$/.test(value)) {
      setNewItem({ ...newItem, price: value });
    }
  };

  const handleEditClick = (categoryId: string, item: any, index: number) => {
    setEditIndex(prev => ({ ...prev, [categoryId]: index }));
    setEditItem(item);
  };
  const handleEditCancel = (categoryId: string) => {
    setEditIndex(prev => ({ ...prev, [categoryId]: null }));
    setEditItem({});
  };
  const handleEditSave = async (categoryId: string, oldItem: any) => {
    const categoryRef = doc(db, `menus/${menu}/categories`, categoryId);
    const categorySnap = await getDocs(collection(db, `menus/${menu}/categories`));
    const categoryDoc = categorySnap.docs.find(doc => doc.id === categoryId);
    if (!categoryDoc) return;
    const items = categoryDoc.data().items || [];
    const updatedItems = items.map((it: any) => {
      if (it.id && editItem.id && it.id === editItem.id) return editItem;
      if (!it.id && !editItem.id && it.name === oldItem.name && it.description === oldItem.description && it.price === oldItem.price && it.imageUrl === oldItem.imageUrl) return editItem;
      return it;
    });
    await updateDoc(categoryRef, { items: updatedItems });
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, items: updatedItems } : cat));
    setEditIndex(prev => ({ ...prev, [categoryId]: null }));
    setEditItem({});
    showSnackbar('Ürün başarıyla güncellendi');
  };

  // imgbb upload fonksiyonu
  const uploadImageToImgbb = async (file: File) => {
    setImageUploading(true);
    const apiKey = '7a85dfdeeca2ee010b05790adcca973d';
    const formData = new FormData();
    formData.append('image', file);
    formData.append('album', 'Wg106N');
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    setImageUploading(false);
    if (data.success) return data.data.url;
    else throw new Error('Görsel yüklenemedi');
  };

  if (loading) {
    return <AdminSpinner />;
  }

  return (
    <div className={`${montserrat.className} w-full flex flex-col gap-8`}>
      <div className="mb-6">
        <label htmlFor="menu-select" className="block text-sm font-medium text-gray-700 mb-2">Menü Seç:</label>
        <select id="menu-select" value={menu} onChange={(e) => setMenu(e.target.value)} className="p-2 rounded-md w-full max-w-xs font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300">
          <option value="pastane">Curlique Eatery</option>
          <option value="kuafor">Ramazan Karahan Kuaför</option>
        </select>
      </div>

      {/* Yeni Kategori Ekle kartı */}
      <div className="mb-8 p-4 rounded-2xl bg-gray-50 shadow flex flex-col gap-4">
        <h2 className="text-xl font-semibold mb-2">Yeni Kategori Ekle</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row gap-4 w-full">
          <input
            type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            placeholder="Kategori Adı"
              className="p-2 rounded-md flex-grow w-full md:w-auto font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300 focus:ring-offset-2"
            />
            <div className="flex items-center gap-4">
              <label className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                <span className="text-2xl text-gray-400">+</span>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      const url = await uploadImageToImgbb(e.target.files[0]);
                      setNewCategory({ ...newCategory, imageUrl: url });
                    } catch (err) {
                      alert('Görsel yüklenemedi');
                    }
                  }
                }} className="hidden" />
              </label>
              {newCategory.imageUrl && (
                <img src={newCategory.imageUrl} alt="Kategori görseli" className="w-20 h-20 object-cover rounded-lg shadow border border-gray-300" />
              )}
              {imageUploading && <div className="text-xs text-blue-500">Yükleniyor...</div>}
            </div>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full md:w-auto">Kategori Ekle</button>
        </form>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Kategorileri Yönet</h2>
        {categories.map(category => (
          <div key={category.id} className="p-4 rounded-2xl mb-6 bg-gray-50 shadow flex flex-col gap-4">
            {/* Kategori başlığı ve edit/sil ikonları */}
            <div className="flex items-center justify-between mb-4 gap-2">
              {editCategory && editCategory.id === category.id ? (
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <input type="text" value={editCategory.name} onChange={e => setEditCategory({...editCategory, name: e.target.value})} className="p-2 rounded-md font-normal tracking-wide text-gray-700 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2" />
                  <label className="flex flex-col items-center justify-center w-10 h-10 bg-gray-100 rounded border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                    {editCategory.imageUrl ? (
                      <img src={editCategory.imageUrl} alt="Kategori görseli" className="w-10 h-10 object-cover rounded" />
                    ) : (
                      <span className="text-xl text-gray-400">+</span>
                    )}
                    <input type="file" accept="image/*" onChange={async (e) => { if (e.target.files && e.target.files[0]) await handleCategoryImageUpload(e.target.files[0]); }} className="hidden" />
                  </label>
                  {categoryImageUploading && <span className="text-xs text-blue-500">Yükleniyor...</span>}
                  <button onClick={handleSaveCategory} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 w-full sm:w-auto mt-2 sm:mt-0">Kaydet</button>
                  <button onClick={handleCancelEditCategory} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400 w-full sm:w-auto mt-2 sm:mt-0">İptal</button>
                </div>
              ) : (
                <>
                  <span className="text-xl font-bold break-words flex items-center gap-2">
                    {category.imageUrl && <img src={category.imageUrl} alt="Kategori görseli" className="w-10 h-10 object-cover rounded border border-gray-300" />}
                    {category.name}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEditCategory(category)} className="group bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-full transition flex items-center justify-center" title="Düzenle">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="group bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition flex items-center justify-center" title="Sil">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
            
            {/* Alt Kategori Yönetimi */}
            <div className="flex flex-col gap-4 overflow-x-auto">
              <h4 className="text-lg font-semibold mb-2">Alt Kategoriler</h4>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder="Alt kategori adı"
                  className="p-2 rounded-md flex-grow font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300"
                />
                <button
                  onClick={() => handleAddSubcategory(category.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Ekle
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {(category.subcategories || []).map((subcategory: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium">{subcategory}</span>
                    <button
                      onClick={() => handleDeleteSubcategory(category.id, subcategory)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 overflow-x-auto">
              <h4 className="text-lg font-semibold mb-2">Yeni Ürün Ekle</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0 overflow-x-auto">
                <input type="text" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} placeholder="Adı" className="p-2 rounded-lg min-w-0 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
                <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} placeholder="Açıklama" className="p-2 rounded-lg min-w-0 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
                <div className="flex items-center bg-gray-50 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-purple-200 focus-within:ring-offset-2 min-w-0 w-full border border-gray-300">
                  <span className="pl-3 pr-1 text-gray-400 text-lg">₺</span>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value.replace(/[^\d]/g, '')})} placeholder="Fiyat" className="p-2 bg-transparent outline-none w-full min-w-0 font-normal tracking-wide text-gray-700 placeholder:text-gray-400" />
                  <button type="button" className="px-2 text-gray-400 hover:text-green-600 text-lg" onClick={() => setNewItem({...newItem, price: String(Number(newItem.price || 0) + 1)})}>+</button>
                  <button type="button" className="px-2 text-gray-400 hover:text-red-600 text-lg" onClick={() => setNewItem({...newItem, price: String(Math.max(0, Number(newItem.price || 0) - 1))})}>-</button>
                </div>
              </div>
              {menu === 'pastane' && (
                <select value={newItem.glutenFree ? 'glutensiz' : 'glutenli'} onChange={e => setNewItem({...newItem, glutenFree: e.target.value === 'glutensiz'})} className="p-2 rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 border border-gray-300">
                  <option value="glutenli">Glutenli</option>
                  <option value="glutensiz">Glutensiz</option>
                </select>
              )}
              <select 
                value={newItem.subcategory} 
                onChange={e => setNewItem({...newItem, subcategory: e.target.value})} 
                className="p-2 rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 border border-gray-300"
              >
                <option value="">Alt kategori seçin</option>
                {(category.subcategories || []).map((subcategory: string, index: number) => (
                  <option key={index} value={subcategory}>{subcategory}</option>
                ))}
              </select>
              <div className="flex flex-col items-start gap-2">
                <label className="text-xs text-gray-500">Ürün Görseli</label>
                <div className="w-full flex items-center gap-4">
                  <label className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                    <span className="text-2xl text-gray-400">+</span>
                    <input type="file" accept="image/*" onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        try {
                          const url = await uploadImageToImgbb(e.target.files[0]);
                          setNewItem({...newItem, imageUrl: url});
                        } catch (err) {
                          alert('Görsel yüklenemedi');
                        }
                      }
                    }} className="hidden" />
                  </label>
                  {newItem.imageUrl && (
                    <img src={newItem.imageUrl} alt="Ürün görseli" className="w-20 h-20 object-cover rounded-lg shadow border border-gray-300" />
                  )}
                  {imageUploading && <div className="text-xs text-blue-500">Yükleniyor...</div>}
                </div>
              </div>
              <input type="text" value={newItem.imageUrl} onChange={(e) => setNewItem({...newItem, imageUrl: e.target.value})} placeholder="Resim URL'si" className="p-2 rounded-lg min-w-0 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
              <button onClick={() => handleAddItem(category.id)} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 w-full md:w-auto">Ürün Ekle</button>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Ürünler</h4>
              {category.items && category.items
                .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                .map((item: any, index: number) => (
                <div key={index} className="flex flex-col md:flex-row justify-between items-start md:items-center p-2 gap-2 mb-4">
                  {editIndex[category.id] === index ? (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full min-w-0 overflow-x-auto">
                        <input type="text" value={editItem.name || ''} onChange={e => setEditItem({...editItem, name: e.target.value})} placeholder="Adı" className="p-2 rounded-lg min-w-0 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
                        <input type="text" value={editItem.description || ''} onChange={e => setEditItem({...editItem, description: e.target.value})} placeholder="Açıklama" className="p-2 rounded-lg min-w-0 w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
                        <div className="flex items-center bg-gray-50 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-purple-200 focus-within:ring-offset-2 min-w-0 w-full border border-gray-300">
                          <span className="pl-3 pr-1 text-gray-400 text-lg">₺</span>
                          <input type="text" inputMode="numeric" pattern="[0-9]*" value={editItem.price || ''} onChange={e => setEditItem({...editItem, price: e.target.value.replace(/[^\d]/g, '')})} placeholder="Fiyat" className="p-2 bg-transparent outline-none w-full min-w-0 font-normal tracking-wide text-gray-700 placeholder:text-gray-400" />
                          <button type="button" className="px-2 text-gray-400 hover:text-green-600 text-lg" onClick={() => setEditItem({...editItem, price: String(Number(editItem.price || 0) + 1)})}>+</button>
                          <button type="button" className="px-2 text-gray-400 hover:text-red-600 text-lg" onClick={() => setEditItem({...editItem, price: String(Math.max(0, Number(editItem.price || 0) - 1))})}>-</button>
                        </div>
                      </div>
                      {menu === 'pastane' && (
                                        <select value={editItem.glutenFree ? 'glutensiz' : 'glutenli'} onChange={e => setEditItem({...editItem, glutenFree: e.target.value === 'glutensiz'})} className="p-2 rounded-lg w-full mb-0 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 border border-gray-300">
                          <option value="glutenli">Glutenli</option>
                          <option value="glutensiz">Glutensiz</option>
                        </select>
                      )}
                      <select 
                        value={editItem.subcategory || ''} 
                        onChange={e => setEditItem({...editItem, subcategory: e.target.value})} 
                        className="p-2 rounded-lg w-full bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 border border-gray-300"
                      >
                        <option value="">Alt kategori seçin</option>
                        {(category.subcategories || []).map((subcategory: string, index: number) => (
                          <option key={index} value={subcategory}>{subcategory}</option>
                        ))}
                      </select>
                      <div className="mb-4 flex flex-col items-start gap-2">
                        <label className="text-xs text-gray-500">Ürün Görseli</label>
                        <div className="w-full flex items-center gap-4">
                          <label className="flex flex-col items-center justify-center w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition">
                            <span className="text-2xl text-gray-400">+</span>
                            <input type="file" accept="image/*" onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                try {
                                  const url = await uploadImageToImgbb(e.target.files[0]);
                                  setEditItem({...editItem, imageUrl: url});
                                } catch (err) {
                                  alert('Görsel yüklenemedi');
                                }
                              }
                            }} className="hidden" />
                          </label>
                          {editItem.imageUrl && (
                            <img src={editItem.imageUrl} alt="Ürün görseli" className="w-20 h-20 object-cover rounded-lg shadow border border-gray-300" />
                          )}
                          {imageUploading && <div className="text-xs text-blue-500">Yükleniyor...</div>}
                        </div>
                      </div>
                      <input type="text" value={editItem.imageUrl || ''} onChange={e => setEditItem({...editItem, imageUrl: e.target.value})} placeholder="Resim URL'si" className="p-2 rounded-lg min-w-0 w-full mb-4 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-2 shadow-sm font-normal tracking-wide text-gray-700 placeholder:text-gray-400 border border-gray-300" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEditSave(category.id, item)} className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600">Kaydet</button>
                        <button onClick={() => handleEditCancel(category.id)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400">İptal</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1">
                        <p className="font-semibold break-words">{item.name} - <span className="font-normal">{item.price} TL</span></p>
                        <p className="text-sm text-gray-600 break-words">{item.description}</p>
                        {item.subcategory && (
                          <span className="inline-block px-2 py-0.5 min-w-0 w-fit whitespace-nowrap leading-tight rounded-full text-xs font-bold mt-1 bg-blue-200 text-blue-800 border border-blue-400">
                            {item.subcategory}
                          </span>
                        )}
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mt-2" />}
                        {menu === 'pastane' && (typeof item.glutenFree !== 'undefined') && (
                          <span className={`inline-block px-2 py-0.5 min-w-0 w-fit whitespace-nowrap leading-tight rounded-full text-xs font-bold mt-1 ${item.glutenFree ? 'bg-green-200 text-green-800 border border-green-400' : 'bg-red-200 text-red-800 border border-red-400'}`}>{item.glutenFree ? 'Glutensiz' : 'Glutenli'}</span>
                        )}
                      </div>
                      {/* Mobilde ikonlar görselin altında ortalanmış */}
                      <div className="flex justify-center gap-2 mt-2 md:hidden">
                        <button onClick={() => handleEditClick(category.id, item, index)} className="group bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-full transition flex items-center justify-center" title="Düzenle">
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="sr-only">Düzenle</span>
                        </button>
                        <button onClick={() => handleDeleteItem(category.id, item)} className="group bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition flex items-center justify-center" title="Sil">
                          <TrashIcon className="h-5 w-5" />
                          <span className="sr-only">Sil</span>
                        </button>
                      </div>
                      {/* Desktop'ta ikonlar sağda */}
                      <div className="hidden md:flex gap-2">
                        <button onClick={() => handleEditClick(category.id, item, index)} className="group bg-yellow-100 hover:bg-yellow-200 text-yellow-700 p-2 rounded-full transition flex items-center justify-center" title="Düzenle">
                          <PencilSquareIcon className="h-5 w-5" />
                          <span className="sr-only">Düzenle</span>
                        </button>
                        <button onClick={() => handleDeleteItem(category.id, item)} className="group bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-full transition flex items-center justify-center" title="Sil">
                          <TrashIcon className="h-5 w-5" />
                          <span className="sr-only">Sil</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {snackbar.open && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm animate-fade-in">
          {snackbar.message}
        </div>
      )}
    </div>
  );
}

