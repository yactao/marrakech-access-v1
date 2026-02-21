'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import MiniCart from '@/components/cart/MiniCart';
import { api } from '@/lib/api';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cart, nights } = useCart();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {}
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('user-changed', loadUser);
    return () => window.removeEventListener('user-changed', loadUser);
  }, []);

  // Ferme le dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initiales de l'utilisateur
  const getInitials = () => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName?.charAt(0) || ''}`.toUpperCase();
  };

  // Libellé du rôle
  const getRoleLabel = () => {
    if (!user) return '';
    return user.role === 'ADMIN' ? 'Administrateur' : user.role === 'OWNER' ? 'Propriétaire' : 'Voyageur';
  };

  // Déconnexion : efface les cookies httpOnly côté serveur, puis le localStorage
  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // On continue même si l'appel échoue (token déjà expiré, etc.)
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  };

  // Calcul du nombre d'items dans le panier
  const cartItemsCount = (cart.propertyId ? 1 : 0) + cart.extras.length;
  const hasValidBooking = cart.propertyId && cart.checkIn && cart.checkOut && nights > 0;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        scrolled ? 'bg-dark/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-playfair text-xl font-bold text-gold tracking-wider">MARRAKECH</span>
            <span className="font-inter text-[10px] tracking-[0.3em] text-white/50 uppercase mt-1">Access</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/properties" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
              Séjourner
            </Link>
            <Link href="/extras" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
              Expériences
            </Link>
            <Link href="/investir" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
              Investir
            </Link>

            {/* Bouton Panier */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg border border-white/10 hover:border-gold/30 transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-white/60 group-hover:text-gold transition-colors"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              
              {/* Badge */}
              {cartItemsCount > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  hasValidBooking ? 'bg-gold text-dark' : 'bg-white/20 text-white'
                }`}>
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Connexion / Badge utilisateur */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Badge initiales */}
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="w-9 h-9 rounded-full bg-gold/15 border-2 border-gold/50 hover:border-gold hover:bg-gold/25 text-gold text-sm font-semibold font-inter flex items-center justify-center transition-all duration-300"
                  title={`${user.firstName} ${user.lastName}`}
                >
                  {getInitials()}
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-48 bg-dark-light border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Infos utilisateur */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-white/90 font-inter truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-[10px] text-gold/60 uppercase tracking-wider mt-0.5">{getRoleLabel()}</p>
                    </div>
                    {/* Mon espace */}
                    <Link
                      href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-white/60 hover:text-gold hover:bg-white/5 transition-colors font-inter"
                    >
                      <span className="text-base">🏠</span> Mon espace
                    </Link>
                    {/* Déconnexion */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-colors font-inter border-t border-white/5"
                    >
                      <span className="text-base">↪</span> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="font-inter text-sm px-5 py-2 rounded border border-gold/40 text-gold hover:bg-gold hover:text-dark transition-all duration-300">
                Connexion
              </Link>
            )}
          </nav>

          {/* Mobile: Cart + Burger */}
          <div className="md:hidden flex items-center gap-3">
            {/* Cart Mobile */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-gold"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {cartItemsCount > 0 && (
                <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                  hasValidBooking ? 'bg-gold text-dark' : 'bg-white/20 text-white'
                }`}>
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Burger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col gap-1.5 p-2">
              <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
              <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ${
          menuOpen ? 'max-h-80 border-b border-white/5' : 'max-h-0'
        }`}>
          <nav className="flex flex-col px-4 py-4 bg-dark/95 backdrop-blur-md gap-4">
            <Link href="/properties" onClick={() => setMenuOpen(false)}
                  className="font-inter text-sm text-white/60 hover:text-gold transition-colors py-2">
              Séjourner
            </Link>
            <Link href="/extras" onClick={() => setMenuOpen(false)}
                  className="font-inter text-sm text-white/60 hover:text-gold transition-colors py-2">
              Expériences
            </Link>
            <Link href="/investir" onClick={() => setMenuOpen(false)}
                  className="font-inter text-sm text-white/60 hover:text-gold transition-colors py-2">
              Investir
            </Link>
            
            {user ? (
              <>
                {/* Badge + nom dans le menu mobile */}
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-2"
                >
                  <span className="w-8 h-8 rounded-full bg-gold/15 border-2 border-gold/50 text-gold text-xs font-semibold font-inter flex items-center justify-center flex-shrink-0">
                    {getInitials()}
                  </span>
                  <div>
                    <p className="text-sm text-white/80 font-inter">{user.firstName} {user.lastName}</p>
                    <p className="text-[10px] text-gold/60 uppercase tracking-wider">{getRoleLabel()}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="font-inter text-sm text-white/30 hover:text-red-400 text-left py-2"
                >
                  ↪ Déconnexion
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="font-inter text-sm text-center px-5 py-2 rounded border border-gold/40 text-gold hover:bg-gold hover:text-dark transition-all">
                Connexion
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mini Cart Slideout */}
      <MiniCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}