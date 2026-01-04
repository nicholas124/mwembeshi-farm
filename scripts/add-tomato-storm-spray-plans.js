const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLANTING_ID = 'cmjzd71mw0001gmvm52yiusl7'; // Tomatoes Storm - Field B

const sprayPlans = [
  // DAY 1 – Friday, 3 Jan 2026 (ALREADY DONE)
  {
    name: 'Day 1 - Insect Control (Leaf Miners)',
    pesticide: 'TUTA-MAX (10ml) + Falco-Stick/Maxi-Stic (5ml)',
    targetPest: 'Leaf miners',
    dosage: 'TUTA-MAX: 10ml, Sticker: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-03'),
    weatherConditions: 'Apply late afternoon',
    safetyPrecautions: 'Wear protective gear. Harvest allowed again from 6 Jan.',
    notes: '✔ Leaf miner control. ✔ Harvest allowed again from 6 Jan.',
    status: 'COMPLETED', // Already done
  },

  // DAY 3 – Sunday, 5 Jan 2026
  {
    name: 'Day 3 - Foliar Feed (Maintain Plant Strength)',
    pesticide: 'VOEMA Vegetative (15ml) + OMEX ZiBo (10ml) + Introgel (10ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'Voema Veg: 15ml, OMEX ZiBo: 10ml, Introgel: 10ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-05'),
    weatherConditions: 'Apply early morning (before 09:00)',
    safetyPrecautions: 'Standard precautions',
    notes: '🎯 Purpose: Keep leaves alive while harvesting continues.',
  },

  // DAY 5 – Tuesday, 7 Jan 2026
  {
    name: 'Day 5 - Insect Control (Sucking Pests)',
    pesticide: 'ACTARA 25WG (4g) + Sticker (5ml) OR SPEAR (5ml) + Sticker (5ml)',
    targetPest: 'Aphids, whitefly, thrips (sucking pests)',
    dosage: 'Option A: ACTARA 4g + Sticker 5ml | Option B: SPEAR 5ml + Sticker 5ml per 20L',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-07'),
    weatherConditions: 'Apply late afternoon',
    safetyPrecautions: '✔ Safe during harvest. Choose ONE option only.',
    notes: '👉 Option A (preferred): ACTARA 25WG. Option B: SPEAR. Both control aphids, whitefly, thrips.',
  },

  // DAY 7 – Thursday, 9 Jan 2026
  {
    name: 'Day 7 - Foliar Feed (Fruit Size & Quality)',
    pesticide: 'VOEMA Flower & Fruit (20ml) + OMEX ZiBo (5ml) + Introgel (10ml)',
    targetPest: 'N/A - Fruit development nutrient',
    dosage: 'Voema F&F: 20ml, OMEX ZiBo: 5ml, Introgel: 10ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-09'),
    weatherConditions: 'Apply early morning (before 09:00)',
    safetyPrecautions: 'Standard precautions',
    notes: '🎯 Purpose: Fruit filling, firmness, colour improvement.',
  },

  // DAY 10 – Sunday, 12 Jan 2026
  {
    name: 'Day 10 - Insect Control (Clean-up) ⚠️ CONDITIONAL',
    pesticide: 'HERO CYPER (10ml) + Sticker (5ml)',
    targetPest: 'General insect clean-up',
    dosage: 'HERO CYPER: 10ml, Sticker: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-12'),
    weatherConditions: 'Apply late afternoon. ONLY if no harvest planned for 5 days!',
    safetyPrecautions: '⚠️ SKIP THIS if harvesting frequently! Do NOT use near picking days. 5-day withholding period.',
    notes: '⚠️ CONDITIONAL: Only apply if no harvest planned for 5 days. Strong insecticide option.',
  },

  // NEXT CYCLE - Wednesday, 15 Jan 2026
  {
    name: 'Day 13 - Insect Control (Leaf Miner Rotation)',
    pesticide: 'TUTA-MAX (10ml) + Sticker (5ml)',
    targetPest: 'Leaf miners (rotation)',
    dosage: 'TUTA-MAX: 10ml, Sticker: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-15'),
    weatherConditions: 'Apply late afternoon',
    safetyPrecautions: 'Wear protective gear. Check harvest schedule.',
    notes: '🔁 ROTATION: Back to TUTA-MAX for leaf miner control cycle.',
  },

  // NEXT CYCLE - Saturday, 18 Jan 2026
  {
    name: 'Day 16 - Foliar Feed (Adaptive)',
    pesticide: 'VOEMA Flower & Fruit (20ml) OR VOEMA Vegetative (15ml) + OMEX ZiBo (10ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'If leaves green: F&F 20ml | If yellowing: Veg 15ml + ZiBo 10ml per 20L',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-18'),
    weatherConditions: 'Apply early morning (before 09:00)',
    safetyPrecautions: 'Standard precautions',
    notes: '🔁 ADAPTIVE FEED: Use Flower & Fruit if leaves are green. Use Vegetative if leaves start yellowing.',
  },
];

async function main() {
  console.log('🍅 Adding spray plans for Tomatoes Storm...\n');
  
  // Check if planting exists
  const planting = await prisma.planting.findUnique({
    where: { id: PLANTING_ID },
    include: { cropType: true, field: true }
  });
  
  if (!planting) {
    console.error('❌ Planting not found!');
    return;
  }
  
  console.log(`Found: ${planting.cropType?.name} - ${planting.field?.name}`);
  console.log(`Planted: ${planting.plantingDate}\n`);

  // Delete existing spray plans for this planting (to avoid duplicates)
  const deleted = await prisma.sprayPlan.deleteMany({
    where: { plantingId: PLANTING_ID }
  });
  console.log(`Removed ${deleted.count} existing spray plans.\n`);

  // Add all spray plans
  let created = 0;
  for (const plan of sprayPlans) {
    const status = plan.status || 'PENDING';
    delete plan.status;
    
    await prisma.sprayPlan.create({
      data: {
        plantingId: PLANTING_ID,
        ...plan,
        status: status,
      }
    });
    created++;
    console.log(`✅ Added: ${plan.name}`);
  }

  console.log(`\n🎉 Successfully added ${created} spray plans for Tomatoes Storm!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
