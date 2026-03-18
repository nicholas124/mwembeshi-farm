const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ══════════════════════════════════════════════════════════════════════════════
// OKRA CLEMSON SPINELESS — Complete Growing Plan
// Location: Lusaka, Zambia
// Seed planted: 12 March 2026
// Plan prepared: 18 March 2026 — adjusted for late D Compound application
// First Harvest Expected: ~23 April 2026
// Season Length: ~5 Months (through August 2026)
// ══════════════════════════════════════════════════════════════════════════════

// Required Inputs — Full Season Reference
// ─────────────────────────────────────────
// FERTILIZERS:
//   D Compound (7:14:7) — 300 kg/ha / ~30 g/m2 — TODAY 18 Mar side-dress (URGENT)
//   Well-rotted manure/compost — 2-3 kg/m2 — Can still add around plants now
//   CAN 27% N or Urea 46% — 150 kg/ha / ~15 g/m2 (CAN) — 1 Apr, 10 May, every 3-4 wks
//   NPK 17:17:17 or Compound S — 200 kg/ha / ~20 g/m2 — 18 Apr (pre-flowering)
//   Muriate of Potash (MOP 60%) — 75 kg/ha / ~7.5 g/m2 — 28 Apr (pod fill)
//   Potassium Nitrate (foliar) — 5 g/L spray — 28 Apr onwards
//   Multifeed Classic 20:20:20 — 2 g/L foliar spray — Mixed with fungicide sprays
//
// CHEMICALS / SPRAYS:
//   Mancozeb 80% WP — 2 g/L — Preventive fungicide (damping off, blight)
//   Karate (Lambda-cyhalothrin 5% EC) — 10 ml/15 L — Aphids, whiteflies, general insects
//   Dimethoate 40% EC — 20 ml/15 L — Sucking pest backup
//   Chlorpyrifos 48% EC — 30 ml/15 L — Pod/fruit borers (Earias spp.)
//   Emamectin benzoate 5% SG — 8 g/15 L — Pod borers (rotate with Chlorpyrifos)
//   Abamectin 1.8% EC — 10 ml/15 L — Spider mites
//   Sulfur 80% WP — 3 g/L — Powdery mildew (dry season, May+)
//   Trifloxystrobin + Tebuconazole — 10 ml/15 L — Powdery mildew alternative

