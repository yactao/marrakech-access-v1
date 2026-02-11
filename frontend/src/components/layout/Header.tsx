'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
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
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/properties" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
            Séjourner
          </Link>
          <Link href="/extras" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
            Expériences
          </Link>
          <Link href="/investir" className="font-inter text-sm text-white/60 hover:text-gold transition-colors duration-300">
            Investir
          </Link>
          <Link href="/login" className="font-inter text-sm px-5 py-2 rounded border border-gold/40 text-gold hover:bg-gold hover:text-dark transition-all duration-300">
            Connexion
          </Link>
        </nav>

        {/* Burger Mobile */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden flex flex-col gap-1.5 p-2">
          <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`}></span>
          <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-[1.5px] bg-gold transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`}></span>
        </button>
      </div>

      {/* Menu Mobile */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ${
        menuOpen ? 'max-h-64 border-b border-white/5' : 'max-h-0'
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
          <Link href="/login" onClick={() => setMenuOpen(false)}
                className="font-inter text-sm text-center px-5 py-2 rounded border border-gold/40 text-gold hover:bg-gold hover:text-dark transition-all">
            Connexion
          </Link>
        </nav>
      </div>
    </header>
  );
}