'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/lib/CartContext';

const typeLabels: Record<string, string> = {
  VILLA: 'Villa', RIAD: 'Riad', APPARTEMENT: 'Appartement', DAR: 'Dar', SUITE: 'Suite',
};

const amenityLabels: Record<string, { label: string; icon: string }> = {
  piscine: { label: 'Piscine privée', icon: '🏊' }, wifi: { label: 'Wifi haut débit', icon: '📶' },
  parking: { label: 'Parking', icon: '🅿️' }, climatisation: { label: 'Climatisation', icon: '❄️' },
  jardin: { label: 'Jardin', icon: '🌿' }, barbecue: { label: 'Barbecue', icon: '🔥' },
  personnel: { label: 'Personnel de maison', icon: '👨‍🍳' }, cuisine_equipee: { label: 'Cuisine équipée', icon: '🍳' },
  terrasse: { label: 'Terrasse', icon: '☀️' }, hammam: { label: 'Hammam', icon: '🧖' },
  patio: { label: 'Patio', icon: '🌺' }, ascenseur: { label: 'Ascenseur', icon: '🛗' },
  machine_laver: { label: 'Machine à laver', icon: '👕' }, vue_ville: { label: 'Vue ville', icon: '🏙️' },
  vue_golf: { label: 'Vue golf', icon: '⛳' }, pool_house: { label: 'Pool house', icon: '🏠' },
  piscine_commune: { label: 'Piscine commune', icon: '🏊' }, salle_sport: { label: 'Salle de sport', icon: '💪' },
  room_service: { label: 'Room service', icon: '🛎️' }, baignoire_balneo: { label: 'Balnéo', icon: '🛁' },
};

const districtPhotos: Record<string, string[]> = {
  Palmeraie: ['/images/palmeraie_marrakech.jpg', '/images/villa_palmeraie.jpg', '/images/jardin_majorelle.jpg'],
  Médina: ['/images/medina_marrakech.jpg', '/images/riad_medina.jpg', '/images/jemaa_el_fna.jpg'],
  Guéliz: ['/images/gueliz_marrakech.jpg', '/images/appartement_gueliz.jpg', '/images/jardin_majorelle.jpg'],
  Hivernage: ['/images/palais_bahia.jpg', '/images/spa_la_sultana.jpg', '/images/theatre_royal.jpg'],
  Amelkis: ['/images/golf_marrakech.jpg', '/images/agdal_marrakech.jpg', '/images/palmeraie_marrakech.jpg'],
  Mellah: ['/images/medina_marrakech.jpg', '/images/medersa_ben_youssef.jpg', '/images/jemaa_el_fna.jpg'],
};

interface Props {
  slug: string;
  initialProperty?: any;
}

