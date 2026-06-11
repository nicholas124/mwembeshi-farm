import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const plantingId = 'cmnvpj7ck00017l6qnqzzbivb';

const sprayPlans = [
  // WEEK 9 — 13-19 June 2026 (Day 63-69) — Flowers fading, keep protecting
  {
    name: 'Week 9 — Fungicide + Foliar Feed',
    pesticide: 'Mupazeb M + Potassium Nitrate + Voema Flower & Fruit + Maxi Stic',
    targetPest: 'Late blight / fungal protection',
    dosage: 'Per 20L tank: 40g Mupazeb M, 30g Potassium Nitrate, 40ml Voema Flower & Fruit, 20ml Maxi Stic (sticker)',
    scheduledDate: new Date('2026-06-13'),
    notes: 'Spray Saturday evening (rotate back from Amistar/Ridomil). Some flowers will fall this week — normal, tubers still growing. Plants need MORE water — run drip longer than before. Check every plant for spots or wilting every 2 days.',
  },
  // WEEK 10 — 20-26 June 2026 (Day 70-76) — Tubers fattening up
  {
    name: 'Week 10 — Fungicide + Insecticide + Foliar Feed',
    pesticide: 'Amistar Top + Akito + Potassium Nitrate + Omex ZiBo + Maxi Stic',
    targetPest: 'Fungal disease + general insect pests',
    dosage: 'Per 20L tank: 20ml Amistar Top, 20ml Akito (insecticide), 30g Potassium Nitrate, 40ml Omex ZiBo (zinc + boron foliar feed), 20ml Maxi Stic (sticker)',
    scheduledDate: new Date('2026-06-20'),
    notes: 'Spray Saturday evening. Most flowers will fall off this week — normal. From this week, start reducing water slightly — soil should be moist, not wet.',
  },
  // WEEK 11 — 27 June - 3 July 2026 (Day 77-83) — Last spray of the season
  {
    name: 'Week 11 — Last Spray of the Season',
    pesticide: 'Mupazeb M + Maxi Stic (sticker, optional)',
    targetPest: 'Fungal protection (final application)',
    dosage: 'Per 20L tank: 40g Mupazeb M, 20ml Maxi Stic (optional)',
    scheduledDate: new Date('2026-06-27'),
    notes: 'LAST SPRAY of the whole season — Saturday evening. After this, no more chemicals. Lower leaves turning yellow this week is good — tubers are mature. From now, REDUCE water by HALF — soil should start drying.',
  },
  // WEEK 12 — 4-10 July 2026 (Day 84-90) — Stop watering / pre-harvest
  {
    name: 'Week 12 — Stop Watering (Pre-Harvest)',
    pesticide: 'None',
    targetPest: null,
    dosage: 'N/A',
    scheduledDate: new Date('2026-07-04'),
    notes: 'Saturday: TURN OFF drip irrigation completely — no more water at all. Leaves will turn yellow and die this week — that is what we want. Walk the field and note plants still green (slow ones — leave them). By end of week, get harvest tools ready: forks, sacks, sorting tarpaulin. CRITICAL: stopping water is very important — wet soil at harvest means potatoes rot in storage, dry soil means strong skin and potatoes last for months.',
  },
];

async function main() {
  // Add new spray plans for weeks 9-12 (no existing spray plans for this planting yet)
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

  console.log(`\nDone. Added ${sprayPlans.length} new spray plans for Irish Potato.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
