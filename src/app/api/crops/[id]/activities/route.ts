import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: plantingId } = await params;
    const body = await request.json();

    const activity = await prisma.cropActivity.create({
      data: {
        plantingId,
        type: body.type,
        description: body.description,
        activityDate: new Date(body.activityDate),
        cost: body.cost || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity recorded successfully',
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
