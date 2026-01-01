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

    const planting = await prisma.planting.update({
      where: { id },
      data: {
        cropTypeId: body.cropTypeId,
        fieldId: body.fieldId,
        plantingDate: body.plantingDate ? new Date(body.plantingDate) : undefined,
        expectedHarvest: body.expectedHarvest ? new Date(body.expectedHarvest) : null,
        areaPlanted: body.areaPlanted,
        seedQuantity: body.seedQuantity,
        seedUnit: body.seedUnit,
        seedCost: body.seedCost,
        status: body.status,
        season: body.season,
        notes: body.notes,
      },
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
