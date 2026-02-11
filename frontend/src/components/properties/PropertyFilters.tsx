'use client';

interface FiltersProps {
  filters: {
    district: string;
    type: string;
    maxBudget: string;
    minCapacity: string;
  };
  districts: string[];
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  total: number;
}

const typeOptions = [
  { value: '', label: 'Tous les types' },
  { value: 'VILLA', label: 'Villa' },
  { value: 'RIAD', label: 'Riad' },
  { value: 'APPARTEMENT', label: 'Appartement' },
  { value: 'DAR', label: 'Dar' },
  { value: 'SUITE', label: 'Suite' },
];

export default function PropertyFilters({ filters, districts, onChange, onReset, total }: FiltersProps) {
  const hasFilters = filters.district || filters.type || filters.maxBudget || filters.minCapacity;

  return (
    <div className="bg-dark-light border border-white/5 rounded-lg p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Quartier */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Quartier</label>
          <select
            value={filters.district}
            onChange={(e) => onChange('district', e.target.value)}
            className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none transition-colors"
          >
            <option value="">Tous les quartiers</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Type</label>
          <select
            value={filters.type}
            onChange={(e) => onChange('type', e.target.value)}
            className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none transition-colors"
          >
            {typeOptions.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        {/* Budget max */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Budget max / nuit</label>
          <select
            value={filters.maxBudget}
            onChange={(e) => onChange('maxBudget', e.target.value)}
            className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none transition-colors"
          >
            <option value="">Sans limite</option>
            <option value="1500">Jusqu&apos;à 1 500 MAD</option>
            <option value="2500">Jusqu&apos;à 2 500 MAD</option>
            <option value="4000">Jusqu&apos;à 4 000 MAD</option>
            <option value="6000">Jusqu&apos;à 6 000 MAD</option>
          </select>
        </div>

        {/* Capacité */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/30 mb-1.5">Voyageurs</label>
          <select
            value={filters.minCapacity}
            onChange={(e) => onChange('minCapacity', e.target.value)}
            className="w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/80 focus:border-gold/50 focus:outline-none transition-colors"
          >
            <option value="">Peu importe</option>
            <option value="2">2+ personnes</option>
            <option value="4">4+ personnes</option>
            <option value="6">6+ personnes</option>
            <option value="8">8+ personnes</option>
          </select>
        </div>
      </div>

      {/* Résultats + Reset */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-white/30">
          {total} bien{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
        </span>
        {hasFilters && (
          <button onClick={onReset}
                  className="text-xs text-gold/60 hover:text-gold transition-colors">
            ✕ Réinitialiser les filtres
          </button>
        )}
      </div>
    </div>
  );
}