import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

// Type definitions for Prisma query results
interface ExpenseRecord {
  id: string;
  amount: Decimal;
  description: string;
  expenseDate: Date;
  category: string;
}

interface IncomeRecord {
  id: string;
  amount: Decimal;
  description: string;
  incomeDate: Date;
  category: string;
}

interface LivestockGroup {
  type: string;
  _count: { id: number };
}

interface CropGroup {
  cropTypeId: string;
  _sum: { areaPlanted: Decimal | null };
  _count: { id: number };
}

interface StatusGroup {
  status: string;
  _count: { id: number };
}

interface HarvestWithPlanting {
  id: string;
  quantity: Decimal;
  soldPrice: Decimal | null;
  planting: {
    cropTypeId: string;
    cropType: {
      id: string;
      name: string;
    };
  };
}

interface CropTypeRecord {
  id: string;
  name: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // week, month, quarter, year
    
    // Calculate date ranges
    const now = new Date();
    const startDate = getStartDate(period);
    
    // Parallel queries for better performance
    const [
      livestock,
      livestockByType,
      crops,
      cropsByType,
      harvests,
      workers,
      equipment,
      expenses,
      income,
      recentTransactions
    ] = await Promise.all([
      // Total livestock count
      prisma.animal.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Livestock by type with counts
      prisma.animal.groupBy({
        by: ['type'],
        where: { status: 'ACTIVE' },
        _count: { id: true }
      }),
      
      // Active crop plantings
      prisma.planting.count({
        where: {
          status: { in: ['PLANTED', 'GROWING', 'HARVESTING'] }
        }
      }),
      
      // Crops by type with area
      prisma.planting.groupBy({
        by: ['cropTypeId'],
        where: {
          status: { in: ['PLANTED', 'GROWING', 'HARVESTING', 'COMPLETED'] }
        },
        _sum: {
          areaPlanted: true
        },
        _count: { id: true }
      }),
      
      // Harvests for revenue calculation
      prisma.harvest.findMany({
        where: {
          harvestDate: { gte: startDate }
        },
        include: {
          planting: {
            include: {
              cropType: true
            }
          }
        }
      }),
      
      // Active workers
      prisma.worker.count({
        where: { status: 'ACTIVE' }
      }),
      
      // Equipment count
      prisma.equipment.count({
        where: { status: { not: 'RETIRED' } }
      }),
      
      // Expenses in period
      prisma.expense.findMany({
        where: {
          expenseDate: { gte: startDate }
        },
        orderBy: { expenseDate: 'desc' }
      }),
      
      // Income in period
      prisma.income.findMany({
        where: {
          incomeDate: { gte: startDate }
        },
        orderBy: { incomeDate: 'desc' }
      }),
      
      // Recent transactions (combined expenses and income)
      Promise.all([
        prisma.expense.findMany({
          take: 10,
          orderBy: { expenseDate: 'desc' },
          select: {
            id: true,
            description: true,
            amount: true,
            expenseDate: true,
            category: true
          }
        }),
        prisma.income.findMany({
          take: 10,
          orderBy: { incomeDate: 'desc' },
          select: {
            id: true,
            description: true,
            amount: true,
            incomeDate: true,
            category: true
          }
        })
      ])
    ]);

