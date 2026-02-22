'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useCart, CartExtra } from '@/lib/CartContext';

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
  const [addedToCart, setAddedToCart] = useState<string | null>(null);

  const { cart, addExtra, removeExtra } = useCart();

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

  const isInCart = (extraId: string) => cart.extras.some((e) => e.id === extraId);

  const handleAddToCart = (extra: Extra) => {
    const cartExtra: CartExtra = {
      id: extra.id,
      name: extra.name,
      category: extra.category,
      price: parseFloat(extra.price),
      priceUnit: extra.priceUnit,
      quantity: 1,
    };
    addExtra(cartExtra);
    
    // Animation feedback
    setAddedToCart(extra.id);
    setTimeout(() => setAddedToCart(null), 1500);
  };

  const handleToggleCart = (extra: Extra) => {
    if (isInCart(extra.id)) {
      removeExtra(extra.id);
    } else {
      handleAddToCart(extra);
    }
  };

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

          {cart.extras.length > 0 && (
            <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <span className="text-gold text-sm">🛒 {cart.extras.length} expérience{cart.extras.length > 1 ? 's' : ''} dans votre panier</span>
            </div>
          )}
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
            {filtered.map((extra) => {
              const inCart = isInCart(extra.id);
              const justAdded = addedToCart === extra.id;
              
              return (
                <div
                  key={extra.id}
                  className={`group relative rounded-lg border bg-dark-light transition-all duration-500 hover:bg-dark-lighter overflow-hidden ${
                    inCart ? 'border-gold/40 ring-1 ring-gold/20' : 'border-white/5 hover:border-gold/20'
                  }`}
                >
                  {/* Badge "Dans le panier" */}
                  {inCart && (
                    <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-gold text-dark text-[10px] font-bold">
                      ✓ Dans le panier
                    </div>
                  )}
                  
                  {/* Animation ajout */}
                  {justAdded && (
                    <div className="absolute inset-0 bg-gold/20 animate-pulse z-10 pointer-events-none" />
                  )}

                  {/* Image ou icône */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => setSelectedExtra(extra)}
                  >
                    {extra.photo ? (
                      <div className="h-40 overflow-hidden">
                        <img src={extra.photo} alt={extra.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    ) : (
                      <div className="h-24 flex items-center justify-center bg-dark-lighter">
                        <span className="text-4xl">
                          {categoryIcons[extra.category] || '✨'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {/* Nom */}
                    <h3 
                      className="font-playfair text-lg font-semibold text-white group-hover:text-gold transition-colors duration-300 cursor-pointer"
                      onClick={() => setSelectedExtra(extra)}
                    >
                      {extra.name}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-white/40 line-clamp-2">
                      {extra.description}
                    </p>

                    {/* Infos */}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/30">
                      {extra.duration && (
                        <span className="flex items-center gap-1">
                          🕐 {extra.duration}
                        </span>
                      )}
                      {extra.maxPersons && (
                        <span className="flex items-center gap-1">
                          👥 Max {extra.maxPersons}
                        </span>
                      )}
                    </div>

                    {/* Prix + Bouton */}
                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="font-playfair text-xl font-bold text-gold">
                          {parseFloat(extra.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-white/30 ml-1">MAD/{extra.priceUnit}</span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleCart(extra)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                          inCart 
                            ? 'bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400' 
                            : 'bg-gold hover:bg-gold-dark text-dark'
                        }`}
                      >
                        {inCart ? '✕ Retirer' : '+ Ajouter'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <div className="relative bg-dark-light border border-white/10 rounded-lg max-w-lg w-full overflow-hidden"
               onClick={(e) => e.stopPropagation()}>

            {/* Image */}
            {selectedExtra.photo && (
              <div className="h-48 overflow-hidden">
                <img src={selectedExtra.photo} alt={selectedExtra.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Bouton fermer */}
              <button onClick={() => setSelectedExtra(null)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white/60 hover:text-white flex items-center justify-center transition-colors">
                ✕
              </button>

              {/* Badge catégorie */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-xs text-white/50 mb-3">
                {categoryIcons[selectedExtra.category] || '✨'} {selectedExtra.category}
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
              <div className="mt-6 grid grid-cols-2 gap-3">
                {selectedExtra.duration && (
                  <div className="p-3 rounded-lg bg-dark border border-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 block">Durée</span>
                    <span className="text-sm text-white/70 mt-1 block">🕐 {selectedExtra.duration}</span>
                  </div>
                )}
                {selectedExtra.maxPersons && (
                  <div className="p-3 rounded-lg bg-dark border border-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-white/30 block">Capacité</span>
                    <span className="text-sm text-white/70 mt-1 block">👥 Max {selectedExtra.maxPersons} pers.</span>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-dark border border-white/5">
                  <span className="text-[10px] uppercase tracking-wider text-white/30 block">Tarif</span>
                  <span className="text-sm text-white/70 mt-1 block">💰 Par {selectedExtra.priceUnit}</span>
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
                
                {isInCart(selectedExtra.id) ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-400">✓ Dans le panier</span>
                    <button 
                      onClick={() => {
                        removeExtra(selectedExtra.id);
                        setSelectedExtra(null);
                      }}
                      className="px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:border-red-400/40 hover:text-red-400 text-sm transition-colors"
                    >
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      handleAddToCart(selectedExtra);
                      setSelectedExtra(null);
                    }}
                    className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-dark font-inter font-semibold text-sm transition-colors duration-300"
                  >
                    + Ajouter au panier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}