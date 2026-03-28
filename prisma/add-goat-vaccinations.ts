import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const goatTags = [
  'NT001', 'NT002', 'NT003', 'NT004', 'NT005', 'NT006', 'NT007',
  'NT008', 'NT009', 'NT010', 'NT011', 'NT012', 'NT013', 'NT014',
  'NT015', 'NT016', 'NT017', 'NT018', 'NT019', 'NT020', 'NT021',
  'Boer01',
];

async function main() {
  console.log('Recording Raksha HS+BQ vaccinations for all goats...\n');

  for (const tag of goatTags) {
    const animal = await prisma.animal.findUnique({ where: { tag } });
    if (!animal) {
      console.log(`  ${tag}: NOT FOUND - skipped`);
      continue;
    }

    await prisma.treatment.create({
      data: {
        animalId: animal.id,
        type: 'VACCINATION',
        description: 'Raksha HS+BQ vaccine',
        medication: 'Raksha HS+BQ',
        treatmentDate: new Date('2026-03-28'),
        notes: 'All goats vaccinated',
      },
    });

    console.log(`  ${tag}: vaccinated`);
  }

  console.log('\n22 goats vaccinated with Raksha HS+BQ on 28/03/2026');
}

main()
  .catch((e) => { console.error('Failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
