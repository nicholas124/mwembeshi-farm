const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Okra Clemson Spineless - Planted 13 March 2026, Mwembeshi Namaya
// Growing cycle: ~55-60 days to first harvest, continuous harvest for 6-8 weeks
// First harvest expected: ~7 May 2026
// Harvest period: May - June 2026

// Spray plan covers 8 weeks (establishment to harvest)
// Okra pests in Zambia: Aphids, Flea beetles, Whitefly, Bollworm/Fruit borers, Leaf miners
// Okra diseases: Powdery mildew, Damping off, Cercospora leaf spot, Fusarium wilt

const sprayPlans = [
  // ═══════════════════════════════════════════════════
  // WEEK 1 (13 – 19 March 2026) — ESTABLISHMENT
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 1 - Fungicide (Damping Off Prevention)',
    pesticide: 'Mupazeb M (30g) + Introgel SET (5ml)',
    targetPest: 'Damping off, Soil-borne fungi',
    dosage: 'Mupazeb M: 30g, Introgel SET: 5ml per 20L water',
    applicationMethod: 'Soil drench around seedling base',
    scheduledDate: new Date('2026-03-15'),
    weatherConditions: 'Apply in the evening after irrigation',
    safetyPrecautions: 'Wear gloves and mask. Mancozeb is minimally toxic but avoid inhalation.',
    notes: 'Damping off is the biggest threat at this stage. Keep soil moist but not waterlogged. Irrigation: daily in morning.',
  },
  {
    name: 'Week 1 - Insect Control (Establishment)',
    pesticide: 'Actara 25WG (5g) + Introgel SET (5ml)',
    targetPest: 'Aphids, Flea beetles, Soil insects',
    dosage: 'Actara 25WG: 5g, Introgel SET: 5ml per 20L water',
    applicationMethod: 'Foliar spray + soil drench',
    scheduledDate: new Date('2026-03-17'),
    weatherConditions: 'Apply early morning (before 09:00) or late afternoon (after 16:00)',
    safetyPrecautions: 'Wear gloves, mask and protective clothing. Actara is systemic — protect bees.',
    notes: 'Flea beetles are the #1 pest on young okra seedlings. Actara is systemic so it protects from inside the plant.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 2 (20 – 26 March 2026) — SEEDLING GROWTH
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 2 - Foliar Feed (Vegetative)',
    pesticide: 'Voema Vegetative NT (20ml)',
    targetPest: 'N/A - Nutrient supplement for leaf growth',
    dosage: 'Voema Vegetative NT: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-03-22'),
    weatherConditions: 'Apply early morning in cool conditions. Avoid midday heat.',
    safetyPrecautions: 'Standard precautions. Fertiliser is safe.',
    notes: 'Okra needs strong vegetative growth early. The 5:1:3 ratio boosts leaf development. Thin seedlings to 1 per station if direct-seeded.',
  },
  {
    name: 'Week 2 - Insect Control',
    pesticide: 'Hero Cyper (15ml) + Neemcide (20ml) + Maxi Stic (5ml)',
    targetPest: 'Flea beetles, Aphids, Caterpillars',
    dosage: 'Hero Cyper: 15ml, Neemcide: 20ml, Maxi Stic: 5ml per 20L water',
    applicationMethod: 'Foliar spray — cover both upper and lower leaf surfaces',
    scheduledDate: new Date('2026-03-25'),
    weatherConditions: 'Apply early morning or late afternoon. No rain expected for 4 hours.',
    safetyPrecautions: 'Cypermethrin is toxic to fish — keep away from water sources. Wear full PPE.',
    notes: 'Neemcide adds organic broad-spectrum protection. Target underside of leaves where aphids hide.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 3 (27 March – 2 April 2026) — VEGETATIVE GROWTH
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 3 - Fungicide (Leaf Spot Prevention)',
    pesticide: 'Amistar Top (10ml) + Introgel SET (5ml)',
    targetPest: 'Cercospora leaf spot, Powdery mildew',
    dosage: 'Amistar Top: 10ml, Introgel SET: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-03-29'),
    weatherConditions: 'Avoid rain for 6 hours after application. Apply in dry conditions.',
    safetyPrecautions: 'Wear protective gear. Amistar Top is a systemic fungicide — very effective.',
    notes: 'Rainy season means high disease pressure. Amistar Top provides both preventive and curative action. Weed around plants this week.',
  },
  {
    name: 'Week 3 - Foliar Feed + Micronutrients',
    pesticide: 'Voema Vegetative NT (20ml) + OMEX ZiBo (10ml)',
    targetPest: 'N/A - Nutrient supplement (Zinc + Boron + NPK)',
    dosage: 'Voema Vegetative NT: 20ml, OMEX ZiBo: 10ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-01'),
    weatherConditions: 'Apply early morning in cool conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'Boron helps flower development later. Zinc boosts overall growth. Apply D-Compound basal fertilizer to soil this week (5g per plant).',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 4 (3 – 9 April 2026) — PRE-FLOWERING
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 4 - Insect Control (Bollworm Prevention)',
    pesticide: 'Emacide/Benzo Extra (10g) + Maxi Stic (5ml)',
    targetPest: 'Bollworm/Fruit borer, Caterpillars, Leaf rollers',
    dosage: 'Emacide (Emamectin Benzoate): 10g, Maxi Stic: 5ml per 20L water',
    applicationMethod: 'Foliar spray — thorough coverage of growing tips',
    scheduledDate: new Date('2026-04-05'),
    weatherConditions: 'Apply late afternoon. Emamectin works best in cool conditions.',
    safetyPrecautions: 'Harmful if inhaled. Wear full PPE. Keep out of reach of children. Toxic to fish.',
    notes: 'Emamectin Benzoate is the best caterpillar/bollworm control. Critical to apply before flowering starts — bollworms attack flower buds and young pods.',
  },
  {
    name: 'Week 4 - Fungicide',
    pesticide: 'Mupazeb M (30g) + Uthane M-45 (30g) + Introgel SET (5ml)',
    targetPest: 'Powdery mildew, Downy mildew, Cercospora',
    dosage: 'Use either Mupazeb M OR Uthane M-45: 30g, Introgel SET: 5ml per 20L water (both are Mancozeb — alternate with Amistar Top)',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-08'),
    weatherConditions: 'Avoid rain for 6 hours. Apply in dry conditions.',
    safetyPrecautions: 'Wear mask — Mancozeb dust irritates respiratory system.',
    notes: 'Alternate Mancozeb and Amistar Top to prevent resistance build-up.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 5 (10 – 16 April 2026) — FLOWERING
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 5 - Foliar Feed (Flowering)',
    pesticide: 'Voema Flower & Fruit (20ml) + OMEX ZiBo (15ml)',
    targetPest: 'N/A - Nutrient supplement for flowering & fruit set',
    dosage: 'Voema Flower & Fruit: 20ml, OMEX ZiBo: 15ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-12'),
    weatherConditions: 'Apply early morning. Avoid spraying open flowers in full sun.',
    safetyPrecautions: 'Standard precautions',
    notes: 'Okra starts flowering around day 30-35. Boron is critical for flower-to-fruit conversion. Switch from Voema Vegetative to Flower & Fruit formula.',
  },
  {
    name: 'Week 5 - Insect + Disease Combo',
    pesticide: 'Tuta-Max (10ml) + Amistar Top (10ml) + Maxi Stic (5ml)',
    targetPest: 'Whitefly, Leaf miner, Thrips + Fungal diseases',
    dosage: 'Tuta-Max: 10ml, Amistar Top: 10ml, Maxi Stic: 5ml per 20L water',
    applicationMethod: 'Foliar spray — full coverage',
    scheduledDate: new Date('2026-04-15'),
    weatherConditions: 'Apply early morning or late afternoon. No rain for 4 hours.',
    safetyPrecautions: 'Chlorfenapyr (Tuta-Max) is toxic — full PPE required. Do not spray near water.',
    notes: 'Tuta-Max controls mites and leaf miners that Cypermethrin misses. Combo spray saves time during busy flowering period.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 6 (17 – 23 April 2026) — EARLY FRUITING
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 6 - Insect Control (Pod Protection)',
    pesticide: 'Emacide/Benzo Extra (10g) + Actara 25WG (3g) + Introgel SET (5ml)',
    targetPest: 'Bollworm/Fruit borer, Aphids on pods, Thrips',
    dosage: 'Emacide: 10g, Actara: 3g, Introgel SET: 5ml per 20L water',
    applicationMethod: 'Foliar spray — target developing pods and flowers',
    scheduledDate: new Date('2026-04-19'),
    weatherConditions: 'Apply early morning before bees are active',
    safetyPrecautions: 'Both Emamectin and Actara toxic to bees — spray early morning only. Full PPE.',
    notes: 'Critical spray! Bollworm larvae bore into young okra pods. Emamectin kills larvae already inside pods.',
  },
  {
    name: 'Week 6 - Fungicide + Foliar Feed',
    pesticide: 'Mupazeb M (30g) + Voema Flower & Fruit (20ml)',
    targetPest: 'Powdery mildew, Pod rot + Fruit nutrition',
    dosage: 'Mupazeb M: 30g, Voema Flower & Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-22'),
    weatherConditions: 'Apply in dry conditions. Avoid rain for 6 hours.',
    safetyPrecautions: 'Wear mask for Mancozeb dust.',
    notes: 'Apply CAN top-dressing fertilizer to soil this week (1 teaspoon per plant around base).',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 7 (24 – 30 April 2026) — HARVESTING BEGINS
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 7 - Foliar Feed (Sustained Production)',
    pesticide: 'Voema Flower & Fruit (20ml) + OMEX ZiBo (15ml)',
    targetPest: 'N/A - Sustain pod production',
    dosage: 'Voema Flower & Fruit: 20ml, OMEX ZiBo: 15ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-26'),
    weatherConditions: 'Apply early morning',
    safetyPrecautions: 'Standard precautions',
    notes: '⚠️ HARVEST starts this week! Pick pods every 2-3 days when 7-10cm long (finger length). Do NOT let pods get tough/woody.',
  },
  {
    name: 'Week 7 - Safe Insect Control (Harvest Period)',
    pesticide: 'Neemcide (30ml) + Maxi Stic (5ml)',
    targetPest: 'Aphids, Whitefly, General pest prevention',
    dosage: 'Neemcide: 30ml, Maxi Stic: 5ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-29'),
    weatherConditions: 'Apply late afternoon after harvest for the day',
    safetyPrecautions: 'Neemcide is botanical/organic — safe to use near harvest. Observe 1-day PHI.',
    notes: 'During harvest, use only Neemcide for insect control — it has the shortest pre-harvest interval. Harvest BEFORE spraying each time.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 8 (1 – 7 May 2026) — PEAK HARVEST
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 8 - Fungicide (Harvest Period)',
    pesticide: 'Amistar Top (10ml) + Introgel SET (5ml)',
    targetPest: 'Pod rot, Leaf diseases during wet conditions',
    dosage: 'Amistar Top: 10ml, Introgel SET: 5ml per 20L water',
    applicationMethod: 'Foliar spray — avoid direct spraying on pods ready to harvest',
    scheduledDate: new Date('2026-05-03'),
    weatherConditions: 'Apply after harvest. No rain for 6 hours.',
    safetyPrecautions: 'Observe 7-day pre-harvest interval for Amistar Top. Only spray AFTER picking.',
    notes: 'Peak harvest period. Pick pods every 2 days. Spray only after harvesting the day\'s pods. Keep plants healthy for prolonged production.',
  },
  {
    name: 'Week 8 - Foliar Feed (Keep Producing)',
    pesticide: 'Voema Flower & Fruit (20ml)',
    targetPest: 'N/A - Sustain flowering and pod production',
    dosage: 'Voema Flower & Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-05-06'),
    weatherConditions: 'Apply early morning',
    safetyPrecautions: 'Standard precautions',
    notes: 'Continue harvesting every 2-3 days. Foliar feed keeps new flowers and pods coming.',
  },

  // ═══════════════════════════════════════════════════
  // WEEK 9-10 (8 – 21 May 2026) — CONTINUED HARVEST
  // ═══════════════════════════════════════════════════
  {
    name: 'Week 9 - Safe Pest Control + Feed',
    pesticide: 'Neemcide (30ml) + Voema Flower & Fruit (20ml)',
    targetPest: 'General pest prevention + Nutrition',
    dosage: 'Neemcide: 30ml, Voema Flower & Fruit: 20ml per 20L water',
    applicationMethod: 'Foliar spray — after harvesting',
    scheduledDate: new Date('2026-05-10'),
    weatherConditions: 'Apply after harvest. Cool conditions.',
    safetyPrecautions: 'Botanical insecticide — low toxicity. Always harvest before spraying.',
    notes: 'Continue picking every 2-3 days. Remove any diseased or oversized pods to maintain plant vigour.',
  },
  {
    name: 'Week 10 - Final Foliar Feed',
    pesticide: 'Voema Flower & Fruit (20ml) + OMEX ZiBo (10ml)',
    targetPest: 'N/A - Final nutrition boost',
    dosage: 'Voema Flower & Fruit: 20ml, OMEX ZiBo: 10ml per 20L water',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-05-17'),
    weatherConditions: 'Apply early morning',
    safetyPrecautions: 'Standard precautions',
    notes: 'Last week of intensive harvest. If plants are still productive, continue with Neemcide-only sprays every 5-7 days. Leave some pods to mature for seed saving if desired.',
  },
];

