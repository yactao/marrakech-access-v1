'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type FormType = 'choose' | 'property' | 'service';

const amenitiesList = [
  { id: 'piscine', label: '🏊 Piscine' },
  { id: 'wifi', label: '📶 Wifi' },
  { id: 'parking', label: '🅿️ Parking' },
  { id: 'climatisation', label: '❄️ Climatisation' },
  { id: 'jardin', label: '🌿 Jardin' },
  { id: 'terrasse', label: '☀️ Terrasse' },
  { id: 'hammam', label: '🧖 Hammam' },
  { id: 'cuisine_equipee', label: '🍳 Cuisine équipée' },
  { id: 'personnel', label: '👨‍🍳 Personnel de maison' },
  { id: 'barbecue', label: '🔥 Barbecue' },
  { id: 'patio', label: '🌺 Patio' },
  { id: 'ascenseur', label: '🛗 Ascenseur' },
];

const districts = ['Palmeraie', 'Médina', 'Guéliz', 'Hivernage', 'Amelkis', 'Mellah', 'Route de Fès', 'Route de l\'Ourika', 'Targa', 'Autre'];

const serviceCategories = [
  { id: 'culinaire', label: '🍽️ Culinaire', examples: 'Chef à domicile, cours de cuisine, brunch...' },
  { id: 'bien-etre', label: '🧖 Bien-être', examples: 'Massage, hammam, yoga, spa...' },
  { id: 'excursion', label: '🏔️ Excursion', examples: 'Quad, montgolfière, cascades, désert...' },
  { id: 'transport', label: '🚗 Transport', examples: 'Transfert aéroport, chauffeur privé...' },
  { id: 'loisir', label: '🎭 Loisir', examples: 'Fantasia, golf, calèche, spectacle...' },
];

