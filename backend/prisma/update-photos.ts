import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const photoMap: Record<string, string> = {
    'villa-oasis-palmeraie': '/images/biens/villa-oisis.png',
    'riad-etoile-medina': '/images/biens/riad-etoile.png',
    'appartement-luxe-gueliz': '/images/biens/appart-majorelle.png',
    'villa-jardin-amelkis': '/images/biens/villa-ourika.png',
    'dar-secret-mellah': '/images/biens/riad-rooftop medina.png',
    'suite-royale-hivernage': '/images/biens/appart-hivernage.png',
  };

  for (const [slug, photo] of Object.entries(photoMap)) {
    try {
      await prisma.property.update({
        where: { slug },
        data: {
          coverPhoto: photo,
          photos: [photo],
        },
      });
      console.log(`✅ ${slug} → ${photo}`);
    } catch (e) {
      console.log(`⚠️ ${slug} non trouvé, skip`);
    }
  }

  console.log('\n🎉 Photos mises à jour !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());