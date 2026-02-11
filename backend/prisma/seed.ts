import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed...\n');

  // =============================================
  // 1. UTILISATEURS
  // =============================================
  console.log('👤 Création des utilisateurs...');

  const passwordHash = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@marrakech-access.com' },
    update: {},
    create: {
      email: 'admin@marrakech-access.com',
      passwordHash,
      firstName: 'Karim',
      lastName: 'Bennani',
      role: 'ADMIN',
      phone: '+212600000001',
    },
  });
  console.log(`   ✅ Admin : ${admin.email}`);

  const owner1 = await prisma.user.upsert({
    where: { email: 'youssef@proprio.com' },
    update: {},
    create: {
      email: 'youssef@proprio.com',
      passwordHash,
      firstName: 'Youssef',
      lastName: 'El Amrani',
      role: 'OWNER',
      phone: '+212600000002',
    },
  });
  console.log(`   ✅ Proprio 1 : ${owner1.email}`);

  const owner2 = await prisma.user.upsert({
    where: { email: 'fatima@proprio.com' },
    update: {},
    create: {
      email: 'fatima@proprio.com',
      passwordHash,
      firstName: 'Fatima',
      lastName: 'Chraibi',
      role: 'OWNER',
      phone: '+212600000003',
    },
  });
  console.log(`   ✅ Proprio 2 : ${owner2.email}`);

  const guest1 = await prisma.user.upsert({
    where: { email: 'pierre@guest.com' },
    update: {},
    create: {
      email: 'pierre@guest.com',
      passwordHash,
      firstName: 'Pierre',
      lastName: 'Dupont',
      role: 'GUEST',
      phone: '+33600000001',
      lang: 'fr',
    },
  });
  console.log(`   ✅ Guest 1 : ${guest1.email}`);

  const guest2 = await prisma.user.upsert({
    where: { email: 'sarah@guest.com' },
    update: {},
    create: {
      email: 'sarah@guest.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'GUEST',
      phone: '+44700000001',
      lang: 'en',
    },
  });
  console.log(`   ✅ Guest 2 : ${guest2.email}`);

  // =============================================
  // 2. PROPRIÉTÉS
  // =============================================
  console.log('\n🏠 Création des propriétés...');

  const properties = await Promise.all([
    prisma.property.upsert({
      where: { slug: 'villa-oasis-palmeraie' },
      update: {},
      create: {
        ownerId: owner1.id,
        name: 'Villa Oasis Palmeraie',
        slug: 'villa-oasis-palmeraie',
        type: 'VILLA',
        description: 'Magnifique villa de 400m² nichée au cœur de la Palmeraie. Piscine privée chauffée, jardin tropical luxuriant avec palmiers centenaires, 5 suites avec salle de bain privative. Personnel de maison inclus (cuisinière, jardinier, gardien). Parfaite pour les familles et groupes cherchant le calme absolu à 15 minutes du centre.',
        shortDesc: 'Villa 5 suites avec piscine privée en Palmeraie',
        district: 'Palmeraie',
        address: 'Circuit de la Palmeraie, Km 8',
        latitude: 31.6695,
        longitude: -7.9811,
        bedrooms: 5,
        bathrooms: 5,
        capacity: 10,
        surface: 400,
        amenities: JSON.parse(JSON.stringify(["piscine", "wifi", "parking", "climatisation", "jardin", "barbecue", "personnel", "cuisine_equipee", "terrasse", "hammam"])),
        priceLowSeason: 3500,
        priceHighSeason: 5500,
        minNights: 3,
        cleaningFee: 500,
        coverPhoto: '/images/properties/villa-oasis-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/villa-oasis-1.jpg', alt: 'Vue piscine' },
          { url: '/images/properties/villa-oasis-2.jpg', alt: 'Salon principal' },
          { url: '/images/properties/villa-oasis-3.jpg', alt: 'Suite master' },
          { url: '/images/properties/villa-oasis-4.jpg', alt: 'Jardin tropical' },
        ])),
        status: 'ACTIVE',
      },
    }),

    prisma.property.upsert({
      where: { slug: 'riad-etoile-medina' },
      update: {},
      create: {
        ownerId: owner1.id,
        name: 'Riad Étoile de la Médina',
        slug: 'riad-etoile-medina',
        type: 'RIAD',
        description: 'Riad authentique du XVIIIe siècle entièrement restauré dans les règles de l\'art. Patio central avec fontaine en zellige, toit-terrasse panoramique avec vue sur l\'Atlas et la Koutoubia. 3 chambres décorées dans la pure tradition marocaine. À 5 minutes à pied de la place Jemaa el-Fna.',
        shortDesc: 'Riad authentique avec terrasse vue Atlas en Médina',
        district: 'Médina',
        address: 'Derb Sidi Bouloukat, Riad Zitoun',
        latitude: 31.6258,
        longitude: -7.9891,
        bedrooms: 3,
        bathrooms: 3,
        capacity: 6,
        surface: 180,
        amenities: JSON.parse(JSON.stringify(["wifi", "climatisation", "terrasse", "patio", "hammam", "cuisine_equipee"])),
        priceLowSeason: 1800,
        priceHighSeason: 3200,
        minNights: 2,
        cleaningFee: 300,
        coverPhoto: '/images/properties/riad-etoile-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/riad-etoile-1.jpg', alt: 'Patio central' },
          { url: '/images/properties/riad-etoile-2.jpg', alt: 'Terrasse rooftop' },
          { url: '/images/properties/riad-etoile-3.jpg', alt: 'Chambre traditionnelle' },
        ])),
        status: 'ACTIVE',
      },
    }),

    prisma.property.upsert({
      where: { slug: 'appartement-luxe-gueliz' },
      update: {},
      create: {
        ownerId: owner2.id,
        name: 'Appartement Luxe Guéliz',
        slug: 'appartement-luxe-gueliz',
        type: 'APPARTEMENT',
        description: 'Appartement haut standing de 95m² au cœur du quartier moderne de Guéliz. Décoration contemporaine raffinée, grande terrasse avec vue sur la ville. À deux pas des meilleurs restaurants, boutiques et galeries d\'art. Idéal pour couples et voyageurs d\'affaires.',
        shortDesc: 'Appartement moderne haut standing à Guéliz',
        district: 'Guéliz',
        address: 'Avenue Mohammed V, Résidence Le Parc',
        latitude: 31.6346,
        longitude: -8.0083,
        bedrooms: 2,
        bathrooms: 1,
        capacity: 4,
        surface: 95,
        amenities: JSON.parse(JSON.stringify(["wifi", "climatisation", "parking", "ascenseur", "terrasse", "cuisine_equipee", "machine_laver"])),
        priceLowSeason: 1200,
        priceHighSeason: 2000,
        minNights: 2,
        cleaningFee: 200,
        coverPhoto: '/images/properties/appart-gueliz-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/appart-gueliz-1.jpg', alt: 'Salon lumineux' },
          { url: '/images/properties/appart-gueliz-2.jpg', alt: 'Terrasse ville' },
          { url: '/images/properties/appart-gueliz-3.jpg', alt: 'Chambre principale' },
        ])),
        status: 'ACTIVE',
      },
    }),

    prisma.property.upsert({
      where: { slug: 'villa-jardin-amelkis' },
      update: {},
      create: {
        ownerId: owner2.id,
        name: 'Villa Jardin d\'Amelkis',
        slug: 'villa-jardin-amelkis',
        type: 'VILLA',
        description: 'Superbe villa contemporaine de 350m² dans le prestigieux quartier d\'Amelkis, face au golf Royal. Piscine à débordement, pool house, 4 suites luxueuses. Jardin paysager avec oliviers et bougainvilliers. Le luxe dans un cadre serein.',
        shortDesc: 'Villa contemporaine face au golf Royal',
        district: 'Amelkis',
        address: 'Route d\'Amelkis, Golf Royal',
        latitude: 31.5993,
        longitude: -7.9527,
        bedrooms: 4,
        bathrooms: 4,
        capacity: 8,
        surface: 350,
        amenities: JSON.parse(JSON.stringify(["piscine", "wifi", "parking", "climatisation", "jardin", "barbecue", "personnel", "pool_house", "vue_golf"])),
        priceLowSeason: 4200,
        priceHighSeason: 6800,
        minNights: 3,
        cleaningFee: 600,
        coverPhoto: '/images/properties/villa-amelkis-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/villa-amelkis-1.jpg', alt: 'Piscine à débordement' },
          { url: '/images/properties/villa-amelkis-2.jpg', alt: 'Salon design' },
          { url: '/images/properties/villa-amelkis-3.jpg', alt: 'Vue sur le golf' },
        ])),
        status: 'ACTIVE',
      },
    }),

    prisma.property.upsert({
      where: { slug: 'dar-secret-mellah' },
      update: {},
      create: {
        ownerId: owner1.id,
        name: 'Dar Secret du Mellah',
        slug: 'dar-secret-mellah',
        type: 'DAR',
        description: 'Petit dar de charme caché dans les ruelles du Mellah, l\'ancien quartier juif. 2 chambres cosy, décoration bohème chic, petite cour intérieure avec bananier. Ambiance intimiste et romantique. Idéal pour couples en quête d\'authenticité.',
        shortDesc: 'Dar intimiste bohème chic dans le Mellah',
        district: 'Mellah',
        address: 'Derb el Mellah',
        latitude: 31.6212,
        longitude: -7.9845,
        bedrooms: 2,
        bathrooms: 2,
        capacity: 4,
        surface: 90,
        amenities: JSON.parse(JSON.stringify(["wifi", "climatisation", "patio", "cuisine_equipee"])),
        priceLowSeason: 900,
        priceHighSeason: 1500,
        minNights: 2,
        cleaningFee: 150,
        coverPhoto: '/images/properties/dar-mellah-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/dar-mellah-1.jpg', alt: 'Cour intérieure' },
          { url: '/images/properties/dar-mellah-2.jpg', alt: 'Chambre romantique' },
        ])),
        status: 'ACTIVE',
      },
    }),

    prisma.property.upsert({
      where: { slug: 'suite-royale-hivernage' },
      update: {},
      create: {
        ownerId: owner2.id,
        name: 'Suite Royale Hivernage',
        slug: 'suite-royale-hivernage',
        type: 'SUITE',
        description: 'Suite de 65m² dans une résidence de prestige au quartier de l\'Hivernage. Décoration palatiale, lit king size, baignoire balnéo, dressing. Accès piscine commune et salle de sport. Conciergerie 24h/24. Le luxe hôtelier avec l\'indépendance d\'un appartement.',
        shortDesc: 'Suite palatiale avec services hôteliers à l\'Hivernage',
        district: 'Hivernage',
        address: 'Rue des Temples, Hivernage',
        latitude: 31.6285,
        longitude: -8.0156,
        bedrooms: 1,
        bathrooms: 1,
        capacity: 2,
        surface: 65,
        amenities: JSON.parse(JSON.stringify(["wifi", "climatisation", "piscine_commune", "salle_sport", "room_service", "parking", "baignoire_balneo"])),
        priceLowSeason: 1500,
        priceHighSeason: 2800,
        minNights: 1,
        cleaningFee: 200,
        coverPhoto: '/images/properties/suite-hivernage-1.jpg',
        photos: JSON.parse(JSON.stringify([
          { url: '/images/properties/suite-hivernage-1.jpg', alt: 'Suite royale' },
          { url: '/images/properties/suite-hivernage-2.jpg', alt: 'Salle de bain' },
        ])),
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log(`   ✅ ${properties.length} propriétés créées`);

  // =============================================
  // 3. EXTRAS (Services & Activités)
  // =============================================
  console.log('\n🎯 Création des extras...');

  const extras = await Promise.all([
    // CULINAIRE
    prisma.extra.create({ data: { name: 'Chef à Domicile — Menu Royal', category: 'culinaire', description: 'Un chef expérimenté prépare un festin marocain 5 plats dans votre villa. Entrées, tajine, couscous, pastilla et desserts. Ingrédients frais du marché.', price: 1200, priceUnit: 'groupe', duration: '3h', maxPersons: 10, sortOrder: 1 } }),
    prisma.extra.create({ data: { name: 'Petit-Déjeuner Berbère', category: 'culinaire', description: 'Msemen, baghrir, amlou, miel, huile d\'olive, fromage frais, jus d\'orange pressé et thé à la menthe. Servi en terrasse.', price: 150, priceUnit: 'personne', duration: '1h', sortOrder: 2 } }),
    prisma.extra.create({ data: { name: 'Cours de Cuisine Marocaine', category: 'culinaire', description: 'Apprenez à préparer tajine, pastilla et couscous avec un chef local. Visite du marché incluse. Vous repartez avec les recettes.', price: 500, priceUnit: 'personne', duration: '3h', maxPersons: 6, sortOrder: 3 } }),
    prisma.extra.create({ data: { name: 'Brunch Oriental', category: 'culinaire', description: 'Buffet généreux mêlant spécialités marocaines et continentales. Viennoiseries, crêpes, fruits, fromages, charcuterie halal.', price: 250, priceUnit: 'personne', duration: '2h', sortOrder: 4 } }),

    // BIEN-ÊTRE
    prisma.extra.create({ data: { name: 'Massage aux Huiles d\'Argan', category: 'bien-etre', description: 'Massage relaxant à domicile par une masseuse professionnelle. Huiles d\'argan bio du Souss. 60 minutes de pure détente.', price: 450, priceUnit: 'personne', duration: '1h', sortOrder: 5 } }),
    prisma.extra.create({ data: { name: 'Séance Hammam Privé', category: 'bien-etre', description: 'Gommage au savon noir, enveloppement au ghassoul, massage relaxant. Dans votre riad ou dans un hammam traditionnel privé.', price: 350, priceUnit: 'personne', duration: '1h30', sortOrder: 6 } }),
    prisma.extra.create({ data: { name: 'Yoga au Lever du Soleil', category: 'bien-etre', description: 'Séance de yoga Hatha sur la terrasse avec vue sur l\'Atlas au lever du soleil. Tapis et accessoires fournis. Tous niveaux.', price: 300, priceUnit: 'personne', duration: '1h', maxPersons: 6, sortOrder: 7 } }),

    // EXCURSIONS
    prisma.extra.create({ data: { name: 'Quad dans le Désert d\'Agafay', category: 'excursion', description: 'Aventure en quad dans le désert pierreux d\'Agafay. Paysages lunaires, pause thé chez les nomades. Sensations garanties.', price: 600, priceUnit: 'personne', duration: '3h', maxPersons: 8, sortOrder: 8 } }),
    prisma.extra.create({ data: { name: 'Vol en Montgolfière', category: 'excursion', description: 'Survolez la palmeraie et le désert d\'Agafay au lever du soleil. Vue à 360° sur l\'Atlas et Marrakech. Petit-déjeuner berbère à l\'atterrissage.', price: 1800, priceUnit: 'personne', duration: '1h', sortOrder: 9 } }),
    prisma.extra.create({ data: { name: 'Excursion Cascades d\'Ouzoud', category: 'excursion', description: 'Journée complète aux cascades d\'Ouzoud (110m de haut). Balade, singes magots, déjeuner en terrasse face aux chutes. Transport inclus.', price: 500, priceUnit: 'personne', duration: 'journée', sortOrder: 10 } }),
    prisma.extra.create({ data: { name: 'Visite Guidée Médina & Souks', category: 'excursion', description: 'Guide francophone passionné. Palais Bahia, Tombeaux Saadiens, Medersa Ben Youssef, souks artisanaux. 3h de découverte.', price: 350, priceUnit: 'personne', duration: '3h', maxPersons: 8, sortOrder: 11 } }),
    prisma.extra.create({ data: { name: 'Journée Essaouira', category: 'excursion', description: 'Escapade à la cité du vent. Port de pêche, médina classée UNESCO, galeries d\'art, déjeuner fruits de mer. 3h de route.', price: 700, priceUnit: 'personne', duration: 'journée', sortOrder: 12 } }),

    // TRANSPORT
    prisma.extra.create({ data: { name: 'Transfert Aéroport VIP', category: 'transport', description: 'Chauffeur privé en berline ou van luxe. Accueil personnalisé à l\'aéroport avec panneau nominatif. Eau et serviettes fraîches.', price: 400, priceUnit: 'forfait', sortOrder: 13 } }),
    prisma.extra.create({ data: { name: 'Chauffeur Privé Journée', category: 'transport', description: 'Véhicule avec chauffeur à disposition toute la journée. Idéal pour explorer Marrakech et ses environs en toute liberté.', price: 1200, priceUnit: 'forfait', duration: 'journée', sortOrder: 14 } }),

    // LOISIRS
    prisma.extra.create({ data: { name: 'Dîner-Spectacle Fantasia', category: 'loisir', description: 'Soirée sous tente caïdale. Dîner marocain gastronomique, spectacle équestre, danseuses, musique gnaoua. Inoubliable.', price: 700, priceUnit: 'personne', duration: 'soirée', sortOrder: 15 } }),
    prisma.extra.create({ data: { name: 'Journée Golf Royal', category: 'loisir', description: 'Green fee au Royal Golf de Marrakech (18 trous, par 72). Caddie et voiturette inclus. Club house avec vue Atlas.', price: 1500, priceUnit: 'personne', duration: 'journée', sortOrder: 16 } }),
    prisma.extra.create({ data: { name: 'Balade en Calèche', category: 'loisir', description: 'Tour de Marrakech en calèche traditionnelle. Remparts, Jardin Majorelle, Koutoubia, Ménara. Couverture et thé offerts.', price: 300, priceUnit: 'forfait', duration: '2h', maxPersons: 4, sortOrder: 17 } }),
  ]);

  console.log(`   ✅ ${extras.length} extras créés`);

  // =============================================
  // 4. KNOWLEDGE BASE (pour le Majordome IA)
  // =============================================
  console.log('\n🧠 Création de la base de connaissances...');

  const knowledgeEntries = await Promise.all([
    // QUARTIERS
    prisma.knowledgeBase.create({ data: { category: 'quartier', title: 'Palmeraie', content: 'Zone résidentielle luxueuse à 15 minutes du centre de Marrakech. Connue pour ses grandes villas avec piscine entourées de palmiers. Quartier calme et verdoyant, idéal pour les familles et groupes. Proche de plusieurs clubs de golf (Amelkis, PalmGolf). Restaurants et beach clubs à proximité.', tags: JSON.parse(JSON.stringify(["luxe", "famille", "piscine", "calme", "golf"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'quartier', title: 'Médina', content: 'Cœur historique de Marrakech, classé UNESCO. Dédale de ruelles, souks artisanaux, monuments (Palais Bahia, Medersa Ben Youssef). La célèbre place Jemaa el-Fna avec ses conteurs et stands de cuisine. Riads traditionnels avec patios. Ambiance authentique et vibrante. Peut être bruyant la nuit.', tags: JSON.parse(JSON.stringify(["authentique", "culture", "histoire", "riad", "souks"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'quartier', title: 'Guéliz', content: 'Quartier moderne créé pendant le protectorat français. Large avenues, restaurants internationaux, cafés branchés, boutiques de marques. Vie nocturne animée. Appartements contemporains. Bien desservi en transports. Idéal jeunes couples et voyageurs d\'affaires. Le Carré Eden et Menara Mall pour le shopping.', tags: JSON.parse(JSON.stringify(["moderne", "restaurants", "shopping", "central", "vie_nocturne"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'quartier', title: 'Hivernage', content: 'Quartier chic et résidentiel entre la Médina et Guéliz. Grands hôtels de luxe (Mamounia, Royal Mansour), théâtre royal, palais des congrès. Calme et arboré. Proche de tout mais au calme. Idéal pour ceux qui veulent le luxe hôtelier.', tags: JSON.parse(JSON.stringify(["luxe", "chic", "calme", "hotels"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'quartier', title: 'Amelkis', content: 'Quartier résidentiel haut de gamme au sud-est de Marrakech, autour du Golf Royal d\'Amelkis. Villas contemporaines de standing. Très calme, sécurisé. Vue sur l\'Atlas. À 20 minutes du centre. Parfait pour golfeurs et familles cherchant le grand luxe.', tags: JSON.parse(JSON.stringify(["luxe", "golf", "calme", "villa", "atlas"])) } }),

    // INFOS PRATIQUES
    prisma.knowledgeBase.create({ data: { category: 'pratique', title: 'Monnaie et paiement', content: 'Monnaie locale : Dirham marocain (MAD). 1 EUR ≈ 11 MAD. Cartes Visa/Mastercard acceptées dans les hôtels, restaurants et grandes boutiques. Prévoir du cash pour les souks, les taxis et les petits commerces. Bureaux de change à l\'aéroport et en ville. Les pourboires (10% environ) sont appréciés.', tags: JSON.parse(JSON.stringify(["argent", "pratique", "pourboire"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'pratique', title: 'Climat et quand venir', content: 'Marrakech bénéficie d\'un climat semi-aride. Haute saison : octobre à mai (20-28°C, idéal). Été : juin à septembre (35-45°C, très chaud). Hiver : décembre-janvier (8-20°C, frais le soir). Ramadan : dates variables, certains restaurants fermés en journée. Meilleure période : mars-mai et octobre-novembre.', tags: JSON.parse(JSON.stringify(["meteo", "climat", "saison", "quand_venir"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'pratique', title: 'Se déplacer', content: 'En taxi : petits taxis beiges (en ville, max 3 personnes, compteur obligatoire). Grands taxis pour les trajets hors ville. En calèche : typique mais touristique, négocier le prix avant. VTC : pas de Uber, mais InDriver et Careem fonctionnent. Location voiture : permis international recommandé, conduite sportive locale.', tags: JSON.parse(JSON.stringify(["transport", "taxi", "deplacement"])) } }),

    // RESTAURANTS
    prisma.knowledgeBase.create({ data: { category: 'restaurant', title: 'Restaurants recommandés — Haut de gamme', content: 'La Mamounia (palace, cuisine raffinée), Le Jardin (médina, cadre exceptionnel), Nomad (rooftop médina, fusion), Al Fassia (cuisine marocaine gastronomique, tenu par des femmes), Le Comptoir Darna (dîner-spectacle), Bo-Zin (asiatique-marocain, ambiance lounge). Réservation conseillée.', tags: JSON.parse(JSON.stringify(["gastronomie", "luxe", "sortir"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'restaurant', title: 'Restaurants recommandés — Budget moyen', content: 'Café des Épices (terrasse place des épices), Amal (association, cuisine marocaine authentique), Café Clock (culturel, pastilla de chameau), KECHMARA (brunch, Guéliz), Pepe Nero (italien chic). Comptez 150-400 MAD par personne.', tags: JSON.parse(JSON.stringify(["restaurant", "budget", "sortir"])) } }),

    // ACTIVITÉS
    prisma.knowledgeBase.create({ data: { category: 'activite', title: 'Incontournables à Marrakech', content: 'Place Jemaa el-Fna (UNESCO, animation jour et nuit), Jardin Majorelle (jardin YSL, bleu iconique), Palais Bahia (architecture mauresque), Tombeaux Saadiens (joyau caché), Medersa Ben Youssef (école coranique, merveille), Souks (cuir, épices, tapis, lanternes). Prévoir 2-3 jours minimum.', tags: JSON.parse(JSON.stringify(["tourisme", "culture", "monument", "visite"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'activite', title: 'Activités nature et aventure', content: 'Vallée de l\'Ourika (1h, cascades, villages berbères), Désert d\'Agafay (30min, quad, bivouac), Atlas (ski à Oukaïmeden en hiver, randonnée Toubkal), Cascades d\'Ouzoud (2h30, les plus belles du Maroc), Essaouira (3h, océan, kitesurf). Le jardin de la Ménara au coucher du soleil est magique et gratuit.', tags: JSON.parse(JSON.stringify(["nature", "aventure", "excursion", "atlas"])) } }),

    // FAQ
    prisma.knowledgeBase.create({ data: { category: 'faq', title: 'Heure d\'arrivée et de départ', content: 'Check-in standard : 15h00. Check-out : 11h00. Arrivée anticipée ou départ tardif possible selon disponibilité (supplément possible). Pour les vols très tôt ou très tard, nous pouvons organiser un accès anticipé ou un late check-out.', tags: JSON.parse(JSON.stringify(["checkin", "checkout", "horaire"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'faq', title: 'Politique d\'annulation', content: 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée. Entre 7 et 3 jours : 50% du montant retenu. Moins de 3 jours ou no-show : 100% du montant retenu. En cas de force majeure (maladie grave, catastrophe naturelle), contactez-nous pour étudier votre situation.', tags: JSON.parse(JSON.stringify(["annulation", "remboursement", "politique"])) } }),
    prisma.knowledgeBase.create({ data: { category: 'faq', title: 'Animaux de compagnie', content: 'Les animaux de compagnie sont acceptés dans certaines villas de la Palmeraie et d\'Amelkis (supplément de 200 MAD/nuit). Non acceptés dans les riads de la Médina et les appartements. Veuillez nous prévenir lors de la réservation.', tags: JSON.parse(JSON.stringify(["animaux", "chien", "chat", "pet"])) } }),
  ]);

  console.log(`   ✅ ${knowledgeEntries.length} entrées knowledge base créées`);

  // =============================================
  // 5. RÉSERVATIONS DE DÉMO
  // =============================================
  console.log('\n📅 Création des réservations de démo...');

  const booking1 = await prisma.booking.create({
    data: {
      propertyId: properties[0].id, // Villa Oasis
      guestId: guest1.id,
      checkIn: new Date('2026-03-15'),
      checkOut: new Date('2026-03-22'),
      nights: 7,
      guestsCount: 6,
      pricePerNight: 4500,
      subtotal: 31500,
      cleaningFee: 500,
      extrasTotal: 2400,
      serviceFee: 0,
      totalAmount: 34400,
      status: 'CONFIRMED',
      paymentStatus: 'FULLY_PAID',
      guestMessage: 'Nous venons en famille avec 3 enfants. Avez-vous des lits bébé ?',
    },
  });

  const booking2 = await prisma.booking.create({
    data: {
      propertyId: properties[1].id, // Riad Étoile
      guestId: guest2.id,
      checkIn: new Date('2026-04-01'),
      checkOut: new Date('2026-04-05'),
      nights: 4,
      guestsCount: 2,
      pricePerNight: 2500,
      subtotal: 10000,
      cleaningFee: 300,
      extrasTotal: 800,
      serviceFee: 0,
      totalAmount: 11100,
      status: 'PENDING',
      paymentStatus: 'DEPOSIT_PAID',
    },
  });

  console.log(`   ✅ 2 réservations créées`);

  // =============================================
  // RÉSUMÉ
  // =============================================
  console.log('\n══════════════════════════════════════');
  console.log('🌱 SEED TERMINÉ AVEC SUCCÈS');
  console.log('══════════════════════════════════════');
  console.log(`   👤 5 utilisateurs (1 admin, 2 proprios, 2 guests)`);
  console.log(`   🏠 6 propriétés (2 villas, 1 riad, 1 appart, 1 dar, 1 suite)`);
  console.log(`   🎯 ${extras.length} extras (culinaire, bien-être, excursions, transport, loisirs)`);
  console.log(`   🧠 ${knowledgeEntries.length} entrées knowledge base`);
  console.log(`   📅 2 réservations de démo`);
  console.log('');
  console.log('   🔑 Tous les mots de passe : 123456');
  console.log('   📧 Admin : admin@marrakech-access.com');
  console.log('   📧 Proprios : youssef@proprio.com / fatima@proprio.com');
  console.log('   📧 Guests : pierre@guest.com / sarah@guest.com');
  console.log('══════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
