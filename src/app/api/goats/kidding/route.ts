import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/kidding
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const animalId = searchParams.get('animalId');

    const records = await prisma.kiddingRecord.findMany({
      where: animalId ? { animalId } : undefined,
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true } },
        breedingRecord: { select: { id: true, breedingDate: true, maleId: true } },
        kids: { select: { id: true, tag: true, name: true, gender: true, dateOfBirth: true, status: true } },
      },
      orderBy: { birthDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch kidding records' }, { status: 500 });
  }
}

// POST /api/goats/kidding
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      animalId, breedingRecordId, birthDate,
      totalBorn, liveBorn, stillBorn,
      birthType, complications, doesCondition,
      placentaExpelled, placentaMinutes, notes,
    } = body;

    if (!animalId || !birthDate) {
      return NextResponse.json({ success: false, error: 'Doe and birth date are required' }, { status: 400 });
    }

    const record = await prisma.kiddingRecord.create({
      data: {
        animalId,
        breedingRecordId: breedingRecordId || null,
        birthDate: new Date(birthDate),
        totalBorn: totalBorn ?? 1,
        liveBorn: liveBorn ?? 1,
        stillBorn: stillBorn ?? 0,
        birthType: birthType || 'UNASSISTED',
        complications: complications || null,
        doesCondition: doesCondition || null,
        placentaExpelled: placentaExpelled ?? null,
        placentaMinutes: placentaMinutes ? parseInt(placentaMinutes) : null,
        notes: notes || null,
      },
      include: {
        animal: { select: { id: true, tag: true, name: true } },
      },
    });

    // Update the breeding record status to BIRTHED if linked
    if (breedingRecordId) {
      await prisma.breedingRecord.update({
        where: { id: breedingRecordId },
        data: { status: 'BIRTHED', actualBirthDate: new Date(birthDate), offspring: liveBorn ?? 1 },
      });
    }

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create kidding record' }, { status: 500 });
  }
}
