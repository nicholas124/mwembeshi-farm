import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    // Map frontend fertilizer types to InputType enum
    // Frontend sends: NPK, UREA, ORGANIC, OTHER
    // Database expects: FERTILIZER, PESTICIDE, HERBICIDE, FUNGICIDE, SEED, OTHER
    const inputType = body.inputType || 'FERTILIZER'; // Default to FERTILIZER for fertilizer modal

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

    return NextResponse.json({
      success: true,
      data: input,
      message: 'Input recorded successfully',
    });
  } catch (error) {
    console.error('Error creating input:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create input' },
      { status: 500 }
    );
  }
}
