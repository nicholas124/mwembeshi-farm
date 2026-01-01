import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/animals/[id]/breeding - Get all breeding records for an animal
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const breeding = await prisma.breedingRecord.findMany({
      where: { animalId: id },
      orderBy: { breedingDate: 'desc' },
    });

    // Get male animal details for each record
    const breedingWithMale = await Promise.all(
      breeding.map(async (record: any) => {
        let male = null;
        if (record.maleId) {
          male = await prisma.animal.findUnique({
            where: { id: record.maleId },
            select: { id: true, tag: true, name: true, breed: true },
          });
        }
        return { ...record, male };
      })
    );

    return NextResponse.json({
      success: true,
      data: breedingWithMale,
      count: breedingWithMale.length,
    });
  } catch (error: any) {
    console.error('Error fetching breeding records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch breeding records' },
      { status: 500 }
    );
  }
}

// POST /api/animals/[id]/breeding - Add a new breeding record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { maleId, breedingDate, expectedDue, actualBirthDate, offspring, status, notes } = body;

    if (!breedingDate) {
      return NextResponse.json(
        { success: false, error: 'Breeding date is required' },
        { status: 400 }
      );
    }

    // Verify animal exists and is female
    const animal = await prisma.animal.findUnique({ where: { id } });
    if (!animal) {
      return NextResponse.json(
        { success: false, error: 'Animal not found' },
        { status: 404 }
      );
    }

    if (animal.gender !== 'FEMALE') {
      return NextResponse.json(
        { success: false, error: 'Breeding records can only be added for female animals' },
        { status: 400 }
      );
    }

    // Verify male animal if provided
    if (maleId) {
      const male = await prisma.animal.findUnique({ where: { id: maleId } });
      if (!male) {
        return NextResponse.json(
          { success: false, error: 'Male animal not found' },
          { status: 404 }
        );
      }
    }

    const breeding = await prisma.breedingRecord.create({
      data: {
        animalId: id,
        maleId: maleId || null,
        breedingDate: new Date(breedingDate),
        expectedDue: expectedDue ? new Date(expectedDue) : null,
        actualBirthDate: actualBirthDate ? new Date(actualBirthDate) : null,
        offspring: offspring ? parseInt(offspring) : 0,
        status: status || 'BRED',
        notes,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: breeding,
        message: 'Breeding record added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating breeding record:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create breeding record' },
      { status: 500 }
    );
  }
}
