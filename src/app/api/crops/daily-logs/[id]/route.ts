import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// PUT /api/crops/daily-logs/[id] - Update a log entry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const log = await prisma.cropDailyLog.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        workerId: body.workerId ?? undefined,
        activity: body.activity ?? undefined,
        description: body.description ?? undefined,
        plantingId: body.plantingId ?? undefined,
        fieldId: body.fieldId ?? undefined,
        areaWorked: body.areaWorked !== undefined ? parseFloat(body.areaWorked) : undefined,
        timeSpent: body.timeSpent !== undefined ? parseFloat(body.timeSpent) : undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true },
        },
        planting: {
          include: {
            cropType: { select: { name: true } },
            field: { select: { name: true } },
          },
        },
        field: {
          select: { id: true, name: true },
        },
      },
    });

    await createNotification({
      type: 'CROP_DAILY_LOG',
      title: 'Crop Daily Log Updated',
      message: `Crop daily log for ${log.activity} was updated${log.worker ? ` (worker: ${log.worker.firstName} ${log.worker.lastName})` : ''}`,
      entityType: 'crop_daily_log',
      entityId: log.id,
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error updating crop daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 }
    );
  }
}

// DELETE /api/crops/daily-logs/[id] - Delete a log entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.cropDailyLog.delete({ where: { id } });

    await createNotification({
      type: 'CROP_DAILY_LOG',
      title: 'Crop Daily Log Deleted',
      message: `A crop daily activity log was deleted`,
      entityType: 'crop_daily_log',
      entityId: id,
    });

    return NextResponse.json({ message: 'Log deleted' });
  } catch (error) {
    console.error('Error deleting crop daily log:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily log' },
      { status: 500 }
    );
  }
}
