import type { Metadata } from 'next';
import PropertyDetailClient from './PropertyDetailClient';

export const revalidate = 3600; // ISR : revalider toutes les heures

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Pré-génère les pages statiques pour tous les biens au build
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_URL}/api/properties?limit=200`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.properties || []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// SEO dynamique par bien
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/properties/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error('Not found');
    const { property } = await res.json();
    return {
      title: `${property.name} | Marrakech Access`,
      description:
        property.shortDesc ||
        `${property.type} de luxe à ${property.district}, Marrakech. À partir de ${property.priceLowSeason} MAD/nuit.`,
      openGraph: {
        title: property.name,
        description:
          property.shortDesc ||
          `${property.type} à ${property.district}, Marrakech`,
        images: property.coverPhoto ? [{ url: property.coverPhoto }] : [],
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Bien | Marrakech Access',
      description: 'Location de luxe à Marrakech',
    };
  }
}

// Page serveur — fetch le bien côté serveur, passe en prop au client
export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let initialProperty = null;

  try {
    const res = await fetch(`${API_URL}/api/properties/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      initialProperty = data.property || null;
    }
  } catch {
    // Fallback : le client fera sa propre requête
  }

  return <PropertyDetailClient slug={slug} initialProperty={initialProperty} />;
}
