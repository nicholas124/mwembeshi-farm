import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/health - Get health overview for all goats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const treatmentType = searchParams.get('type');

    const where: Record<string, unknown> = {
      animal: { type: 'GOAT' },
    };
    if (treatmentType) where.type = treatmentType;

    const [treatments, upcomingTreatments, treatmentStats] = await Promise.all([
      // Recent treatments
      prisma.treatment.findMany({
        where,
        include: {
          animal: { select: { id: true, tag: true, name: true, breed: true, gender: true } },
        },
        orderBy: { treatmentDate: 'desc' },
        take: 50,
      }),
      // Upcoming/overdue treatments
      prisma.treatment.findMany({
        where: {
          animal: { type: 'GOAT', status: 'ACTIVE' },
          nextDueDate: { not: null },
        },
        include: {
          animal: { select: { id: true, tag: true, name: true, breed: true, gender: true } },
        },
        orderBy: { nextDueDate: 'asc' },
      }),
      // Stats by treatment type
      prisma.treatment.groupBy({
        by: ['type'],
        where: { animal: { type: 'GOAT' } },
        _count: { id: true },
      }),
    ]);

    // Goats that have never been treated
    const treatedGoatIds = await prisma.treatment.findMany({
      where: { animal: { type: 'GOAT' } },
      select: { animalId: true },
      distinct: ['animalId'],
    });
    const treatedIds = treatedGoatIds.map(t => t.animalId);

    const untreatedGoats = await prisma.animal.findMany({
      where: {
        type: 'GOAT',
        status: 'ACTIVE',
        id: { notIn: treatedIds.length > 0 ? treatedIds : ['none'] },
      },
      select: { id: true, tag: true, name: true, breed: true, gender: true, dateOfBirth: true },
    });

    // Separate upcoming from overdue
    const now = new Date();
    const overdue = upcomingTreatments.filter(t => t.nextDueDate && new Date(t.nextDueDate) < now);
    const upcoming = upcomingTreatments.filter(t => t.nextDueDate && new Date(t.nextDueDate) >= now);

    return NextResponse.json({
      success: true,
      recentTreatments: treatments.map(t => ({
        ...t,
        date: t.treatmentDate,
      })),
      overdueTreatments: overdue.map(t => ({
        ...t,
        date: t.treatmentDate,
      })),
      upcomingTreatments: upcoming.map(t => ({
        ...t,
        date: t.treatmentDate,
      })),
      untreatedGoats,
      treatmentStats: treatmentStats.map(s => ({
        type: s.type,
        _count: s._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching goat health records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health records' },
      { status: 500 }
    );
  }
}

// DELETE /api/goats/health - Bulk delete treatments
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { treatmentIds } = body;

    if (!treatmentIds || treatmentIds.length === 0) {
      return NextResponse.json({ success: false, error: 'No treatments selected' }, { status: 400 });
    }

    const result = await prisma.treatment.deleteMany({
      where: {
        id: { in: treatmentIds },
        animal: { type: 'GOAT' },
      },
    });

    return NextResponse.json({
      success: true,
      count: result.count,
      message: `Deleted ${result.count} treatment records`,
    });
  } catch (error) {
    console.error('Error bulk deleting treatments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete treatments' },
      { status: 500 }
    );
  }
}

// POST /api/goats/health - Bulk treatment for multiple goats
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { animalIds, type, description, medication, dosage, cost, treatmentDate, nextDueDate, veterinarian, notes } = body;

    if (!animalIds || animalIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one goat' }, { status: 400 });
    }
    if (!type || !description) {
      return NextResponse.json({ success: false, error: 'Type and description are required' }, { status: 400 });
    }

    const treatments = await prisma.$transaction(
      animalIds.map((animalId: string) =>
        prisma.treatment.create({
          data: {
            animalId,
            type,
            description,
            medication: medication || null,
            dosage: dosage || null,
            cost: cost ? parseFloat(cost) : null,
            treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date(),
            nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
            veterinarian: veterinarian || null,
            notes: notes || null,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      count: treatments.length,
      message: `Treatment applied to ${treatments.length} goats`,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bulk treatments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create bulk treatments' },
      { status: 500 }
    );
  }
}
