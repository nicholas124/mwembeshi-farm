import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const usageRecords = await prisma.equipmentUsage.findMany({
      where: { equipmentId: id },
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
      take: 50,
    });

    return NextResponse.json({ success: true, data: usageRecords });
  } catch (error) {
    console.error('Error fetching equipment usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch usage records' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate required fields
    if (!body.usedById) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!body.purpose) {
      return NextResponse.json(
        { success: false, error: 'Purpose is required' },
        { status: 400 }
      );
    }

    // Check if equipment exists
    const equipment = await prisma.equipment.findUnique({
      where: { id },
    });

    if (!equipment) {
      return NextResponse.json(
        { success: false, error: 'Equipment not found' },
        { status: 404 }
      );
    }

    // Determine if this is a checkout (starting usage) or a return (completing usage)
    const isCheckout = !body.returnTime;

    // Create the usage record
    const usageRecord = await prisma.equipmentUsage.create({
      data: {
        equipmentId: id,
        usedById: body.usedById,
        purpose: body.purpose,
        checkoutTime: body.checkoutTime ? new Date(body.checkoutTime) : new Date(),
        returnTime: body.returnTime ? new Date(body.returnTime) : null,
        hoursUsed: body.hoursUsed ? parseFloat(body.hoursUsed) : null,
        fuelUsed: body.fuelUsed ? parseFloat(body.fuelUsed) : null,
        notes: body.notes || null,
      },
      include: {
        usedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update equipment status based on checkout/return
    if (isCheckout && equipment.status === 'AVAILABLE') {
      await prisma.equipment.update({
        where: { id },
        data: { status: 'IN_USE' },
      });
    } else if (!isCheckout && equipment.status === 'IN_USE') {
      await prisma.equipment.update({
        where: { id },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({ success: true, data: usageRecord }, { status: 201 });
  } catch (error) {
    console.error('Error recording equipment usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record usage' },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update existing usage record (e.g., for returns)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.usageId) {
      return NextResponse.json(
        { success: false, error: 'Usage record ID is required' },
        { status: 400 }
      );
    }

    const usageRecord = await prisma.equipmentUsage.update({
      where: { id: body.usageId },
      data: {
        returnTime: body.returnTime ? new Date(body.returnTime) : new Date(),
        hoursUsed: body.hoursUsed ? parseFloat(body.hoursUsed) : null,
        fuelUsed: body.fuelUsed ? parseFloat(body.fuelUsed) : null,
        notes: body.notes || undefined,
      },
      include: {
        equipment: true,
        usedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update equipment status to available
    if (usageRecord.equipment.status === 'IN_USE') {
      await prisma.equipment.update({
        where: { id: params.id },
        data: { status: 'AVAILABLE' },
      });
    }

    return NextResponse.json({ success: true, data: usageRecord });
  } catch (error) {
    console.error('Error updating equipment usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update usage record' },
      { status: 500 }
    );
  }
}
