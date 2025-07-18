
'use client';

import withAuth from './auth/withAuth';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import MenuManagement from './components/MenuManagement';

function AdminPage() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Yönetici Paneli</h1>
        <button 
          onClick={handleSignOut} 
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Çıkış Yap
        </button>
      </div>
      <MenuManagement />
    </div>
  );
}

export default withAuth(AdminPage);
