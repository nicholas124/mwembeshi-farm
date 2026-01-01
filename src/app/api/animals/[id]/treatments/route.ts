import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/animals/[id]/treatments - Get all treatment records for an animal
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

    const treatments = await prisma.treatment.findMany({
      where,
      orderBy: { treatmentDate: 'desc' },
      include: {
        administeredBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Get upcoming treatments (next due dates)
    const upcoming = await prisma.treatment.findMany({
      where: {
        animalId: id,
        nextDueDate: {
          gte: new Date(),
        },
      },
      orderBy: { nextDueDate: 'asc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: treatments,
      upcoming,
      count: treatments.length,
    });
  } catch (error: any) {
    console.error('Error fetching treatment records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch treatment records' },
      { status: 500 }
    );
  }
}

// POST /api/animals/[id]/treatments - Add a new treatment record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      type,
      description,
      medication,
      dosage,
      cost,
      treatmentDate,
      nextDueDate,
      veterinarian,
      notes,
    } = body;

    if (!type || !description) {
      return NextResponse.json(
        { success: false, error: 'Type and description are required' },
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

    const treatment = await prisma.treatment.create({
      data: {
        animalId: id,
        type,
        description,
        medication,
        dosage,
        cost: cost ? parseFloat(cost) : null,
        treatmentDate: treatmentDate ? new Date(treatmentDate) : new Date(),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        veterinarian,
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: treatment,
        message: 'Treatment record added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating treatment record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create treatment record' },
      { status: 500 }
    );
  }
}