export default function PropertyDetailClient({ slug, initialProperty }: Props) {
  const router = useRouter();
  const { cart, setProperty, setDates, setGuests, addExtra, removeExtra, nights, accommodationTotal, extrasTotal, total } = useCart();

  const [property, setPropertyData] = useState<any>(initialProperty || null);
  const [extras, setExtras] = useState<any[]>([]);
  const [loading, setLoading] = useState(!initialProperty);
  const [error, setError] = useState('');
  const [showExtras, setShowExtras] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<any | null>(null);

  useEffect(() => {
    // Fetch extras toujours (client-side)
    api.get('/extras').then((res) => setExtras(res.data.extras)).catch(() => {});

    // Fetch property uniquement si pas de données initiales SSR
    if (initialProperty) return;

    setLoading(true);
    api.get(`/properties/${slug}`)
      .then((res) => setPropertyData(res.data.property))
      .catch((err) => {
        if (err.response?.status === 404) setError('Propriété non trouvée');
        else setError('Erreur de chargement');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (property && cart.propertyId !== property.id) setProperty(property);
  }, [property]);

  const handleDateChange = (field: 'checkIn' | 'checkOut', value: string) => {
    if (field === 'checkIn') setDates(value, cart.checkOut);
    else setDates(cart.checkIn, value);
  };

  const handleReserve = () => {
    if (!localStorage.getItem('token')) { router.push('/login'); return; }
    if (!cart.checkIn || !cart.checkOut) return;
    if (nights < (property?.minNights || 1)) return;
    router.push('/checkout');
  };

  const isExtraInCart = (extraId: string) => cart.extras.some((e) => e.id === extraId);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-5xl mx-auto">
          <div className="h-80 bg-dark-lighter rounded-lg animate-pulse mb-8"></div>
        </div>
      </main>
    );
  }

  if (error || !property) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark flex items-center justify-center">
        <div className="text-center">
          <span className="text-5xl block mb-4">🏜️</span>
          <h1 className="font-playfair text-2xl text-white/60">{error || 'Propriété non trouvée'}</h1>
          <Link href="/properties" className="mt-4 inline-block text-sm text-gold">← Retour</Link>
        </div>
      </main>
    );
  }

  const priceLow = parseFloat(property.priceLowSeason);
  const priceHigh = parseFloat(property.priceHighSeason);
  const cleaningFee = parseFloat(property.cleaningFee);
  const amenities: string[] = property.amenities || [];

  const allPhotos: string[] = [];
  if (property.coverPhoto) allPhotos.push(property.coverPhoto);
  if (property.photos && Array.isArray(property.photos)) {
    property.photos.forEach((p: string) => { if (!allPhotos.includes(p)) allPhotos.push(p); });
  }
  const extraPhotos = districtPhotos[property.district] || [];
  extraPhotos.forEach((p) => { if (!allPhotos.includes(p)) allPhotos.push(p); });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <main className="min-h-screen pt-20 pb-16 bg-dark">

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl z-10" onClick={() => setLightboxOpen(false)}>✕</button>
          {allPhotos.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
                onClick={(e) => { e.stopPropagation(); setActivePhoto((prev) => (prev - 1 + allPhotos.length) % allPhotos.length); }}>‹</button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl z-10"
                onClick={(e) => { e.stopPropagation(); setActivePhoto((prev) => (prev + 1) % allPhotos.length); }}>›</button>
            </>
          )}
          <img src={allPhotos[activePhoto]} alt={`Photo ${activePhoto + 1}`}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
            {activePhoto + 1} / {allPhotos.length}
          </div>
        </div>
      )}

      {/* GALERIE */}
      <section className="max-w-6xl mx-auto px-4 pt-4">
        <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
          <Link href="/properties" className="hover:text-gold transition-colors">Nos biens</Link>
          <span>/</span>
          <span className="text-white/50">{property.name}</span>
        </div>

        <div className="relative rounded-lg overflow-hidden bg-dark-lighter h-64 md:h-[420px] cursor-pointer group"
          onClick={() => { setActivePhoto(0); setLightboxOpen(true); }}>
          {allPhotos.length > 0 ? (
            <img src={allPhotos[0]} alt={property.name}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/10 text-8xl">
              {property.type === 'VILLA' ? '🏡' : '🕌'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent"></div>
          <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-dark/80 backdrop-blur-sm rounded text-xs font-inter tracking-wider text-gold uppercase">
            {typeLabels[property.type]}
          </span>
          {property.avgRating && (
            <span className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-gold rounded text-xs font-inter font-bold text-dark">
              ★ {property.avgRating} ({property.reviewsCount} avis)
            </span>
          )}
          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 bg-dark/80 backdrop-blur-sm rounded text-xs text-white/60 flex items-center gap-1.5">
            📷 {allPhotos.length} photos
          </div>
        </div>

        {allPhotos.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {allPhotos.slice(0, 6).map((photo, i) => (
              <button key={i}
                onClick={() => { setActivePhoto(i); setLightboxOpen(true); }}
                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                  activePhoto === i ? 'border-gold' : 'border-transparent opacity-60 hover:opacity-100'
                }`}>
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {allPhotos.length > 6 && (
              <button onClick={() => { setActivePhoto(6); setLightboxOpen(true); }}
                className="flex-shrink-0 w-24 h-16 rounded-lg bg-dark-lighter border-2 border-transparent hover:border-gold/30 flex items-center justify-center text-xs text-white/40 transition-all">
                +{allPhotos.length - 6} photos
              </button>
            )}
          </div>
        )}
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">{property.name}</h1>
              <p className="mt-1 text-white/40 flex items-center gap-2">
                <span>📍 {property.district}</span>
                {property.address && <span className="text-white/20">— {property.address}</span>}
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: '🛏️', label: `${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}` },
                { icon: '🚿', label: `${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain` },
                { icon: '👥', label: `${property.capacity} voyageurs max` },
                { icon: '📐', label: `${property.surface} m²` },
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-dark-light border border-white/5 text-sm text-white/60">
                  <span>{spec.icon}</span><span>{spec.label}</span>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Description</h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((a: string) => {
                  const info = amenityLabels[a] || { label: a, icon: '✓' };
                  return <div key={a} className="flex items-center gap-2 text-sm text-white/50"><span>{info.icon}</span><span>{info.label}</span></div>;
                })}
              </div>
            </div>

            {/* EXTRAS */}
            <div>
              <button onClick={() => setShowExtras(!showExtras)}
                className="flex items-center gap-2 font-playfair text-lg font-semibold text-gold mb-3 hover:text-gold-light transition-colors">
                <span>🎯 Ajouter des expériences</span>
                <span className="text-sm">{showExtras ? '▲' : '▼'}</span>
                {cart.extras.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-gold text-dark text-xs font-inter">{cart.extras.length}</span>
                )}
              </button>

              {showExtras && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  {extras.map((extra) => {
                    const inCart = isExtraInCart(extra.id);
                    return (
                      <div key={extra.id} className={`rounded-lg border overflow-hidden transition-all duration-300 ${inCart ? 'border-gold/40 bg-gold/5' : 'border-white/5 bg-dark-light hover:border-white/10'}`}>
                        {extra.photo && (
                          <div className="h-28 overflow-hidden cursor-pointer" onClick={() => setSelectedExtra(extra)}>
                            <img src={extra.photo} alt={extra.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-4 flex items-start justify-between gap-2">
                          <div className="flex-1 cursor-pointer" onClick={() => setSelectedExtra(extra)}>
                            <h4 className="text-sm font-semibold text-white/80 hover:text-gold transition-colors">{extra.name}</h4>
                            <p className="text-xs text-white/30 mt-1 line-clamp-2">{extra.description}</p>
                            <p className="text-xs text-gold mt-1">{parseFloat(extra.price).toLocaleString()} MAD/{extra.priceUnit}</p>
                          </div>
                          <button onClick={() => {
                            if (inCart) removeExtra(extra.id);
                            else addExtra({ id: extra.id, name: extra.name, category: extra.category, price: parseFloat(extra.price), priceUnit: extra.priceUnit, quantity: 1 });
                          }}
                            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${inCart ? 'bg-gold text-dark' : 'border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold'}`}>
                            {inCart ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Hôte */}
            {property.owner && (
              <div>
                <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Votre hôte</h2>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-light border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-playfair text-lg">{property.owner.firstName[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{property.owner.firstName} {property.owner.lastName}</p>
                    <p className="text-xs text-white/30">Membre depuis {new Date(property.owner.createdAt).getFullYear()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Avis */}
            {property.reviews && property.reviews.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="text-center">
                    <p className="font-playfair text-4xl font-bold text-gold">{property.avgRating}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= Math.round(property.avgRating) ? 'text-gold' : 'text-white/20'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-white/30 mt-1">{property.reviewsCount} avis</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map((star) => {
                      const count = property.reviews.filter((r: any) => r.rating === star).length;
                      const pct = property.reviewsCount > 0 ? (count / property.reviewsCount) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] text-white/30 w-2">{star}</span>
                          <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-white/20 w-3">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-4">
                  {property.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-lg bg-dark-light border border-white/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          {review.author.avatar
                            ? <img src={review.author.avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            : <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">{review.author.firstName[0]}</div>
                          }
                          <div>
                            <p className="text-sm text-white/80 font-medium">{review.author.firstName}</p>
                            <p className="text-[11px] text-white/25">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <span key={s} className={`text-xs ${s <= review.rating ? 'text-gold' : 'text-white/15'}`}>★</span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-white/55 leading-relaxed">{review.comment}</p>
                      {review.ownerReply && (
                        <div className="mt-3 pl-3 border-l-2 border-gold/30">
                          <p className="text-[11px] text-gold/70 font-medium mb-1">Réponse du propriétaire</p>
                          <p className="text-xs text-white/40 leading-relaxed">{review.ownerReply}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ENCART RÉSERVATION */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-white/10 bg-dark-light space-y-5">
              <div className="text-center pb-4 border-b border-white/5">
                <span className="font-playfair text-3xl font-bold text-gold">{priceLow.toLocaleString()}</span>
                <span className="text-white/30 text-sm ml-1">{property.currency}/nuit</span>
                <p className="text-xs text-white/20 mt-1">Haute saison : {priceHigh.toLocaleString()} {property.currency}/nuit</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Arrivée</label>
                  <input type="date" min={minDate} value={cart.checkIn} onChange={(e) => handleDateChange('checkIn', e.target.value)}
                    className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Départ</label>
                  <input type="date" min={cart.checkIn || minDate} value={cart.checkOut} onChange={(e) => handleDateChange('checkOut', e.target.value)}
                    className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Voyageurs</label>
                  <select value={cart.guests} onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none">
                    {[...Array(property.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} voyageur{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {nights > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/5 text-sm">
                  <div className="flex justify-between text-white/40">
                    <span>{cart.pricePerNight.toLocaleString()} × {nights} nuit{nights > 1 ? 's' : ''}</span>
                    <span>{accommodationTotal.toLocaleString()} MAD</span>
                  </div>
                  {cleaningFee > 0 && (
                    <div className="flex justify-between text-white/40">
                      <span>Frais de ménage</span>
                      <span>{cleaningFee.toLocaleString()} MAD</span>
                    </div>
                  )}
                  {cart.extras.length > 0 && (
                    <>
                      <div className="flex justify-between text-white/40"><span>Extras ({cart.extras.length})</span><span>{extrasTotal.toLocaleString()} MAD</span></div>
                      <div className="pl-3 space-y-1">
                        {cart.extras.map((e) => (
                          <div key={e.id} className="flex justify-between text-[11px] text-white/25"><span>{e.name} ×{e.quantity}</span><span>{(e.price * e.quantity).toLocaleString()}</span></div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/5">
                    <span>Total</span><span className="text-gold">{total.toLocaleString()} MAD</span>
                  </div>
                </div>
              )}

              {nights > 0 && nights < property.minNights && (
                <p className="text-xs text-red-400 text-center">Séjour minimum : {property.minNights} nuit{property.minNights > 1 ? 's' : ''}</p>
              )}

              <button onClick={handleReserve} disabled={!cart.checkIn || !cart.checkOut || nights < property.minNights}
                className="w-full py-3 rounded bg-gold hover:bg-gold-dark disabled:bg-white/5 disabled:text-white/20 text-dark font-inter font-semibold text-sm transition-colors duration-300">
                {nights > 0 ? `Réserver · ${total.toLocaleString()} MAD` : 'Sélectionnez vos dates'}
              </button>

              <button onClick={() => setShowExtras(!showExtras)}
                className="w-full py-3 rounded border border-gold/30 text-gold hover:bg-gold/5 font-inter text-sm transition-all duration-300">
                🎯 {showExtras ? 'Masquer les extras' : `Ajouter des extras ${cart.extras.length > 0 ? `(${cart.extras.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL DÉTAIL EXTRA */}
      {selectedExtra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedExtra(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
          <div className="relative bg-dark-light border border-white/10 rounded-lg max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {selectedExtra.photo && (
              <div className="h-48 overflow-hidden">
                <img src={selectedExtra.photo} alt={selectedExtra.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <button onClick={() => setSelectedExtra(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 text-white/60 hover:text-white flex items-center justify-center transition-colors">✕</button>
              <h2 className="font-playfair text-2xl font-bold text-white">{selectedExtra.name}</h2>
              <p className="mt-4 text-sm text-white/50 leading-relaxed">{selectedExtra.description}</p>
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
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="font-playfair text-2xl font-bold text-gold">{parseFloat(selectedExtra.price).toLocaleString()}</span>
                  <span className="text-sm text-white/30 ml-1">MAD/{selectedExtra.priceUnit}</span>
                </div>
                {isExtraInCart(selectedExtra.id) ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-400">✓ Dans le panier</span>
                    <button onClick={() => { removeExtra(selectedExtra.id); setSelectedExtra(null); }}
                      className="px-4 py-2.5 rounded-lg border border-white/10 text-white/60 hover:border-red-400/40 hover:text-red-400 text-sm transition-colors">
                      Retirer
                    </button>
                  </div>
                ) : (
                  <button onClick={() => {
                    addExtra({ id: selectedExtra.id, name: selectedExtra.name, category: selectedExtra.category, price: parseFloat(selectedExtra.price), priceUnit: selectedExtra.priceUnit, quantity: 1 });
                    setSelectedExtra(null);
                  }}
                    className="px-6 py-2.5 rounded-lg bg-gold hover:bg-gold-dark text-dark font-inter font-semibold text-sm transition-colors duration-300">
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
