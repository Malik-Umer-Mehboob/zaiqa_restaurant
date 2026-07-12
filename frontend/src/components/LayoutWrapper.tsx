'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import CartDrawer from './CartDrawer';

const Header = dynamic(() => import('./Header'), { ssr: false });

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {children}
      </main>
      <footer className="bg-ink text-basmati p-6 text-center mt-auto">
        <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} Zaiqa. All rights reserved.</p>
      </footer>
      <CartDrawer />
    </>
  );
}
