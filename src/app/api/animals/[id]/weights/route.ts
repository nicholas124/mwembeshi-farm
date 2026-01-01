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
