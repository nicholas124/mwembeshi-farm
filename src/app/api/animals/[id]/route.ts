import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/animals/[id] - Get single animal with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const animal = await prisma.animal.findUnique({
      where: { id },
      include: {
        mother: { select: { id: true, tag: true, name: true, type: true } },
        father: { select: { id: true, tag: true, name: true, type: true } },
        offspringAsMother: {
          select: { id: true, tag: true, name: true, gender: true, dateOfBirth: true },
        },
        offspringAsFather: {
          select: { id: true, tag: true, name: true, gender: true, dateOfBirth: true },
        },
        treatments: {
          orderBy: { treatmentDate: 'desc' },
          take: 10,
        },
        weights: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        productions: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
        breeding: {
          orderBy: { breedingDate: 'desc' },
          take: 5,
        },
        recordedBy: {
          select: { id: true, name: true },
        },
      },
    });

    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: animal });
  } catch (error) {
    console.error('Error fetching animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch animal' },
      { status: 500 }
    );
  }
}

// PUT /api/animals/[id] - Update an animal
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const animal = await prisma.animal.update({
      where: { id },
      data: {
        tag: body.tag,
        name: body.name,
        breed: body.breed,
        gender: body.gender,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        status: body.status,
        color: body.color,
        weight: body.weight,
        notes: body.notes,
        motherId: body.motherId,
        fatherId: body.fatherId,
      },
    });

    return NextResponse.json({
      success: true,
      data: animal,
      message: 'Animal updated successfully',
    });
  } catch (error) {
    console.error('Error updating animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update animal' },
      { status: 500 }
    );
  }
}

// DELETE /api/animals/[id] - Delete an animal (soft delete by setting status)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Soft delete - just update status
    await prisma.animal.update({
      where: { id },
      data: { status: 'DECEASED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Animal record archived',
    });
  } catch (error) {
    console.error('Error deleting animal:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete animal' },
      { status: 500 }
    );
  }
}
