'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Decode JWT payload to check role securely on client side
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);

      if (payload.role !== 'ADMIN') {
        router.push('/');
      } else {
        Promise.resolve().then(() => setIsAuthorized(true));
      }
    } catch {
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  if (!isAuthorized) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-basmati text-bottle font-bold gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-turmeric"></div>
        <p className="animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
