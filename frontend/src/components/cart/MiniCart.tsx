'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const { cart, nights, accommodationTotal, extrasTotal, total, removeExtra, updateExtraQuantity, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted) return null;

  const hasProperty = !!cart.propertyId;
  const hasItems = hasProperty || cart.extras.length > 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slideout Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-dark border-l border-white/10 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-playfair text-lg font-semibold text-gold">
            🛒 Votre panier
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-white/10 text-white/40 hover:text-white hover:border-white/30 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 h-[calc(100vh-180px)]">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">🏜️</span>
              <h3 className="font-playfair text-lg text-white/60 mb-2">Votre panier est vide</h3>
              <p className="text-sm text-white/30 mb-6">Explorez nos villas et riads d'exception</p>
              <Link
                href="/properties"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm transition-colors"
              >
                Découvrir les biens
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Hébergement */}
              {hasProperty && (
                <div className="p-4 rounded-lg border border-white/10 bg-dark-light">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-gold">Hébergement</span>
                    {nights > 0 && (
                      <span className="text-xs text-white/30">{nights} nuit{nights > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-dark flex items-center justify-center text-2xl flex-shrink-0">
                      {cart.propertyType === 'VILLA' ? '🏡' : cart.propertyType === 'RIAD' ? '🕌' : '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate">{cart.propertyName}</h4>
                      <p className="text-xs text-white/30">📍 {cart.propertyDistrict}</p>
                      
                      {cart.checkIn && cart.checkOut ? (
                        <div className="mt-2 text-xs text-white/40">
                          {new Date(cart.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' → '}
                          {new Date(cart.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          {' · '}{cart.guests} voyageur{cart.guests > 1 ? 's' : ''}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-yellow-400/70">⚠️ Sélectionnez vos dates</p>
                      )}
                    </div>
                  </div>

                  {nights > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-sm">
                      <span className="text-white/40">{cart.pricePerNight.toLocaleString()} × {nights}</span>
                      <span className="text-gold font-semibold">{accommodationTotal.toLocaleString()} MAD</span>
                    </div>
                  )}

                  <Link
                    href={`/properties/${cart.propertySlug}`}
                    onClick={onClose}
                    className="mt-3 block text-center text-xs text-gold/60 hover:text-gold transition-colors"
                  >
                    Modifier la réservation →
                  </Link>
                </div>
              )}

              {/* Extras */}
              {cart.extras.length > 0 && (
                <div className="p-4 rounded-lg border border-white/10 bg-dark-light">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-wider text-gold">Expériences</span>
                    <span className="text-xs text-white/30">{cart.extras.length} extra{cart.extras.length > 1 ? 's' : ''}</span>
                  </div>
                  
                  <div className="space-y-3">
                    {cart.extras.map((extra) => (
                      <div key={extra.id} className="flex items-center gap-3 p-2 rounded bg-dark">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm text-white/70 truncate">{extra.name}</h4>
                          <p className="text-xs text-white/30">{extra.price.toLocaleString()} MAD/{extra.priceUnit}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateExtraQuantity(extra.id, extra.quantity - 1)}
                            className="w-6 h-6 rounded border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold flex items-center justify-center text-xs transition-colors"
                          >
                            −
                          </button>
                          <span className="text-sm text-white/70 w-5 text-center">{extra.quantity}</span>
                          <button
                            onClick={() => updateExtraQuantity(extra.id, extra.quantity + 1)}
                            className="w-6 h-6 rounded border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold flex items-center justify-center text-xs transition-colors"
                          >
                            +
                          </button>
                        </div>
                        
                        <span className="text-sm text-gold font-semibold w-16 text-right">
                          {(extra.price * extra.quantity).toLocaleString()}
                        </span>
                        
                        <button
                          onClick={() => removeExtra(extra.id)}
                          className="text-white/20 hover:text-red-400 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ajouter plus d'extras */}
              {hasProperty && (
                <Link
                  href="/extras"
                  onClick={onClose}
                  className="block p-4 rounded-lg border border-dashed border-white/10 hover:border-gold/30 text-center transition-colors group"
                >
                  <span className="text-2xl block mb-1">✨</span>
                  <span className="text-sm text-white/40 group-hover:text-gold transition-colors">
                    Ajouter des expériences
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-dark">
            {/* Total */}
            {nights > 0 && (
              <div className="space-y-1 mb-4">
                {cart.cleaningFee > 0 && (
                  <div className="flex justify-between text-xs text-white/30">
                    <span>Frais de ménage</span>
                    <span>{cart.cleaningFee.toLocaleString()} MAD</span>
                  </div>
                )}
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-xs text-white/30">
                    <span>Extras</span>
                    <span>{extrasTotal.toLocaleString()} MAD</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/5">
                  <span className="text-white">Total</span>
                  <span className="text-gold">{total.toLocaleString()} MAD</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {cart.checkIn && cart.checkOut && nights > 0 ? (
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="block w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm text-center transition-colors"
                >
                  Finaliser la réservation →
                </Link>
              ) : hasProperty ? (
                <Link
                  href={`/properties/${cart.propertySlug}`}
                  onClick={onClose}
                  className="block w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm text-center transition-colors"
                >
                  Sélectionner les dates →
                </Link>
              ) : (
                <Link
                  href="/properties"
                  onClick={onClose}
                  className="block w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm text-center transition-colors"
                >
                  Choisir un hébergement →
                </Link>
              )}
              
              <button
                onClick={() => {
                  clearCart();
                  onClose();
                }}
                className="w-full py-2 text-xs text-white/30 hover:text-red-400 transition-colors"
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
