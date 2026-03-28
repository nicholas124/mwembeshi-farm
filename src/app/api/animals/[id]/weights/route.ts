import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/animals/[id]/weights - Get all weight records for an animal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const weights = await prisma.weightRecord.findMany({
      where: { animalId: id },
      orderBy: { recordedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: weights,
      count: weights.length,
    });
  } catch (error: any) {
    console.error('Error fetching weight records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch weight records' },
      { status: 500 }
    );
  }
}

// PUT /api/animals/[id]/weights - Update an existing weight record
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { weightId, weight, recordedAt, notes } = body;

    if (!weightId) {
      return NextResponse.json({ success: false, error: 'Weight record ID is required' }, { status: 400 });
    }

    const existing = await prisma.weightRecord.findFirst({ where: { id: weightId, animalId: id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Weight record not found' }, { status: 404 });
    }

    const weightRecord = await prisma.weightRecord.update({
      where: { id: weightId },
      data: {
        weight: weight ? parseFloat(weight) : existing.weight,
        recordedAt: recordedAt ? new Date(recordedAt) : existing.recordedAt,
        notes: notes ?? existing.notes,
      },
    });

    // Update the animal's current weight to the latest record
    const latest = await prisma.weightRecord.findFirst({
      where: { animalId: id },
      orderBy: { recordedAt: 'desc' },
    });
    if (latest) {
      await prisma.animal.update({
        where: { id },
        data: { weight: latest.weight },
      });
    }

    return NextResponse.json({ success: true, data: weightRecord });
  } catch (error: any) {
    console.error('Error updating weight record:', error);
    return NextResponse.json({ success: false, error: 'Failed to update weight record' }, { status: 500 });
  }
}

// POST /api/animals/[id]/weights - Add a new weight record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { weight, recordedAt, notes } = body;

    if (!weight) {
      return NextResponse.json(
        { success: false, error: 'Weight is required' },
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

    const weightRecord = await prisma.weightRecord.create({
      data: {
        animalId: id,
        weight: parseFloat(weight),
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        notes,
      },
    });

    // Also update the animal's current weight
    await prisma.animal.update({
      where: { id },
      data: { weight: parseFloat(weight) },
    });

    return NextResponse.json(
      {
        success: true,
        data: weightRecord,
        message: 'Weight record added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating weight record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create weight record' },
      { status: 500 }
    );
  }
}
