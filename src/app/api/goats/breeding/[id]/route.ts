import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/breeding/[id] - Get a single breeding record
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const record = await prisma.breedingRecord.findUnique({
      where: { id },
      include: {
        animal: { select: { id: true, tag: true, name: true, breed: true, gender: true } },
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    // Get sire info if available
    let sire = null;
    if (record.maleId) {
      sire = await prisma.animal.findUnique({
        where: { id: record.maleId },
        select: { id: true, tag: true, name: true, breed: true },
      });
    }

    return NextResponse.json({
      success: true,
      data: { ...record, sire, dam: record.animal },
    });
  } catch (error) {
    console.error('Error fetching breeding record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breeding record' },
      { status: 500 }
    );
  }
}

// PUT /api/goats/breeding/[id] - Update a breeding record
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.breedingRecord.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    const record = await prisma.breedingRecord.update({
      where: { id },
      data: {
        maleId: body.maleId ?? undefined,
        breedingDate: body.breedingDate ? new Date(body.breedingDate) : undefined,
        expectedDue: body.expectedDue ? new Date(body.expectedDue) : undefined,
        actualBirthDate: body.actualBirthDate ? new Date(body.actualBirthDate) : undefined,
        offspring: body.offspring !== undefined ? parseInt(body.offspring) : undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: {
        animal: { select: { id: true, tag: true, name: true } },
      },
    });

    await createNotification({
      type: 'GOAT_BREEDING',
      title: 'Breeding Record Updated',
      message: `Breeding record for goat "${record.animal?.name || record.animal?.tag}" was updated (status: ${record.status})`,
      entityType: 'goat_breeding',
      entityId: record.id,
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error('Error updating breeding record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update breeding record' },
      { status: 500 }
    );
  }
}

// DELETE /api/goats/breeding/[id] - Delete a breeding record
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const record = await prisma.breedingRecord.findUnique({
      where: { id },
      include: {
        animal: { select: { id: true, tag: true, name: true } },
      },
    });

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Breeding record not found' },
        { status: 404 }
      );
    }

    await prisma.breedingRecord.delete({ where: { id } });

    await createNotification({
      type: 'GOAT_BREEDING',
      title: 'Breeding Record Deleted',
      message: `Breeding record for goat "${record.animal?.name || record.animal?.tag}" was deleted`,
      entityType: 'goat_breeding',
      entityId: id,
    });

    return NextResponse.json({ success: true, message: 'Breeding record deleted' });
  } catch (error) {
    console.error('Error deleting breeding record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete breeding record' },
      { status: 500 }
    );
  }
}
