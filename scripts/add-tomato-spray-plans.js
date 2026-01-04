const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLANTING_ID = 'cmjzbocuq0005nddbnziwupbn'; // Tomatoes Tengeru Select - Field B

const sprayPlans = [
  // WEEK 1 (8 – 14 November 2025) — ESTABLISHMENT
  {
    name: 'Week 1 - Insect Control (Establishment)',
    pesticide: 'Actara 25WG (5g) + Cyper 20EC (10ml) + Dosth (5ml)',
    targetPest: 'General insects - Establishment phase',
    dosage: 'Actara: 5g, Cyper 20EC: 10ml, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-12'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear gloves, mask and protective clothing. Keep away from water sources.',
    notes: 'Goal: Help seedlings recover and root well. Irrigation: 2x daily (06:00 & 17:00), 15 min each.',
  },
  {
    name: 'Week 1 - Fungicide',
    pesticide: 'Mupazeb M (30g) + Neemcide (20ml)',
    targetPest: 'Fungal diseases prevention',
    dosage: 'Mupazeb M: 30g, Neemcide: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-14'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear protective gear. Do not spray during windy conditions.',
    notes: 'Establishment phase fungicide application.',
  },

  // WEEK 2 (15 – 21 November 2025)
  {
    name: 'Week 2 - Foliar Feed',
    pesticide: 'Voema Vegetative N (20ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'Voema Vegetative N: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-17'),
    weatherConditions: 'Apply in cool conditions, early morning preferred',
    safetyPrecautions: 'Standard precautions',
    notes: 'Foliar feeding for vegetative growth.',
  },
  {
    name: 'Week 2 - Insect Control',
    pesticide: 'Tejas (5g) + Spear (10ml) + Dosth (5ml)',
    targetPest: 'Sucking and chewing insects',
    dosage: 'Tejas: 5g, Spear: 10ml, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-20'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear gloves and mask. Avoid contact with skin.',
    notes: '',
  },

  // WEEK 3 (22 – 28 November 2025)
  {
    name: 'Week 3 - Top Dressing',
    pesticide: 'D Compound',
    targetPest: 'N/A - Fertilizer',
    dosage: '5g per plant - soil application',
    applicationMethod: 'Soil drench',
    scheduledDate: new Date('2025-11-25'),
    weatherConditions: 'Apply after irrigation or light rain',
    safetyPrecautions: 'Wear gloves when handling fertilizer',
    notes: 'Apply around base of each plant, not touching stem.',
  },
  {
    name: 'Week 3 - Foliar Feed',
    pesticide: 'Voema Vegetative N (20ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'Voema Vegetative N: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-27'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },
  {
    name: 'Week 3 - Fungicide',
    pesticide: 'Amistar Top (10ml) + Mupazeb M (30g) + Dosth (5ml)',
    targetPest: 'Early blight, Late blight, Fungal diseases',
    dosage: 'Amistar Top: 10ml, Mupazeb M: 30g, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-11-28'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear full protective gear. Keep away from water sources.',
    notes: '',
  },

  // WEEK 4 (29 Nov – 5 December 2025)
  {
    name: 'Week 4 - Foliar Feed',
    pesticide: 'Voema Vegetative N (20ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'Voema Vegetative N: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-01'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },
  {
    name: 'Week 4 - Insect Control',
    pesticide: 'Tejas (5g) + Cyper (10ml) + Dosth (5ml)',
    targetPest: 'Sucking and chewing insects',
    dosage: 'Tejas: 5g, Cyper: 10ml, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-04'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear gloves, mask and protective clothing.',
    notes: '',
  },

  // WEEK 5 (6 – 12 December 2025)
  {
    name: 'Week 5 - Foliar Feed (Flowering)',
    pesticide: 'Voema Flower & Fruit (20ml)',
    targetPest: 'N/A - Nutrient supplement for flowering',
    dosage: 'Voema Flower & Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-08'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'IMPORTANT: Stake and tie plants this week!',
  },
  {
    name: 'Week 5 - Insect Control',
    pesticide: 'Falcon (15ml) + Dosth (5ml)',
    targetPest: 'Various insects',
    dosage: 'Falcon: 15ml, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-11'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear protective gear.',
    notes: '',
  },

  // WEEK 6 (13 – 19 December 2025)
  {
    name: 'Week 6 - Foliar Feed (Boron & Zinc)',
    pesticide: 'OMEX ZiBo (15ml)',
    targetPest: 'N/A - Micronutrient supplement',
    dosage: 'OMEX ZiBo: 15ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-15'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'Zinc and Boron for fruit development.',
  },
  {
    name: 'Week 6 - Fungicide',
    pesticide: 'Amistar Top (10ml) + Mupazeb M (30g) + Dosth (5ml)',
    targetPest: 'Early blight, Late blight, Fungal diseases',
    dosage: 'Amistar Top: 10ml, Mupazeb M: 30g, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-18'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear full protective gear.',
    notes: '',
  },

  // WEEK 7 (20 – 26 December 2025)
  {
    name: 'Week 7 - Foliar Feed (Flower & Fruit)',
    pesticide: 'Voema Flower & Fruit (20ml)',
    targetPest: 'N/A - Nutrient supplement',
    dosage: 'Voema Flower & Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-22'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },
  {
    name: 'Week 7 - Insect Control',
    pesticide: 'Snowcron (15ml) + Tejas (5g) + Dosth (5ml)',
    targetPest: 'Various insects including whitefly',
    dosage: 'Snowcron: 15ml, Tejas: 5g, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-25'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear protective gear.',
    notes: 'Christmas Day spray - schedule accordingly.',
  },

  // WEEK 8 (27 Dec 2025 – 2 Jan 2026)
  {
    name: 'Week 8 - Foliar Feed (Boron & Zinc)',
    pesticide: 'OMEX ZiBo (15ml)',
    targetPest: 'N/A - Micronutrient supplement',
    dosage: 'OMEX ZiBo: 15ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2025-12-29'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },
  {
    name: 'Week 8 - Fungicide',
    pesticide: 'Amistar Top (10ml) + Mupazeb M (30g)',
    targetPest: 'Early blight, Late blight, Fungal diseases',
    dosage: 'Amistar Top: 10ml, Mupazeb M: 30g per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-02'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear full protective gear.',
    notes: '',
  },

  // WEEK 9 (3 – 9 January 2026)
  {
    name: 'Week 9 - Top Dressing (CAN)',
    pesticide: 'CAN Fertilizer',
    targetPest: 'N/A - Nitrogen fertilizer',
    dosage: '1 teaspoon per plant - soil application',
    applicationMethod: 'Soil drench',
    scheduledDate: new Date('2026-01-04'),
    weatherConditions: 'Apply after irrigation',
    safetyPrecautions: 'Wear gloves when handling fertilizer',
    notes: 'Apply around base of plant. Do not let fertilizer touch stem.',
  },
  {
    name: 'Week 9 - Insect Control',
    pesticide: 'Actara (5g) + Cyper (10ml) + Dosth (5ml)',
    targetPest: 'Sucking and chewing insects',
    dosage: 'Actara: 5g, Cyper: 10ml, Dosth: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-07'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear gloves, mask and protective clothing.',
    notes: '',
  },

  // WEEK 10 (10 – 16 January 2026)
  {
    name: 'Week 10 - Foliar Feed (Boron & Zinc)',
    pesticide: 'OMEX ZiBo (15ml)',
    targetPest: 'N/A - Micronutrient supplement',
    dosage: 'OMEX ZiBo: 15ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-12'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },
  {
    name: 'Week 10 - Disease Control',
    pesticide: 'Amistar Top (10ml) + Neemcide (20ml)',
    targetPest: 'Fungal diseases + organic pest control',
    dosage: 'Amistar Top: 10ml, Neemcide: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-15'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear protective gear.',
    notes: '',
  },

  // WEEK 11 (17 – 23 January 2026)
  {
    name: 'Week 11 - Fungicide',
    pesticide: 'Mupazeb M (30g)',
    targetPest: 'Fungal diseases',
    dosage: 'Mupazeb M: 30g per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-19'),
    weatherConditions: 'Avoid rain for 6 hours after application',
    safetyPrecautions: 'Wear protective gear.',
    notes: '',
  },
  {
    name: 'Week 11 - Foliar Feed (Fruit)',
    pesticide: 'Voema Fruit (20ml)',
    targetPest: 'N/A - Fruit development nutrient',
    dosage: 'Voema Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-21'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: '',
  },

  // WEEK 12 (24 – 30 January 2026) - Final Week
  {
    name: 'Week 12 - Final Spray (Pre-harvest)',
    pesticide: 'Neemcide only (20ml)',
    targetPest: 'General pest prevention - organic/safe',
    dosage: 'Neemcide: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-01-25'),
    weatherConditions: 'Apply in cool conditions',
    safetyPrecautions: 'Neemcide is organic and safe near harvest.',
    notes: '⚠️ FINAL SPRAY before harvest! Expected harvest start: 02 February 2026',
  },
];

async function main() {
  console.log('🍅 Adding spray plans for Tomatoes Tengeru Select...\n');
  
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
    await prisma.sprayPlan.create({
      data: {
        plantingId: PLANTING_ID,
        ...plan,
        status: plan.scheduledDate < new Date() ? 'PENDING' : 'PENDING',
      }
    });
    created++;
    console.log(`✅ Added: ${plan.name}`);
  }

  console.log(`\n🎉 Successfully added ${created} spray plans!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
