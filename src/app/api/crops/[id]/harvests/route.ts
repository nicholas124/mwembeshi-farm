import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    console.log('Creating harvest for planting:', plantingId, 'with data:', body);

    // Verify the planting exists
    const planting = await prisma.planting.findUnique({
      where: { id: plantingId },
    });

    if (!planting) {
      return NextResponse.json(
        { error: 'Planting not found' },
        { status: 404 }
      );
    }

    const harvest = await prisma.harvest.create({
      data: {
        plantingId,
        harvestDate: new Date(body.harvestDate),
        quantity: body.quantity,
        unit: body.unit,
        quality: body.quality || 'GOOD',
        notes: body.notes || null,
      },
    });

    console.log('Harvest created successfully:', harvest.id);

    return NextResponse.json({
      success: true,
      data: harvest,
      message: 'Harvest recorded successfully',
    });
  } catch (error) {
    console.error('Error creating harvest:', error);
    return NextResponse.json(
      { error: 'Failed to create harvest', details: String(error) },
      { status: 500 }
    );
  }
}
