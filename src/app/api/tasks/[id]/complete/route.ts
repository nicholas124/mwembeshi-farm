import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    // Validate task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update task status and completion details
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualHours: body.actualHours ? parseFloat(body.actualHours) : null,
        notes: body.notes || task.notes,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workers: {
          include: {
            worker: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: updatedTask });
  } catch (error) {
    console.error('Error completing task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to complete task' },
      { status: 500 }
    );
  }
}
