'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Extra {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  priceUnit: string;
  duration: string | null;
  maxPersons: number | null;
  photo: string | null;
}

interface Category {
  id: string;
  label: string;
}

const categoryIcons: Record<string, string> = {
  'culinaire': '🍽️',
  'bien-etre': '🧖',
  'excursion': '🏔️',
  'transport': '🚗',
  'loisir': '🎭',
};

export default function ExtrasPage() {
  const [extras, setExtras] = useState<Extra[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedExtra, setSelectedExtra] = useState<Extra | null>(null);

  useEffect(() => {
    api.get('/extras')
      .then((res) => {
        setExtras(res.data.extras);
        setCategories(res.data.categories);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory
    ? extras.filter((e) => e.category === activeCategory)
    : extras;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-6xl mx-auto">

        {/* En-tête */}
        <div className="mb-10 text-center">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            Expériences <span className="text-gold">Sur Mesure</span>
          </h1>
          <p className="mt-3 text-white/40 max-w-lg mx-auto">
            Chef à domicile, quad dans le désert, vol en montgolfière... Votre séjour, vos envies.
          </p>
        </div>

        {/* Onglets catégories */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          <button
            onClick={() => setActiveCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-inter transition-all duration-300 ${
              activeCategory === ''
                ? 'bg-gold text-dark font-semibold'
                : 'border border-white/10 text-white/50 hover:border-gold/30 hover:text-gold'
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-inter transition-all duration-300 ${
                activeCategory === cat.id
                  ? 'bg-gold text-dark font-semibold'
                  : 'border border-white/10 text-white/50 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {categoryIcons[cat.id] || '✨'} {cat.label.replace(/^[^\s]+\s/, '')}
            </button>
          ))}
        </div>

        {/* Grille d'extras */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-dark-light p-6">
                <div className="h-4 bg-dark-lighter rounded animate-pulse w-3/4 mb-3"></div>
                <div className="h-3 bg-dark-lighter rounded animate-pulse w-full mb-2"></div>
                <div className="h-3 bg-dark-lighter rounded animate-pulse w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((extra) => (
              <div
                key={extra.id}
                onClick={() => setSelectedExtra(extra)}
                className="group cursor-pointer rounded-lg border border-white/5 hover:border-gold/20 bg-dark-light p-6 transition-all duration-500 hover:bg-dark-lighter"
              >
                {/* Catégorie */}
                <span className="text-2xl mb-3 block">
                  {categoryIcons[extra.category] || '✨'}
                </span>

                {/* Nom */}
                <h3 className="font-playfair text-lg font-semibold text-white group-hover:text-gold transition-colors duration-300">
                  {extra.name}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-white/40 line-clamp-2">
                  {extra.description}
                </p>

                {/* Infos */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-white/30">
                  {extra.duration && (
                    <span className="flex items-center gap-1">
                      🕐 {extra.duration}
                    </span>
                  )}
                  {extra.maxPersons && (
                    <span className="flex items-center gap-1">
                      👥 Max {extra.maxPersons} pers.
                    </span>
                  )}
                </div>

                {/* Prix */}
                <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between">
                  <div>
                    <span className="font-playfair text-xl font-bold text-gold">
                      {parseFloat(extra.price).toLocaleString()}
                    </span>
                    <span className="text-xs text-white/30 ml-1">MAD/{extra.priceUnit}</span>
                  </div>
                  <span className="text-xs text-gold/40 group-hover:text-gold transition-colors">
                    Détails →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Résultat vide */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🔍</span>
            <h2 className="font-playfair text-xl text-white/60">Aucune expérience dans cette catégorie</h2>
          </div>
        )}
      </div>

      {/* MODAL DÉTAIL */}
      {selectedExtra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             onClick={() => setSelectedExtra(null)}>
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>

          {/* Contenu */}
          <div className="relative bg-dark-light border border-white/10 rounded-lg max-w-lg w-full p-6 md:p-8"
               onClick={(e) => e.stopPropagation()}>

            {/* Bouton fermer */}
            <button onClick={() => setSelectedExtra(null)}
                    className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors text-xl">
              ✕
            </button>

            {/* Icône */}
            <span className="text-4xl block mb-4">
              {categoryIcons[selectedExtra.category] || '✨'}
            </span>

            {/* Nom */}
            <h2 className="font-playfair text-2xl font-bold text-white">
              {selectedExtra.name}
            </h2>

            {/* Description complète */}
            <p className="mt-4 text-sm text-white/50 leading-relaxed">
              {selectedExtra.description}
            </p>

            {/* Infos détaillées */}
            <div className="mt-6 space-y-2">
              {selectedExtra.duration && (
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <span>🕐</span>
                  <span>Durée : {selectedExtra.duration}</span>
                </div>
              )}
              {selectedExtra.maxPersons && (
                <div className="flex items-center gap-3 text-sm text-white/40">
                  <span>👥</span>
                  <span>Maximum {selectedExtra.maxPersons} personnes</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-white/40">
                <span>💰</span>
                <span>Prix par {selectedExtra.priceUnit}</span>
              </div>
            </div>

            {/* Prix + CTA */}
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <span className="font-playfair text-2xl font-bold text-gold">
                  {parseFloat(selectedExtra.price).toLocaleString()}
                </span>
                <span className="text-sm text-white/30 ml-1">MAD/{selectedExtra.priceUnit}</span>
              </div>
              <button className="px-6 py-2.5 rounded bg-gold hover:bg-gold-dark text-dark font-inter font-semibold text-sm transition-colors duration-300">
                Ajouter au panier
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}