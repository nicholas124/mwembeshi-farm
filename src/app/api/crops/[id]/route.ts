import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/crops/[id] - Get a single planting
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const planting = await prisma.planting.findUnique({
      where: { id },
      include: {
        cropType: true,
        field: true,
        activities: {
          orderBy: { activityDate: 'desc' },
        },
        inputs: {
          orderBy: { appliedDate: 'desc' },
        },
        harvests: {
          orderBy: { harvestDate: 'desc' },
        },
      },
    });

    if (!planting) {
      return NextResponse.json(
        { success: false, error: 'Planting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: planting,
    });
  } catch (error) {
    console.error('Error fetching planting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch planting' },
      { status: 500 }
    );
  }
}

// PUT /api/crops/[id] - Update a planting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update data object, only including fields that are provided
    const updateData: any = {};
    
    if (body.cropTypeId) updateData.cropTypeId = body.cropTypeId;
    if (body.fieldId) updateData.fieldId = body.fieldId;
    if (body.plantingDate) updateData.plantingDate = new Date(body.plantingDate);
    if (body.expectedHarvest) updateData.expectedHarvest = new Date(body.expectedHarvest);
    if (body.areaPlanted !== undefined) updateData.areaPlanted = body.areaPlanted;
    if (body.seedQuantity !== undefined) updateData.seedQuantity = body.seedQuantity;
    if (body.seedUnit !== undefined) updateData.seedUnit = body.seedUnit;
    if (body.seedCost !== undefined) updateData.seedCost = body.seedCost;
    if (body.status) updateData.status = body.status;
    if (body.season) updateData.season = body.season;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const planting = await prisma.planting.update({
      where: { id },
      data: updateData,
      include: {
        cropType: true,
        field: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: planting,
      message: 'Planting updated successfully',
    });
  } catch (error) {
    console.error('Error updating planting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update planting' },
      { status: 500 }
    );
  }
}

// DELETE /api/crops/[id] - Delete a planting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Delete related records first (if not using CASCADE)
    await prisma.$transaction([
      prisma.cropActivity.deleteMany({ where: { plantingId: id } }),
      prisma.cropInput.deleteMany({ where: { plantingId: id } }),
      prisma.harvest.deleteMany({ where: { plantingId: id } }),
      prisma.planting.delete({ where: { id } }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Planting deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting planting:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete planting' },
      { status: 500 }
    );
  }
}
