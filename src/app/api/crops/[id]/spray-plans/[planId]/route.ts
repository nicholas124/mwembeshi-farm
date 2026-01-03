import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/crops/[id]/spray-plans/[planId] - Get a specific spray plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { planId } = await params;

    const sprayPlan = await prisma.sprayPlan.findUnique({
      where: { id: planId },
      include: {
        completedBy: {
          select: { id: true, name: true },
        },
        planting: {
          include: {
            cropType: true,
            field: true,
          },
        },
      },
    });

    if (!sprayPlan) {
      return NextResponse.json(
        { error: 'Spray plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sprayPlan,
    });
  } catch (error) {
    console.error('Error fetching spray plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch spray plan' },
      { status: 500 }
    );
  }
}

// PUT /api/crops/[id]/spray-plans/[planId] - Update a spray plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { planId } = await params;
    const body = await request.json();

    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.pesticide !== undefined) updateData.pesticide = body.pesticide;
    if (body.targetPest !== undefined) updateData.targetPest = body.targetPest;
    if (body.dosage !== undefined) updateData.dosage = body.dosage;
    if (body.applicationMethod !== undefined) updateData.applicationMethod = body.applicationMethod;
    if (body.scheduledDate !== undefined) updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.weatherConditions !== undefined) updateData.weatherConditions = body.weatherConditions;
    if (body.safetyPrecautions !== undefined) updateData.safetyPrecautions = body.safetyPrecautions;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;
    
    // If marking as completed, set completed date and user
    if (body.status === 'COMPLETED') {
      updateData.completedDate = new Date();
      if (body.completedById) {
        updateData.completedById = body.completedById;
      }
    }

    const sprayPlan = await prisma.sprayPlan.update({
      where: { id: planId },
      data: updateData,
      include: {
        completedBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: sprayPlan,
      message: 'Spray plan updated successfully',
    });
  } catch (error) {
    console.error('Error updating spray plan:', error);
    return NextResponse.json(
      { error: 'Failed to update spray plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/crops/[id]/spray-plans/[planId] - Delete a spray plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; planId: string }> }
) {
  try {
    const { planId } = await params;

    await prisma.sprayPlan.delete({
      where: { id: planId },
    });

    return NextResponse.json({
      success: true,
      message: 'Spray plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting spray plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete spray plan' },
      { status: 500 }
    );
  }
}
