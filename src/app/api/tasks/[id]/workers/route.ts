import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const taskWorkers = await prisma.taskWorker.findMany({
      where: { taskId: id },
      include: {
        worker: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            position: true,
            phone: true,
            status: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: taskWorkers });
  } catch (error) {
    console.error('Error fetching task workers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task workers' },
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
    if (!body.workerId) {
      return NextResponse.json(
        { success: false, error: 'Worker ID is required' },
        { status: 400 }
      );
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: body.workerId },
    });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Check if worker is already assigned
    const existingAssignment = await prisma.taskWorker.findUnique({
      where: {
        taskId_workerId: {
          taskId: id,
          workerId: body.workerId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'Worker is already assigned to this task' },
        { status: 400 }
      );
    }

    // Create the assignment
    const taskWorker = await prisma.taskWorker.create({
      data: {
        taskId: id,
        workerId: body.workerId,
      },
      include: {
        worker: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            position: true,
            phone: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: taskWorker }, { status: 201 });
  } catch (error) {
    console.error('Error assigning worker to task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to assign worker' },
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
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Worker ID is required' },
        { status: 400 }
      );
    }

    // Delete the assignment
    await prisma.taskWorker.delete({
      where: {
        taskId_workerId: {
          taskId: id,
          workerId: workerId,
        },
      },
    });

    return NextResponse.json({ success: true, message: 'Worker removed from task' });
  } catch (error) {
    console.error('Error removing worker from task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove worker' },
      { status: 500 }
    );
  }
}
