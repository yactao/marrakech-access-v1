'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ==========================================
// COMPOSANT INTRO NETFLIX
// ==========================================
function NetflixIntro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-netflix-fade"
         style={{ animationDelay: '2s', animationFillMode: 'forwards' }}>
      <div className="text-center animate-netflix-reveal">
        <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl font-bold tracking-wider">
          <span className="bg-gradient-to-r from-gold-dark via-gold to-gold-dark bg-[length:200%_auto] animate-logo-shine bg-clip-text text-transparent">
            MARRAKECH
          </span>
        </h1>
        <div className="mt-2 flex items-center justify-center gap-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-gold"></div>
          <span className="font-inter text-sm md:text-base tracking-[0.4em] text-gold/80 uppercase">
            Access
          </span>
          <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-gold"></div>
        </div>
        <p className="mt-4 font-inter text-xs tracking-[0.3em] text-white/40 uppercase">
          Conciergerie de luxe
        </p>
      </div>
    </div>
  );
}

// ==========================================
// LANDING PAGE
// ==========================================
export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Vérifier si l'intro a déjà été vue cette session
    const seen = sessionStorage.getItem('intro_seen');
    if (seen) {
      setShowIntro(false);
      setContentVisible(true);
    }
  }, []);

  const handleIntroComplete = () => {
    setShowIntro(false);
    setContentVisible(true);
    sessionStorage.setItem('intro_seen', 'true');
  };

  return (
    <>
      {showIntro && <NetflixIntro onComplete={handleIntroComplete} />}

      <main className={`min-h-screen transition-opacity duration-1000 ${contentVisible ? 'opacity-100' : 'opacity-0'}`}>
        
        {/* HERO SECTION */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-dark via-dark-light to-dark"></div>
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5"
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8A97E' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
               }}>
          </div>

          <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
            {/* Logo */}
            <div className="animate-fade-in">
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider">
                <span className="text-gold">MARRAKECH</span>
                <br />
                <span className="text-white text-2xl md:text-3xl lg:text-4xl tracking-[0.3em]">ACCESS</span>
              </h1>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-gold"></div>
                <span className="text-gold/60 text-xs tracking-[0.3em] uppercase">Conciergerie de luxe</span>
                <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-gold"></div>
              </div>
            </div>

            {/* Tagline */}
            <p className="mt-8 font-inter text-lg md:text-xl text-white/70 max-w-2xl mx-auto animate-fade-in-up"
               style={{ animationDelay: '0.3s' }}>
              Vivez Marrakech autrement. Villas d&apos;exception, riads authentiques
              et expériences sur mesure guidées par votre Majordome IA personnel.
            </p>

            {/* CTA Buttons — Split screen */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto animate-fade-in-up"
                 style={{ animationDelay: '0.6s' }}>
              
              {/* SÉJOURNER */}
              <Link href="/properties"
                    className="group relative overflow-hidden rounded-lg border border-gold/30 p-8 text-center transition-all duration-500 hover:border-gold hover:bg-gold/5">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <span className="text-3xl mb-4 block">🏠</span>
                  <h2 className="font-playfair text-2xl font-semibold text-gold mb-2">Séjourner</h2>
                  <p className="font-inter text-sm text-white/50">
                    Villas, riads, appartements de luxe avec services de conciergerie
                  </p>
                </div>
              </Link>

              {/* INVESTIR */}
              <Link href="/investir"
                    className="group relative overflow-hidden rounded-lg border border-gold/30 p-8 text-center transition-all duration-500 hover:border-gold hover:bg-gold/5">
                <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <span className="text-3xl mb-4 block">📈</span>
                  <h2 className="font-playfair text-2xl font-semibold text-gold mb-2">Investir</h2>
                  <p className="font-inter text-sm text-white/50">
                    Confiez-nous votre bien et maximisez vos revenus locatifs
                  </p>
                </div>
              </Link>
            </div>

            {/* Scroll indicator */}
            <div className="mt-16 animate-bounce">
              <svg className="w-6 h-6 mx-auto text-gold/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* SECTION SERVICES */}
        <section className="py-24 px-4 bg-dark-light">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gold">
                Une expérience complète
              </h2>
              <p className="mt-4 text-white/50 max-w-xl mx-auto">
                Du logement aux activités, votre Majordome IA organise tout pour vous
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🏡',
                  title: 'Hébergements Premium',
                  desc: 'Villas avec piscine, riads authentiques, appartements design — chaque bien est sélectionné et vérifié.',
                },
                {
                  icon: '🎭',
                  title: 'Expériences Sur Mesure',
                  desc: 'Chef à domicile, quad dans le désert, vol en montgolfière, hammam privé — des moments inoubliables.',
                },
                {
                  icon: '🎩',
                  title: 'Majordome IA 24/7',
                  desc: 'Votre assistant personnel intelligent vous conseille, réserve et organise votre séjour de A à Z.',
                },
              ].map((item, i) => (
                <div key={i}
                     className="group p-8 rounded-lg border border-white/5 hover:border-gold/20 transition-all duration-500 hover:bg-dark-lighter">
                  <span className="text-4xl block mb-4">{item.icon}</span>
                  <h3 className="font-playfair text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION QUARTIERS */}
        <section className="py-24 px-4 bg-dark">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-gold">
                Les quartiers de Marrakech
              </h2>
              <p className="mt-4 text-white/50 max-w-xl mx-auto">
                Chaque quartier a son âme. Trouvez celui qui vous correspond.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'Palmeraie', vibe: 'Luxe & Sérénité', emoji: '🌴', desc: 'Grandes villas, piscines, jardins. Le calme absolu.' },
                { name: 'Médina', vibe: 'Authenticité', emoji: '🕌', desc: 'Riads traditionnels, souks, place Jemaa el-Fna.' },
                { name: 'Guéliz', vibe: 'Moderne & Branché', emoji: '🏙️', desc: 'Restaurants, boutiques, vie nocturne.' },
                { name: 'Hivernage', vibe: 'Chic & Élégant', emoji: '✨', desc: 'Quartier hôtelier haut de gamme.' },
                { name: 'Amelkis', vibe: 'Golf & Prestige', emoji: '⛳', desc: 'Face au Royal Golf, villas contemporaines.' },
                { name: 'Mellah', vibe: 'Bohème & Intimiste', emoji: '🎨', desc: 'Charme caché de l\'ancien quartier.' },
              ].map((q, i) => (
                <Link key={i} href={`/properties?district=${q.name}`}
                      className="group relative p-6 rounded-lg border border-white/5 hover:border-gold/30 transition-all duration-500 cursor-pointer">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{q.emoji}</span>
                    <div>
                      <h3 className="font-playfair text-lg font-semibold text-white group-hover:text-gold transition-colors">
                        {q.name}
                      </h3>
                      <span className="text-xs text-gold/60 tracking-wider uppercase">{q.vibe}</span>
                      <p className="mt-2 text-sm text-white/40">{q.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 px-4 border-t border-white/5">
          <div className="max-w-6xl mx-auto text-center">
            <h3 className="font-playfair text-xl text-gold">MARRAKECH ACCESS</h3>
            <p className="mt-2 text-white/30 text-sm">Conciergerie de luxe à Marrakech</p>
            <p className="mt-4 text-white/20 text-xs">© 2026 Marrakech Access. Tous droits réservés.</p>
          </div>
        </footer>
      </main>
    </>
  );
}