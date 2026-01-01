import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single crop type
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cropType = await prisma.cropType.findUnique({
      where: { id: params.id },
    });

    if (!cropType) {
      return NextResponse.json(
        { error: 'Crop type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(cropType);
  } catch (error) {
    console.error('Error fetching crop type:', error);
    return NextResponse.json(
      { error: 'Failed to fetch crop type' },
      { status: 500 }
    );
  }
}

// PUT update crop type
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, localName, category, growingDays, description, isActive } = body;

    const cropType = await prisma.cropType.update({
      where: { id: params.id },
      data: {
        name,
        localName: localName || null,
        category,
        growingDays: growingDays || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(cropType);
  } catch (error: any) {
    console.error('Error updating crop type:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A crop type with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update crop type' },
      { status: 500 }
    );
  }
}

// DELETE crop type
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if crop type is being used
    const plantingsCount = await prisma.planting.count({
      where: { cropTypeId: params.id },
    });

    if (plantingsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: This crop type is used in ${plantingsCount} planting(s)` },
        { status: 400 }
      );
    }

    await prisma.cropType.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting crop type:', error);
    return NextResponse.json(
      { error: 'Failed to delete crop type' },
      { status: 500 }
    );
  }
}
