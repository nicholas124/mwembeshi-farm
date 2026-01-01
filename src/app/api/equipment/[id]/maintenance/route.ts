import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const maintenances = await prisma.maintenance.findMany({
      where: { equipmentId: params.id },
      orderBy: { maintenanceDate: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: maintenances });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { 
      type, 
      description, 
      performedBy, 
      cost, 
      parts,
      maintenanceDate,
      nextDueDate,
      notes 
    } = body;

    // Validate required fields
    if (!type || !description) {
      return NextResponse.json(
        { success: false, error: 'Type and description are required' },
        { status: 400 }
      );
    }

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id: params.id },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Create maintenance record
    const maintenance = await prisma.maintenance.create({
      data: {
        equipmentId: params.id,
        type,
        description,
        performedBy,
        cost: cost ? parseFloat(cost) : null,
        parts,
        maintenanceDate: maintenanceDate ? new Date(maintenanceDate) : new Date(),
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
        notes,
      },
    });

    // Update equipment status if it was in maintenance
    if (equipment.status === 'MAINTENANCE') {
      await prisma.equipment.update({
        where: { id: params.id },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({ success: true, data: maintenance }, { status: 201 });
  } catch (error) {
    console.error('Error recording maintenance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record maintenance' },
      { status: 500 }
    );
  }
}
