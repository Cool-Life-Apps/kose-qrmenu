'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, getDocs, updateDoc, doc, writeBatch } from 'firebase/firestore';
import AdminSpinner from '@/app/components/AdminSpinner';
import { Montserrat } from 'next/font/google';
import { ArrowLeftIcon, Bars3Icon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const montserrat = Montserrat({ subsets: ['latin'], weight: ["400", "500", "600"] });

interface Item {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  glutenFree?: boolean;
  subcategory?: string;
}

interface Category {
  id: string;
  name: string;
  imageUrl?: string;
  items: Item[];
  subcategories: string[];
  order: number;
}

interface SubcategoryGroup {
  name: string;
  items: Item[];
}

function SortableCategory({ category, onItemsReorder }: { category: Category; onItemsReorder: (categoryId: string, newItems: Item[]) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleItemsReorder = (newItems: Item[]) => {
    onItemsReorder(category.id, newItems);
  };

  // Alt kategorilere göre ürünleri grupla
  const subcategoryGroups: SubcategoryGroup[] = [];
  const itemsWithoutSubcategory: Item[] = [];

  category.items.forEach(item => {
    if (item.subcategory) {
      let group = subcategoryGroups.find(g => g.name === item.subcategory);
      if (!group) {
        group = { name: item.subcategory, items: [] };
        subcategoryGroups.push(group);
      }
      group.items.push(item);
    } else {
      itemsWithoutSubcategory.push(item);
    }
  });

  const handleSubcategoryReorder = (newGroups: SubcategoryGroup[]) => {
    // Mevcut ürünleri koru, sadece alt kategori sıralamasını güncelle
    const updatedItems = [...category.items];
    
    // Alt kategorisiz ürünleri başa al
    const itemsWithoutSubcategory = updatedItems.filter(item => !item.subcategory);
    const itemsWithSubcategory = updatedItems.filter(item => item.subcategory);
    
    // Alt kategorili ürünleri yeni sırayla düzenle
    const reorderedItems: Item[] = [];
    newGroups.forEach(group => {
      const groupItems = itemsWithSubcategory.filter(item => item.subcategory === group.name);
      reorderedItems.push(...groupItems);
    });
    
    // Son sıralamayı birleştir
    const finalItems = [...itemsWithoutSubcategory, ...reorderedItems];
    
    onItemsReorder(category.id, finalItems);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-category-id={category.id}
      className={`bg-white rounded-lg shadow-md p-6 ${isDragging ? 'shadow-xl opacity-50' : ''}`}
    >
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          {...attributes}
          {...listeners}
          className="p-2 bg-gray-100 rounded-lg cursor-grab hover:bg-gray-200 transition"
        >
          <Bars3Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex items-center gap-3">
          {category.imageUrl && (
            <img 
              src={category.imageUrl} 
              alt={category.name} 
              className="w-12 h-12 object-cover rounded-lg"
            />
          )}
          <h2 className="text-xl font-bold text-gray-800">{category.name}</h2>
        </div>
      </div>
      
      {/* Items Container */}
      {category.items.length > 0 && (
        <div className="ml-8 space-y-4">
          {/* Alt kategorisiz ürünler */}
          {itemsWithoutSubcategory.length > 0 && (
            <SortableItemsList 
              items={itemsWithoutSubcategory} 
              onReorder={handleItemsReorder}
              title="Genel"
            />
          )}
          
          {/* Alt kategorili ürünler */}
          <SortableSubcategoryGroups
            groups={subcategoryGroups}
            categoryId={category.id}
            onReorder={handleSubcategoryReorder}
            allItems={category.items}
          />
        </div>
      )}
    </div>
  );
}

function SortableSubcategoryGroup({ 
  group, 
  categoryId, 
  onReorder, 
  allItems 
}: { 
  group: SubcategoryGroup; 
  categoryId: string; 
  onReorder: (newItems: Item[]) => void;
  allItems: Item[];
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${categoryId}-${group.name}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleItemsReorder = (newGroupItems: Item[]) => {
    // Mevcut ürünleri kopyala
    const updatedItems = [...allItems];
    
    // Bu alt kategorinin ürünlerini bul ve indekslerini al
    const groupItemIndices: number[] = [];
    updatedItems.forEach((item, index) => {
      if (item.subcategory === group.name) {
        groupItemIndices.push(index);
      }
    });
    
    // Bu alt kategorinin ürünlerini yeni sırayla yerleştir
    groupItemIndices.forEach((originalIndex, newIndex) => {
      if (newGroupItems[newIndex]) {
        updatedItems[originalIndex] = newGroupItems[newIndex];
      }
    });
    
    onReorder(updatedItems);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gray-50 rounded-lg p-4 ${isDragging ? 'shadow-lg opacity-50' : ''}`}
    >
      {/* Subcategory Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          {...attributes}
          {...listeners}
          className="p-1 bg-gray-200 rounded cursor-grab hover:bg-gray-300 transition"
        >
          <Bars3Icon className="h-4 w-4 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">{group.name}</h3>
      </div>
      
      {/* Items in this subcategory */}
      <div className="ml-6">
        <SortableItemsList 
          items={group.items} 
          onReorder={handleItemsReorder}
        />
      </div>
    </div>
  );
}

function SortableItemsList({ items, onReorder, title }: { items: Item[]; onReorder: (newItems: Item[]) => void; title?: string }) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = items.findIndex(item => (item.id || `${item.name}-${item.subcategory || 'no-sub'}`) === active.id);
      const newIndex = items.findIndex(item => (item.id || `${item.name}-${item.subcategory || 'no-sub'}`) === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(items, oldIndex, newIndex);
        onReorder(newItems);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
              <SortableContext
          items={items.map(item => item.id || `${item.name}-${item.subcategory || 'no-sub'}`)}
          strategy={verticalListSortingStrategy}
        >
        <div className="space-y-2">
          {title && (
            <h4 className="text-sm font-medium text-gray-600 mb-2">{title}</h4>
          )}
          {items.map((item, index) => (
            <SortableItem key={`${item.id || item.name}-${index}-${item.subcategory || 'no-sub'}`} item={item} index={index} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({ item, index }: { item: Item; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id || `${item.name}-${item.subcategory || 'no-sub'}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-3 ${isDragging ? 'shadow-lg opacity-50' : ''}`}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="p-1 bg-gray-200 rounded cursor-grab hover:bg-gray-300 transition"
        >
          <Bars3Icon className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-800">{item.name}</h3>
            {item.subcategory && (
              <span className="px-2 py-0.5 min-w-0 w-fit whitespace-nowrap leading-tight rounded-full text-xs font-bold bg-blue-200 text-blue-800 border border-blue-400">
                {item.subcategory}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">{item.description}</p>
          <p className="text-sm font-medium text-gray-800">{item.price} ₺</p>
        </div>
        {item.imageUrl && (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-12 h-12 object-cover rounded-lg"
          />
        )}
      </div>
    </div>
  );
}

function SortableSubcategoryGroups({ 
  groups, 
  categoryId, 
  onReorder, 
  allItems 
}: { 
  groups: SubcategoryGroup[]; 
  categoryId: string; 
  onReorder: (newGroups: SubcategoryGroup[]) => void;
  allItems: Item[];
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = groups.findIndex(group => `${categoryId}-${group.name}` === active.id);
      const newIndex = groups.findIndex(group => `${categoryId}-${group.name}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newGroups = arrayMove(groups, oldIndex, newIndex);
        onReorder(newGroups);
      }
    }
  };

  const handleGroupItemsReorder = (groupName: string, newGroupItems: Item[]) => {
    // Mevcut ürünleri kopyala
    const updatedItems = [...allItems];
    
    // Bu alt kategorinin ürünlerini bul ve indekslerini al
    const groupItemIndices: number[] = [];
    updatedItems.forEach((item, index) => {
      if (item.subcategory === groupName) {
        groupItemIndices.push(index);
      }
    });
    
    // Bu alt kategorinin ürünlerini yeni sırayla yerleştir
    groupItemIndices.forEach((originalIndex, newIndex) => {
      if (newGroupItems[newIndex]) {
        updatedItems[originalIndex] = newGroupItems[newIndex];
      }
    });
    
    // Ana kategori state'ini güncelle
    const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
    if (categoryElement) {
      const event = new CustomEvent('itemsReorder', {
        detail: { categoryId, newItems: updatedItems }
      });
      window.dispatchEvent(event);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={groups.map(group => `${categoryId}-${group.name}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {groups.map((group) => (
            <SortableSubcategoryGroup
              key={group.name}
              group={group}
              categoryId={categoryId}
              onReorder={(newGroupItems) => handleGroupItemsReorder(group.name, newGroupItems)}
              allItems={allItems}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export default function OrderPage() {
  const [menu, setMenu] = useState('pastane');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string}>({open: false, message: ''});

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const showSnackbar = (message: string) => {
    setSnackbar({open: true, message});
    setTimeout(() => setSnackbar({open: false, message: ''}), 2500);
  };

  const fetchCategories = async () => {
    setLoading(true);
    const categoriesCollection = collection(db, `menus/${menu}/categories`);
    const categoriesSnapshot = await getDocs(categoriesCollection);
    const categoriesList = categoriesSnapshot.docs.map((doc, index) => ({ 
      id: doc.id, 
      ...doc.data(),
      order: doc.data().order || index
    })) as Category[];
    
    // Sıralamaya göre sırala
    categoriesList.sort((a, b) => a.order - b.order);
    setCategories(categoriesList);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [menu]);

  useEffect(() => {
    const handleItemsReorder = (event: CustomEvent) => {
      const { categoryId, newItems } = event.detail;
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, items: newItems }
          : cat
      ));
    };

    window.addEventListener('itemsReorder', handleItemsReorder as EventListener);
    
    return () => {
      window.removeEventListener('itemsReorder', handleItemsReorder as EventListener);
    };
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      // Kategori sıralaması
      const oldIndex = categories.findIndex(cat => cat.id === active.id);
      const newIndex = categories.findIndex(cat => cat.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newCategories.map((cat, index) => ({ ...cat, order: index })));
      }
    }
  };

  const handleItemsReorder = (categoryId: string, newItems: Item[]) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, items: newItems }
        : cat
    ));
  };

  const saveOrder = async () => {
    setSaving(true);
    try {
      const batch = writeBatch(db);
      
      categories.forEach((category, categoryIndex) => {
        const categoryRef = doc(db, `menus/${menu}/categories`, category.id);
        batch.update(categoryRef, { 
          order: categoryIndex,
          items: category.items.map((item, itemIndex) => ({
            ...item,
            order: itemIndex
          }))
        });
      });

      await batch.commit();
      showSnackbar('Sıralama başarıyla kaydedildi!');
    } catch (error) {
      console.error('Error saving order:', error);
      showSnackbar('Sıralama kaydedilirken hata oluştu!');
    }
    setSaving(false);
  };

  if (loading) {
    return <AdminSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition">
                <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
              </button>
            </Link>
            <h1 className={`${montserrat.className} text-3xl font-bold text-gray-800`}>Sıralamayı Düzenle</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={menu} 
              onChange={(e) => setMenu(e.target.value)}
              className="p-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value="pastane">Curlique Eatery</option>
              <option value="kuafor">Ramazan Karahan Kuaför</option>
            </select>
            
            <button
              onClick={saveOrder}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Drag Drop Context */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={categories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {categories.map((category) => (
                <SortableCategory 
                  key={category.id} 
                  category={category}
                  onItemsReorder={handleItemsReorder}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-8 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 text-sm">
          {snackbar.message}
        </div>
      )}
    </div>
  );
} 