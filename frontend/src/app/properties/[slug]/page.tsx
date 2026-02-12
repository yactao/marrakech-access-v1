'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const typeLabels: Record<string, string> = {
  VILLA: 'Villa',
  RIAD: 'Riad',
  APPARTEMENT: 'Appartement',
  DAR: 'Dar',
  SUITE: 'Suite',
};

const amenityLabels: Record<string, { label: string; icon: string }> = {
  piscine: { label: 'Piscine privée', icon: '🏊' },
  wifi: { label: 'Wifi haut débit', icon: '📶' },
  parking: { label: 'Parking', icon: '🅿️' },
  climatisation: { label: 'Climatisation', icon: '❄️' },
  jardin: { label: 'Jardin', icon: '🌿' },
  barbecue: { label: 'Barbecue', icon: '🔥' },
  personnel: { label: 'Personnel de maison', icon: '👨‍🍳' },
  cuisine_equipee: { label: 'Cuisine équipée', icon: '🍳' },
  terrasse: { label: 'Terrasse', icon: '☀️' },
  hammam: { label: 'Hammam', icon: '🧖' },
  patio: { label: 'Patio', icon: '🌺' },
  ascenseur: { label: 'Ascenseur', icon: '🛗' },
  machine_laver: { label: 'Machine à laver', icon: '👕' },
  vue_ville: { label: 'Vue sur la ville', icon: '🏙️' },
  vue_golf: { label: 'Vue sur le golf', icon: '⛳' },
  pool_house: { label: 'Pool house', icon: '🏠' },
  piscine_commune: { label: 'Piscine commune', icon: '🏊' },
  salle_sport: { label: 'Salle de sport', icon: '💪' },
  room_service: { label: 'Room service', icon: '🛎️' },
  baignoire_balneo: { label: 'Baignoire balnéo', icon: '🛁' },
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api.get(`/properties/${slug}`)
      .then((res) => setProperty(res.data.property))
      .catch((err) => {
        if (err.response?.status === 404) setError('Propriété non trouvée');
        else setError('Erreur de chargement');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-5xl mx-auto">
          <div className="h-80 bg-dark-lighter rounded-lg animate-pulse mb-8"></div>
          <div className="h-8 bg-dark-lighter rounded animate-pulse w-1/2 mb-4"></div>
          <div className="h-4 bg-dark-lighter rounded animate-pulse w-3/4"></div>
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
          <Link href="/properties" className="mt-4 inline-block text-sm text-gold hover:text-gold-light transition-colors">
            ← Retour au catalogue
          </Link>
        </div>
      </main>
    );
  }

  const photos: { url: string; alt: string }[] = property.photos || [];
  const amenities: string[] = property.amenities || [];
  const priceLow = parseFloat(property.priceLowSeason);
  const priceHigh = parseFloat(property.priceHighSeason);
  const cleaningFee = parseFloat(property.cleaningFee);

  return (
    <main className="min-h-screen pt-20 pb-16 bg-dark">

      {/* GALERIE */}
      <section className="max-w-6xl mx-auto px-4 pt-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-white/30 mb-4">
          <Link href="/properties" className="hover:text-gold transition-colors">Nos biens</Link>
          <span>/</span>
          <span className="text-white/50">{property.name}</span>
        </div>

        {/* Photo principale */}
        <div className="relative rounded-lg overflow-hidden bg-dark-lighter h-64 md:h-96">
          <div className="absolute inset-0 flex items-center justify-center text-white/10 text-8xl">
            {property.type === 'VILLA' ? '🏡' : property.type === 'RIAD' ? '🕌' : property.type === 'APPARTEMENT' ? '🏢' : property.type === 'DAR' ? '🏠' : '✨'}
          </div>
          {/* Badge */}
          <span className="absolute top-4 left-4 z-10 px-3 py-1 bg-dark/80 backdrop-blur-sm rounded text-xs font-inter tracking-wider text-gold uppercase">
            {typeLabels[property.type]}
          </span>
          {property.avgRating && (
            <span className="absolute top-4 right-4 z-10 px-2.5 py-1 bg-gold rounded text-xs font-inter font-bold text-dark">
              ★ {property.avgRating} ({property.reviewsCount} avis)
            </span>
          )}
        </div>

        {/* Miniatures */}
        {photos.length > 1 && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            {photos.map((photo, i) => (
              <button key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`flex-shrink-0 w-20 h-14 rounded bg-dark-lighter border-2 transition-all flex items-center justify-center text-xl ${
                        activePhoto === i ? 'border-gold' : 'border-transparent opacity-50 hover:opacity-100'
                      }`}>
                📷
              </button>
            ))}
          </div>
        )}
      </section>

      {/* CONTENU */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne gauche — Infos */}
          <div className="lg:col-span-2 space-y-8">

            {/* Titre + Quartier */}
            <div>
              <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">
                {property.name}
              </h1>
              <p className="mt-1 text-white/40 flex items-center gap-2">
                <span>📍 {property.district}</span>
                {property.address && <span className="text-white/20">— {property.address}</span>}
              </p>
            </div>

            {/* Specs rapides */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: '🛏️', label: `${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}` },
                { icon: '🚿', label: `${property.bathrooms} salle${property.bathrooms > 1 ? 's' : ''} de bain` },
                { icon: '👥', label: `${property.capacity} voyageurs max` },
                { icon: '📐', label: `${property.surface} m²` },
              ].map((spec, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded bg-dark-light border border-white/5 text-sm text-white/60">
                  <span>{spec.icon}</span>
                  <span>{spec.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Description</h2>
              <p className="text-white/50 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Équipements */}
            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {amenities.map((amenity: string) => {
                  const info = amenityLabels[amenity] || { label: amenity, icon: '✓' };
                  return (
                    <div key={amenity} className="flex items-center gap-2 text-sm text-white/50">
                      <span>{info.icon}</span>
                      <span>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Propriétaire */}
            {property.owner && (
              <div>
                <h2 className="font-playfair text-lg font-semibold text-gold mb-3">Votre hôte</h2>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-dark-light border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center text-gold font-playfair text-lg">
                    {property.owner.firstName[0]}
                  </div>
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
                <h2 className="font-playfair text-lg font-semibold text-gold mb-3">
                  Avis ({property.reviewsCount})
                </h2>
                <div className="space-y-4">
                  {property.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 rounded-lg bg-dark-light border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold text-xs font-bold">
                            {review.author.firstName[0]}
                          </div>
                          <span className="text-sm text-white/70">{review.author.firstName}</span>
                        </div>
                        <span className="text-sm text-gold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="text-sm text-white/40">{review.comment}</p>
                      {review.ownerReply && (
                        <div className="mt-2 pl-4 border-l-2 border-gold/20">
                          <p className="text-xs text-white/30">
                            <span className="text-gold/60">Réponse de l&apos;hôte :</span> {review.ownerReply}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne droite — Encart réservation sticky */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-white/10 bg-dark-light space-y-5">

              {/* Prix */}
              <div className="text-center pb-4 border-b border-white/5">
                <div>
                  <span className="font-playfair text-3xl font-bold text-gold">{priceLow.toLocaleString()}</span>
                  <span className="text-white/30 text-sm ml-1">{property.currency}/nuit</span>
                </div>
                <p className="text-xs text-white/20 mt-1">
                  Haute saison : {priceHigh.toLocaleString()} {property.currency}/nuit
                </p>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Arrivée</label>
                  <input type="date" className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Départ</label>
                  <input type="date" className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1">Voyageurs</label>
                  <select className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none">
                    {[...Array(property.capacity)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} voyageur{i > 0 ? 's' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Détail prix */}
              <div className="space-y-2 pt-3 border-t border-white/5 text-sm">
                <div className="flex justify-between text-white/40">
                  <span>{priceLow.toLocaleString()} × — nuits</span>
                  <span>— {property.currency}</span>
                </div>
                {cleaningFee > 0 && (
                  <div className="flex justify-between text-white/40">
                    <span>Frais de ménage</span>
                    <span>{cleaningFee.toLocaleString()} {property.currency}</span>
                  </div>
                )}
                <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="text-gold">— {property.currency}</span>
                </div>
              </div>

              {/* Nuits minimum */}
              <p className="text-[10px] text-white/20 text-center">
                Séjour minimum : {property.minNights} nuit{property.minNights > 1 ? 's' : ''}
              </p>

              {/* CTA */}
              <button className="w-full py-3 rounded bg-gold hover:bg-gold-dark text-dark font-inter font-semibold text-sm transition-colors duration-300">
                Réserver
              </button>

              {/* Ou contacter */}
              <button className="w-full py-3 rounded border border-gold/30 text-gold hover:bg-gold/5 font-inter text-sm transition-all duration-300">
                🎩 Demander au Majordome
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}