import Link from 'next/link';
import { 
  Beef, 
  Sprout, 
  Users, 
  Wrench, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sun,
  Moon,
  CloudSun,
  Heart,
  Activity,
  Plus,
  BarChart3,
  Package,
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

    // Goat-specific stats
    const totalGoats = await prisma.animal.count({
      where: { type: 'GOAT', status: 'ACTIVE' },
    });

    const goatBucks = await prisma.animal.count({
      where: { type: 'GOAT', status: 'ACTIVE', gender: 'MALE' },
    });

    const goatDoes = await prisma.animal.count({
      where: { type: 'GOAT', status: 'ACTIVE', gender: 'FEMALE' },
    });

    const pregnantGoats = await prisma.breedingRecord.count({
      where: { animal: { type: 'GOAT' }, status: 'PREGNANT' },
    });

    const goatTreatmentsDue = await prisma.treatment.count({
      where: {
        animal: { type: 'GOAT', status: 'ACTIVE' },
        nextDueDate: { lte: new Date() },
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
      goats: {
        total: totalGoats,
        bucks: goatBucks,
        does: goatDoes,
        pregnant: pregnantGoats,
        treatmentsDue: goatTreatmentsDue,
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
      goats: {
        total: 0,
        bucks: 0,
        does: 0,
        pregnant: 0,
        treatmentsDue: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  // Determine greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const GreetingIcon = hour < 12 ? Sun : hour < 17 ? CloudSun : Moon;
  const totalTasks = stats.tasks.pending + stats.tasks.inProgress;

  return (
    <div className="space-y-5 sm:space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 rounded-2xl p-5 sm:p-7 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="currentColor" />
            <circle cx="60" cy="60" r="30" fill="currentColor" />
            <circle cx="150" cy="50" r="20" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <GreetingIcon className="w-5 h-5 text-yellow-300" />
            <span className="text-green-200 text-sm font-medium">{greeting}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">
            Mwembeshi Farm
          </h1>
          <p className="text-green-100 text-sm sm:text-base">
            {stats.crops.totalFields} fields • {stats.crops.totalArea} hectares • Mwembeshi, Zambia
          </p>

          {/* Inline alerts */}
          <div className="flex flex-wrap gap-2 mt-4">
            {stats.livestock.needingAttention > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm text-yellow-100 px-3 py-1.5 rounded-full text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {stats.livestock.needingAttention} treatments overdue
              </span>
            )}
            {stats.crops.readyToHarvest > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 backdrop-blur-sm text-amber-100 px-3 py-1.5 rounded-full text-xs font-medium">
                <Sprout className="w-3.5 h-3.5" />
                {stats.crops.readyToHarvest} crops ready to harvest
              </span>
            )}
            {totalTasks > 0 && (
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-full text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                {totalTasks} active tasks
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Link href="/dashboard/livestock" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-green-300 dark:group-hover:border-green-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-xl flex items-center justify-center">
                <Beef className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.livestock.total}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Livestock</p>
              {stats.livestock.recentBirths > 0 && (
                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                  +{stats.livestock.recentBirths} new
                </span>
              )}
            </div>
          </div>
        </Link>

        <Link href="/dashboard/crops" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-yellow-300 dark:group-hover:border-yellow-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.crops.activePlantings}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Active Plantings</p>
              {stats.crops.readyToHarvest > 0 && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-full">
                  {stats.crops.readyToHarvest} ready
                </span>
              )}
            </div>
          </div>
        </Link>

        <Link href="/dashboard/workers" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-blue-300 dark:group-hover:border-blue-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.workers.presentToday}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Workers Present</p>
              <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
                {stats.workers.presentToday}/{stats.workers.total}
              </span>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/equipment" className="group">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 transition-all group-hover:shadow-md group-hover:-translate-y-0.5 group-hover:border-orange-300 dark:group-hover:border-orange-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/50 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{stats.equipment.total}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 dark:text-gray-400">Equipment</p>
              {stats.equipment.needingMaintenance > 0 ? (
                <span className="text-[10px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded-full">
                  {stats.equipment.needingMaintenance} alerts
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded-full">
                  All good
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>

      {/* Goat Herd Spotlight */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🐐</span>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-base">Goat Herd</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Quick overview</p>
            </div>
          </div>
          <Link href="/dashboard/goats" className="text-sm text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium">
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <Link href="/dashboard/goats" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center hover:shadow-sm transition-all">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.goats.total}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">Total</p>
          </Link>
          <Link href="/dashboard/goats?gender=MALE" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center hover:shadow-sm transition-all">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.goats.bucks}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">♂ Bucks</p>
          </Link>
          <Link href="/dashboard/goats?gender=FEMALE" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center hover:shadow-sm transition-all">
            <p className="text-xl font-bold text-pink-600 dark:text-pink-400">{stats.goats.does}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">♀ Does</p>
          </Link>
          <Link href="/dashboard/goats/breeding" className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center hover:shadow-sm transition-all">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.goats.pregnant}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">Pregnant</p>
          </Link>
          <Link href="/dashboard/goats/health" className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 text-center hover:shadow-sm transition-all ${stats.goats.treatmentsDue > 0 ? 'ring-1 ring-red-300 dark:ring-red-700' : ''}`}>
            <p className={`text-xl font-bold ${stats.goats.treatmentsDue > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>{stats.goats.treatmentsDue}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mt-0.5">Due Care</p>
          </Link>
        </div>

        {/* Quick goat actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-800/30">
          <Link href="/dashboard/goats/new" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all">
            <Plus className="w-3 h-3" /> Register Goat
          </Link>
          <Link href="/dashboard/goats/breeding" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all">
            <Heart className="w-3 h-3" /> Breeding
          </Link>
          <Link href="/dashboard/goats/health" className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 dark:text-amber-300 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg hover:shadow-sm transition-all">
            <Activity className="w-3 h-3" /> Health
          </Link>
        </div>
      </div>

      {/* Two Column: Livestock Overview + Tasks */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Livestock Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Livestock Overview</h2>
            <Link href="/dashboard/livestock" className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-1">
            {Object.entries(stats.livestock.byType).length === 0 ? (
              <div className="text-center py-6">
                <Beef className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No livestock recorded yet</p>
                <Link href="/dashboard/livestock/new" className="text-xs text-green-600 dark:text-green-400 hover:underline mt-1 inline-block">Add your first animal</Link>
              </div>
            ) : (
              Object.entries(stats.livestock.byType).map(([type, count]: [string, any]) => {
                const icons: Record<string, string> = {
                  GOAT: '🐐', COW: '🐄', SHEEP: '🐑', CHICKEN: '🐔', PIG: '🐷',
                };
                const colors: Record<string, string> = {
                  GOAT: 'bg-amber-100 dark:bg-amber-900/30',
                  COW: 'bg-green-100 dark:bg-green-900/30',
                  SHEEP: 'bg-blue-100 dark:bg-blue-900/30',
                  CHICKEN: 'bg-yellow-100 dark:bg-yellow-900/30',
                  PIG: 'bg-pink-100 dark:bg-pink-900/30',
                };
                return (
                  <div key={type} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${colors[type] || 'bg-gray-100 dark:bg-gray-700'}`}>
                        {icons[type] || '🐾'}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium">
                        {type.toLowerCase()}s
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{count}</span>
                  </div>
                );
              })
            )}
            {stats.livestock.needingAttention > 0 && (
              <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center gap-2 text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {stats.livestock.needingAttention} animals need attention
              </div>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Tasks</h2>
            <Link href="/dashboard/tasks" className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1 font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4.5 h-4.5 text-amber-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{stats.tasks.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4.5 h-4.5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">In Progress</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{stats.tasks.inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4.5 h-4.5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Done This Week</span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{stats.tasks.completedThisWeek}</span>
            </div>
            {totalTasks === 0 && stats.tasks.completedThisWeek === 0 && (
              <div className="text-center py-3">
                <p className="text-xs text-gray-400 dark:text-gray-500">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-gray-100 dark:bg-gray-700">
          {[
            { href: '/dashboard/goats/new', icon: '🐐', label: 'Register Goat', color: 'text-amber-600 dark:text-amber-400' },
            { href: '/dashboard/livestock/new', icon: '🐄', label: 'Add Animal', color: 'text-green-600 dark:text-green-400' },
            { href: '/dashboard/crops/new', icon: '🌱', label: 'New Planting', color: 'text-yellow-600 dark:text-yellow-400' },
            { href: '/dashboard/tasks/new', icon: '✅', label: 'Create Task', color: 'text-purple-600 dark:text-purple-400' },
            { href: '/dashboard/expenses/new', icon: '💰', label: 'Add Expense', color: 'text-red-600 dark:text-red-400' },
            { href: '/dashboard/reports', icon: '📊', label: 'View Reports', color: 'text-blue-600 dark:text-blue-400' },
          ].map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-center"
            >
              <span className="text-2xl">{action.icon}</span>
              <span className={`text-xs font-medium ${action.color}`}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Row: Farm Stats + Inventory + Financial */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/dashboard/reports" className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Reports</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">View farm analytics, financials & production data</p>
        </Link>

        <Link href="/dashboard/inventory" className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Inventory</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Track supplies, feed, medicines & farm inputs</p>
        </Link>

        <Link href="/dashboard/expenses" className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-rose-100 dark:bg-rose-900/40 rounded-lg flex items-center justify-center">
              <span className="text-sm">💰</span>
            </div>
            <span className="font-semibold text-sm text-gray-900 dark:text-white">Finances</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expenses, income & financial tracking</p>
        </Link>
      </div>
    </div>
  );
}
