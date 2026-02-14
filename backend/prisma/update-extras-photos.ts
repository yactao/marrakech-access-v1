import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const extrasPhotos: Record<string, string> = {
    'Chef à Domicile': '/images/extras/chef.jpg',
    'Petit-Déjeuner Berbère': '/images/extras/brunch.jpg',
    'Cours de Cuisine Marocaine': '/images/cours_cuisine.jpg',
    'Brunch Royal': '/images/extras/brunch.jpg',
    'Massage Argan': '/images/culinaire_bien_etre.jpg',
    'Hammam Traditionnel': '/images/extras/hammam.jpg',
    'Quad Désert Agafay': '/images/extras/quad.jpg',
    'Vol en Montgolfière': '/images/extras/balloon.jpg',
    'Excursion Cascades Ouzoud': '/images/decouverte.jpg',
    'Visite Guidée Médina': '/images/medina_marrakech.jpg',
    'Excursion Essaouira': '/images/decouverte.jpg',
    'Balade en Calèche': '/images/extras/chameau.jpg',
  };

  for (const [name, photo] of Object.entries(extrasPhotos)) {
    try {
      const extra = await prisma.extra.findFirst({ where: { name } });
      if (extra) {
        await prisma.extra.update({
          where: { id: extra.id },
          data: { photo },
        });
        console.log(`✅ ${name} → ${photo}`);
      }
    } catch (e) {
      console.log(`⚠️ ${name} — erreur`);
    }
  }

  console.log('\n🎉 Photos extras mises à jour !');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());