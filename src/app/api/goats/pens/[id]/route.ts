import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type Params = { params: Promise<{ id: string }> };

// GET /api/goats/pens/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const pen = await prisma.goatPen.findUnique({
      where: { id },
      include: {
        assignments: {
          include: {
            animal: { select: { id: true, tag: true, name: true, gender: true, breed: true, dateOfBirth: true, status: true, weight: true } },
          },
          orderBy: { assignedAt: 'desc' },
        },
        feedRecords: { orderBy: { date: 'desc' }, take: 10 },
      },
    });

    if (!pen) return NextResponse.json({ success: false, error: 'Pen not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: pen });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pen' }, { status: 500 });
  }
}

// PUT /api/goats/pens/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, capacity, location, notes, isActive } = body;

    const pen = await prisma.goatPen.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(capacity !== undefined && { capacity: capacity ? parseInt(capacity) : null }),
        ...(location !== undefined && { location }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, data: pen });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to update pen' }, { status: 500 });
  }
}

// POST /api/goats/pens/[id]/assign handled separately
// DELETE /api/goats/pens/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.goatPen.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to delete pen' }, { status: 500 });
  }
}
