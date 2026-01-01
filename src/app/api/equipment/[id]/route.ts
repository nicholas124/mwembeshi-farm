import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const equipment = await prisma.equipment.findUnique({
      where: { id },
      include: {
        maintenances: {
          orderBy: { maintenanceDate: 'desc' },
          take: 20,
        },
        usageRecords: {
          include: {
            usedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { checkoutTime: 'desc' },
          take: 20,
        },
      },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const equipment = await prisma.equipment.update({
      where: { id },
      data: {
        name: body.name,
        category: body.category,
        brand: body.brand || null,
        model: body.model || null,
        serialNumber: body.serialNumber || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        purchasePrice: body.purchasePrice ? parseFloat(body.purchasePrice) : null,
        currentValue: body.currentValue ? parseFloat(body.currentValue) : null,
        location: body.location || null,
        status: body.status,
        condition: body.condition,
        lastServiceDate: body.lastServiceDate ? new Date(body.lastServiceDate) : null,
        nextServiceDate: body.nextServiceDate ? new Date(body.nextServiceDate) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error updating equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update equipment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete by setting status to RETIRED
    const equipment = await prisma.equipment.update({
      where: { id },
      data: { status: 'RETIRED' },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Equipment retired successfully',
      data: equipment 
    });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}
