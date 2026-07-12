'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import CartButton from './CartButton';
import { useCartStore } from '@/store/cartStore';

interface User {
  name?: string;
  email?: string;
  role?: 'CUSTOMER' | 'ADMIN';
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items, toggleCart } = useCartStore();
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          return JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user from localStorage', e);
        }
      }
    }
    return null;
  });
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const closeDropdown = () => setIsUserDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [isUserDropdownOpen]);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleCartClick = () => {
    setIsMenuOpen(false);
    toggleCart(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsUserDropdownOpen(false);
    router.push('/login');
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-bottle text-basmati shadow-md relative z-50">
      <div className="container mx-auto px-6 md:px-10 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" onClick={handleLinkClick}>
          <h1 className="text-3xl font-serif font-bold text-turmeric tracking-wide cursor-pointer">
            Zaiqa
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold">
          <Link href="/" className="hover:text-turmeric transition-colors duration-200">
            Home
          </Link>
          <Link href="/menu" className="hover:text-turmeric transition-colors duration-200">
            Menu
          </Link>
          <Link href="/reservations" className="hover:text-turmeric transition-colors duration-200">
            Reservations
          </Link>
          
          {user ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserDropdownOpen(!isUserDropdownOpen);
                }}
                className="hover:text-turmeric transition-colors duration-200 flex items-center gap-1 font-semibold focus:outline-none cursor-pointer"
              >
                <span>Hi, {user.name || 'User'}</span>
                <svg className={`w-4 h-4 transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-bottle border border-white/10 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  {user.role === 'ADMIN' ? (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2.5 hover:bg-white/5 hover:text-turmeric transition-colors text-sm font-semibold text-basmati"
                    >
                      Admin Panel
                    </Link>
                  ) : (
                    <Link
                      href="#"
                      onClick={() => setIsUserDropdownOpen(false)}
                      className="block px-4 py-2.5 hover:bg-white/5 hover:text-turmeric transition-colors text-sm font-semibold text-basmati"
                    >
                      My Account
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2.5 hover:bg-white/5 hover:text-chili transition-colors text-sm font-semibold text-basmati border-t border-white/5 cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="hover:text-turmeric transition-colors duration-200">
              Login
            </Link>
          )}

          <CartButton />
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-basmati hover:text-turmeric transition-colors duration-200 focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-bottle border-t border-white/10 shadow-xl transition-all duration-200 ease-in-out animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-4 px-8 py-6 text-base font-semibold">
            <Link
              href="/"
              onClick={handleLinkClick}
              className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5"
            >
              Home
            </Link>
            <Link
              href="/menu"
              onClick={handleLinkClick}
              className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5"
            >
              Menu
            </Link>
            <Link
              href="/reservations"
              onClick={handleLinkClick}
              className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5"
            >
              Reservations
            </Link>
            
            {user ? (
              <>
                {user.role === 'ADMIN' ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={handleLinkClick}
                    className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5 text-left text-basmati"
                  >
                    Admin Panel
                  </Link>
                ) : (
                  <Link
                    href="#"
                    onClick={handleLinkClick}
                    className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5 text-left text-basmati"
                  >
                    My Account
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLinkClick();
                    handleLogout();
                  }}
                  className="text-left w-full hover:text-chili text-basmati transition-colors duration-200 py-2 border-b border-white/5 font-semibold focus:outline-none cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={handleLinkClick}
                className="hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5"
              >
                Login
              </Link>
            )}

            <button
              onClick={handleCartClick}
              className="text-left w-full hover:text-turmeric transition-colors duration-200 py-2 border-b border-white/5 font-semibold focus:outline-none flex items-center gap-2 cursor-pointer"
            >
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-chili text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-in zoom-in">
                  {itemCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
