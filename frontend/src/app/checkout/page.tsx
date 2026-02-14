'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/lib/CartContext';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, nights, accommodationTotal, extrasTotal, total, clearCart, removeExtra, updateExtraQuantity } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [success, setSuccess] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/login'); return; }
    if (!cart.propertyId || !cart.checkIn || !cart.checkOut) { router.push('/properties'); return; }
  }, [cart, router]);

  const handleConfirm = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/bookings', {
        propertyId: cart.propertyId,
        checkIn: cart.checkIn,
        checkOut: cart.checkOut,
        guestsCount: cart.guests,
        extras: cart.extras.map((e) => ({
          extraId: e.id,
          quantity: e.quantity,
        })),
        specialRequests: specialRequests || undefined,
      });

      setSuccess(res.data.booking);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la réservation');
    } finally {
      setLoading(false);
    }
  };

  // Écran de succès
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-dark">
        <div className="max-w-md text-center">
          <span className="text-6xl block mb-6">🎉</span>
          <h1 className="font-playfair text-2xl font-bold text-gold mb-4">Réservation confirmée !</h1>
          <div className="p-6 rounded-lg border border-white/10 bg-dark-light text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Bien</span>
              <span className="text-white/70 font-semibold">{success.property.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Dates</span>
              <span className="text-white/70">
                {new Date(success.checkIn).toLocaleDateString('fr-FR')} → {new Date(success.checkOut).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Nuits</span>
              <span className="text-white/70">{success.nights}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Voyageurs</span>
              <span className="text-white/70">{success.guestsCount}</span>
            </div>
            {success.extras.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase tracking-wider text-white/30">Extras</span>
                {success.extras.map((e: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs text-white/40 mt-1">
                    <span>{e.name} ×{e.quantity}</span>
                    <span>{(e.unitPrice * e.quantity).toLocaleString()} MAD</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/5">
              <span className="text-white">Total</span>
              <span className="text-gold">{Number(success.totalAmount).toLocaleString()} MAD</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/30">Statut</span>
              <span className="text-yellow-400">En attente de confirmation</span>
            </div>
          </div>
          <div className="space-y-3">
            <Link href="/properties" className="block w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm transition-colors text-center">
              Continuer à explorer
            </Link>
            <Link href="/" className="block text-sm text-white/30 hover:text-gold transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!cart.propertyId) return null;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-4xl mx-auto">

        <Link href={`/properties/${cart.propertySlug}`} className="text-sm text-white/30 hover:text-gold transition-colors mb-6 block">
          ← Retour à la fiche
        </Link>

        <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white mb-8">
          Récapitulatif de <span className="text-gold">réservation</span>
        </h1>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Détails */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bien */}
            <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
              <h2 className="font-playfair text-lg text-gold font-semibold mb-4">Hébergement</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-dark-lighter flex items-center justify-center text-3xl">
                  {cart.propertyType === 'VILLA' ? '🏡' : cart.propertyType === 'RIAD' ? '🕌' : '🏢'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{cart.propertyName}</h3>
                  <p className="text-xs text-white/30">📍 {cart.propertyDistrict}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded bg-dark border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">Arrivée</p>
                  <p className="text-sm text-white/70 mt-1">{new Date(cart.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-3 rounded bg-dark border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">Départ</p>
                  <p className="text-sm text-white/70 mt-1">{new Date(cart.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="p-3 rounded bg-dark border border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-white/30">Voyageurs</p>
                  <p className="text-sm text-white/70 mt-1">{cart.guests} personne{cart.guests > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* Extras */}
            {cart.extras.length > 0 && (
              <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
                <h2 className="font-playfair text-lg text-gold font-semibold mb-4">Expériences ajoutées</h2>
                <div className="space-y-3">
                  {cart.extras.map((extra) => (
                    <div key={extra.id} className="flex items-center justify-between p-3 rounded bg-dark border border-white/5">
                      <div className="flex-1">
                        <h4 className="text-sm text-white/70">{extra.name}</h4>
                        <p className="text-xs text-white/30">{extra.price.toLocaleString()} MAD/{extra.priceUnit}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateExtraQuantity(extra.id, extra.quantity - 1)}
                            className="w-7 h-7 rounded border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold flex items-center justify-center text-sm transition-colors">
                            −
                          </button>
                          <span className="text-sm text-white/70 w-6 text-center">{extra.quantity}</span>
                          <button onClick={() => updateExtraQuantity(extra.id, extra.quantity + 1)}
                            className="w-7 h-7 rounded border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold flex items-center justify-center text-sm transition-colors">
                            +
                          </button>
                        </div>
                        <span className="text-sm text-gold font-semibold w-20 text-right">
                          {(extra.price * extra.quantity).toLocaleString()} MAD
                        </span>
                        <button onClick={() => removeExtra(extra.id)}
                          className="text-white/20 hover:text-red-400 transition-colors text-sm ml-2">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demandes spéciales */}
            <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
              <h2 className="font-playfair text-lg text-gold font-semibold mb-3">Demandes spéciales</h2>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none resize-none"
                placeholder="Arrivée tardive, lit bébé, décoration anniversaire..."
              />
            </div>
          </div>

          {/* Récap prix sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-white/10 bg-dark-light space-y-4">
              <h2 className="font-playfair text-lg text-gold font-semibold">Détail du prix</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>{cart.pricePerNight.toLocaleString()} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                  <span>{accommodationTotal.toLocaleString()} MAD</span>
                </div>
                {cart.cleaningFee > 0 && (
                  <div className="flex justify-between text-white/40">
                    <span>Frais de ménage</span>
                    <span>{cart.cleaningFee.toLocaleString()} MAD</span>
                  </div>
                )}
                {extrasTotal > 0 && (
                  <div className="flex justify-between text-white/40">
                    <span>Extras ({cart.extras.length})</span>
                    <span>{extrasTotal.toLocaleString()} MAD</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-semibold pt-3 border-t border-white/5 text-base">
                  <span>Total</span>
                  <span className="text-gold">{total.toLocaleString()} MAD</span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full py-3.5 rounded-lg bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-dark font-inter font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span> Confirmation...</>
                ) : (
                  '✓ Confirmer la réservation'
                )}
              </button>

              <p className="text-[10px] text-white/20 text-center">
                Paiement sur place · Annulation gratuite 48h avant
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}