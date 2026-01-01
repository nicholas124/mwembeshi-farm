import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks - List all tasks with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const assignedToId = searchParams.get('assignedToId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    const where: Record<string, unknown> = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    if (priority) where.priority = priority;
    if (assignedToId) where.assignedToId = assignedToId;
    
    const total = await prisma.task.count({ where });
    
    const tasks = await prisma.task.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        workers: {
          include: {
            worker: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { dueDate: 'asc' },
        { createdAt: 'desc' },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: tasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get a default user if createdById is not provided
    let createdById = body.createdById;
    if (!createdById) {
      const defaultUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true }
      });
      if (!defaultUser) {
        // If no admin, get any user
        const anyUser = await prisma.user.findFirst({
          select: { id: true }
        });
        if (!anyUser) {
          return NextResponse.json(
            { success: false, error: 'No users found in system. Please create a user first.' },
            { status: 400 }
          );
        }
        createdById = anyUser.id;
      } else {
        createdById = defaultUser.id;
      }
    }
    
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        priority: body.priority || 'MEDIUM',
        status: 'PENDING',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        estimatedHours: body.estimatedHours,
        createdById: createdById,
        assignedToId: body.assignedToId || null,
        notes: body.notes,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    });
    
    // Assign workers if provided
    if (body.workerIds && body.workerIds.length > 0) {
      await prisma.taskWorker.createMany({
        data: body.workerIds.map((workerId: string) => ({
          taskId: task.id,
          workerId,
        })),
      });
    }
    
    return NextResponse.json({
      success: true,
      data: task,
      message: 'Task created successfully',
    });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    );
  }
}