export default function InvestirPage() {
  const [formType, setFormType] = useState<FormType>('choose');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Champs communs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Champs bien
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState('VILLA');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [capacity, setCapacity] = useState(4);
  const [surface, setSurface] = useState(100);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [pricePerNight, setPricePerNight] = useState(1500);

  // Champs service
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('culinaire');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState(500);
  const [servicePriceUnit, setServicePriceUnit] = useState('personne');
  const [serviceDuration, setServiceDuration] = useState('');
  const [serviceMaxPersons, setServiceMaxPersons] = useState(0);

  const toggleAmenity = (id: string) => {
    setAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/invest/property', {
        firstName, lastName, email, phone, password,
        propertyName, propertyType, district, address,
        bedrooms, bathrooms, capacity, surface,
        description, amenities, pricePerNight, message,
      });
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/invest/service', {
        firstName, lastName, email, phone, password,
        serviceName,
        category: serviceCategory,
        description: serviceDescription,
        price: servicePrice,
        priceUnit: servicePriceUnit,
        duration: serviceDuration || undefined,
        maxPersons: serviceMaxPersons || undefined,
        message,
      });
      setSuccess(res.data.message);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // ÉCRAN DE SUCCÈS
  // ============================
  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-dark">
        <div className="max-w-md text-center">
          <span className="text-6xl block mb-6">🎉</span>
          <h1 className="font-playfair text-2xl font-bold text-gold mb-4">Demande envoyée !</h1>
          <p className="text-white/50 text-sm leading-relaxed mb-8">{success}</p>
          <div className="space-y-3">
            <Link href="/login" className="block w-full py-3 rounded-lg bg-gold hover:bg-gold-dark text-dark font-semibold text-sm transition-colors text-center">
              Accéder à mon espace
            </Link>
            <Link href="/" className="block text-sm text-white/30 hover:text-gold transition-colors">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ============================
  // CHOIX : BIEN OU SERVICE
  // ============================
  if (formType === 'choose') {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-4xl mx-auto">

          {/* En-tête */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
              Rejoignez <span className="text-gold">Marrakech Access</span>
            </h1>
            <p className="mt-3 text-white/40 max-w-lg mx-auto">
              Référencez votre bien ou proposez vos services premium sur notre plateforme de conciergerie de luxe.
            </p>
          </div>

          {/* Avantages */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: '📈', title: 'Visibilité Premium', desc: 'Votre bien/service présenté à une clientèle internationale exigeante.' },
              { icon: '🎩', title: 'Majordome IA', desc: 'Notre IA recommande activement votre offre aux voyageurs correspondants.' },
              { icon: '🤝', title: 'Gestion Simplifiée', desc: 'Dashboard dédié, réservations, paiements et avis centralisés.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-lg border border-white/5 bg-dark-light text-center">
                <span className="text-3xl block mb-3">{item.icon}</span>
                <h3 className="font-playfair text-base font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Choix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Référencer un bien */}
            <button
              onClick={() => setFormType('property')}
              className="group p-8 rounded-xl border border-white/10 hover:border-gold/40 bg-dark-light text-left transition-all duration-500 hover:bg-dark-lighter"
            >
              <span className="text-5xl block mb-4">🏠</span>
              <h2 className="font-playfair text-2xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                Référencer un bien
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Villa, riad, appartement, dar ou suite — confiez-nous votre bien et maximisez vos revenus locatifs.
              </p>
              <div className="space-y-2 text-xs text-white/30">
                <p>✓ Gestion locative complète</p>
                <p>✓ Photos professionnelles offertes</p>
                <p>✓ Conciergerie et ménage inclus</p>
                <p>✓ Dashboard propriétaire temps réel</p>
              </div>
              <span className="inline-block mt-6 text-sm text-gold/60 group-hover:text-gold transition-colors">
                Commencer →
              </span>
            </button>

            {/* Proposer un service */}
            <button
              onClick={() => setFormType('service')}
              className="group p-8 rounded-xl border border-white/10 hover:border-gold/40 bg-dark-light text-left transition-all duration-500 hover:bg-dark-lighter"
            >
              <span className="text-5xl block mb-4">⭐</span>
              <h2 className="font-playfair text-2xl font-bold text-white group-hover:text-gold transition-colors mb-2">
                Proposer un service
              </h2>
              <p className="text-sm text-white/40 mb-4">
                Chef, guide, chauffeur, masseur — proposez vos services premium à nos voyageurs.
              </p>
              <div className="space-y-2 text-xs text-white/30">
                <p>✓ Clientèle haut de gamme</p>
                <p>✓ Réservations gérées par la plateforme</p>
                <p>✓ Recommandé par notre Majordome IA</p>
                <p>✓ Paiements sécurisés</p>
              </div>
              <span className="inline-block mt-6 text-sm text-gold/60 group-hover:text-gold transition-colors">
                Commencer →
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ============================
  // FORMULAIRE BIEN
  // ============================
  if (formType === 'property') {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-2xl mx-auto">

          <button onClick={() => setFormType('choose')} className="text-sm text-white/30 hover:text-gold transition-colors mb-6 block">
            ← Retour au choix
          </button>

          <div className="text-center mb-8">
            <span className="text-4xl block mb-3">🏠</span>
            <h1 className="font-playfair text-2xl font-bold text-white">Référencer votre bien</h1>
            <p className="mt-2 text-white/40 text-sm">Remplissez le formulaire, notre équipe vous contacte sous 48h.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitProperty} className="space-y-6">

            {/* Section: Vos coordonnées */}
            <div className="p-6 rounded-lg border border-white/5 bg-dark-light space-y-4">
              <h2 className="font-playfair text-lg text-gold font-semibold">Vos coordonnées</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Prénom *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nom *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Téléphone *</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="+212 6..." />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Mot de passe *</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Min 6 caractères" />
                </div>
              </div>
            </div>

            {/* Section: Votre bien */}
            <div className="p-6 rounded-lg border border-white/5 bg-dark-light space-y-4">
              <h2 className="font-playfair text-lg text-gold font-semibold">Votre bien</h2>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nom du bien *</label>
                <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Villa Palmeraie Rose" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Type *</label>
                  <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none">
                    <option value="VILLA">Villa</option>
                    <option value="RIAD">Riad</option>
                    <option value="APPARTEMENT">Appartement</option>
                    <option value="DAR">Dar</option>
                    <option value="SUITE">Suite</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Quartier *</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none">
                    <option value="">Choisir...</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Adresse</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Adresse complète (optionnel)" />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Chambres *</label>
                  <input type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} min={1} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">SdB *</label>
                  <input type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} min={1} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Capacité *</label>
                  <input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} min={1} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Surface m²</label>
                  <input type="number" value={surface} onChange={(e) => setSurface(Number(e.target.value))} min={10} required
                    className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={20} rows={4}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none resize-none"
                  placeholder="Décrivez votre bien, son ambiance, ses points forts..." />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">Équipements</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesList.map((a) => (
                    <button type="button" key={a.id} onClick={() => toggleAmenity(a.id)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
                        amenities.includes(a.id)
                          ? 'bg-gold/15 border border-gold/40 text-gold'
                          : 'border border-white/10 text-white/40 hover:border-white/20'
                      }`}>
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Prix par nuit (MAD) *</label>
                <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(Number(e.target.value))} min={100} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
              </div>
            </div>

            {/* Message */}
            <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Message (optionnel)</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none resize-none"
                placeholder="Des précisions ou questions pour notre équipe..." />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-lg bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-dark font-inter font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span> Envoi en cours...</>
              ) : (
                'Soumettre mon bien'
              )}
            </button>
          </form>
        </div>
      </main>
    );
  }

  // ============================
  // FORMULAIRE SERVICE
  // ============================
  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => setFormType('choose')} className="text-sm text-white/30 hover:text-gold transition-colors mb-6 block">
          ← Retour au choix
        </button>

        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">⭐</span>
          <h1 className="font-playfair text-2xl font-bold text-white">Proposer un service premium</h1>
          <p className="mt-2 text-white/40 text-sm">Décrivez votre service, notre équipe vous contacte sous 48h.</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitService} className="space-y-6">

          {/* Coordonnées */}
          <div className="p-6 rounded-lg border border-white/5 bg-dark-light space-y-4">
            <h2 className="font-playfair text-lg text-gold font-semibold">Vos coordonnées</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Prénom *</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nom *</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Téléphone *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="+212 6..." />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Mot de passe *</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Min 6 caractères" />
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="p-6 rounded-lg border border-white/5 bg-dark-light space-y-4">
            <h2 className="font-playfair text-lg text-gold font-semibold">Votre service</h2>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nom du service *</label>
              <input type="text" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Ex: Chef à domicile, Massage Argan..." />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-2">Catégorie *</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {serviceCategories.map((cat) => (
                  <button type="button" key={cat.id}
                    onClick={() => setServiceCategory(cat.id)}
                    className={`p-3 rounded-lg text-left text-xs transition-all duration-300 border ${
                      serviceCategory === cat.id
                        ? 'border-gold/40 bg-gold/10 text-gold'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}>
                    <span className="font-semibold block">{cat.label}</span>
                    <span className="text-[10px] opacity-60">{cat.examples}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Description *</label>
              <textarea value={serviceDescription} onChange={(e) => setServiceDescription(e.target.value)} required minLength={20} rows={4}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none resize-none"
                placeholder="Décrivez votre service, ce qui le rend unique..." />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Prix (MAD) *</label>
                <input type="number" value={servicePrice} onChange={(e) => setServicePrice(Number(e.target.value))} min={50} required
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Par *</label>
                <select value={servicePriceUnit} onChange={(e) => setServicePriceUnit(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none">
                  <option value="personne">Personne</option>
                  <option value="groupe">Groupe</option>
                  <option value="forfait">Forfait</option>
                  <option value="heure">Heure</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Durée</label>
                <input type="text" value={serviceDuration} onChange={(e) => setServiceDuration(e.target.value)}
                  className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Ex: 3h" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Nombre max de personnes (optionnel)</label>
              <input type="number" value={serviceMaxPersons || ''} onChange={(e) => setServiceMaxPersons(Number(e.target.value))} min={0}
                className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none" placeholder="Laisser vide si illimité" />
            </div>
          </div>

          {/* Message */}
          <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
            <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Message (optionnel)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3}
              className="w-full bg-dark border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white/80 focus:border-gold/50 focus:outline-none resize-none"
              placeholder="Des précisions pour notre équipe..." />
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-lg bg-gold hover:bg-gold-dark disabled:bg-gold/50 text-dark font-inter font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2">
            {loading ? (
              <><span className="w-4 h-4 border-2 border-dark/30 border-t-dark rounded-full animate-spin"></span> Envoi en cours...</>
            ) : (
              'Soumettre mon service'
            )}
          </button>
        </form>
      </div>
    </main>
  );
}