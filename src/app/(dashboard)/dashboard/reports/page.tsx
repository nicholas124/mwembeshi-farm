'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Beef,
  Sprout,
  Users,
  Package
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReportsData {
  financial: {
    revenue: number;
    expenses: number;
    profit: number;
    profitMargin: number;
    revenueChange: number;
    expenseChange: number;
  };
  overview: {
    livestock: number;
    crops: number;
    workers: number;
    equipment: number;
  };
  monthlyTrend: Array<{
    month: string;
    livestock: number;
    crops: number;
    revenue: number;
    expenses: number;
  }>;
  livestockPerformance: Array<{
    type: string;
    count: number;
    revenue: number;
  }>;
  cropPerformance: Array<{
    crop: string;
    area: number;
    yield: number;
    status: string;
    revenue: number;
  }>;
  recentTransactions: Array<{
    id: string;
    type: 'income' | 'expense';
    description: string;
    amount: number;
    date: Date;
    category: string;
  }>;
}

export default function ReportsPage() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/reports?period=${period}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReports();
  }, [period]);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
        </div>
      </div>
    );
  }

  const maxRevenue = data.monthlyTrend.length > 0 
    ? Math.max(...data.monthlyTrend.map(d => Math.max(d.revenue, d.expenses)))
    : 0;

  const handleExportReport = () => {
    // Generate a CSV report
    let csvContent = "Mwembeshi Farm Report\n";
    csvContent += `Period: ${period.charAt(0).toUpperCase() + period.slice(1)}\n`;
    csvContent += `Generated: ${new Date().toLocaleDateString()}\n\n`;
    
    // Financial Summary
    csvContent += "Financial Summary\n";
    csvContent += `Revenue,ZMW ${data.financial.revenue.toLocaleString()}\n`;
    csvContent += `Expenses,ZMW ${data.financial.expenses.toLocaleString()}\n`;
    csvContent += `Net Profit,ZMW ${data.financial.profit.toLocaleString()}\n`;
    csvContent += `Profit Margin,${data.financial.profitMargin.toFixed(1)}%\n\n`;
    
    // Overview
    csvContent += "Farm Overview\n";
    csvContent += `Livestock,${data.overview.livestock}\n`;
    csvContent += `Crops,${data.overview.crops}\n`;
    csvContent += `Workers,${data.overview.workers}\n`;
    csvContent += `Equipment,${data.overview.equipment}\n\n`;
    
    // Monthly Trend
    csvContent += "Monthly Trend\n";
    csvContent += "Month,Livestock,Crops,Revenue,Expenses\n";
    data.monthlyTrend.forEach(m => {
      csvContent += `${m.month},${m.livestock},${m.crops},${m.revenue},${m.expenses}\n`;
    });
    
    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `mwembeshi_farm_report_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Farm analytics and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['week', 'month', 'quarter', 'year'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
            <span className={`flex items-center text-xs font-medium ${
              data.financial.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.financial.revenueChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {data.financial.revenueChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ZMW {data.financial.revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Expenses</p>
            <span className={`flex items-center text-xs font-medium ${
              data.financial.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.financial.expenseChange <= 0 ? <TrendingDown className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1" />}
              {data.financial.expenseChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ZMW {data.financial.expenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Net Profit</p>
          <p className={`text-2xl font-bold ${data.financial.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ZMW {data.financial.profit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Profit Margin</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {data.financial.profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue & Expenses Trend</h2>
        <div className="h-64 flex items-end justify-between gap-2">
          {data.monthlyTrend.map((monthData, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex gap-1 justify-center" style={{ height: '200px' }}>
                <div 
                  className="w-4 bg-green-500 rounded-t"
                  style={{ height: `${maxRevenue > 0 ? (monthData.revenue / maxRevenue) * 100 : 0}%` }}
                  title={`Revenue: ZMW ${monthData.revenue.toLocaleString()}`}
                />
                <div 
                  className="w-4 bg-red-400 rounded-t"
                  style={{ height: `${maxRevenue > 0 ? (monthData.expenses / maxRevenue) * 100 : 0}%` }}
                  title={`Expenses: ZMW ${monthData.expenses.toLocaleString()}`}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">{monthData.month}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-400 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Expenses</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Livestock Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Beef className="w-5 h-5 text-green-600" />
              Livestock Performance
            </h2>
          </div>
          {data.livestockPerformance.length > 0 ? (
            <div className="space-y-3">
              {data.livestockPerformance.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.type.charAt(0) + item.type.slice(1).toLowerCase()}s
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.count} animals</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      ZMW {item.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No livestock data available</p>
          )}
        </div>

        {/* Crop Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Sprout className="w-5 h-5 text-yellow-600" />
              Crop Performance
            </h2>
          </div>
          {data.cropPerformance.length > 0 ? (
            <div className="space-y-3">
              {data.cropPerformance.map((crop, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{crop.crop}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {crop.area.toFixed(1)} ha • {crop.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {crop.revenue > 0 ? `ZMW ${crop.revenue.toLocaleString()}` : '-'}
                    </p>
                    {crop.yield > 0 && (
                      <p className="text-xs text-gray-500">{crop.yield.toFixed(0)} kg yield</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">No crop data available</p>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
        </div>
        {data.recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {data.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    {transaction.type === 'income' 
                      ? <TrendingUp className="w-4 h-4 text-green-600" />
                      : <TrendingDown className="w-4 h-4 text-red-600" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}ZMW {transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">No transactions recorded</p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <Beef className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.overview.livestock}</p>
          <p className="text-sm opacity-80">Total Livestock</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white">
          <Sprout className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.overview.crops}</p>
          <p className="text-sm opacity-80">Active Plantings</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.overview.workers}</p>
          <p className="text-sm opacity-80">Workers</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <Package className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-2xl font-bold">{data.overview.equipment}</p>
          <p className="text-sm opacity-80">Equipment Items</p>
        </div>
      </div>
    </div>
  );
}
