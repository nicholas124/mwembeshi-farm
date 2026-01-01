import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const { activityId } = await params;
    const body = await request.json();

    const activity = await prisma.cropActivity.update({
      where: { id: activityId },
      data: {
        type: body.type,
        description: body.description,
        activityDate: body.activityDate ? new Date(body.activityDate) : undefined,
        cost: body.cost || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: activity,
      message: 'Activity updated successfully',
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update activity' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const { activityId } = await params;

    await prisma.cropActivity.delete({
      where: { id: activityId },
    });

    return NextResponse.json({
      success: true,
      message: 'Activity deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete activity' },
      { status: 500 }
    );
  }
}
