'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  CONFIRMED: { label: 'Confirmée', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  CHECKED_IN: { label: 'En cours', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  CHECKED_OUT: { label: 'Terminée', color: 'text-white/40 bg-white/5 border-white/10' },
  CANCELLED: { label: 'Annulée', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Vérifier l'auth
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (!token || !user) {
      router.push('/login');
      return;
    }

    const parsed = JSON.parse(user);
    if (parsed.role !== 'OWNER' && parsed.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    setUserName(parsed.firstName);

    // Charger les stats
    api.get('/owner/stats')
      .then((res) => setData(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.push('/login');
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-dark-lighter rounded animate-pulse w-64 mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-dark-lighter rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-white">
              Bonjour, <span className="text-gold">{userName}</span> 👋
            </h1>
            <p className="mt-1 text-white/40 text-sm">Voici un aperçu de votre activité</p>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              router.push('/login');
            }}
            className="text-xs text-white/30 hover:text-red-400 transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Chiffre d\'affaires', value: `${data.kpis.totalRevenue.toLocaleString()} MAD`, icon: '💰' },
            { label: 'Réservations', value: data.kpis.totalBookings, icon: '📅' },
            { label: 'Taux occupation', value: `${data.kpis.occupancyRate}%`, icon: '📊' },
            { label: 'Note moyenne', value: data.kpis.avgRating ? `${data.kpis.avgRating} ★` : 'N/A', icon: '⭐' },
          ].map((kpi, i) => (
            <div key={i} className="p-5 rounded-lg border border-white/5 bg-dark-light">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-wider text-white/30">{kpi.label}</span>
                <span className="text-xl">{kpi.icon}</span>
              </div>
              <p className="font-playfair text-2xl font-bold text-white">{kpi.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Colonne gauche — Mes biens */}
          <div className="lg:col-span-1">
            <h2 className="font-playfair text-lg font-semibold text-gold mb-4">
              Mes biens ({data.properties.length})
            </h2>
            <div className="space-y-3">
              {data.properties.map((property: any) => (
                <Link key={property.id} href={`/properties/${property.slug}`}
                      className="block p-4 rounded-lg border border-white/5 bg-dark-light hover:border-gold/20 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-dark-lighter flex items-center justify-center text-xl">
                      {property.type === 'VILLA' ? '🏡' : property.type === 'RIAD' ? '🕌' : '🏢'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white truncate">{property.name}</h3>
                      <p className="text-xs text-white/30">{property.district}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gold font-semibold">{property.bookingsCount} résa</p>
                      {property.avgRating && (
                        <p className="text-[10px] text-white/30">★ {property.avgRating}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne droite — Réservations */}
          <div className="lg:col-span-2">

            {/* Prochaines réservations */}
            {data.upcomingBookings.length > 0 && (
              <div className="mb-8">
                <h2 className="font-playfair text-lg font-semibold text-gold mb-4">
                  📅 Prochaines réservations
                </h2>
                <div className="space-y-3">
                  {data.upcomingBookings.map((booking: any) => (
                    <div key={booking.id} className="p-4 rounded-lg border border-white/5 bg-dark-light">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center text-gold text-sm font-bold">
                            {booking.guest.firstName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {booking.guest.firstName} {booking.guest.lastName}
                            </p>
                            <p className="text-xs text-white/30">{booking.guest.email}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-[10px] font-inter border ${
                          statusLabels[booking.status]?.color || 'text-white/40'
                        }`}>
                          {statusLabels[booking.status]?.label || booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs text-white/40">
                        <span>
                          📅 {new Date(booking.checkIn).toLocaleDateString('fr-FR')} → {new Date(booking.checkOut).toLocaleDateString('fr-FR')}
                        </span>
                        <span>
                          {booking.nights} nuit{booking.nights > 1 ? 's' : ''} · {booking.guestsCount} voyageur{booking.guestsCount > 1 ? 's' : ''}
                        </span>
                        <span className="text-gold font-semibold">
                          {Number(booking.totalAmount).toLocaleString()} MAD
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dernières réservations */}
            <div>
              <h2 className="font-playfair text-lg font-semibold text-gold mb-4">
                📋 Dernières réservations
              </h2>
              {data.recentBookings.length === 0 ? (
                <div className="text-center py-10">
                  <span className="text-4xl block mb-3">📭</span>
                  <p className="text-white/40 text-sm">Aucune réservation pour le moment</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] uppercase tracking-wider text-white/30">
                        <th className="text-left py-3 pr-4">Client</th>
                        <th className="text-left py-3 pr-4">Dates</th>
                        <th className="text-left py-3 pr-4">Nuits</th>
                        <th className="text-left py-3 pr-4">Montant</th>
                        <th className="text-left py-3">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentBookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-dark-lighter transition-colors">
                          <td className="py-3 pr-4 text-white/60">
                            {booking.guest.firstName} {booking.guest.lastName}
                          </td>
                          <td className="py-3 pr-4 text-white/40">
                            {new Date(booking.checkIn).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            {' → '}
                            {new Date(booking.checkOut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3 pr-4 text-white/40">{booking.nights}</td>
                          <td className="py-3 pr-4 text-gold font-semibold">
                            {Number(booking.totalAmount).toLocaleString()} MAD
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${
                              statusLabels[booking.status]?.color || 'text-white/40'
                            }`}>
                              {statusLabels[booking.status]?.label || booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}