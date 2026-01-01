import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const attendances = await prisma.attendance.findMany({
      where: { workerId: params.id },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return NextResponse.json({ success: true, data: attendances });
  } catch (error) {
    console.error('Error fetching attendances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch attendances' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, status, checkIn, checkOut, hoursWorked, overtime, notes } = body;

    // Validate required fields
    if (!date || !status) {
      return NextResponse.json(
        { success: false, error: 'Date and status are required' },
        { status: 400 }
      );
    }

    // Check if worker exists
    const worker = await prisma.worker.findUnique({
      where: { id: params.id },
    });

    if (!worker) {
      return NextResponse.json(
        { success: false, error: 'Worker not found' },
        { status: 404 }
      );
    }

    // Check for existing attendance on same date
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        workerId_date: {
          workerId: params.id,
          date: new Date(date),
        },
      },
    });

    if (existingAttendance) {
      // Update existing attendance
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          status,
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
          overtime: overtime ? parseFloat(overtime) : null,
          notes,
        },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Create new attendance record
    const attendance = await prisma.attendance.create({
      data: {
        workerId: params.id,
        date: new Date(date),
        status,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        overtime: overtime ? parseFloat(overtime) : null,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: attendance }, { status: 201 });
  } catch (error) {
    console.error('Error recording attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record attendance' },
      { status: 500 }
    );
  }
}
