'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Property {
  id: string;
  name: string;
  slug: string;
  type: string;
  district: string;
  latitude: number | null;
  longitude: number | null;
  priceLowSeason: string;
  coverPhoto?: string;
  bedrooms: number;
  capacity: number;
}

interface PropertyMapProps {
  properties: Property[];
  selectedSlug?: string;
  onMarkerClick?: (slug: string) => void;
  height?: string;
}

// Coordonnées des quartiers de Marrakech (fallback si pas de coords)
const districtCoords: Record<string, { lat: number; lng: number }> = {
  'Palmeraie': { lat: 31.6695, lng: -7.9635 },
  'Médina': { lat: 31.6295, lng: -7.9811 },
  'Guéliz': { lat: 31.6347, lng: -8.0078 },
  'Hivernage': { lat: 31.6180, lng: -8.0150 },
  'Amelkis': { lat: 31.5950, lng: -7.9450 },
  'Mellah': { lat: 31.6220, lng: -7.9780 },
  'Agdal': { lat: 31.6050, lng: -8.0200 },
};

// Icônes par type de bien
const typeIcons: Record<string, string> = {
  'VILLA': '🏡',
  'RIAD': '🕌',
  'APPARTEMENT': '🏢',
  'DAR': '🏠',
  'SUITE': '🛏️',
};

export default function PropertyMap({ properties, selectedSlug, onMarkerClick, height = '500px' }: PropertyMapProps) {
  const [MapComponents, setMapComponents] = useState<any>(null);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  // Charger react-leaflet dynamiquement (client-side only)
  useEffect(() => {
    (async () => {
      const L = await import('leaflet');
      const { MapContainer, TileLayer, Marker, Popup } = await import('react-leaflet');
      
      // Fix pour les icônes Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      setMapComponents({ L, MapContainer, TileLayer, Marker, Popup });
    })();
  }, []);

  if (!MapComponents) {
    return (
      <div 
        className="rounded-xl bg-dark-lighter flex items-center justify-center border border-white/10"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full mx-auto mb-3"></div>
          <span className="text-white/40 text-sm">Chargement de la carte...</span>
        </div>
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup } = MapComponents;

  // Préparer les propriétés avec coordonnées
  const propertiesWithCoords = properties.map(property => {
    let lat = property.latitude;
    let lng = property.longitude;

    if (!lat || !lng) {
      const districtCoord = districtCoords[property.district];
      if (districtCoord) {
        lat = districtCoord.lat + (Math.random() - 0.5) * 0.01;
        lng = districtCoord.lng + (Math.random() - 0.5) * 0.01;
      }
    }

    return { ...property, lat, lng };
  }).filter(p => p.lat && p.lng);

  // Créer une icône personnalisée
  const createCustomIcon = (property: Property, isSelected: boolean) => {
    const icon = typeIcons[property.type] || '📍';
    const price = Math.round(parseFloat(property.priceLowSeason) / 1000);
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="marker-wrapper ${isSelected ? 'selected' : ''}">
          <div class="marker-icon">${icon}</div>
          <div class="marker-price">${price}k</div>
        </div>
      `,
      iconSize: [50, 60],
      iconAnchor: [25, 60],
      popupAnchor: [0, -60],
    });
  };

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10" style={{ height }}>
      {/* CSS pour les marqueurs */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
        
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .marker-wrapper:hover {
          transform: scale(1.15);
        }
        .marker-wrapper.selected {
          transform: scale(1.2);
        }
        .marker-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border: 3px solid #D4AF37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.5);
        }
        .marker-wrapper.selected .marker-icon {
          border-color: #FFD700;
          box-shadow: 0 0 25px rgba(212, 175, 55, 0.6);
        }
        .marker-price {
          background: linear-gradient(135deg, #D4AF37 0%, #B8960C 100%);
          color: #1a1a1a;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          margin-top: -10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .leaflet-container {
          background: #1a1a1a !important;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          color: white;
        }
        .leaflet-popup-tip {
          background: #1a1a1a !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .leaflet-popup-close-button {
          color: rgba(255,255,255,0.5) !important;
          font-size: 20px !important;
          padding: 8px !important;
        }
        .leaflet-popup-close-button:hover {
          color: #D4AF37 !important;
        }
        .leaflet-control-attribution {
          background: rgba(26, 26, 26, 0.9) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #D4AF37 !important;
        }
        .leaflet-control-zoom {
          border: none !important;
        }
        .leaflet-control-zoom a {
          background: #1a1a1a !important;
          color: #D4AF37 !important;
          border: 1px solid rgba(212, 175, 55, 0.3) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #2a2a2a !important;
        }
      `}</style>

      <MapContainer
        center={[31.6295, -7.9811]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat!, property.lng!]}
            icon={createCustomIcon(property, property.slug === selectedSlug)}
            eventHandlers={{
              click: () => onMarkerClick?.(property.slug),
              mouseover: () => setHoveredProperty(property),
              mouseout: () => setHoveredProperty(null),
            }}
          >
            <Popup>
              <div className="w-56">
                {property.coverPhoto && (
                  <div className="h-28 -mx-0 -mt-0 overflow-hidden rounded-t-lg">
                    <img 
                      src={property.coverPhoto} 
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{typeIcons[property.type]}</span>
                    <h4 className="font-semibold text-white text-sm truncate">{property.name}</h4>
                  </div>
                  <p className="text-xs text-white/50 mb-2">📍 {property.district}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      {property.bedrooms} ch. · {property.capacity} pers.
                    </span>
                    <span className="text-gold font-bold">
                      {parseFloat(property.priceLowSeason).toLocaleString()} MAD
                    </span>
                  </div>
                  <Link 
                    href={`/properties/${property.slug}`}
                    className="mt-3 block w-full text-center py-2 bg-gold hover:bg-gold-dark text-dark text-xs font-semibold rounded-lg transition-colors"
                  >
                    Voir le bien →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-dark/90 backdrop-blur-sm rounded-lg p-3 border border-white/10 z-[1000]">
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Types de biens</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeIcons).map(([type, icon]) => (
            <span key={type} className="flex items-center gap-1 text-xs text-white/60">
              {icon} {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