const growingPlan = [
  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 1 — Soil Prep, Planting & D Compound Correction
  // 7 March – 18 March 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Phase 1 — Bed Preparation (completed)',
    pesticide: 'N/A — Land preparation',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Tilled soil 30-40 cm deep',
    scheduledDate: new Date('2026-03-07'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION: Aim for loose, well-draining loam, pH 6.0-6.8. If soil is heavy clay, incorporate coarse river sand + compost for drainage.',
  },
  {
    name: 'Phase 1 — Planting Day (completed)',
    pesticide: 'N/A — Seed sowing',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Direct seeding — 2 seeds per hole, 2-3 cm deep',
    scheduledDate: new Date('2026-03-12'),
    weatherConditions: 'Seeds soaked 12-24 hrs before sowing',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION: Spacing 30-45 cm between plants, 60-90 cm between rows. Watered immediately after sowing.',
  },
  {
    name: 'Phase 1 — URGENT: Apply D Compound Side-Dress',
    pesticide: 'D Compound (7:14:7)',
    targetPest: 'N/A — Critical fertilizer for root establishment',
    dosage: '300 kg/ha (~30 g per square metre)',
    applicationMethod: 'Scatter in a ring 8-10 cm from each seedling stem — do NOT place on leaves or against the stem',
    scheduledDate: new Date('2026-03-18'),
    weatherConditions: 'Water in immediately and thoroughly after application',
    safetyPrecautions: 'Wear gloves. Do not place fertilizer on leaves — will burn.',
    notes: 'URGENT CORRECTION: D Compound was NOT applied at planting on 12 March 2026. Apply TODAY as emergency side-dress around seedlings. This provides critical phosphorus for root establishment while seedlings are still young enough to benefit fully. Do not delay beyond 18 March — after 10 days post-germination, phosphorus uptake efficiency drops significantly.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 2 — Germination & Establishment
  // 12 March – 26 March 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Phase 2 — Keep Soil Moist for Germination',
    pesticide: 'N/A — Watering schedule',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Water lightly every morning',
    scheduledDate: new Date('2026-03-13'),
    weatherConditions: 'Keep moist — not waterlogged. April Lusaka can still have rains — adjust watering if rain falls.',
    safetyPrecautions: 'Standard precautions',
    notes: 'WATERING (13-17 Mar): Okra germinates in 5-10 days. Expect first seedlings around 17-20 March.',
  },
  {
    name: 'Phase 2 — Thinning Seedlings',
    pesticide: 'N/A — Thinning action',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Remove weaker seedlings carefully to avoid disturbing roots',
    scheduledDate: new Date('2026-03-20'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION (20-22 Mar): Once seedlings reach 5-7 cm tall, thin to the strongest plant per hole. Never leave two plants per hole — they will compete and reduce yield.',
  },
  {
    name: 'Phase 2 — First Weeding',
    pesticide: 'N/A — Weeding action',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Hand-weed or shallow-hoe around seedlings',
    scheduledDate: new Date('2026-03-22'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Do not disturb shallow roots',
    notes: 'ACTION (22-26 Mar): Keep a 10 cm clear zone around each plant. Mulch with dry grass or straw to conserve moisture and suppress weeds.',
  },
  {
    name: 'Phase 2 — Preventive Fungicide + Foliar Feed',
    pesticide: 'Mancozeb 80% WP (2 g/L) + Multifeed Classic 20:20:20 (2 g/L)',
    targetPest: 'Damping off, Early blight',
    dosage: 'Mancozeb: 2 g/L, Multifeed Classic 20:20:20: 2 g/L',
    applicationMethod: 'Spray all foliage in early morning or late afternoon',
    scheduledDate: new Date('2026-03-25'),
    weatherConditions: 'NEVER spray in midday heat',
    safetyPrecautions: 'Wear mask and gloves. Avoid inhalation of Mancozeb dust.',
    notes: 'SPRAY: This prevents damping off and early blight while feeding the young plants. Mixed with fungicide sprays for efficiency.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 3 — Vegetative Growth
  // 1 April – 20 April 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Phase 3 — First Topdress: Nitrogen Boost',
    pesticide: 'CAN (Calcium Ammonium Nitrate 27% N) or Urea (46% N)',
    targetPest: 'N/A — Nitrogen fertilizer for vegetative growth',
    dosage: 'CAN: 150 kg/ha (~15 g/m2) OR Urea 46% N at 75 kg/ha',
    applicationMethod: 'Ring application 10 cm from plant base',
    scheduledDate: new Date('2026-04-01'),
    weatherConditions: 'Water in immediately after application',
    safetyPrecautions: 'Do NOT place on leaves — will burn.',
    notes: 'FERTILIZER: First nitrogen topdress to boost vegetative growth. Repeat on 10 May, then every 3-4 weeks.',
  },
  {
    name: 'Phase 3 — Pest Scout & Insecticide (if needed)',
    pesticide: 'Karate (Lambda-cyhalothrin 5% EC) OR Dimethoate 40% EC',
    targetPest: 'Aphids, Whiteflies, Shoot borers',
    dosage: 'Karate: 10 ml/15 L knapsack, OR Dimethoate 40% EC: 20 ml/15 L',
    applicationMethod: 'Foliar spray — spray the underside of leaves',
    scheduledDate: new Date('2026-04-03'),
    weatherConditions: 'Apply early morning or late afternoon',
    safetyPrecautions: 'Wear full PPE. Lambda-cyhalothrin toxic to aquatic life.',
    notes: 'SPRAY: Scout for aphids, whiteflies, and shoot borers. If infestation confirmed, spray. Dimethoate for sucking insects.',
  },
  {
    name: 'Phase 3 — Establish Watering Routine',
    pesticide: 'N/A — Irrigation schedule',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Irrigate early morning at the plant base',
    scheduledDate: new Date('2026-04-07'),
    weatherConditions: 'Adjust for any remaining April rains',
    safetyPrecautions: 'Avoid wetting leaves excessively',
    notes: 'WATERING: Water every 2-3 days. Okra tolerates some drought but consistent moisture is essential for yield.',
  },
  {
    name: 'Phase 3 — Second Weeding + Earthing Up',
    pesticide: 'N/A — Weeding and earthing up',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Weed thoroughly. Earth up soil around plant stems to support upright growth and cover surface roots.',
    scheduledDate: new Date('2026-04-10'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION: Replenish mulch layer. Plants should now be 25-35 cm tall.',
  },
  {
    name: 'Phase 3 — Fungicide + Foliar Feed (Repeat)',
    pesticide: 'Mancozeb 80% WP (2 g/L) + Multifeed Classic 20:20:20 (2 g/L)',
    targetPest: 'Leaf curl, Yellowing, Black spots',
    dosage: 'Mancozeb: 2 g/L, Multifeed Classic 20:20:20: 2 g/L',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-15'),
    weatherConditions: 'Spray early morning or late afternoon only',
    safetyPrecautions: 'Wear mask and gloves.',
    notes: 'SPRAY: Repeat preventive fungicide. Watch for leaf curl, yellowing, or black spots. Spray every 10 days as preventive measure.',
  },
  {
    name: 'Phase 3 — Second Topdress: Pre-Flowering',
    pesticide: 'NPK 17:17:17 or Compound S (7:21:7 + Sulfur)',
    targetPest: 'N/A — Pre-flowering fertilizer for phosphorus and sulfur',
    dosage: 'NPK 17:17:17: 200 kg/ha (~20 g/m2)',
    applicationMethod: 'Ring application 15 cm from stem',
    scheduledDate: new Date('2026-04-18'),
    weatherConditions: 'Water thoroughly after',
    safetyPrecautions: 'Wear gloves. Avoid contact with foliage.',
    notes: 'FERTILIZER: This promotes healthy flower bud formation. Phosphorus and sulfur are key nutrients at this stage.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 4 — Flowering
  // 20 April – 5 May 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Phase 4 — Flowering Begins',
    pesticide: 'N/A — Flowering milestone',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'N/A — Monitor plants',
    scheduledDate: new Date('2026-04-20'),
    weatherConditions: 'CRITICAL: Keep plants consistently watered during flowering — any water stress causes flower drop and drastically reduces yield',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION (20-25 Apr): Clemson Spineless flowers 40-55 days after planting. Expect first large yellow flowers (with purple/red centre) around 20-25 April. Flowers are self-pollinating — no hand pollination needed.',
  },
  {
    name: 'Phase 4 — Pest Control: Pod Borers & Spider Mites',
    pesticide: 'Chlorpyrifos 48% EC OR Emamectin benzoate 5% SG + Abamectin 1.8% EC',
    targetPest: 'Pod/fruit borers (Earias spp.), Spider mites',
    dosage: 'Chlorpyrifos: 30 ml/15 L, OR Emamectin benzoate: 8 g/15 L. For spider mites: Abamectin 1.8% EC at 10 ml/15 L',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-04-22'),
    weatherConditions: 'Always spray AFTER bees are inactive — late afternoon',
    safetyPrecautions: 'Full PPE required. IMPORTANT: rotate chemicals to prevent resistance.',
    notes: 'SPRAY: Once flowering starts, scout intensively for pod/fruit borers (Earias spp.). Always spray AFTER bees are inactive — late afternoon.',
  },
  {
    name: 'Phase 4 — Potassium Boost: Pod Fill',
    pesticide: 'Potassium Nitrate (KNO3) foliar OR Muriate of Potash (MOP 60%)',
    targetPest: 'N/A — Potassium for pod size, quality, flavour, and disease resistance',
    dosage: 'KNO3: 5 g/L foliar spray, OR MOP 60%: 75 kg/ha (~7.5 g/m2) soil application',
    applicationMethod: 'Foliar spray of KNO3 at 5 g/L, OR apply Muriate of Potash to soil',
    scheduledDate: new Date('2026-04-28'),
    weatherConditions: 'Apply after watering',
    safetyPrecautions: 'Standard precautions. Wear gloves for soil application.',
    notes: 'FERTILIZER: Potassium improves pod size, quality, flavour, and disease resistance. Continue foliar KNO3 from 28 Apr onwards.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PHASE 5 — Harvest & Ongoing Maintenance
  // Late April – August 2026
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Phase 5 — First Harvest: Begin Picking',
    pesticide: 'N/A — Harvest begins',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Harvest when pods are 7-10 cm long (finger length) and snap cleanly',
    scheduledDate: new Date('2026-04-23'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Wear gloves — the plant has fine hairs that irritate skin.',
    notes: 'HARVEST (23 Apr – 10 May): Pods are ready 4-6 days after flower drop. Overripe pods become tough/fibrous and signal the plant to stop producing.',
  },
  {
    name: 'Phase 5 — Ongoing Harvest Schedule',
    pesticide: 'N/A — Harvest schedule',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Harvest every 2-3 days',
    scheduledDate: new Date('2026-05-01'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Wear gloves — okra plant hairs irritate skin.',
    notes: 'HARVEST (Every 2-3 days, May-Jul): Okra MUST be harvested every 2-3 days. Leaving pods on the plant tells it to stop producing new flowers. Regular picking = continuous yield for 3-4 months. This is the single most important harvesting rule.',
  },
  {
    name: 'Phase 5 — Third Topdress: Sustain Production',
    pesticide: 'CAN or Urea',
    targetPest: 'N/A — Nitrogen fertilizer to sustain pod production',
    dosage: 'CAN: 150 kg/ha (~15 g/m2) OR Urea at same rate as 1 April',
    applicationMethod: 'Ring application around plant base',
    scheduledDate: new Date('2026-05-10'),
    weatherConditions: 'Water in after application',
    safetyPrecautions: 'Avoid leaf contact.',
    notes: 'FERTILIZER: Repeat every 3-4 weeks through the harvest period to maintain vigorous pod production.',
  },
  {
    name: 'Phase 5 — Fungicide: Powdery Mildew Prevention',
    pesticide: 'Sulfur 80% WP (3 g/L) OR Trifloxystrobin + Tebuconazole (10 ml/15 L)',
    targetPest: 'Powdery mildew (white dusty coating on leaves)',
    dosage: 'Sulfur 80% WP: 3 g/L, OR Trifloxystrobin + Tebuconazole: 10 ml/15 L',
    applicationMethod: 'Foliar spray',
    scheduledDate: new Date('2026-05-15'),
    weatherConditions: 'Spray early morning or late afternoon',
    safetyPrecautions: 'Wear mask and gloves. Sulfur can irritate eyes.',
    notes: 'SPRAY: As cooler/drier May weather arrives, watch for powdery mildew (white dusty coating on leaves). Spray every 10-14 days as needed.',
  },
  {
    name: 'Phase 5 — Adjust Watering for Dry Season',
    pesticide: 'N/A — Irrigation adjustment',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Increase to irrigating every 2 days. Double the mulch layer to conserve soil moisture.',
    scheduledDate: new Date('2026-05-20'),
    weatherConditions: 'Lusaka dry season deepens in May-July',
    safetyPrecautions: 'Standard precautions',
    notes: 'WATERING (May-Jul ongoing): Drip or furrow irrigation is ideal. Okra tolerates some drought but pod quality drops without consistent moisture at the root zone.',
  },
  {
    name: 'Phase 5 — End of Season: Final Harvest & Clear',
    pesticide: 'N/A — Season end',
    targetPest: 'N/A',
    dosage: 'N/A',
    applicationMethod: 'Allow last few pods to fully mature and dry on the plant for seed saving',
    scheduledDate: new Date('2026-08-01'),
    weatherConditions: 'Any conditions',
    safetyPrecautions: 'Standard precautions',
    notes: 'ACTION (August 2026): Clemson Spineless seeds store well for 2-3 years in a cool dry place. Clear all plant debris from beds. Incorporate compost and rest the soil, or rotate with a legume crop (beans/cowpeas) to restore nitrogen.',
  },
];

// Key Tips for Lusaka Conditions:
// - March/April: End of rainy season — monitor soil moisture carefully. Do not overwater in first 6 weeks. If rain falls, skip irrigation that day.
// - May onwards: Dry season arrives fast — ramp up irrigation and double your mulch layer immediately.
// - Biggest pest threats: Aphids early on (March-April), Pod borers once flowering starts (April+). Scout every 3 days from April onwards.
// - Always spray chemicals in early morning or late afternoon — NEVER in midday heat. This prevents leaf burn and protects pollinators.
// - Always rotate insecticide chemicals (do not use the same product twice in a row) to prevent pest resistance building up.
// - Clemson Spineless is one of the most reliable and productive okra varieties — if you follow this plan consistently, expect excellent yields from late April through August.

async function main() {
  console.log('🌿 Adding COMPLETE Growing Plan for Okra (Clemson Spineless) - Lusaka, Zambia...\n');
  console.log('📅 Planted: 12 March 2026');
  console.log('🌱 First Harvest Expected: ~23 April 2026');
  console.log('📆 Season Length: ~5 Months (through August 2026)\n');

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
        location: 'Lusaka, Zambia',
        soilType: 'Sandy loam',
        irrigation: 'RAINFED',
        notes: 'Okra planting field — Namaya section, Mwembeshi',
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
        plantingDate: new Date('2026-03-12'),
        expectedHarvest: new Date('2026-04-23'),
        areaPlanted: 0.5,
        variety: 'Clemson Spineless',
        seedSource: 'Local Market',
        plantingMethod: 'DIRECT_SEEDING',
        spacingRows: 75,
        spacingPlants: 37,
        health: 'GOOD',
        basalFertilizer: 'D-Compound (7:14:7)',
        topDressFertilizer: 'CAN 27% N',
        status: 'PLANTED',
        season: 'RAINY',
        notes: 'Okra Clemson Spineless — Complete Growing Plan. Planted 12 March 2026, Lusaka, Zambia. First harvest expected ~23 April 2026. Season ~5 months through August 2026. Plan adjusted for late D Compound application.',
      },
      include: { cropType: true, field: true }
    });
    console.log(`✅ Created planting: ${planting.cropType.name} (${planting.variety}) in ${planting.field.name}`);
  } else {
    // Update existing planting
    planting = await prisma.planting.update({
      where: { id: planting.id },
      data: {
        variety: 'Clemson Spineless',
        plantingDate: new Date('2026-03-12'),
        expectedHarvest: new Date('2026-04-23'),
        plantingMethod: 'DIRECT_SEEDING',
        spacingRows: 75,
        spacingPlants: 37,
        health: 'GOOD',
        basalFertilizer: 'D-Compound (7:14:7)',
        topDressFertilizer: 'CAN 27% N',
        status: 'PLANTED',
        season: 'RAINY',
        notes: 'Okra Clemson Spineless — Complete Growing Plan. Planted 12 March 2026, Lusaka, Zambia. First harvest expected ~23 April 2026. Season ~5 months through August 2026. Plan adjusted for late D Compound application.',
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
    console.log(`Removed ${deleted.count} existing plans.\n`);
  }

  // Add all growing plan tasks
  let created = 0;
  let currentPhase = '';
  for (const plan of growingPlan) {
    const phase = plan.name.split('—')[0].trim();
    if (phase !== currentPhase) {
      currentPhase = phase;
      console.log(`\n── ${phase} ──`);
    }

    await prisma.sprayPlan.create({
      data: {
        plantingId: planting.id,
        ...plan,
        status: 'PENDING',
      }
    });
    created++;
    console.log(`  ✅ ${plan.name} — ${plan.scheduledDate.toISOString().split('T')[0]}`);
  }

  console.log(`\n🎉 Successfully added ${created} growing plan tasks for Okra Clemson Spineless!`);

  console.log('\n📋 REQUIRED INPUTS SUMMARY:');
  console.log('  FERTILIZERS:');
  console.log('    D Compound (7:14:7) — 300 kg/ha — 18 Mar (URGENT side-dress)');
  console.log('    CAN 27% N or Urea 46% — 150 kg/ha — 1 Apr, 10 May, every 3-4 wks');
  console.log('    NPK 17:17:17 or Compound S — 200 kg/ha — 18 Apr (pre-flowering)');
  console.log('    Muriate of Potash (MOP 60%) — 75 kg/ha — 28 Apr (pod fill)');
  console.log('    Potassium Nitrate (foliar) — 5 g/L — 28 Apr onwards');
  console.log('    Multifeed Classic 20:20:20 — 2 g/L foliar — with fungicide sprays');
  console.log('  CHEMICALS / SPRAYS:');
  console.log('    Mancozeb 80% WP — 2 g/L — Preventive fungicide');
  console.log('    Karate (Lambda-cyhalothrin 5% EC) — 10 ml/15 L — General insects');
  console.log('    Dimethoate 40% EC — 20 ml/15 L — Sucking pests');
  console.log('    Chlorpyrifos 48% EC — 30 ml/15 L — Pod borers');
  console.log('    Emamectin benzoate 5% SG — 8 g/15 L — Pod borers (rotate)');
  console.log('    Abamectin 1.8% EC — 10 ml/15 L — Spider mites');
  console.log('    Sulfur 80% WP — 3 g/L — Powdery mildew');
  console.log('    Trifloxystrobin + Tebuconazole — 10 ml/15 L — Powdery mildew alternative');

  console.log('\n🌿 KEY TIPS FOR LUSAKA CONDITIONS:');
  console.log('  • March/April: End of rainy season — monitor soil moisture, don\'t overwater');
  console.log('  • May onwards: Dry season — ramp up irrigation, double mulch layer');
  console.log('  • Biggest pests: Aphids (Mar-Apr), Pod borers (Apr+). Scout every 3 days');
  console.log('  • NEVER spray in midday heat — early morning or late afternoon only');
  console.log('  • Rotate insecticides — never use the same product twice in a row');
  console.log('  • Harvest every 2-3 days — the single most important rule for continuous yield');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
