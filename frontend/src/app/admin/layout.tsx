'use client';

import AdminGuard from '@/components/AdminGuard';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, ShoppingBag, Utensils, Calendar, LogOut, Menu, X, Table as TableIcon } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminUser] = useState<{ name?: string; email?: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing admin user from localStorage', e);
        }
      }
    }
    return null;
  });
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Set document title
    document.title = 'Admin Dashboard | Zaiqa';
  }, []);

  // Close sidebar on pathname changes (mobile navigation)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSidebarOpen(false); // Resetting UI state on navigation is an intentional exception to this rule.
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <AdminGuard>
      <div className="flex h-screen bg-basmati overflow-hidden font-sans">
        
        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`fixed inset-y-0 left-0 w-72 bg-ink text-basmati flex flex-col shadow-2xl z-40 transition-transform duration-300 transform 
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:relative md:translate-x-0 shrink-0`}
        >
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-serif font-bold text-turmeric tracking-wide">Zaiqa</h1>
              <p className="text-xs text-white/50 uppercase tracking-[0.2em] mt-2 font-bold">Admin Portal</p>
            </div>
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-basmati hover:text-turmeric focus:outline-none"
              aria-label="Close sidebar"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 py-8 space-y-3 px-5 overflow-y-auto">
            <Link 
              href="/admin/dashboard" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl hover:bg-white/5 hover:text-turmeric transition-all font-semibold group ${
                pathname === '/admin/dashboard' ? 'bg-white/10 text-turmeric' : ''
              }`}
            >
              <LayoutDashboard size={20} className="text-white/50 group-hover:text-turmeric transition-colors" />
              Dashboard
            </Link>
            <Link 
              href="/admin/orders" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl hover:bg-white/5 hover:text-turmeric transition-all font-semibold group ${
                pathname === '/admin/orders' ? 'bg-white/10 text-turmeric' : ''
              }`}
            >
              <ShoppingBag size={20} className="text-white/50 group-hover:text-turmeric transition-colors" />
              Live Orders
            </Link>
            <Link 
              href="/admin/menu" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl hover:bg-white/5 hover:text-turmeric transition-all font-semibold group ${
                pathname === '/admin/menu' ? 'bg-white/10 text-turmeric' : ''
              }`}
            >
              <Utensils size={20} className="text-white/50 group-hover:text-turmeric transition-colors" />
              Menu Management
            </Link>
            <Link 
              href="/admin/reservations" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl hover:bg-white/5 hover:text-turmeric transition-all font-semibold group ${
                pathname === '/admin/reservations' ? 'bg-white/10 text-turmeric' : ''
              }`}
            >
              <Calendar size={20} className="text-white/50 group-hover:text-turmeric transition-colors" />
              Reservations
            </Link>
            <Link 
              href="/admin/tables" 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl hover:bg-white/5 hover:text-turmeric transition-all font-semibold group ${
                pathname === '/admin/tables' ? 'bg-white/10 text-turmeric' : ''
              }`}
            >
              <TableIcon size={20} className="text-white/50 group-hover:text-turmeric transition-colors" />
              Tables
            </Link>
          </nav>
          
          <div className="p-6 border-t border-white/10 bg-black/20">
            <Link href="/" className="flex items-center gap-3 px-5 py-3 text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all">
              <LogOut size={18} />
              Return to Website
            </Link>
          </div>
        </aside>
        
        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* Admin Top Bar */}
          <header className="bg-ink text-basmati px-6 py-4 flex items-center justify-between border-b border-white/10 z-20 shrink-0">
            <div className="flex items-center gap-4">
              {/* Hamburger Button for mobile */}
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden text-basmati hover:text-turmeric focus:outline-none"
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <span className="text-xl font-serif font-bold text-turmeric">Zaiqa Admin</span>
            </div>

            <div className="flex items-center gap-4">
              {adminUser && (
                <div className="hidden sm:flex flex-col items-end text-xs font-semibold">
                  <span className="text-basmati">{adminUser.name || 'Admin'}</span>
                  <span className="text-white/50">{adminUser.email}</span>
                </div>
              )}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-chili hover:bg-chili/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
              >
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-basmati/50 custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
