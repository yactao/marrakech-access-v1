import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const photoGalleries: Record<string, string[]> = {
    'villa-oasis-palmeraie': [
      '/images/biens/villa-oisis.png',
      '/images/palmeraie_marrakech.jpg',
      '/images/villa_palmeraie.jpg',
      '/images/jardin_majorelle.jpg',
      '/images/equitation_palmeraie.jpg',
    ],
    'riad-etoile-medina': [
      '/images/biens/riad-etoile.png',
      '/images/medina_marrakech.jpg',
      '/images/riad_medina.jpg',
      '/images/medersa_ben_youssef.jpg',
      '/images/jemaa_el_fna.jpg',
    ],
    'appartement-luxe-gueliz': [
      '/images/biens/appart-majorelle.png',
      '/images/gueliz_marrakech.jpg',
      '/images/appartement_gueliz.jpg',
      '/images/jardin_majorelle.jpg',
    ],
    'villa-jardin-amelkis': [
      '/images/biens/villa-ourika.png',
      '/images/golf_marrakech.jpg',
      '/images/agdal_marrakech.jpg',
      '/images/palmeraie_marrakech.jpg',
    ],
    'dar-secret-mellah': [
      '/images/biens/riad-rooftop medina.png',
      '/images/medina_marrakech.jpg',
      '/images/medersa_ben_youssef.jpg',
      '/images/koutoubia_marrakech.jpg',
    ],
    'suite-royale-hivernage': [
      '/images/biens/appart-hivernage.png',
      '/images/palais_bahia.jpg',
      '/images/spa_la_sultana.jpg',
      '/images/theatre_royal.jpg',
      '/images/marrakech_hero.jpg',
    ],
  };

  for (const [slug, photos] of Object.entries(photoGalleries)) {
    try {
      await prisma.property.update({
        where: { slug },
        data: {
          coverPhoto: photos[0],
          photos,
        },
      });
      console.log(`✅ ${slug} → ${photos.length} photos`);
    } catch (e) {
      console.log(`⚠️ ${slug} non trouvé`);
    }
  }

  console.log('\n🎉 Galeries mises à jour !');
}

main().catch(console.error).finally(() => prisma.$disconnect());