'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ==========================================
// INTRO STYLE ORIGINAL (Logo + Slide Up)
// ==========================================
function IntroOverlay({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'visible' | 'exiting' | 'done'>('visible');

  useEffect(() => {
    // Après 3s, lance l'animation de sortie
    const exitTimer = setTimeout(() => setPhase('exiting'), 3000);
    // Après 4.5s, supprime l'overlay
    const doneTimer = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-all duration-[1500ms] ease-in-out ${
        phase === 'exiting' ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      {/* Logo réel */}
      <div
        className="w-36 h-36 mb-6 opacity-0 animate-intro-reveal"
        style={{ animationDelay: '0s' }}
      >
        <img
          src="/images/logo.jpg"
          alt="Marrakech Access"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Nom */}
      <h1
        className="font-playfair text-4xl md:text-5xl text-gold uppercase tracking-[5px] opacity-0 animate-intro-reveal"
        style={{ animationDelay: '0.3s' }}
      >
        Marrakech Access
      </h1>

      {/* Slogan */}
      <p
        className="mt-4 text-white/40 text-sm tracking-[3px] uppercase opacity-0 animate-intro-reveal"
        style={{ animationDelay: '0.8s' }}
      >
        L&apos;Art de vivre, simplement.
      </p>
    </div>
  );
}

// ==========================================
// LANDING PAGE — SPLIT SCREEN
// ==========================================
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [contentReady, setContentReady] = useState(false);

    const handleIntroComplete = () => {
    setShowIntro(false);
    setContentReady(true);
  };

  return (
    <>
      {showIntro && <IntroOverlay onComplete={handleIntroComplete} />}

      {/* SPLIT SCREEN PLEIN ÉCRAN */}
      <main className={`h-screen w-screen overflow-hidden transition-opacity duration-1000 ${
        contentReady ? 'opacity-100' : 'opacity-0'
      }`}>

        {/* Brand header */}
        <div className="absolute top-6 w-full text-center z-10 pointer-events-none">
          <span className="font-playfair text-white text-sm md:text-base tracking-[3px] drop-shadow-lg">
            MARRAKECH ACCESS
          </span>
        </div>

        {/* Split container */}
        <div className="flex h-full">

          {/* SÉJOURNER */}
          <Link href="/properties"
                className="group flex-1 relative flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-[600ms] hover:flex-[1.5] overflow-hidden border-r border-gold/30">
            
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-dark via-dark-light to-dark-lighter"></div>
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A97E' fill-opacity='0.15'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}>
            </div>

            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all duration-500"></div>

            {/* Contenu */}
            <div className="relative z-[2] transform translate-y-5 group-hover:translate-y-0 transition-transform duration-500 px-5">
              <span className="text-5xl md:text-6xl block mb-6">🏡</span>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white font-bold drop-shadow-xl">
                Séjourner
              </h2>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                Villas, Riads & Expériences Uniques
              </p>
              <span className="inline-block mt-6 px-8 py-3 border border-white/40 text-white text-xs uppercase tracking-[2px] backdrop-blur-sm bg-black/20 group-hover:bg-gold group-hover:border-gold group-hover:text-dark transition-all duration-300">
                Réserver mon séjour
              </span>
            </div>
          </Link>

          {/* INVESTIR */}
          <Link href="/investir"
                className="group flex-1 relative flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-[600ms] hover:flex-[1.5] overflow-hidden">
            
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-bl from-dark via-dark-light to-dark-lighter"></div>
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                 style={{
                   backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A97E' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                 }}>
            </div>

            {/* Overlay sombre */}
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/30 transition-all duration-500"></div>

            {/* Contenu */}
            <div className="relative z-[2] transform translate-y-5 group-hover:translate-y-0 transition-transform duration-500 px-5">
              <span className="text-5xl md:text-6xl block mb-6">📈</span>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white font-bold drop-shadow-xl">
                Investir
              </h2>
              <p className="mt-3 text-white/60 text-sm md:text-base">
                Gestion Locative & Conciergerie Privée
              </p>
              <span className="inline-block mt-6 px-8 py-3 border border-white/40 text-white text-xs uppercase tracking-[2px] backdrop-blur-sm bg-black/20 group-hover:bg-gold group-hover:border-gold group-hover:text-dark transition-all duration-300">
                Espace Propriétaire
              </span>
            </div>
          </Link>
        </div>

        {/* Footer links */}
        <div className="absolute bottom-5 w-full text-center z-10">
          <Link href="/login" className="text-white/30 text-xs mx-3 hover:text-gold transition-colors">Espace Admin</Link>
          <span className="text-white/10">|</span>
          <Link href="#" className="text-white/30 text-xs mx-3 hover:text-gold transition-colors">Contact</Link>
        </div>
      </main>
    </>
  );
}