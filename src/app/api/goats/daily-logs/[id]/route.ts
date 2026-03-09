import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// PUT /api/goats/daily-logs/[id] - Update a log entry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const log = await prisma.goatDailyLog.update({
      where: { id },
      data: {
        date: body.date ? new Date(body.date) : undefined,
        workerId: body.workerId ?? undefined,
        activity: body.activity ?? undefined,
        description: body.description ?? undefined,
        goatsAffected: body.goatsAffected !== undefined ? parseInt(body.goatsAffected) : undefined,
        animalId: body.animalId ?? undefined,
        timeSpent: body.timeSpent !== undefined ? parseFloat(body.timeSpent) : undefined,
        status: body.status ?? undefined,
        notes: body.notes ?? undefined,
      },
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true },
        },
        animal: {
          select: { id: true, tag: true, name: true },
        },
      },
    });

    await createNotification({
      type: 'GOAT_DAILY_LOG',
      title: 'Goat Daily Log Updated',
      message: `Goat daily log for ${log.activity} was updated${log.worker ? ` (worker: ${log.worker.firstName} ${log.worker.lastName})` : ''}`,
      entityType: 'goat_daily_log',
      entityId: log.id,
    });

    return NextResponse.json(log);
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 }
    );
  }
}

// DELETE /api/goats/daily-logs/[id] - Delete a log entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.goatDailyLog.delete({ where: { id } });

    await createNotification({
      type: 'GOAT_DAILY_LOG',
      title: 'Goat Daily Log Deleted',
      message: `A goat daily activity log was deleted`,
      entityType: 'goat_daily_log',
      entityId: id,
    });

    return NextResponse.json({ message: 'Log deleted' });
  } catch (error) {
    console.error('Error deleting daily log:', error);
    return NextResponse.json(
      { error: 'Failed to delete daily log' },
      { status: 500 }
    );
  }
}
