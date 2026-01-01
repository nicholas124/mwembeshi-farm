import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/crops - List all plantings with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const cropTypeId = searchParams.get('cropTypeId');
    const fieldId = searchParams.get('fieldId');
    const season = searchParams.get('season');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    const where: Record<string, unknown> = {};
    
    if (status) where.status = status;
    if (cropTypeId) where.cropTypeId = cropTypeId;
    if (fieldId) where.fieldId = fieldId;
    if (season) where.season = season;
    
    const total = await prisma.planting.count({ where });
    
    const plantings = await prisma.planting.findMany({
      where,
      include: {
        cropType: true,
        field: true,
        harvests: {
          orderBy: { harvestDate: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            activities: true,
            inputs: true,
            harvests: true,
          },
        },
      },
      orderBy: { plantingDate: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: plantings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching plantings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch plantings' },
      { status: 500 }
    );
  }
}

// POST /api/crops - Create a new planting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.cropTypeId) {
      return NextResponse.json(
        { success: false, error: 'Crop type is required' },
        { status: 400 }
      );
    }
    
    if (!body.fieldId) {
      return NextResponse.json(
        { success: false, error: 'Field is required' },
        { status: 400 }
      );
    }
    
    if (!body.plantingDate) {
      return NextResponse.json(
        { success: false, error: 'Planting date is required' },
        { status: 400 }
      );
    }
    
    if (!body.areaPlanted) {
      return NextResponse.json(
        { success: false, error: 'Area planted is required' },
        { status: 400 }
      );
    }
    
    const planting = await prisma.planting.create({
      data: {
        cropTypeId: body.cropTypeId,
        fieldId: body.fieldId,
        plantingDate: new Date(body.plantingDate),
        expectedHarvest: body.expectedHarvest ? new Date(body.expectedHarvest) : null,
        areaPlanted: body.areaPlanted,
        seedQuantity: body.seedQuantity || null,
        seedUnit: body.seedUnit || null,
        seedCost: body.seedCost || null,
        status: body.status || 'PLANNED',
        season: body.season || null,
        notes: body.notes || null,
      },
      include: {
        cropType: true,
        field: true,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: planting,
      message: 'Planting created successfully',
    });
  } catch (error) {
    console.error('Error creating planting:', error);
    return NextResponse.json(
      { success: false, error: `Failed to create planting: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
