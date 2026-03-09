import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats - List all goats with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const ageGroup = searchParams.get('ageGroup'); // kid, juvenile, adult
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');

    const where: Record<string, unknown> = { type: 'GOAT' };

    if (status) where.status = status;
    if (gender) where.gender = gender;
    if (breed) where.breed = { contains: breed, mode: 'insensitive' };
    if (search) {
      where.OR = [
        { tag: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Age group filter
    if (ageGroup) {
      const now = new Date();
      if (ageGroup === 'kid') {
        // Under 6 months
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        where.dateOfBirth = { gte: sixMonthsAgo };
      } else if (ageGroup === 'juvenile') {
        // 6 months to 1 year
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        where.dateOfBirth = { gte: oneYearAgo, lt: sixMonthsAgo };
      } else if (ageGroup === 'adult') {
        // Over 1 year
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        where.dateOfBirth = { lt: oneYearAgo };
      }
    }

    const total = await prisma.animal.count({ where });

    const goats = await prisma.animal.findMany({
      where,
      include: {
        mother: { select: { id: true, tag: true, name: true } },
        father: { select: { id: true, tag: true, name: true } },
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          take: 1,
        },
        breeding: {
          where: { status: 'PREGNANT' },
          take: 1,
        },
        weights: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            offspringAsMother: true,
            offspringAsFather: true,
            treatments: true,
            breeding: true,
            productions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Get summary stats
    const [
      totalGoats,
      activeBucks,
      activeDoes,
      pregnantCount,
      kidsCount,
      recentTreatments,
    ] = await Promise.all([
      prisma.animal.count({ where: { type: 'GOAT', status: 'ACTIVE' } }),
      prisma.animal.count({ where: { type: 'GOAT', status: 'ACTIVE', gender: 'MALE' } }),
      prisma.animal.count({ where: { type: 'GOAT', status: 'ACTIVE', gender: 'FEMALE' } }),
      prisma.breedingRecord.count({
        where: {
          animal: { type: 'GOAT' },
          status: 'PREGNANT',
        },
      }),
      prisma.animal.count({
        where: {
          type: 'GOAT',
          status: 'ACTIVE',
          dateOfBirth: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 6, new Date().getDate()),
          },
        },
      }),
      prisma.treatment.count({
        where: {
          animal: { type: 'GOAT' },
          treatmentDate: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, new Date().getDate()),
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: goats,
      stats: {
        total: totalGoats,
        bucks: activeBucks,
        does: activeDoes,
        pregnant: pregnantCount,
        kids: kidsCount,
        recentTreatments,
      },
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching goats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goats' },
      { status: 500 }
    );
  }
}

// POST /api/goats - Create a new goat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const goat = await prisma.animal.create({
      data: {
        tag: body.tag,
        name: body.name || null,
        type: 'GOAT',
        breed: body.breed || null,
        gender: body.gender || 'FEMALE',
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        acquisitionMethod: body.acquisitionMethod || 'BORN',
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        motherId: body.motherId || null,
        fatherId: body.fatherId || null,
        color: body.color || null,
        weight: body.weight ? parseFloat(body.weight) : null,
        notes: body.notes || null,
        status: 'ACTIVE',
        recordedById: body.recordedById || null,
      },
      include: {
        mother: { select: { id: true, tag: true, name: true } },
        father: { select: { id: true, tag: true, name: true } },
      },
    });

    await createNotification({
      type: 'ANIMAL_ADDED',
      title: 'New Goat Added',
      message: `Goat "${goat.name || goat.tag}" (${goat.breed || 'Unknown breed'}) was added`,
      entityType: 'goat',
      entityId: goat.id,
    });

    return NextResponse.json({ success: true, data: goat }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating goat:', error);
    const message = error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002'
      ? 'A goat with this tag already exists'
      : 'Failed to create goat';
    return NextResponse.json(
      { success: false, error: message },
      { status: error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002' ? 409 : 500 }
    );
  }
}
