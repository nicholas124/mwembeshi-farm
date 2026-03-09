import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/breeding - Get all goat breeding records with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      animal: { type: 'GOAT' },
    };
    if (status) where.status = status;

    const [records, pregnantCount, totalBred, totalBirthed] = await Promise.all([
      prisma.breedingRecord.findMany({
        where,
        include: {
          animal: { select: { id: true, tag: true, name: true, breed: true } },
        },
        orderBy: { breedingDate: 'desc' },
        take: 50,
      }),
      prisma.breedingRecord.count({
        where: { animal: { type: 'GOAT' }, status: 'PREGNANT' },
      }),
      prisma.breedingRecord.count({
        where: { animal: { type: 'GOAT' }, status: 'BRED' },
      }),
      prisma.breedingRecord.count({
        where: { animal: { type: 'GOAT' }, status: 'BIRTHED' },
      }),
    ]);

    // Get available bucks for breeding
    const availableBucks = await prisma.animal.findMany({
      where: { type: 'GOAT', gender: 'MALE', status: 'ACTIVE' },
      select: { id: true, tag: true, name: true, breed: true, dateOfBirth: true },
    });

    // Get does ready for breeding (active females not currently pregnant)
    const pregnantDoeIds = await prisma.breedingRecord.findMany({
      where: { animal: { type: 'GOAT' }, status: 'PREGNANT' },
      select: { animalId: true },
    });
    const pregnantIds = pregnantDoeIds.map(r => r.animalId);

    const availableDoes = await prisma.animal.findMany({
      where: {
        type: 'GOAT',
        gender: 'FEMALE',
        status: 'ACTIVE',
        id: { notIn: pregnantIds.length > 0 ? pregnantIds : ['none'] },
      },
      select: { id: true, tag: true, name: true, breed: true, dateOfBirth: true },
    });

    // Enrich records with sire info by finding male animals
    const maleIds = records.map(r => r.maleId).filter(Boolean) as string[];
    const males = maleIds.length > 0
      ? await prisma.animal.findMany({
          where: { id: { in: maleIds } },
          select: { id: true, tag: true, name: true, breed: true },
        })
      : [];
    const maleMap = Object.fromEntries(males.map(m => [m.id, m]));

    const enrichedRecords = records.map(r => ({
      ...r,
      sire: r.maleId ? maleMap[r.maleId] || null : null,
      dam: r.animal,
    }));

    return NextResponse.json({
      success: true,
      data: enrichedRecords,
      stats: {
        totalPregnant: pregnantCount,
        totalBred: totalBred,
        totalBirthed: totalBirthed,
      },
      availableBucks,
      availableDoes,
    });
  } catch (error) {
    console.error('Error fetching goat breeding records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breeding records' },
      { status: 500 }
    );
  }
}

// POST /api/goats/breeding - Create a new breeding record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the doe exists and is a goat
    const doeId = body.animalId || body.damId;
    const doe = await prisma.animal.findFirst({
      where: { id: doeId, type: 'GOAT', gender: 'FEMALE' },
    });
    if (!doe) {
      return NextResponse.json(
        { success: false, error: 'Female goat not found' },
        { status: 404 }
      );
    }

    // Validate the buck if provided
    const buckId = body.maleId || body.sireId;
    if (buckId) {
      const buck = await prisma.animal.findFirst({
        where: { id: buckId, type: 'GOAT', gender: 'MALE' },
      });
      if (!buck) {
        return NextResponse.json(
          { success: false, error: 'Male goat (buck) not found' },
          { status: 404 }
        );
      }
    }

    const record = await prisma.breedingRecord.create({
      data: {
        animalId: body.animalId || body.damId,
        maleId: body.maleId || body.sireId || null,
        breedingDate: new Date(body.breedingDate),
        expectedDue: body.expectedDue || body.expectedDueDate ? new Date(body.expectedDue || body.expectedDueDate) : null,
        actualBirthDate: body.actualBirthDate ? new Date(body.actualBirthDate) : null,
        offspring: body.offspring ? parseInt(body.offspring) : null,
        status: body.status || 'BRED',
        notes: body.notes || null,
      },
      include: {
        animal: { select: { id: true, tag: true, name: true } },
      },
    });

    await createNotification({
      type: 'GOAT_BREEDING',
      title: 'Goat Breeding Recorded',
      message: `Breeding record for goat "${record.animal?.name || record.animal?.tag}" was created`,
      entityType: 'goat_breeding',
      entityId: record.id,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error('Error creating breeding record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create breeding record' },
      { status: 500 }
    );
  }
}
