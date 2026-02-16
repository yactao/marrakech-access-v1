import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Coordonnées approximatives par quartier avec variations pour chaque bien
const districtCoords: Record<string, { lat: number; lng: number; variance: number }> = {
  'Palmeraie': { lat: 31.6695, lng: -7.9635, variance: 0.02 },
  'Médina': { lat: 31.6295, lng: -7.9811, variance: 0.008 },
  'Guéliz': { lat: 31.6347, lng: -8.0078, variance: 0.01 },
  'Hivernage': { lat: 31.6180, lng: -8.0150, variance: 0.008 },
  'Amelkis': { lat: 31.5950, lng: -7.9450, variance: 0.015 },
  'Mellah': { lat: 31.6220, lng: -7.9780, variance: 0.005 },
  'Agdal': { lat: 31.6050, lng: -8.0200, variance: 0.01 },
};

async function main() {
  console.log('🗺️  Mise à jour des coordonnées GPS...\n');

  const properties = await prisma.property.findMany({
    select: { id: true, name: true, district: true, latitude: true, longitude: true },
  });

  let updated = 0;

  for (const property of properties) {
    const coords = districtCoords[property.district];
    
    if (!coords) {
      console.log(`⚠️  Quartier inconnu: ${property.district} pour ${property.name}`);
      continue;
    }

    // Générer des coordonnées avec une légère variation
    const latitude = coords.lat + (Math.random() - 0.5) * coords.variance;
    const longitude = coords.lng + (Math.random() - 0.5) * coords.variance;

    await prisma.property.update({
      where: { id: property.id },
      data: { latitude, longitude },
    });

    console.log(`✅ ${property.name} (${property.district}): ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    updated++;
  }

  console.log('\n══════════════════════════════════════');
  console.log(`🗺️  ${updated} propriétés mises à jour avec GPS`);
  console.log('══════════════════════════════════════\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