    // Calculate financial metrics
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalIncome = income.reduce((sum, i) => sum + Number(i.amount), 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    // Calculate monthly trend data (last 6 periods)
    const monthlyTrend = await calculateMonthlyTrend(period);

    // Calculate revenue change
    const previousPeriodStart = getPreviousPeriodStart(period);
    const previousPeriodExpenses = await prisma.expense.aggregate({
      where: {
        expenseDate: { gte: previousPeriodStart, lt: startDate }
      },
      _sum: { amount: true }
    });
    const previousPeriodIncome = await prisma.income.aggregate({
      where: {
        incomeDate: { gte: previousPeriodStart, lt: startDate }
      },
      _sum: { amount: true }
    });

    const prevExpenses = Number(previousPeriodExpenses._sum.amount || 0);
    const prevIncome = Number(previousPeriodIncome._sum.amount || 0);
    const revenueChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
    const expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    // Get livestock performance with revenue
    const livestockPerformance = await Promise.all(
      (livestockByType as LivestockGroup[]).map(async (item: LivestockGroup) => {
        // Get income from livestock sales
        const livestockIncome = await prisma.income.aggregate({
          where: {
            category: 'LIVESTOCK_SALE',
            incomeDate: { gte: startDate },
            description: { contains: item.type, mode: 'insensitive' }
          },
          _sum: { amount: true }
        });

        return {
          type: item.type,
          count: item._count.id,
          revenue: Number(livestockIncome._sum.amount || 0)
        };
      })
    );

    // Get crop performance
    const cropTypeIds = Array.from(new Set(cropsByType.map((c) => c.cropTypeId)));
    const cropTypes = await prisma.cropType.findMany({
      where: { id: { in: cropTypeIds } }
    });

    const cropPerformance = await Promise.all(
      cropsByType.map(async (item) => {
        const cropType = cropTypes.find((ct) => ct.id === item.cropTypeId);
        
        // Get harvests for this crop type
        const cropHarvests = harvests.filter((h) => h.planting.cropTypeId === item.cropTypeId);
        const totalYield = cropHarvests.reduce((sum, h) => sum + Number(h.quantity), 0);
        const revenue = cropHarvests.reduce((sum, h) => sum + Number(h.soldPrice || 0), 0);

        // Get current status
        const statuses = await prisma.planting.groupBy({
          by: ['status'],
          where: { cropTypeId: item.cropTypeId },
          _count: { id: true }
        });
        const primaryStatus = statuses.length > 0 
          ? statuses.reduce((a, b) => a._count.id > b._count.id ? a : b)
          : { status: 'UNKNOWN', _count: { id: 0 } };

        return {
          crop: cropType?.name || 'Unknown',
          area: Number(item._sum.areaPlanted || 0),
          yield: totalYield,
          status: primaryStatus.status,
          revenue: revenue
        };
      })
    );

    // Combine and sort recent transactions
    const [expenseTransactions, incomeTransactions] = recentTransactions;
    const combinedTransactions = [
      ...expenseTransactions.map((e) => ({
        id: `exp-${e.id}`,
        type: 'expense' as const,
        description: e.description,
        amount: Number(e.amount),
        date: e.expenseDate,
        category: e.category
      })),
      ...incomeTransactions.map((i) => ({
        id: `inc-${i.id}`,
        type: 'income' as const,
        description: i.description,
        amount: Number(i.amount),
        date: i.incomeDate,
        category: i.category
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

    return NextResponse.json({
      success: true,
      data: {
        financial: {
          revenue: totalIncome,
          expenses: totalExpenses,
          profit: netProfit,
          profitMargin: profitMargin,
          revenueChange: revenueChange,
          expenseChange: expenseChange
        },
        overview: {
          livestock: livestock,
          crops: crops,
          workers: workers,
          equipment: equipment
        },
        monthlyTrend: monthlyTrend,
        livestockPerformance: livestockPerformance,
        cropPerformance: cropPerformance,
        recentTransactions: combinedTransactions,
        period: period
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), quarter * 3, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

function getPreviousPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      return new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), (quarter - 1) * 3, 1);
    case 'year':
      return new Date(now.getFullYear() - 1, 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
}

async function calculateMonthlyTrend(period: string) {
  const now = new Date();
  const months = [];
  const numPeriods = 6;

  for (let i = numPeriods - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    
    const [expenses, income, livestock, crops] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          expenseDate: { gte: date, lt: nextDate }
        },
        _sum: { amount: true }
      }),
      prisma.income.aggregate({
        where: {
          incomeDate: { gte: date, lt: nextDate }
        },
        _sum: { amount: true }
      }),
      prisma.animal.count({
        where: {
          createdAt: { lte: nextDate },
          OR: [
            { status: 'ACTIVE' },
            { updatedAt: { gte: date } }
          ]
        }
      }),
      prisma.planting.count({
        where: {
          plantingDate: { gte: date, lt: nextDate }
        }
      })
    ]);

    months.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      livestock: livestock,
      crops: crops,
      revenue: Number(income._sum.amount || 0),
      expenses: Number(expenses._sum.amount || 0)
    });
  }

  return months;
}
