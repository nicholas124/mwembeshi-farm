import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/animals/[id]/production - Get all production records for an animal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');

    const where: any = { animalId: id };
    if (type) {
      where.type = type;
    }

    const production = await prisma.production.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });

    // Calculate totals by type
    const totals = await prisma.production.groupBy({
      by: ['type', 'unit'],
      where: { animalId: id },
      _sum: { quantity: true },
    });

    return NextResponse.json({
      success: true,
      data: production,
      totals,
      count: production.length,
    });
  } catch (error: any) {
    console.error('Error fetching production records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch production records' },
      { status: 500 }
    );
  }
}

// POST /api/animals/[id]/production - Add a new production record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { type, quantity, unit, recordedAt, notes } = body;

    if (!type || !quantity || !unit) {
      return NextResponse.json(
        { success: false, error: 'Type, quantity, and unit are required' },
        { status: 400 }
      );
    }

    // Verify animal exists
    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    const production = await prisma.production.create({
      data: {
        animalId: id,
        type,
        quantity: parseFloat(quantity),
        unit,
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: production,
        message: 'Production record added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating production record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create production record' },
      { status: 500 }
    );
  }
}
