import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/goats/[id]/assessments — BCS + FAMACHA history
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const [bcsRecords, famachaRecords] = await Promise.all([
      prisma.bodyConditionScore.findMany({
        where: { animalId: id },
        orderBy: { assessedAt: 'desc' },
      }),
      prisma.fAMACHAScore.findMany({
        where: { animalId: id },
        orderBy: { assessedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ success: true, bcs: bcsRecords, famacha: famachaRecords });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

// POST /api/goats/[id]/assessments — record BCS or FAMACHA
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: animalId } = await params;
    const body = await request.json();
    const { type, score, notes, assessedAt } = body;

    if (!type || score === undefined) {
      return NextResponse.json({ success: false, error: 'Type and score are required' }, { status: 400 });
    }

    const date = assessedAt ? new Date(assessedAt) : new Date();

    if (type === 'BCS') {
      const bcsScore = parseFloat(score);
      if (bcsScore < 1 || bcsScore > 5) {
        return NextResponse.json({ success: false, error: 'BCS score must be between 1.0 and 5.0' }, { status: 400 });
      }
      const record = await prisma.bodyConditionScore.create({
        data: { animalId, score: bcsScore, assessedAt: date, notes: notes || null },
      });
      return NextResponse.json({ success: true, data: record }, { status: 201 });
    }

    if (type === 'FAMACHA') {
      const famScore = parseInt(score);
      if (famScore < 1 || famScore > 5) {
        return NextResponse.json({ success: false, error: 'FAMACHA score must be between 1 and 5' }, { status: 400 });
      }
      const record = await prisma.fAMACHAScore.create({
        data: {
          animalId,
          score: famScore,
          assessedAt: date,
          dewormingRequired: famScore >= 3,
          notes: notes || null,
        },
      });
      // Auto-create a deworming treatment reminder if score >= 3
      if (famScore >= 3) {
        await prisma.treatment.create({
          data: {
            animalId,
            type: 'DEWORMING',
            description: `Deworming required — FAMACHA score ${famScore}`,
            treatmentDate: date,
          },
        });
      }
      return NextResponse.json({ success: true, data: record }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: 'Type must be BCS or FAMACHA' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to record assessment' }, { status: 500 });
  }
}
