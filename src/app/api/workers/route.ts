import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/workers - List all workers with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    const where: Record<string, unknown> = {};
    
    if (status) where.status = status;
    if (type) where.workerType = type;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    const total = await prisma.worker.count({ where });
    
    const workers = await prisma.worker.findMany({
      where,
      include: {
        attendances: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
          take: 1,
        },
        _count: {
          select: {
            attendances: true,
            payments: true,
            taskAssignments: true,
          },
        },
      },
      orderBy: [{ status: 'asc' }, { firstName: 'asc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    return NextResponse.json({
      success: true,
      data: workers,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workers' },
      { status: 500 }
    );
  }
}

// POST /api/workers - Create a new worker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate employee ID
    const lastWorker = await prisma.worker.findFirst({
      orderBy: { employeeId: 'desc' },
    });
    const nextId = lastWorker 
      ? `EMP-${String(parseInt(lastWorker.employeeId.split('-')[1]) + 1).padStart(4, '0')}`
      : 'EMP-0001';
    
    const worker = await prisma.worker.create({
      data: {
        employeeId: nextId,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        address: body.address,
        nrc: body.nrc,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        position: body.position,
        workerType: body.workerType || 'PERMANENT',
        dailyRate: body.dailyRate,
        monthlyRate: body.monthlyRate,
        emergencyContact: body.emergencyContact,
        emergencyPhone: body.emergencyPhone,
        notes: body.notes,
        status: 'ACTIVE',
      },
    });
    
    return NextResponse.json({
      success: true,
      data: worker,
      message: 'Worker created successfully',
    });
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create worker' },
      { status: 500 }
    );
  }
}
