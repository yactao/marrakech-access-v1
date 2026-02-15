import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🖼️ Mise à jour des photos avec URLs Unsplash...\n');

  // =============================================
  // PHOTOS DES PROPRIÉTÉS
  // =============================================
  const propertyPhotos: Record<string, { cover: string; gallery: string[] }> = {
    'villa-oasis-palmeraie': {
      cover: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      ],
    },
    'riad-etoile-medina': {
      cover: 'https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1539437829697-1b4ed5aebd19?w=800',
        'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
        'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
    },
    'appartement-luxe-gueliz': {
      cover: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
        'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=800',
      ],
    },
    'villa-jardin-amelkis': {
      cover: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800',
        'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800',
      ],
    },
    'dar-secret-mellah': {
      cover: 'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800',
        'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=800',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
      ],
    },
    'suite-royale-hivernage': {
      cover: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      gallery: [
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
        'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800',
      ],
    },
  };

  for (const [slug, photos] of Object.entries(propertyPhotos)) {
    try {
      await prisma.property.update({
        where: { slug },
        data: {
          coverPhoto: photos.cover,
          photos: photos.gallery,
        },
      });
      console.log(`✅ Propriété: ${slug} → ${photos.gallery.length} photos`);
    } catch (e) {
      console.log(`⚠️ Propriété ${slug} non trouvée`);
    }
  }

  // =============================================
  // PHOTOS DES EXTRAS
  // =============================================
  const extrasPhotos: Record<string, string> = {
    'Chef à Domicile': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600',
    'Petit-Déjeuner Berbère': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600',
    'Cours de Cuisine Marocaine': 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=600',
    'Brunch Royal': 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=600',
    'Massage Argan': 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600',
    'Hammam Traditionnel': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600',
    'Soin Visage Oriental': 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600',
    'Quad Désert Agafay': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    'Vol en Montgolfière': 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600',
    'Excursion Cascades Ouzoud': 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600',
    'Visite Guidée Médina': 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600',
    'Excursion Essaouira': 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600',
    'Transfert Aéroport VIP': 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600',
    'Location 4x4 Premium': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    'Chauffeur Privé Journée': 'https://images.unsplash.com/photo-1449965408869-ebd3fee56f93?w=600',
    'Balade en drmadaire': 'https://unsplash.com/fr/photos/homme-marchant-avec-des-chameaux-dans-le-desert-dnLmApcmNHg',
    'Golf Royal': 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=600',
  };

  for (const [name, photo] of Object.entries(extrasPhotos)) {
    try {
      const extra = await prisma.extra.findFirst({ where: { name } });
      if (extra) {
        await prisma.extra.update({
          where: { id: extra.id },
          data: { photo },
        });
        console.log(`✅ Extra: ${name}`);
      } else {
        console.log(`⚠️ Extra "${name}" non trouvé`);
      }
    } catch (e) {
      console.log(`❌ Erreur pour ${name}`);
    }
  }

  console.log('\n══════════════════════════════════════');
  console.log('🎉 PHOTOS MISES À JOUR AVEC SUCCÈS !');
  console.log('══════════════════════════════════════\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
