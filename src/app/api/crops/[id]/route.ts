import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

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

    // Verify planting exists
    const existing = await prisma.planting.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Planting not found' },
        { status: 404 }
      );
    }

    // Build update data - only include provided fields
    const updateData: Record<string, unknown> = {};
    
    // Core planting fields
    if (body.cropTypeId !== undefined) updateData.cropTypeId = body.cropTypeId;
    if (body.fieldId !== undefined) updateData.fieldId = body.fieldId;
    if (body.plantingDate !== undefined) updateData.plantingDate = new Date(body.plantingDate);
    if (body.expectedHarvest !== undefined) updateData.expectedHarvest = body.expectedHarvest ? new Date(body.expectedHarvest) : null;
    if (body.areaPlanted !== undefined) updateData.areaPlanted = body.areaPlanted;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.season !== undefined) updateData.season = body.season;
    if (body.notes !== undefined) updateData.notes = body.notes || null;
    
    // Seed info
    if (body.seedQuantity !== undefined) updateData.seedQuantity = body.seedQuantity;
    if (body.seedUnit !== undefined) updateData.seedUnit = body.seedUnit || null;
    if (body.seedCost !== undefined) updateData.seedCost = body.seedCost;
    if (body.seedSource !== undefined) updateData.seedSource = body.seedSource || null;
    if (body.seedTreatment !== undefined) updateData.seedTreatment = body.seedTreatment || null;
    
    // Practical crop management fields
    if (body.variety !== undefined) updateData.variety = body.variety || null;
    if (body.plantingMethod !== undefined) updateData.plantingMethod = body.plantingMethod;
    if (body.spacingRows !== undefined) updateData.spacingRows = body.spacingRows;
    if (body.spacingPlants !== undefined) updateData.spacingPlants = body.spacingPlants;
    if (body.health !== undefined) updateData.health = body.health;
    if (body.basalFertilizer !== undefined) updateData.basalFertilizer = body.basalFertilizer || null;
    if (body.topDressFertilizer !== undefined) updateData.topDressFertilizer = body.topDressFertilizer || null;
    if (body.expectedYield !== undefined) updateData.expectedYield = body.expectedYield;

    const planting = await prisma.planting.update({
      where: { id },
      data: updateData,
      include: {
        cropType: true,
        field: true,
      },
    });

    await createNotification({
      type: 'CROP_UPDATED',
      title: 'Crop Planting Updated',
      message: `${planting.cropType?.name || 'Crop'}${planting.variety ? ` (${planting.variety})` : ''} in ${planting.field?.name || 'field'} was updated`,
      entityType: 'crop',
      entityId: planting.id,
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

    await createNotification({
      type: 'CROP_DELETED',
      title: 'Crop Planting Deleted',
      message: `A crop planting record was deleted`,
      entityType: 'crop',
      entityId: id,
    });

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
