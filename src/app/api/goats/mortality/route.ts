import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/mortality
export async function GET() {
  try {
    const records = await prisma.mortalityRecord.findMany({
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true, gender: true, dateOfBirth: true } },
      },
      orderBy: { deathDate: 'desc' },
    });

    const totalLoss = records.reduce((sum, r) => sum + Number(r.estimatedValue || 0), 0);

    return NextResponse.json({ success: true, data: records, totalLoss });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch mortality records' }, { status: 500 });
  }
}

// POST /api/goats/mortality
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      animalId, deathDate, cause, causeDetails,
      symptomsDuration, symptomsDescription, treatmentsGiven,
      estimatedValue, necropsyDone, necropsyFindings, notes,
    } = body;

    if (!animalId || !deathDate || !cause) {
      return NextResponse.json({ success: false, error: 'Animal, death date, and cause are required' }, { status: 400 });
    }

    const record = await prisma.mortalityRecord.create({
      data: {
        animalId,
        deathDate: new Date(deathDate),
        cause,
        causeDetails: causeDetails || null,
        symptomsDuration: symptomsDuration ? parseInt(symptomsDuration) : null,
        symptomsDescription: symptomsDescription || null,
        treatmentsGiven: treatmentsGiven || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        necropsyDone: necropsyDone ?? false,
        necropsyFindings: necropsyFindings || null,
        notes: notes || null,
      },
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true } },
      },
    });

    // Mark animal as DECEASED
    await prisma.animal.update({ where: { id: animalId }, data: { status: 'DECEASED' } });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A mortality record already exists for this animal' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to record mortality' }, { status: 500 });
  }
}
