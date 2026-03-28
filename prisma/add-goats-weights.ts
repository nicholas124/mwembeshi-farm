import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const goats = [
  { tag: 'NT001', weight: 19, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT002', weight: 16, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT003', weight: 17, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT004', weight: 15, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT005', weight: 14, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT006', weight: 9, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT007', weight: 17, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT008', weight: 13, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT009', weight: 15, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT010', weight: 16, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT011', weight: 15, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT012', weight: 17, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT013', weight: 10, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT014', weight: 15, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT015', weight: 14, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT016', weight: 17, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT017', weight: 16, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT018', weight: 14, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT019', weight: 12, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT020', weight: 14, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'NT021', weight: 13, breed: 'Local', gender: 'FEMALE' as const },
  { tag: 'Boer01', weight: 21, breed: 'Boer', gender: 'MALE' as const },
];

const weighDate = new Date('2026-03-23');

async function main() {
  console.log('Adding 22 goats and weight records...\n');

  for (const goat of goats) {
    const animal = await prisma.animal.upsert({
      where: { tag: goat.tag },
      update: {
        weight: goat.weight,
      },
      create: {
        tag: goat.tag,
        type: 'GOAT',
        breed: goat.breed,
        gender: goat.gender,
        status: 'ACTIVE',
        acquisitionMethod: 'PURCHASED',
        weight: goat.weight,
      },
    });

    await prisma.weightRecord.create({
      data: {
        animalId: animal.id,
        weight: goat.weight,
        recordedAt: weighDate,
        notes: 'Initial weigh-in 23/03/2026',
      },
    });

    console.log(`  ${goat.tag}: ${goat.weight} kg`);
  }

  console.log('\n22 goats added with weight records for 23/03/2026');
}

main()
  .catch((e) => {
    console.error('Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
