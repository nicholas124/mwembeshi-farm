import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || null,
        category: body.category,
        priority: body.priority,
        status: body.status,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours ? parseFloat(body.estimatedHours) : null,
        actualHours: body.actualHours ? parseFloat(body.actualHours) : null,
        assignedToId: body.assignedToId || null,
        notes: body.notes || null,
        ...(body.status === 'COMPLETED' && !body.completedAt ? { completedAt: new Date() } : {}),
        ...(body.status === 'IN_PROGRESS' && !body.startedAt ? { startedAt: new Date() } : {}),
      },
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete by setting status to CANCELLED
    const task = await prisma.task.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Task cancelled successfully',
      data: task 
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}
