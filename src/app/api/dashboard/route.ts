import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/dashboard - Get dashboard statistics
export async function GET() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Livestock stats
    const livestockStats = await prisma.animal.groupBy({
      by: ['type'],
      where: { status: 'ACTIVE' },
      _count: true,
    });

    const totalLivestock = await prisma.animal.count({
      where: { status: 'ACTIVE' },
    });

    const recentBirths = await prisma.animal.count({
      where: {
        acquisitionMethod: 'BORN',
        createdAt: { gte: weekAgo },
      },
    });

    // Animals needing attention (treatments due)
    const needingAttention = await prisma.treatment.count({
      where: {
        nextDueDate: { lte: new Date() },
        animal: { status: 'ACTIVE' },
      },
    });

    // Crop stats
    const activePlantings = await prisma.planting.count({
      where: {
        status: { in: ['PLANTED', 'GROWING', 'HARVESTING'] },
      },
    });

    const readyToHarvest = await prisma.planting.count({
      where: {
        status: 'HARVESTING',
      },
    });

    const totalFields = await prisma.field.count({
      where: { isActive: true },
    });

    const fieldArea = await prisma.field.aggregate({
      where: { isActive: true },
      _sum: { size: true },
    });

    // Worker stats
    const totalWorkers = await prisma.worker.count({
      where: { status: 'ACTIVE' },
    });

    const presentToday = await prisma.attendance.count({
      where: {
        date: today,
        status: 'PRESENT',
      },
    });

    const onLeave = await prisma.worker.count({
      where: { status: 'ON_LEAVE' },
    });

    // Equipment stats
    const totalEquipment = await prisma.equipment.count({
      where: { status: { not: 'RETIRED' } },
    });

    const equipmentInUse = await prisma.equipment.count({
      where: { status: 'IN_USE' },
    });

    const needingMaintenance = await prisma.equipment.count({
      where: {
        OR: [
          { status: 'MAINTENANCE' },
          { nextServiceDate: { lte: new Date() } },
          { condition: 'POOR' },
        ],
      },
    });

    // Task stats
    const pendingTasks = await prisma.task.count({
      where: { status: 'PENDING' },
    });

    const inProgressTasks = await prisma.task.count({
      where: { status: 'IN_PROGRESS' },
    });

    const completedThisWeek = await prisma.task.count({
      where: {
        status: 'COMPLETED',
        completedAt: { gte: weekAgo },
      },
    });

    // Format livestock by type
    const byType: Record<string, number> = {};
    livestockStats.forEach((stat: any) => {
      byType[stat.type] = stat._count;
    });

    return NextResponse.json({
      success: true,
      data: {
        livestock: {
          total: totalLivestock,
          byType,
          recentBirths,
          needingAttention,
        },
        crops: {
          activePlantings,
          readyToHarvest,
          totalFields,
          totalArea: fieldArea._sum.size || 0,
        },
        workers: {
          total: totalWorkers,
          presentToday,
          onLeave,
        },
        equipment: {
          total: totalEquipment,
          inUse: equipmentInUse,
          needingMaintenance,
        },
        tasks: {
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completedThisWeek,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
