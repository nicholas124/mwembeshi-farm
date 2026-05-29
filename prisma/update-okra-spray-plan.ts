import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plantingId = 'cmmqsh0qe0002ayuq70p3691f';

const sprayPlans = [
  // WEEK 4 — 7-8 April 2026
  {
    name: 'Week 4 — Insecticide',
    pesticide: 'Neemcide + Introgel SET (sticker)',
    targetPest: 'Leaf-eating pests',
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-07'),
    notes: 'Spray in the evening. Target the leaf holes you can see. Repeat in 5 days if still active.',
  },
  {
    name: 'Week 4 — Weeding',
    pesticide: 'Hand weed between all rows',
    targetPest: 'Weeds',
    dosage: 'N/A',
    scheduledDate: new Date('2026-04-08'),
    notes: 'Do this before the next rain or irrigation.',
  },
  // WEEK 5 — 14 April 2026
  {
    name: 'Week 5 — Fertilizer',
    pesticide: 'Voema Vegetative NT — foliar spray',
    targetPest: null,
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-14'),
    notes: 'Mix as per label. Spray early morning. Boosts leaf growth.',
  },
  {
    name: 'Week 5 — Insecticide',
    pesticide: 'Actara 25WG + Maxi Stic',
    targetPest: 'Whitefly, aphids, thrips',
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-14'),
    notes: 'Systemic — controls whitefly, aphids, thrips. Rotate from Neemcide.',
  },
  // WEEK 6 — 21 April 2026
  {
    name: 'Week 6 — Fungicide',
    pesticide: 'Mupazeb M (Mancozeb) — preventive spray',
    targetPest: 'Early blight, downy mildew',
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-21'),
    notes: 'Prevents early blight and downy mildew. Do not wait for symptoms.',
  },
  {
    name: 'Week 6 — Insecticide',
    pesticide: 'Benzo Extra or Emacide + sticker',
    targetPest: 'Caterpillars/worms',
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-21'),
    notes: 'For caterpillars/worms. These are the same active — use one or the other, not both.',
  },
  // WEEK 7 — 28 April 2026
  {
    name: 'Week 7 — Fertilizer',
    pesticide: 'Voema Vegetative NT + Omex ZiBo',
    targetPest: null,
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-28'),
    notes: 'ZiBo adds Zinc & Boron — critical before flowering starts. Mix together in one tank.',
  },
  {
    name: 'Week 7 — Insecticide',
    pesticide: 'Akito + FalcoStick',
    targetPest: 'General pests',
    dosage: 'As per label',
    scheduledDate: new Date('2026-04-28'),
    notes: 'Rotate insecticide mode of action to prevent resistance.',
  },
  // WEEK 8 — PRE-FLOWERING — 5 May 2026
  {
    name: 'Week 8 — Fungicide (Pre-flowering)',
    pesticide: 'Amistar Top — systemic fungicide',
    targetPest: 'Fungal diseases',
    dosage: 'As per label',
    scheduledDate: new Date('2026-05-05'),
    notes: 'Switch to systemic now. Protects from inside the plant as flowers develop.',
  },
  {
    name: 'Week 8 — Fertilizer (Pre-flowering)',
    pesticide: 'Voema Flower & Fruit',
    targetPest: null,
    dosage: 'As per label',
    scheduledDate: new Date('2026-05-05'),
    notes: 'Higher potassium formula — supports flower set and pod development.',
  },
  // WEEK 10 — FLOWERING & PODS — 19 May 2026
  {
    name: 'Week 10 — Insecticide (Flowering)',
    pesticide: 'Neemcide or Hero Cyper + sticker',
    targetPest: 'General pests',
    dosage: 'As per label',
    scheduledDate: new Date('2026-05-19'),
    notes: 'Keep rotating. Spray in evening to protect pollinators during the day.',
  },
  {
    name: 'Week 10 — Fertilizer (Flowering)',
    pesticide: 'Voema Flower & Fruit — continue every 2 weeks',
    targetPest: null,
    dosage: 'As per label',
    scheduledDate: new Date('2026-05-19'),
    notes: 'Sustains pod fill and quality throughout harvest period.',
  },
  // WEEK 12+ — HARVEST — 2 June 2026 onwards
  {
    name: 'Week 12+ — Harvest begins',
    pesticide: 'Pick pods when 8-10 cm long',
    targetPest: null,
    dosage: 'N/A',
    scheduledDate: new Date('2026-06-02'),
    notes: 'Harvest every 2-3 days. Do not let pods go woody — this slows new pod production. Continue spraying on rotation.',
  },
];

async function main() {
  // Delete all existing spray plans for this okra planting
  const deleted = await prisma.sprayPlan.deleteMany({ where: { plantingId } });
  console.log(`Deleted ${deleted.count} existing spray plans`);

  // Add new spray plans
  for (const plan of sprayPlans) {
    await prisma.sprayPlan.create({
      data: {
        plantingId,
        name: plan.name,
        pesticide: plan.pesticide,
        targetPest: plan.targetPest,
        dosage: plan.dosage,
        scheduledDate: plan.scheduledDate,
        notes: plan.notes,
      },
    });
    console.log(`  Added: ${plan.name}`);
  }

  console.log(`\nDone. Added ${sprayPlans.length} new spray plans for Okra.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
