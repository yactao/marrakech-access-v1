'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [introVisible, setIntroVisible] = useState(true);
  const [introFading, setIntroFading] = useState(false);
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIntroFading(true), 2800);
    const hideTimer = setTimeout(() => setIntroVisible(false), 3600);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  return (
    <>
     {/* ====== INTRO OVERLAY ====== */}
      {introVisible && (
        <div
          className={`fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-all duration-[1500ms] ${
            introFading ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
          }`}
          style={{ pointerEvents: 'none' }}
        >
          {/* Logo rond avec bordure dorée */}
          <div
            className="w-[120px] h-[120px] rounded-full border-2 border-gold p-[5px] mb-6 opacity-0"
            style={{ animation: 'introReveal 2s ease-out forwards' }}
          >
            <img
              src="/images/logo.jpg"
              alt="Marrakech Access"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          {/* Titre */}
          <h1
            className="font-playfair text-[3rem] text-gold uppercase tracking-[5px] opacity-0"
            style={{ animation: 'introReveal 2s ease-out 0.3s forwards' }}
          >
            Marrakech Access
          </h1>

          {/* Slogan */}
          <p
            className="text-[0.9rem] text-[#666] tracking-[3px] mt-4 uppercase opacity-0"
            style={{ animation: 'introReveal 2s ease-out 0.8s forwards' }}
          >
            L&apos;Art de vivre, simplement
          </p>
        </div>
      )}

      {/* ====== SPLIT SCREEN ====== */}
      <main className="h-screen flex flex-col md:flex-row overflow-hidden">

        {/* SÉJOURNER */}
        <Link href="/properties"
          onMouseEnter={() => setHoveredSide('left')}
          onMouseLeave={() => setHoveredSide(null)}
          className={`relative flex-1 flex items-center justify-center overflow-hidden transition-all duration-700 ease-out ${
            hoveredSide === 'left' ? 'md:flex-[1.6]' : hoveredSide === 'right' ? 'md:flex-[0.7]' : 'md:flex-1'
          }`}
        >
          {/* Image de fond */}
          <img
            src="/images/sejourner.png"
            alt="Séjourner à Marrakech"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              hoveredSide === 'left' ? 'scale-105 brightness-80' : 'scale-100 brightness-[0.3]'
            }`}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/40 to-dark/60 z-10"></div>

          {/* Contenu */}
          <div className="relative z-20 text-center px-8">
            <div className={`transition-all duration-500 ${hoveredSide === 'left' ? 'scale-100 opacity-100' : 'scale-95 opacity-80'}`}>
              
              {/* Petite ligne dorée */}
              <div className="w-10 h-[1px] bg-gold/50 mx-auto mb-6"></div>

              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Séjourner
              </h2>
              
              <p className="mt-4 text-white/50 font-inter text-sm md:text-base max-w-sm mx-auto leading-relaxed">
                Villas privées, riads authentiques & expériences sur mesure
              </p>

              <div className={`mt-8 transition-all duration-500 ${hoveredSide === 'left' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className="inline-block px-8 py-3 border border-gold/50 text-gold font-inter text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-dark transition-all duration-300">
                  Découvrir nos biens
                </span>
              </div>
            </div>
          </div>

          {/* Ligne de séparation verticale */}
          <div className="hidden md:block absolute right-0 top-[15%] bottom-[15%] w-[1px] bg-white/10 z-30"></div>
        </Link>

        {/* INVESTIR */}
        <Link href="/investir"
          onMouseEnter={() => setHoveredSide('right')}
          onMouseLeave={() => setHoveredSide(null)}
          className={`relative flex-1 flex items-center justify-center overflow-hidden transition-all duration-700 ease-out ${
            hoveredSide === 'right' ? 'md:flex-[1.6]' : hoveredSide === 'left' ? 'md:flex-[0.7]' : 'md:flex-1'
          }`}
        >
          {/* Image de fond */}
          <img
            src="/images/investir.png"
            alt="Investir à Marrakech"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              hoveredSide === 'right' ? 'scale-105 brightness-80' : 'scale-100 brightness-[0.3]'
            }`}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/40 to-dark/60 z-10"></div>

          {/* Contenu */}
          <div className="relative z-20 text-center px-8">
            <div className={`transition-all duration-500 ${hoveredSide === 'right' ? 'scale-100 opacity-100' : 'scale-95 opacity-80'}`}>
              
              <div className="w-10 h-[1px] bg-gold/50 mx-auto mb-6"></div>

              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                Investir
              </h2>
              
              <p className="mt-4 text-white/50 font-inter text-sm md:text-base max-w-sm mx-auto leading-relaxed">
                Gestion locative premium & conciergerie privée
              </p>

              <div className={`mt-8 transition-all duration-500 ${hoveredSide === 'right' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <span className="inline-block px-8 py-3 border border-gold/50 text-gold font-inter text-xs tracking-[0.2em] uppercase hover:bg-gold hover:text-dark transition-all duration-300">
                  Espace propriétaire
                </span>
              </div>
            </div>
          </div>
        </Link>



        {/* FOOTER FLOTTANT */}
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center py-6 pointer-events-none">
          <div className="flex items-center gap-8 text-[10px] font-inter tracking-[0.2em] uppercase text-white/20">
            <span>Marrakech</span>
            <span className="w-1 h-1 rounded-full bg-gold/40"></span>
            <span>Conciergerie de luxe</span>
            <span className="w-1 h-1 rounded-full bg-gold/40"></span>
            <span>Since 2024</span>
          </div>
        </div>
      </main>
    </>
  );
}