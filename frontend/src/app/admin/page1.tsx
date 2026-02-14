'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function AdminPage()

// ===== COMPOSANT MEDIA MANAGER =====
function MediaManager({ token, apiUrl }: { token: string; apiUrl: string }) {
  const [mediaData, setMediaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedExtra, setSelectedExtra] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [filterFolder, setFilterFolder] = useState<string>('all');
  const [message, setMessage] = useState('');

  const fetchMedia = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/media`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMediaData(data);
    } catch (e) {
      console.error('Erreur chargement médias:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${apiUrl}/admin/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`✅ Image uploadée : ${data.path}`);
        fetchMedia();
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (err) {
      setMessage('❌ Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const assignToProperty = async (propertyId: string, imagePath: string, type: 'cover' | 'gallery') => {
    setMessage('');
    try {
      const property = mediaData.properties.find((p: any) => p.id === propertyId);
      if (!property) return;

      let body: any = {};
      if (type === 'cover') {
        body = { coverPhoto: imagePath };
      } else {
        const currentPhotos: string[] = property.photos || [];
        if (!currentPhotos.includes(imagePath)) {
          body = { photos: [...currentPhotos, imagePath] };
        } else {
          setMessage('⚠️ Photo déjà dans la galerie');
          return;
        }
      }

      const res = await fetch(`${apiUrl}/admin/properties/${propertyId}/photos`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setMessage(`✅ Photo ${type === 'cover' ? 'de couverture' : 'de galerie'} assignée !`);
        fetchMedia();
      }
    } catch (err) {
      setMessage('❌ Erreur assignation');
    }
  };

  const removeFromGallery = async (propertyId: string, imagePath: string) => {
    const property = mediaData.properties.find((p: any) => p.id === propertyId);
    if (!property) return;

    const updatedPhotos = (property.photos || []).filter((p: string) => p !== imagePath);

    const res = await fetch(`${apiUrl}/admin/properties/${propertyId}/photos`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ photos: updatedPhotos }),
    });

    if (res.ok) {
      setMessage('✅ Photo retirée de la galerie');
      fetchMedia();
    }
  };

  const assignToExtra = async (extraId: string, imagePath: string) => {
    setMessage('');
    try {
      const res = await fetch(`${apiUrl}/admin/extras/${extraId}/photo`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo: imagePath }),
      });

      if (res.ok) {
        setMessage('✅ Photo extra assignée !');
        fetchMedia();
      }
    } catch (err) {
      setMessage('❌ Erreur assignation');
    }
  };

  if (loading) return <div className="text-center text-white/30 py-12">Chargement des médias...</div>;
  if (!mediaData) return <div className="text-center text-white/30 py-12">Erreur de chargement</div>;

  const filteredFiles = filterFolder === 'all'
    ? mediaData.files
    : mediaData.files.filter((f: any) => f.folder === filterFolder);

  return (
    <div className="space-y-8">

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm text-center ${message.startsWith('✅') ? 'bg-green-500/10 border border-green-500/20 text-green-400' : message.startsWith('⚠️') ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {message}
        </div>
      )}

      {/* UPLOAD */}
      <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
        <h3 className="font-playfair text-lg text-gold font-semibold mb-4">📤 Uploader une image</h3>
        <div className="flex items-center gap-4">
          <label className={`cursor-pointer px-6 py-3 rounded-lg text-sm font-semibold transition-colors ${uploading ? 'bg-white/5 text-white/20' : 'bg-gold hover:bg-gold-dark text-dark'}`}>
            {uploading ? '⏳ Upload en cours...' : '+ Choisir une image'}
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
          <span className="text-xs text-white/30">JPG, PNG ou WebP • Max 10 MB</span>
        </div>
      </div>

      {/* GESTION DES BIENS */}
      <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
        <h3 className="font-playfair text-lg text-gold font-semibold mb-4">🏠 Photos des biens</h3>

        <div className="space-y-6">
          {mediaData.properties.map((property: any) => (
            <div key={property.id} className="p-4 rounded-lg border border-white/5 bg-dark">
              <h4 className="text-sm font-semibold text-white mb-3">{property.name}</h4>

              {/* Cover */}
              <div className="mb-3">
                <span className="text-[10px] uppercase tracking-wider text-white/30">Photo de couverture</span>
                <div className="flex items-center gap-3 mt-2">
                  {property.coverPhoto ? (
                    <div className="relative w-24 h-16 rounded overflow-hidden border border-gold/30">
                      <img src={property.coverPhoto} alt="cover" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-24 h-16 rounded bg-dark-lighter border border-white/5 flex items-center justify-center text-white/20 text-xs">
                      Aucune
                    </div>
                  )}
                  <select
                    className="flex-1 bg-dark border border-white/10 rounded px-3 py-2 text-xs text-white/60 focus:border-gold/50 focus:outline-none"
                    value=""
                    onChange={(e) => { if (e.target.value) assignToProperty(property.id, e.target.value, 'cover'); }}
                  >
                    <option value="">Changer la couverture...</option>
                    {mediaData.files.map((f: any) => (
                      <option key={f.path} value={f.path}>{f.name} ({f.folder})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Galerie */}
              <div>
                <span className="text-[10px] uppercase tracking-wider text-white/30">Galerie ({(property.photos || []).length} photos)</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(property.photos || []).map((photo: string, i: number) => (
                    <div key={i} className="relative w-20 h-14 rounded overflow-hidden border border-white/10 group/thumb">
                      <img src={photo} alt={`photo ${i}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFromGallery(property.id, photo)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-500/80 text-white text-[8px] hidden group-hover/thumb:flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <select
                    className="w-20 h-14 bg-dark-lighter border border-dashed border-white/10 rounded text-[10px] text-white/30 focus:border-gold/50 focus:outline-none text-center"
                    value=""
                    onChange={(e) => { if (e.target.value) assignToProperty(property.id, e.target.value, 'gallery'); }}
                  >
                    <option value="">+ Ajouter</option>
                    {mediaData.files.map((f: any) => (
                      <option key={f.path} value={f.path}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GESTION DES EXTRAS */}
      <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
        <h3 className="font-playfair text-lg text-gold font-semibold mb-4">⭐ Photos des extras</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mediaData.extras.map((extra: any) => (
            <div key={extra.id} className="p-4 rounded-lg border border-white/5 bg-dark flex items-center gap-3">
              {extra.photo ? (
                <div className="w-16 h-12 rounded overflow-hidden border border-white/10 flex-shrink-0">
                  <img src={extra.photo} alt={extra.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-12 rounded bg-dark-lighter border border-white/5 flex items-center justify-center text-white/20 text-xs flex-shrink-0">
                  —
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white/70 truncate">{extra.name}</p>
                <p className="text-[10px] text-white/30">{extra.category}</p>
              </div>
              <select
                className="w-32 bg-dark border border-white/10 rounded px-2 py-1.5 text-[10px] text-white/50 focus:border-gold/50 focus:outline-none"
                value=""
                onChange={(e) => { if (e.target.value) assignToExtra(extra.id, e.target.value); }}
              >
                <option value="">Changer...</option>
                {mediaData.files.map((f: any) => (
                  <option key={f.path} value={f.path}>{f.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* BIBLIOTHÈQUE D'IMAGES */}
      <div className="p-6 rounded-lg border border-white/5 bg-dark-light">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-playfair text-lg text-gold font-semibold">📁 Bibliothèque ({mediaData.files.length} images)</h3>
          <div className="flex gap-2">
            {['all', 'uploads', 'images', 'biens', 'extras'].map((folder) => (
              <button key={folder} onClick={() => setFilterFolder(folder)}
                className={`px-3 py-1 rounded text-xs transition-colors ${filterFolder === folder ? 'bg-gold/15 text-gold border border-gold/30' : 'text-white/30 border border-white/5 hover:border-white/10'}`}>
                {folder === 'all' ? 'Tout' : folder}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
          {filteredFiles.map((file: any) => (
            <div key={file.path}
              onClick={() => setSelectedImage(selectedImage === file.path ? '' : file.path)}
              className={`relative aspect-square rounded overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === file.path ? 'border-gold scale-95' : 'border-transparent hover:border-white/20'}`}>
              <img src={file.path} alt={file.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-dark/80 px-1 py-0.5">
                <p className="text-[8px] text-white/40 truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedImage && (
          <div className="mt-4 p-4 rounded-lg bg-dark border border-gold/20">
            <div className="flex items-center gap-4">
              <img src={selectedImage} alt="selected" className="w-24 h-16 rounded object-cover" />
              <div className="flex-1 space-y-2">
                <p className="text-xs text-white/60">{selectedImage}</p>
                <div className="flex gap-2">
                  <select value={selectedProperty} onChange={(e) => setSelectedProperty(e.target.value)}
                    className="flex-1 bg-dark border border-white/10 rounded px-2 py-1.5 text-xs text-white/50 focus:outline-none">
                    <option value="">Assigner à un bien...</option>
                    {mediaData.properties.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {selectedProperty && (
                    <div className="flex gap-1">
                      <button onClick={() => { assignToProperty(selectedProperty, selectedImage, 'cover'); setSelectedProperty(''); }}
                        className="px-2 py-1 rounded bg-gold/20 text-gold text-[10px] hover:bg-gold/30">Couverture</button>
                      <button onClick={() => { assignToProperty(selectedProperty, selectedImage, 'gallery'); setSelectedProperty(''); }}
                        className="px-2 py-1 rounded bg-gold/10 text-gold/70 text-[10px] hover:bg-gold/20">Galerie</button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <select value={selectedExtra} onChange={(e) => setSelectedExtra(e.target.value)}
                    className="flex-1 bg-dark border border-white/10 rounded px-2 py-1.5 text-xs text-white/50 focus:outline-none">
                    <option value="">Assigner à un extra...</option>
                    {mediaData.extras.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  {selectedExtra && (
                    <button onClick={() => { assignToExtra(selectedExtra, selectedImage); setSelectedExtra(''); }}
                      className="px-3 py-1 rounded bg-gold/20 text-gold text-[10px] hover:bg-gold/30">Assigner</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const statusColors: Record<string, string> = {
  DRAFT: 'text-white/40 bg-white/5 border-white/10',
  PENDING: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  ACTIVE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  PAUSED: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  ARCHIVED: 'text-red-400 bg-red-400/10 border-red-400/20',
  CONFIRMED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  CHECKED_IN: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  CHECKED_OUT: 'text-white/40 bg-white/5 border-white/10',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  OPEN: 'text-red-400 bg-red-400/10 border-red-400/20',
  IN_PROGRESS: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  RESOLVED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  CLOSED: 'text-white/40 bg-white/5 border-white/10',
};

type Tab = 'overview' | 'properties' | 'bookings' | 'users' | 'tickets';

export default function AdminPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) { router.push('/login'); return; }

    const parsed = JSON.parse(user);
    if (parsed.role !== 'ADMIN') { router.push('/'); return; }

    api.get('/admin/stats')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const updatePropertyStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/properties/${id}/status`, { status });
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/bookings/${id}/status`, { status });
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/tickets/${id}/status`, { status });
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-dark-lighter rounded animate-pulse w-64 mb-8"></div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-dark-lighter rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'properties', label: 'Biens', icon: '🏠' },
    { id: 'bookings', label: 'Réservations', icon: '📅' },
    { id: 'users', label: 'Utilisateurs', icon: '👥' },
    { id: 'tickets', label: 'Tickets', icon: '🎫' },
    { id: 'medias', label: 'Médias', icon: '🖼️' },
  ];

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">
              Back-office <span className="text-gold">Admin</span>
            </h1>
            <p className="mt-1 text-white/40 text-sm">Gestion de la plateforme Marrakech Access</p>
          </div>
          <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
          }} className="text-xs text-white/30 hover:text-red-400 transition-colors">
            Déconnexion
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {[
            { label: 'Revenus', value: `${data.kpis.totalRevenue.toLocaleString()}`, icon: '💰' },
            { label: 'Utilisateurs', value: data.kpis.usersCount, icon: '👥' },
            { label: 'Biens', value: data.kpis.propertiesCount, icon: '🏠' },
            { label: 'Réservations', value: data.kpis.bookingsCount, icon: '📅' },
            { label: 'Extras', value: data.kpis.extrasCount, icon: '🎯' },
            { label: 'Tickets ouverts', value: data.kpis.openTickets, icon: '🎫' },
          ].map((kpi, i) => (
            <div key={i} className="p-4 rounded-lg border border-white/5 bg-dark-light text-center">
              <span className="text-lg block">{kpi.icon}</span>
              <p className="font-playfair text-xl font-bold text-white mt-1">{kpi.value}</p>
              <p className="text-[9px] uppercase tracking-wider text-white/30 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-inter whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gold text-dark font-semibold'
                  : 'border border-white/10 text-white/40 hover:border-gold/30 hover:text-gold'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* CONTENU ONGLETS */}

        {/* VUE D'ENSEMBLE */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dernières réservations */}
            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-4">Dernières réservations</h2>
              <div className="space-y-2">
                {data.recentBookings.slice(0, 5).map((b: any) => (
                  <div key={b.id} className="p-3 rounded-lg border border-white/5 bg-dark-light flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white/70">{b.guest.firstName} {b.guest.lastName}</p>
                      <p className="text-xs text-white/30">{b.property.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gold font-semibold">{Number(b.totalAmount).toLocaleString()} MAD</p>
                      <span className={`px-2 py-0.5 rounded text-[9px] border ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tickets ouverts */}
            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-4">
                Tickets ouverts ({data.openTickets.length})
              </h2>
              {data.openTickets.length === 0 ? (
                <div className="text-center py-10 text-white/30">
                  <span className="text-3xl block mb-2">✅</span>
                  <p className="text-sm">Aucun ticket ouvert</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {data.openTickets.map((t: any) => (
                    <div key={t.id} className="p-3 rounded-lg border border-white/5 bg-dark-light">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-white/70">{t.subject}</p>
                        <span className={`px-2 py-0.5 rounded text-[9px] border ${statusColors[t.status]}`}>
                          {t.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/30">
                        Par {t.creator.firstName} {t.creator.lastName}
                        {t.booking?.property && ` · ${t.booking.property.name}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* ONGLET MÉDIAS */}
          {activeTab === 5 && <MediaManager token={token} apiUrl={process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'} />}

        {/* BIENS */}
        {activeTab === 'properties' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
                  <th className="text-left py-3 pr-4">Bien</th>
                  <th className="text-left py-3 pr-4">Propriétaire</th>
                  <th className="text-left py-3 pr-4">Type</th>
                  <th className="text-left py-3 pr-4">Quartier</th>
                  <th className="text-left py-3 pr-4">Prix/nuit</th>
                  <th className="text-left py-3 pr-4">Résa</th>
                  <th className="text-left py-3 pr-4">Statut</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.properties.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-dark-lighter transition-colors">
                    <td className="py-3 pr-4 text-white/70 font-semibold">{p.name}</td>
                    <td className="py-3 pr-4 text-white/40">{p.owner.firstName} {p.owner.lastName}</td>
                    <td className="py-3 pr-4 text-white/40">{p.type}</td>
                    <td className="py-3 pr-4 text-white/40">{p.district}</td>
                    <td className="py-3 pr-4 text-gold">{Number(p.priceLowSeason).toLocaleString()} MAD</td>
                    <td className="py-3 pr-4 text-white/40">{p._count.bookings}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] border ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={p.status}
                        onChange={(e) => updatePropertyStatus(p.id, e.target.value)}
                        className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white/60 focus:border-gold/50 focus:outline-none"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* RÉSERVATIONS */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
                  <th className="text-left py-3 pr-4">Client</th>
                  <th className="text-left py-3 pr-4">Bien</th>
                  <th className="text-left py-3 pr-4">Dates</th>
                  <th className="text-left py-3 pr-4">Nuits</th>
                  <th className="text-left py-3 pr-4">Montant</th>
                  <th className="text-left py-3 pr-4">Statut</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBookings.map((b: any) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-dark-lighter transition-colors">
                    <td className="py-3 pr-4">
                      <p className="text-white/70">{b.guest.firstName} {b.guest.lastName}</p>
                      <p className="text-[10px] text-white/30">{b.guest.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-white/40">{b.property.name}</td>
                    <td className="py-3 pr-4 text-white/40 text-xs">
                      {new Date(b.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      {' → '}
                      {new Date(b.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 pr-4 text-white/40">{b.nights}</td>
                    <td className="py-3 pr-4 text-gold font-semibold">{Number(b.totalAmount).toLocaleString()} MAD</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] border ${statusColors[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <select
                        value={b.status}
                        onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                        className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white/60 focus:border-gold/50 focus:outline-none"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CHECKED_IN">Checked In</option>
                        <option value="CHECKED_OUT">Checked Out</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* UTILISATEURS */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
                  <th className="text-left py-3 pr-4">Nom</th>
                  <th className="text-left py-3 pr-4">Email</th>
                  <th className="text-left py-3 pr-4">Rôle</th>
                  <th className="text-left py-3">Inscrit le</th>
                </tr>
              </thead>
              <tbody>
                {data.recentUsers.map((u: any) => (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-dark-lighter transition-colors">
                    <td className="py-3 pr-4 text-white/70">{u.firstName} {u.lastName}</td>
                    <td className="py-3 pr-4 text-white/40">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] border ${
                        u.role === 'ADMIN' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                        u.role === 'OWNER' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                        'text-white/40 bg-white/5 border-white/10'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-white/30 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TICKETS */}
        {activeTab === 'tickets' && (
          <div>
            {data.openTickets.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-5xl block mb-4">✅</span>
                <h2 className="font-playfair text-xl text-white/60">Aucun ticket ouvert</h2>
                <p className="mt-2 text-white/30 text-sm">Tout roule !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.openTickets.map((t: any) => (
                  <div key={t.id} className="p-4 rounded-lg border border-white/5 bg-dark-light">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-semibold text-white/70">{t.subject}</h3>
                        <p className="text-xs text-white/30 mt-1">
                          Type: {t.type} · Par {t.creator.firstName} {t.creator.lastName}
                          {t.booking?.property && ` · Bien: ${t.booking.property.name}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[9px] border ${statusColors[t.priority] || statusColors[t.status]}`}>
                          {t.priority}
                        </span>
                        <select
                          value={t.status}
                          onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                          className="bg-dark border border-white/10 rounded px-2 py-1 text-xs text-white/60 focus:border-gold/50 focus:outline-none"
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}