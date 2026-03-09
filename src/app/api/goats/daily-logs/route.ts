import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createNotification } from '@/lib/notifications';

// GET /api/goats/daily-logs - List daily goat activity logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // specific date YYYY-MM-DD
    const month = searchParams.get('month'); // YYYY-MM for calendar view
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

    const logs = await prisma.goatDailyLog.findMany({
      where,
      include: {
        worker: {
          select: { id: true, firstName: true, lastName: true, position: true },
        },
        animal: {
          select: { id: true, tag: true, name: true },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    // Get summary stats for the queried period
    const allLogs = month
      ? logs
      : await prisma.goatDailyLog.findMany({
          where: month ? where : {},
          select: { date: true, activity: true, status: true },
        });

    // Group by date for calendar view
    const byDate: Record<string, { total: number; activities: Record<string, number> }> = {};
    for (const log of allLogs) {
      const key = new Date(log.date).toISOString().split('T')[0];
      if (!byDate[key]) byDate[key] = { total: 0, activities: {} };
      byDate[key].total++;
      byDate[key].activities[log.activity] = (byDate[key].activities[log.activity] || 0) + 1;
    }

    // Activity breakdown
    const activitySummary: Record<string, number> = {};
    for (const log of allLogs) {
      activitySummary[log.activity] = (activitySummary[log.activity] || 0) + 1;
    }

    // Get workers for filter dropdown
    const workers = await prisma.worker.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json({
      logs,
      calendarData: byDate,
      activitySummary,
      workers,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching goat daily logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily logs' },
      { status: 500 }
    );
  }
}

// POST /api/goats/daily-logs - Create a daily activity log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const log = await prisma.goatDailyLog.create({
      data: {
        date: new Date(body.date),
        workerId: body.workerId || null,
        activity: body.activity,
        description: body.description || null,
        goatsAffected: body.goatsAffected ? parseInt(body.goatsAffected) : null,
        animalId: body.animalId || null,
        timeSpent: body.timeSpent ? parseFloat(body.timeSpent) : null,
        status: body.status || 'COMPLETED',
        notes: body.notes || null,
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
      title: 'Goat Daily Activity Logged',
      message: `${log.activity} activity logged${log.worker ? ` by ${log.worker.firstName} ${log.worker.lastName}` : ''}`,
      entityType: 'goat_daily_log',
      entityId: log.id,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Error creating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to create daily log' },
      { status: 500 }
    );
  }
}
