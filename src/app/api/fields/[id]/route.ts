import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single field
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const field = await prisma.field.findUnique({
      where: { id: params.id },
    });

    if (!field) {
      return NextResponse.json(
        { error: 'Field not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error('Error fetching field:', error);
    return NextResponse.json(
      { error: 'Failed to fetch field' },
      { status: 500 }
    );
  }
}

// PUT update field
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, size, location, soilType, irrigation, notes, isActive } = body;

    const field = await prisma.field.update({
      where: { id: params.id },
      data: {
        name,
        size,
        location: location || null,
        soilType: soilType || null,
        irrigation: irrigation || 'RAINFED',
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error('Error updating field:', error);
    return NextResponse.json(
      { error: 'Failed to update field' },
      { status: 500 }
    );
  }
}

// DELETE field
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if field is being used
    const plantingsCount = await prisma.planting.count({
      where: { fieldId: params.id },
    });

    if (plantingsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete: This field is used in ${plantingsCount} planting(s)` },
        { status: 400 }
      );
    }

    await prisma.field.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting field:', error);
    return NextResponse.json(
      { error: 'Failed to delete field' },
      { status: 500 }
    );
  }
}
