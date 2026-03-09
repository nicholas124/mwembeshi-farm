import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/crops/daily-logs - List daily crop activity logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const workerId = searchParams.get('workerId');
    const activity = searchParams.get('activity');

    const where: Record<string, unknown> = {};

    if (date) {
      where.date = new Date(date);
    } else if (month) {
      const [year, mon] = month.split('-').map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 0, 23, 59, 59);
      where.date = { gte: start, lte: end };
    }

    if (workerId) where.workerId = workerId;
    if (activity) where.activity = activity;

    const logs = await prisma.cropDailyLog.findMany({
      where,
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
        planting: {
          include: {
            cropType: { select: { id: true, name: true } },
            field: { select: { id: true, name: true } },
          },
        },
        field: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    // Group by date for calendar view
    const allLogs = month ? logs : [];
    const byDate: Record<string, { total: number; activities: Record<string, number> }> = {};
    for (const log of (month ? logs : allLogs)) {
      const key = new Date(log.date).toISOString().split('T')[0];
      if (!byDate[key]) byDate[key] = { total: 0, activities: {} };
      byDate[key].total++;
      byDate[key].activities[log.activity] = (byDate[key].activities[log.activity] || 0) + 1;
    }

    // Activity breakdown
    const activitySummary: Record<string, number> = {};
    for (const log of (month ? logs : allLogs)) {
      activitySummary[log.activity] = (activitySummary[log.activity] || 0) + 1;
    }

    // Get workers for filter dropdown
    const workers = await prisma.worker.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    });

    // Get active plantings for form dropdown
    const plantings = await prisma.planting.findMany({
      where: { status: { notIn: ['COMPLETED', 'FAILED'] } },
      include: {
        cropType: { select: { name: true } },
        field: { select: { name: true } },
      },
      orderBy: { plantingDate: 'desc' },
    });

    // Get active fields
    const fields = await prisma.field.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      logs,
      calendarData: byDate,
      activitySummary,
      workers,
      plantings,
      fields,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching crop daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    );
  }
}

// POST /api/crops/daily-logs - Create a daily crop activity log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const log = await prisma.cropDailyLog.create({
      data: {
        date: new Date(body.date),
        workerId: body.workerId || null,
        activity: body.activity,
        description: body.description || null,
        plantingId: body.plantingId || null,
        fieldId: body.fieldId || null,
        areaWorked: body.areaWorked ? parseFloat(body.areaWorked) : null,
        timeSpent: body.timeSpent ? parseFloat(body.timeSpent) : null,
        status: body.status || 'COMPLETED',
        notes: body.notes || null,
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
      title: 'Crop Daily Activity Logged',
      message: `${log.activity} activity logged${log.worker ? ` by ${log.worker.firstName} ${log.worker.lastName}` : ''}`,
      entityType: 'crop_daily_log',
      entityId: log.id,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating crop daily log:', error);
    return NextResponse.json(
      { error: 'Failed to create daily log' },
      { status: 500 }
    );
  }
}
