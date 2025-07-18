
'use client';

import { useEffect } from 'react';
import { auth } from '@/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import Spinner from '@/app/components/Spinner'; // Added import for Spinner

export default function withAuth(Component: React.ComponentType<any>) {
  return function AuthenticatedComponent(props: any) {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/admin/login');
      }
    }, [user, loading, router]);

    if (loading) {
      return <Spinner />;
    }

    if (!user) {
      return null; // Or a redirect component
    }

    return <Component {...props} />;
  };
}
