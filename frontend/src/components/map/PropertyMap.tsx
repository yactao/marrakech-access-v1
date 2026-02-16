'use client';

import { useEffect, useRef, useState } from 'react';
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

export default function PropertyMap({ properties, selectedSlug, onMarkerClick, height = '400px' }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);

  useEffect(() => {
    // Charger Leaflet dynamiquement
    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return;
      
      // Charger le CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Charger le JS
      if (!(window as any).L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setIsLoaded(true);
        document.body.appendChild(script);
      } else {
        setIsLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    // Centrer sur Marrakech
    const map = L.map(mapRef.current, {
      center: [31.6295, -7.9811],
      zoom: 12,
      scrollWheelZoom: false,
    });

    // Ajouter le layer de tuiles (style sombre)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Ajouter les nouveaux marqueurs
    const bounds: any[] = [];

    properties.forEach((property) => {
      let lat = property.latitude;
      let lng = property.longitude;

      // Utiliser les coordonnées du quartier si pas de coords précises
      if (!lat || !lng) {
        const districtCoord = districtCoords[property.district];
        if (districtCoord) {
          // Ajouter un léger décalage aléatoire pour éviter les superpositions
          lat = districtCoord.lat + (Math.random() - 0.5) * 0.01;
          lng = districtCoord.lng + (Math.random() - 0.5) * 0.01;
        }
      }

      if (!lat || !lng) return;

      bounds.push([lat, lng]);

      // Créer un marqueur personnalisé
      const isSelected = property.slug === selectedSlug;
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div class="marker-container ${isSelected ? 'selected' : ''}">
            <div class="marker-icon">${typeIcons[property.type] || '📍'}</div>
            <div class="marker-price">${Math.round(parseFloat(property.priceLowSeason) / 1000)}k</div>
          </div>
        `,
        iconSize: [50, 60],
        iconAnchor: [25, 60],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => {
          if (onMarkerClick) onMarkerClick(property.slug);
        })
        .on('mouseover', () => setHoveredProperty(property))
        .on('mouseout', () => setHoveredProperty(null));

      markersRef.current.push(marker);
    });

    // Ajuster la vue pour montrer tous les marqueurs
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [properties, selectedSlug, isLoaded, onMarkerClick]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-white/10">
      {/* Carte */}
      <div ref={mapRef} style={{ height, width: '100%' }} className="z-0" />

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-dark/90 backdrop-blur-sm rounded-lg p-3 border border-white/10 z-10">
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-2">Types de biens</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeIcons).map(([type, icon]) => (
            <span key={type} className="flex items-center gap-1 text-xs text-white/60">
              {icon} {type.charAt(0) + type.slice(1).toLowerCase()}
            </span>
          ))}
        </div>
      </div>

      {/* Popup au survol */}
      {hoveredProperty && (
        <div className="absolute top-4 right-4 w-64 bg-dark/95 backdrop-blur-sm rounded-lg border border-gold/20 overflow-hidden z-20 shadow-xl">
          {hoveredProperty.coverPhoto && (
            <div className="h-24 overflow-hidden">
              <img 
                src={hoveredProperty.coverPhoto} 
                alt={hoveredProperty.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <span>{typeIcons[hoveredProperty.type]}</span>
              <h4 className="font-playfair text-sm font-semibold text-white truncate">{hoveredProperty.name}</h4>
            </div>
            <p className="text-xs text-white/40 mb-2">📍 {hoveredProperty.district}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/40">
                {hoveredProperty.bedrooms} ch. · {hoveredProperty.capacity} pers.
              </span>
              <span className="text-gold font-semibold text-sm">
                {parseFloat(hoveredProperty.priceLowSeason).toLocaleString()} MAD
              </span>
            </div>
            <Link 
              href={`/properties/${hoveredProperty.slug}`}
              className="mt-2 block text-center text-xs text-gold hover:text-gold-dark transition-colors"
            >
              Voir le bien →
            </Link>
          </div>
        </div>
      )}

      {/* Styles pour les marqueurs */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .marker-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .marker-container:hover {
          transform: scale(1.1);
        }
        .marker-container.selected {
          transform: scale(1.2);
        }
        .marker-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
          border: 2px solid #D4AF37;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        }
        .marker-container.selected .marker-icon {
          border-color: #FFD700;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
        }
        .marker-price {
          background: #D4AF37;
          color: #1a1a1a;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          margin-top: -8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .leaflet-control-attribution {
          background: rgba(26, 26, 26, 0.8) !important;
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #D4AF37 !important;
        }
      `}</style>
    </div>
  );
}
