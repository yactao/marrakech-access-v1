import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎭 Seed des événements...\n');

  // Supprimer les anciens événements
  await prisma.event.deleteMany({});
  console.log('🗑️  Anciens événements supprimés\n');

  // Créer les événements un par un avec le bon typage
  await prisma.event.create({
    data: {
      name: 'Soirée Gnaoua au Café Clock',
      category: 'MUSIQUE',
      description: 'Concert de musique Gnaoua traditionnelle avec dîner marocain. Une expérience authentique au cœur de la Médina.',
      location: 'Café Clock',
      address: '7 Derb el Magana, Médina',
      startDate: new Date('2026-01-01'),
      startTime: '20:30',
      isRecurring: true,
      recurrence: 'weekly:4',
      price: '200 MAD (avec dîner)',
      website: 'https://cafeclock.com',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Soirée Gnaoua au Café Clock');

  await prisma.event.create({
    data: {
      name: 'Spectacle Fantasia Chez Ali',
      category: 'TRADITION',
      description: 'Dîner-spectacle grandiose avec cavaliers berbères, acrobates, danseurs et folklore marocain sous les étoiles.',
      location: 'Chez Ali',
      address: 'Route de Casablanca, Km 10',
      startDate: new Date('2026-01-01'),
      startTime: '20:00',
      isRecurring: true,
      recurrence: 'daily',
      price: '450 MAD',
      phone: '+212 524 30 77 30',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Spectacle Fantasia Chez Ali');

  await prisma.event.create({
    data: {
      name: 'Cours de Cuisine Marocaine',
      category: 'GASTRONOMIE',
      description: 'Apprenez à préparer tajine, couscous et pastilla avec un chef. Visite du marché incluse.',
      location: 'La Maison Arabe',
      address: '1 Derb Assehbe, Bab Doukkala',
      startDate: new Date('2026-01-01'),
      startTime: '10:00',
      isRecurring: true,
      recurrence: 'weekly:1',
      price: '800 MAD',
      website: 'https://lamaisonarabe.com',
      active: true,
    },
  });
  console.log('✅ Cours de Cuisine Marocaine');

  await prisma.event.create({
    data: {
      name: 'Visite Guidée des Souks',
      category: 'CULTURE',
      description: 'Découverte des artisans et secrets de la Médina avec un guide local francophone.',
      location: 'Place Jemaa el-Fna',
      address: 'Rendez-vous au Café de France',
      startDate: new Date('2026-01-01'),
      startTime: '09:30',
      isRecurring: true,
      recurrence: 'daily',
      price: '350 MAD/personne',
      active: true,
    },
  });
  console.log('✅ Visite Guidée des Souks');

  await prisma.event.create({
    data: {
      name: 'Marché de la Place Jemaa el-Fna',
      category: 'MARCHE',
      description: 'Le célèbre marché nocturne avec ses conteurs, charmeurs de serpents, stands de nourriture et musiciens.',
      location: 'Place Jemaa el-Fna',
      address: 'Centre Médina',
      startDate: new Date('2026-01-01'),
      startTime: '18:00',
      endTime: '01:00',
      isRecurring: true,
      recurrence: 'daily',
      price: 'Gratuit',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Marché de la Place Jemaa el-Fna');

  await prisma.event.create({
    data: {
      name: 'Balade en Calèche',
      category: 'EXCURSION',
      description: 'Tour de la ville en calèche traditionnelle. Remparts, jardins et quartiers historiques.',
      location: 'Place Jemaa el-Fna',
      address: 'Station de calèches',
      startDate: new Date('2026-01-01'),
      startTime: '10:00',
      isRecurring: true,
      recurrence: 'daily',
      price: '300-400 MAD/heure',
      active: true,
    },
  });
  console.log('✅ Balade en Calèche');

  await prisma.event.create({
    data: {
      name: 'Festival International du Film de Marrakech',
      category: 'FESTIVAL',
      description: 'Stars internationales, projections exclusives et tapis rouge. Le rendez-vous cinéma de l\'année.',
      location: 'Palais des Congrès',
      address: 'Avenue Mohammed VI',
      startDate: new Date('2026-11-27'),
      endDate: new Date('2026-12-05'),
      startTime: '19:00',
      isRecurring: false,
      price: 'Sur invitation / Pass journée disponible',
      website: 'https://festivalmarrakech.info',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Festival International du Film de Marrakech');

  await prisma.event.create({
    data: {
      name: 'Marathon de Marrakech',
      category: 'SPORT',
      description: '42km à travers la ville ocre. Semi-marathon et 10km également disponibles.',
      location: 'Place Jemaa el-Fna',
      address: 'Départ et arrivée Place Jemaa el-Fna',
      startDate: new Date('2026-01-25'),
      endDate: new Date('2026-01-25'),
      startTime: '08:00',
      isRecurring: false,
      price: '50€ inscription',
      website: 'https://marathon-marrakech.com',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Marathon de Marrakech');

  await prisma.event.create({
    data: {
      name: 'Festival Gnaoua d\'Essaouira',
      category: 'FESTIVAL',
      description: 'Le plus grand festival de musique du Maroc. 4 jours de concerts gratuits avec artistes internationaux.',
      location: 'Essaouira',
      address: 'À 2h30 de Marrakech',
      startDate: new Date('2026-06-25'),
      endDate: new Date('2026-06-28'),
      startTime: '18:00',
      isRecurring: false,
      price: 'Gratuit',
      website: 'https://festival-gnaoua.net',
      featured: true,
      active: true,
    },
  });
  console.log('✅ Festival Gnaoua d\'Essaouira');

  await prisma.event.create({
    data: {
      name: 'Aïd el-Fitr (Fin du Ramadan)',
      category: 'TRADITION',
      description: 'Fête de fin du Ramadan. Ambiance festive dans toute la ville, pâtisseries traditionnelles.',
      location: 'Toute la ville',
      address: 'Marrakech',
      startDate: new Date('2026-03-30'),
      endDate: new Date('2026-04-01'),
      isRecurring: false,
      price: 'N/A',
      active: true,
    },
  });
  console.log('✅ Aïd el-Fitr');

  const count = await prisma.event.count();
  
  console.log('\n══════════════════════════════════════');
  console.log('🎭 ÉVÉNEMENTS SEEDÉS AVEC SUCCÈS');
  console.log(`   ${count} événements ajoutés`);
  console.log('══════════════════════════════════════\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());