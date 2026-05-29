import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/goats/pens
export async function GET() {
  try {
    const pens = await prisma.goatPen.findMany({
      where: { isActive: true },
      include: {
        assignments: {
          where: { removedAt: null },
          include: {
            animal: { select: { id: true, tag: true, name: true, gender: true, breed: true, status: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = pens.map(pen => ({
      ...pen,
      currentCount: pen.assignments.length,
      animals: pen.assignments.map(a => a.animal),
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to fetch pens' }, { status: 500 });
  }
}

// POST /api/goats/pens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, capacity, location, notes } = body;

    if (!name || !type) {
      return NextResponse.json({ success: false, error: 'Name and type are required' }, { status: 400 });
    }

    const pen = await prisma.goatPen.create({
      data: { name, type, capacity: capacity ? parseInt(capacity) : null, location, notes },
    });

    return NextResponse.json({ success: true, data: pen }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Failed to create pen' }, { status: 500 });
  }
}
