'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';

function PropertiesContent() {
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      console.log('FIRST PROPERTY:', JSON.stringify(res.data.properties[0]));
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

  return (
    <main className="min-h-screen pt-24 pb-16 px-4 bg-dark">
      <div className="max-w-7xl mx-auto">

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-white">
            Nos <span className="text-gold">Collections</span>
          </h1>
          <p className="mt-2 text-white/40 max-w-lg">
            Découvrez notre sélection de biens d&apos;exception à Marrakech
          </p>
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

        {/* Grille de propriétés */}
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
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              console.log('PROPERTY:', property.name, property.coverPhoto);
              return <PropertyCard key={property.id} property={property} />;
            })}
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