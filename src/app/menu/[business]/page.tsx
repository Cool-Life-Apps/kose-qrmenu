
'use client';

import { useParams } from 'next/navigation';

// Mock data for demonstration purposes
const menus = {
  pastane: {
    name: 'Pastane Menu',
    categories: [
      {
        name: 'Cakes',
        items: [
          { name: 'Chocolate Cake', description: 'Rich and decadent', price: '25 TL' },
          { name: 'Cheesecake', description: 'Creamy and delicious', price: '30 TL' },
        ],
      },
      {
        name: 'Drinks',
        items: [
          { name: 'Coffee', description: 'Freshly brewed', price: '15 TL' },
          { name: 'Tea', description: 'Hot and soothing', price: '10 TL' },
        ],
      },
    ],
  },
  kuafor: {
    name: 'Kuaför Menu',
    categories: [
      {
        name: 'Services',
        items: [
          { name: 'Haircut', description: 'Includes wash and style', price: '100 TL' },
          { name: 'Manicure', description: 'Classic manicure', price: '80 TL' },
        ],
      },
      {
        name: 'Packages',
        items: [
          { name: 'Bridal Package', description: 'Hair, makeup, and nails', price: '1500 TL' },
          { name: 'Groom Package', description: 'Haircut and shave', price: '200 TL' },
        ],
      },
    ],
  },
};

export default function MenuPage() {
  const { business } = useParams();
  const menu = menus[business as keyof typeof menus];

  if (!menu) {
    return <div>Menu not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">{menu.name}</h1>
      <div>
        {menu.categories.map((category) => (
          <div key={category.name} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map((item) => (
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
