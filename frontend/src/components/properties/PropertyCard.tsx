import Link from 'next/link';

interface PropertyCardProps {
  property: {
    slug: string;
    name: string;
    type: string;
    shortDesc: string | null;
    district: string;
    bedrooms: number;
    bathrooms: number;
    capacity: number;
    surface: number;
    priceLowSeason: string;
    priceHighSeason: string;
    currency: string;
    coverPhoto: string | null;
    avgRating: number | null;
    reviewsCount: number;
  };
}

const typeLabels: Record<string, string> = {
  VILLA: 'Villa',
  RIAD: 'Riad',
  APPARTEMENT: 'Appartement',
  DAR: 'Dar',
  SUITE: 'Suite',
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const price = parseFloat(property.priceLowSeason);

  return (
    <Link href={`/properties/${property.slug}`}
          className="group block rounded-lg overflow-hidden border border-white/5 hover:border-gold/20 transition-all duration-500 bg-dark-light">

      {/* Image */}
      <div className="relative h-52 bg-dark-lighter overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent z-10"></div>
        
        {/* Placeholder image */}
        <div className="w-full h-full flex items-center justify-center text-white/10 text-6xl group-hover:scale-105 transition-transform duration-700">
          {property.type === 'VILLA' ? '🏡' : property.type === 'RIAD' ? '🕌' : property.type === 'APPARTEMENT' ? '🏢' : property.type === 'DAR' ? '🏠' : '✨'}
        </div>

        {/* Badge type */}
        <span className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-dark/80 backdrop-blur-sm rounded text-[10px] font-inter tracking-wider text-gold uppercase">
          {typeLabels[property.type] || property.type}
        </span>

        {/* Badge rating */}
        {property.avgRating && (
          <span className="absolute top-3 right-3 z-20 px-2 py-1 bg-gold/90 rounded text-[11px] font-inter font-semibold text-dark">
            ★ {property.avgRating}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-playfair text-base font-semibold text-white group-hover:text-gold transition-colors duration-300 line-clamp-1">
              {property.name}
            </h3>
            <p className="text-xs text-white/40 mt-0.5">{property.district}</p>
          </div>
        </div>

        {property.shortDesc && (
          <p className="mt-2 text-xs text-white/30 line-clamp-2">{property.shortDesc}</p>
        )}

        {/* Specs */}
        <div className="mt-3 flex items-center gap-3 text-[11px] text-white/40">
          <span>{property.bedrooms} ch.</span>
          <span className="text-white/10">|</span>
          <span>{property.bathrooms} sdb</span>
          <span className="text-white/10">|</span>
          <span>{property.capacity} pers.</span>
          <span className="text-white/10">|</span>
          <span>{property.surface}m²</span>
        </div>

        {/* Prix */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-end justify-between">
          <div>
            <span className="font-playfair text-lg font-bold text-gold">{price.toLocaleString()}</span>
            <span className="text-xs text-white/30 ml-1">{property.currency}/nuit</span>
          </div>
          <span className="text-[10px] text-white/20 font-inter">min. nuit dispo</span>
        </div>
      </div>
    </Link>
  );
}