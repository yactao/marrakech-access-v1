'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';
import dynamic from 'next/dynamic';

// Charger la carte dynamiquement (client-side only)
const PropertyMap = dynamic(() => import('@/components/map/PropertyMap'), { 
  ssr: false,
  loading: () => (
    <div className="h-[500px] rounded-xl bg-dark-lighter animate-pulse flex items-center justify-center">
      <span className="text-white/30">Chargement de la carte...</span>
    </div>
  ),
});

function PropertiesContent() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    district: searchParams.get('district') || '',
    type: searchParams.get('type') || '',
    maxBudget: searchParams.get('maxBudget') || '',
    minCapacity: searchParams.get('minCapacity') || '',
  });

  // Charger les quartiers
  useEffect(() => {
    api.get('/properties/districts')
      .then((res) => setDistricts(res.data.districts))
      .catch(console.error);
  }, []);

  // Charger les propriétés
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.district) params.district = filters.district;
      if (filters.type) params.type = filters.type;
      if (filters.maxBudget) params.maxBudget = filters.maxBudget;
      if (filters.minCapacity) params.minCapacity = filters.minCapacity;

     const res = await api.get('/properties', { params });
      setProperties(res.data.properties);
      setTotal(res.data.pagination.total);
    } catch (error) {
      console.error('Erreur chargement propriétés:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ district: '', type: '', maxBudget: '', minCapacity: '' });
  };

  const handleMarkerClick = (slug: string) => {
    setSelectedProperty(slug);
    // Scroll vers la carte sur mobile si on est en mode carte
    const card = document.getElementById(`property-${slug}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* En-tête */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
              Nos <span className="text-gold">Collections</span>
            </h1>
            <p className="mt-2 text-white/40 max-w-lg">
              Découvrez notre sélection de biens d&apos;exception à Marrakech
            </p>
          </div>
          
          {/* Toggle Vue */}
          <div className="flex items-center gap-2 bg-dark-light rounded-lg p-1 border border-white/5">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'grid'
                  ? 'bg-gold text-dark font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grille
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                viewMode === 'map'
                  ? 'bg-gold text-dark font-semibold'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Carte
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-8">
          <PropertyFilters
            filters={filters}
            districts={districts}
            onChange={handleFilterChange}
            onReset={handleReset}
            total={total}
          />
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg border border-white/5 bg-dark-light overflow-hidden">
                <div className="h-52 bg-dark-lighter animate-pulse"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-dark-lighter rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-dark-lighter rounded animate-pulse w-1/2"></div>
                  <div className="h-3 bg-dark-lighter rounded animate-pulse w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl block mb-4">🏜️</span>
            <h2 className="font-playfair text-xl text-white/60">Aucun bien trouvé</h2>
            <p className="mt-2 text-white/30 text-sm">Essayez de modifier vos filtres</p>
            <button onClick={handleReset}
                    className="mt-4 text-sm text-gold hover:text-gold-light transition-colors">
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'map' ? (
          /* VUE CARTE */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Carte */}
            <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
              <PropertyMap 
                properties={properties}
                selectedSlug={selectedProperty || undefined}
                onMarkerClick={handleMarkerClick}
                height="100%"
              />
            </div>
            
            {/* Liste scrollable */}
            <div className="space-y-4 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
              {properties.map((property) => (
                <div
                  key={property.id}
                  id={`property-${property.slug}`}
                  className={`transition-all duration-300 ${
                    selectedProperty === property.slug 
                      ? 'ring-2 ring-gold rounded-lg' 
                      : ''
                  }`}
                  onClick={() => setSelectedProperty(property.slug)}
                >
                  <PropertyCard property={property} compact />
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* VUE GRILLE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 bg-dark-lighter rounded animate-pulse w-64 mb-8"></div>
        </div>
      </main>
    }>
      <PropertiesContent />
    </Suspense>
  );
}