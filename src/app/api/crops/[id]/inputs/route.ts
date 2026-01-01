import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    console.log('Creating crop input with data:', { plantingId, body });

    // Map frontend fertilizer types to InputType enum
    const inputType = body.inputType || 'FERTILIZER';

    const input = await prisma.cropInput.create({
      data: {
        plantingId,
        name: body.name,
        type: inputType,
        quantity: body.quantity,
        unit: body.unit,
        cost: body.cost || null,
        appliedDate: new Date(body.appliedDate),
        notes: body.notes || null,
      },
    });

    console.log('Crop input created:', input);

    return NextResponse.json({
      success: true,
      data: input,
      message: 'Input recorded successfully',
    });
  } catch (error: any) {
    console.error('Error creating input:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create input' },
      { status: 500 }
    );
  }
}
