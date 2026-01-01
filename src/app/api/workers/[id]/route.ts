import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const worker = await prisma.worker.findUnique({
      where: { id },
      include: {
        attendances: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        payments: {
          orderBy: { paymentDate: 'desc' },
          take: 10,
        },
        taskAssignments: {
          include: {
            task: true,
          },
          orderBy: { assignedAt: 'desc' },
        },
      },
    });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error fetching worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch worker' },
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

    const worker = await prisma.worker.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone || null,
        address: body.address || null,
        nrc: body.nrc || null,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        position: body.position,
        workerType: body.workerType,
        dailyRate: body.dailyRate ? parseFloat(body.dailyRate) : null,
        monthlyRate: body.monthlyRate ? parseFloat(body.monthlyRate) : null,
        status: body.status,
        emergencyContact: body.emergencyContact || null,
        emergencyPhone: body.emergencyPhone || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({ success: true, data: worker });
  } catch (error) {
    console.error('Error updating worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update worker' },
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

    // Soft delete by setting status to TERMINATED
    const worker = await prisma.worker.update({
      where: { id },
      data: { status: 'TERMINATED' },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Worker terminated successfully',
      data: worker 
    });
  } catch (error) {
    console.error('Error deleting worker:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete worker' },
      { status: 500 }
    );
  }
}
