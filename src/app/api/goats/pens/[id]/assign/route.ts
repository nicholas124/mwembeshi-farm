import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// POST /api/goats/pens/[id]/assign — assign one or more goats to a pen
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id: penId } = await params;
    const body = await request.json();
    const { animalIds, reason } = body;

    if (!animalIds || animalIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one goat' }, { status: 400 });
    }

    // Close any existing active assignments for these animals
    await prisma.penAssignment.updateMany({
      where: { animalId: { in: animalIds }, removedAt: null },
      data: { removedAt: new Date() },
    });

    // Create new assignments
    await prisma.penAssignment.createMany({
      data: animalIds.map((animalId: string) => ({ animalId, penId, reason })),
    });

    return NextResponse.json({ success: true, count: animalIds.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to assign goats' }, { status: 500 });
  }
}

// DELETE /api/goats/pens/[id]/assign — remove goats from pen
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id: penId } = await params;
    const body = await request.json();
    const { animalIds } = body;

    await prisma.penAssignment.updateMany({
      where: { penId, animalId: { in: animalIds }, removedAt: null },
      data: { removedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to remove goats from pen' }, { status: 500 });
  }
}
