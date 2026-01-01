import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

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

    return NextResponse.json({
      success: true,
      data: harvest,
      message: 'Harvest recorded successfully',
    });
  } catch (error) {
    console.error('Error creating harvest:', error);
    return NextResponse.json(
      { error: 'Failed to create harvest' },
      { status: 500 }
    );
  }
}
