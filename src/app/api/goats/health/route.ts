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
