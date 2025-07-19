
'use client';

import withAuth from './auth/withAuth';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import MenuManagement from './components/MenuManagement';
import { Montserrat } from 'next/font/google';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
const montserrat = Montserrat({ subsets: ['latin'], weight: ["400", "500", "600"] });

function AdminPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-purple-50 to-pink-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`${montserrat.className} text-3xl font-bold text-gray-800`}>Yönetici Paneli</h1>
          <button 
            onClick={handleSignOut} 
            className="group bg-purple-100 hover:bg-purple-200 text-purple-700 p-2 rounded-full transition flex items-center justify-center relative"
            title="Çıkış Yap"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded px-2 py-1 left-1/2 -translate-x-1/2 top-10 whitespace-nowrap transition">Çıkış Yap</span>
          </button>
        </div>
        <MenuManagement />
      </div>
    </div>
  );
}

export default withAuth(AdminPage);
