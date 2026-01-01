import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/equipment - List all equipment with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    const where: Record<string, unknown> = {};
    
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const total = await prisma.equipment.count({ where });
    
    const equipment = await prisma.equipment.findMany({
      where,
      include: {
        maintenances: {
          orderBy: { maintenanceDate: 'desc' },
          take: 1,
        },
        usageRecords: {
          where: { returnTime: null },
          include: {
            usedBy: { select: { id: true, name: true } },
          },
          take: 1,
        },
        _count: {
          select: {
            maintenances: true,
            usageRecords: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { name: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: equipment,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

// POST /api/equipment - Create new equipment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const equipment = await prisma.equipment.create({
      data: {
        name: body.name,
        code: body.code,
        category: body.category,
        brand: body.brand,
        model: body.model,
        serialNumber: body.serialNumber,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice,
        currentValue: body.purchasePrice, // Initially same as purchase price
        location: body.location,
        status: 'AVAILABLE',
        condition: body.condition || 'GOOD',
        notes: body.notes,
      },
    });
    
    return NextResponse.json({
      success: true,
      data: equipment,
      message: 'Equipment created successfully',
    });
  } catch (error) {
    console.error('Error creating equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}
