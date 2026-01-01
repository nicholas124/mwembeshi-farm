import Link from 'next/link';
import { 
  Beef, 
  Sprout, 
  Users, 
  Wrench, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

import prisma from '@/lib/prisma';

// This fetches stats directly from the database
async function getDashboardStats() {
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

    const needingAttention = await prisma.treatment.count({
      where: {
        nextDueDate: { lte: new Date() },
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

    return {
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
        totalArea: Number(fieldArea._sum.size || 0),
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
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    // Return fallback data
    return {
      livestock: {
        total: 0,
        byType: {},
        recentBirths: 0,
        needingAttention: 0,
      },
      crops: {
        activePlantings: 0,
        readyToHarvest: 0,
        totalFields: 0,
        totalArea: 0,
      },
      workers: {
        total: 0,
        presentToday: 0,
        onLeave: 0,
      },
      equipment: {
        total: 0,
        inUse: 0,
        needingMaintenance: 0,
      },
      tasks: {
        pending: 0,
        inProgress: 0,
        completedThisWeek: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening on your farm today.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Livestock */}
        <Link href="/dashboard/livestock" className="card-hover">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <Beef className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.livestock.recentBirths}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.livestock.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Livestock</p>
          </div>
        </Link>

        {/* Crops */}
        <Link href="/dashboard/crops" className="card-hover">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              {stats.crops.readyToHarvest > 0 && (
                <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
                  {stats.crops.readyToHarvest} ready
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.crops.activePlantings}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Active Plantings</p>
          </div>
        </Link>

        {/* Workers */}
        <Link href="/dashboard/workers" className="card-hover">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                {stats.workers.presentToday}/{stats.workers.total}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.workers.presentToday}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Present Today</p>
          </div>
        </Link>

        {/* Equipment */}
        <Link href="/dashboard/equipment" className="card-hover">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              {stats.equipment.needingMaintenance > 0 && (
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                  {stats.equipment.needingMaintenance} alerts
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.equipment.total}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Equipment Items</p>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Livestock Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Livestock Overview</h2>
            <Link href="/dashboard/livestock" className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {Object.entries(stats.livestock.byType).map(([type, count]: [string, any]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {type === 'GOAT' && '🐐'}
                    {type === 'COW' && '🐄'}
                    {type === 'SHEEP' && '🐑'}
                    {type === 'CHICKEN' && '🐔'}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {type.toLowerCase()}s
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{count}</span>
              </div>
            ))}
          </div>
          {stats.livestock.needingAttention > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
              <AlertCircle className="w-4 h-4" />
              {stats.livestock.needingAttention} animals need attention
            </div>
          )}
        </div>

        {/* Tasks Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Tasks</h2>
            <Link href="/dashboard/tasks" className="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{stats.tasks.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{stats.tasks.inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Completed This Week</span>
              </div>
              <span className="font-medium text-gray-900 dark:text-white">{stats.tasks.completedThisWeek}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link
              href="/dashboard/livestock/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <span className="text-sm">🐐</span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Add New Animal</span>
            </Link>
            <Link
              href="/dashboard/crops/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <span className="text-sm">🌱</span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Record Planting</span>
            </Link>
            <Link
              href="/dashboard/workers/attendance"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-sm">📋</span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Mark Attendance</span>
            </Link>
            <Link
              href="/dashboard/tasks/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-sm">✅</span>
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">Create Task</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Farm Info */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Mwembeshi Farm</h2>
            <p className="text-green-100 mt-1">
              {stats.crops.totalFields} fields • {stats.crops.totalArea} hectares • Mwembeshi, Zambia
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
          >
            View Reports <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
