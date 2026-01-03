import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/crops/[id]/spray-plans - Get all spray plans for a planting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;

    const sprayPlans = await prisma.sprayPlan.findMany({
      where: { plantingId },
      orderBy: { scheduledDate: 'asc' },
      include: {
        completedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sprayPlans,
    });
  } catch (error) {
    console.error('Error fetching spray plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spray plans' },
      { status: 500 }
    );
  }
}

// POST /api/crops/[id]/spray-plans - Create a new spray plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    console.log('Creating spray plan for planting:', plantingId, 'with data:', body);

    // Verify the planting exists
    const planting = await prisma.planting.findUnique({
      where: { id: plantingId },
    });

    if (!planting) {
      return NextResponse.json(
        { error: 'Planting not found' },
        { status: 404 }
      );
    }

    const sprayPlan = await prisma.sprayPlan.create({
      data: {
        plantingId,
        name: body.name,
        pesticide: body.pesticide,
        targetPest: body.targetPest || null,
        dosage: body.dosage,
        applicationMethod: body.applicationMethod || null,
        scheduledDate: new Date(body.scheduledDate),
        weatherConditions: body.weatherConditions || null,
        safetyPrecautions: body.safetyPrecautions || null,
        notes: body.notes || null,
        status: 'PENDING',
      },
    });

    console.log('Spray plan created successfully:', sprayPlan.id);

    return NextResponse.json({
      success: true,
      data: sprayPlan,
      message: 'Spray plan created successfully',
    });
  } catch (error) {
    console.error('Error creating spray plan:', error);
    return NextResponse.json(
      { error: 'Failed to create spray plan', details: String(error) },
      { status: 500 }
    );
  }
}
