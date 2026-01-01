import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    const input = await prisma.cropInput.create({
      data: {
        plantingId,
        name: body.name,
        type: body.type,
        quantity: body.quantity,
        unit: body.unit,
        cost: body.cost || null,
        appliedDate: new Date(body.appliedDate),
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: input,
      message: 'Input recorded successfully',
    });
  } catch (error) {
    console.error('Error creating input:', error);
    return NextResponse.json(
      { error: 'Failed to create input' },
      { status: 500 }
    );
  }
}