async function main() {
  console.log('🌿 Adding spray plans for Okra (Clemson Spineless) - Mwembeshi Namaya...\n');

  // First, find the Okra crop type
  const okraCropType = await prisma.cropType.findFirst({
    where: { name: { contains: 'Okra', mode: 'insensitive' } }
  });

  if (!okraCropType) {
    console.error('❌ Okra crop type not found! Run seed first.');
    return;
  }
  console.log(`Found crop type: ${okraCropType.name} (${okraCropType.localName})`);

  // Find or create the Namaya field
  let field = await prisma.field.findFirst({
    where: { name: { contains: 'Namaya', mode: 'insensitive' } }
  });

  if (!field) {
    field = await prisma.field.create({
      data: {
        name: 'Mwembeshi Namaya',
        size: 1.0,
        location: 'Namaya section, Mwembeshi',
        soilType: 'Sandy loam',
        irrigation: 'RAINFED',
        notes: 'Okra planting field',
      }
    });
    console.log(`✅ Created field: ${field.name}`);
  } else {
    console.log(`Found field: ${field.name}`);
  }

  // Find existing okra planting or create one
  let planting = await prisma.planting.findFirst({
    where: {
      cropTypeId: okraCropType.id,
      fieldId: field.id,
    },
    include: { cropType: true, field: true }
  });

  if (!planting) {
    planting = await prisma.planting.create({
      data: {
        cropTypeId: okraCropType.id,
        fieldId: field.id,
        plantingDate: new Date('2026-03-13'),
        expectedHarvest: new Date('2026-05-07'),
        areaPlanted: 0.5,
        variety: 'Clemson Spineless',
        seedSource: 'Local Market',
        plantingMethod: 'DIRECT_SEEDING',
        spacingRows: 60,
        spacingPlants: 30,
        health: 'GOOD',
        basalFertilizer: 'D-Compound',
        topDressFertilizer: 'CAN',
        status: 'PLANTED',
        season: 'RAINY',
        notes: 'Okra Clemson Spineless planted in Mwembeshi Namaya. Direct seeded. Expected first harvest around 7 May 2026. Continuous harvesting for 6-8 weeks.',
      },
      include: { cropType: true, field: true }
    });
    console.log(`✅ Created planting: ${planting.cropType.name} (${planting.variety}) in ${planting.field.name}`);
  } else {
    // Update existing planting with variety info
    planting = await prisma.planting.update({
      where: { id: planting.id },
      data: {
        variety: 'Clemson Spineless',
        plantingDate: new Date('2026-03-13'),
        expectedHarvest: new Date('2026-05-07'),
        plantingMethod: 'DIRECT_SEEDING',
        spacingRows: 60,
        spacingPlants: 30,
        health: 'GOOD',
        basalFertilizer: 'D-Compound',
        topDressFertilizer: 'CAN',
        status: 'PLANTED',
        season: 'RAINY',
      },
      include: { cropType: true, field: true }
    });
    console.log(`Updated planting: ${planting.cropType.name} in ${planting.field.name}`);
  }

  console.log(`\nPlanting ID: ${planting.id}`);
  console.log(`Planted: ${planting.plantingDate}`);
  console.log(`Expected Harvest: ${planting.expectedHarvest}\n`);

  // Delete existing spray plans for this planting (to avoid duplicates)
  const deleted = await prisma.sprayPlan.deleteMany({
    where: { plantingId: planting.id }
  });
  if (deleted.count > 0) {
    console.log(`Removed ${deleted.count} existing spray plans.\n`);
  }

  // Add all spray plans
  let created = 0;
  for (const plan of sprayPlans) {
    await prisma.sprayPlan.create({
      data: {
        plantingId: planting.id,
        ...plan,
        status: 'PENDING',
      }
    });
    created++;
    console.log(`✅ ${plan.name} — ${plan.scheduledDate.toISOString().split('T')[0]}`);
  }

  console.log(`\n🎉 Successfully added ${created} spray plans for Okra!`);
  console.log('\n📋 CHEMICALS USED (from your store):');
  console.log('  Fungicides: Mupazeb M, Uthane M-45, Amistar Top');
  console.log('  Insecticides: Actara 25WG, Hero Cyper, Tuta-Max, Emacide/Benzo Extra, Neemcide');
  console.log('  Foliar Feeds: Voema Vegetative NT, Voema Flower & Fruit, OMEX ZiBo');
  console.log('  Adjuvants: Introgel SET, Maxi Stic');
  console.log('\n📌 MISSING (consider buying):');
  console.log('  • Ridomil Gold MZ (Metalaxyl + Mancozeb) — best for damping off if Mancozeb alone isn\'t enough');
  console.log('  • Lambda-cyhalothrin (e.g., Karate) — broad-spectrum alternative to rotate with Cypermethrin');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
