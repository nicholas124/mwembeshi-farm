import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/[id] - Get a single goat with all records
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const goat = await prisma.animal.findFirst({
      where: { id, type: 'GOAT' },
      include: {
        mother: { select: { id: true, tag: true, name: true, breed: true } },
        father: { select: { id: true, tag: true, name: true, breed: true } },
        offspringAsMother: {
          select: { id: true, tag: true, name: true, gender: true, dateOfBirth: true, status: true },
          orderBy: { dateOfBirth: 'desc' },
        },
        offspringAsFather: {
          select: { id: true, tag: true, name: true, gender: true, dateOfBirth: true, status: true },
          orderBy: { dateOfBirth: 'desc' },
        },
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          take: 20,
        },
        weights: {
          orderBy: { recordedAt: 'desc' },
          take: 20,
        },
        productions: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        breeding: {
          orderBy: { breedingDate: 'desc' },
          take: 10,
        },
        recordedBy: { select: { id: true, name: true } },
      },
    });

    if (!goat) {
      return NextResponse.json(
        { success: false, error: 'Goat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: goat });
  } catch (error) {
    console.error('Error fetching goat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch goat' },
      { status: 500 }
    );
  }
}

// PUT /api/goats/[id] - Update a goat
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Ensure we're only updating goats
    const existing = await prisma.animal.findFirst({ where: { id, type: 'GOAT' } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Goat not found' },
        { status: 404 }
      );
    }

    const goat = await prisma.animal.update({
      where: { id },
      data: {
        tag: body.tag,
        name: body.name || null,
        breed: body.breed || null,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        acquisitionMethod: body.acquisitionMethod,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        motherId: body.motherId || null,
        fatherId: body.fatherId || null,
        color: body.color || null,
        weight: body.weight ? parseFloat(body.weight) : null,
        notes: body.notes || null,
        status: body.status || existing.status,
      },
      include: {
        mother: { select: { id: true, tag: true, name: true } },
        father: { select: { id: true, tag: true, name: true } },
      },
    });

    await createNotification({
      type: 'ANIMAL_UPDATED',
      title: 'Goat Updated',
      message: `Goat "${goat.name || goat.tag}" was updated`,
      entityType: 'goat',
      entityId: goat.id,
    });

    return NextResponse.json({ success: true, data: goat });
  } catch (error) {
    console.error('Error updating goat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update goat' },
      { status: 500 }
    );
  }
}

// DELETE /api/goats/[id] - Soft delete a goat (mark as deceased)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.animal.findFirst({ where: { id, type: 'GOAT' } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Goat not found' },
        { status: 404 }
      );
    }

    await prisma.animal.update({
      where: { id },
      data: { status: 'DECEASED' },
    });

    await createNotification({
      type: 'ANIMAL_DELETED',
      title: 'Goat Removed',
      message: `Goat "${existing.name || existing.tag}" was removed`,
      entityType: 'goat',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Goat removed' });
  } catch (error) {
    console.error('Error deleting goat:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete goat' },
      { status: 500 }
    );
  }
}
