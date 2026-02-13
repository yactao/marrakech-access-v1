'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

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