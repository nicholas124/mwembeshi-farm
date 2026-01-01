'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Milk, Egg, Activity, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const productionIcons: Record<string, React.ReactNode> = {
  MILK: <Milk className="w-5 h-5 text-blue-500" />,
  EGGS: <Egg className="w-5 h-5 text-yellow-500" />,
  WOOL: <Activity className="w-5 h-5 text-gray-500" />,
  OTHER: <Activity className="w-5 h-5 text-gray-500" />,
};

const productionColors: Record<string, string> = {
  MILK: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  EGGS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  WOOL: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  OTHER: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function ProductionHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [animal, setAnimal] = useState<any>(null);
  const [production, setProduction] = useState<any[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animalRes, productionRes] = await Promise.all([
          fetch(`/api/animals/${id}`),
          fetch(`/api/animals/${id}/production${filterType ? `?type=${filterType}` : ''}`),
        ]);

        if (animalRes.ok) {
          const animalData = await animalRes.json();
          setAnimal(animalData.data || animalData);
        }

        if (productionRes.ok) {
          const productionData = await productionRes.json();
          setProduction(productionData.data || []);
          setTotals(productionData.totals || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id, filterType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Group by date for daily totals
  const dailyTotals = production.reduce((acc: any, record: any) => {
    const date = formatDateShort(record.recordedAt);
    if (!acc[date]) {
      acc[date] = { date, records: [], total: 0 };
    }
    acc[date].records.push(record);
    acc[date].total += Number(record.quantity);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/livestock/${id}`}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Production Records
            </h1>
            {animal && (
              <p className="text-gray-600 dark:text-gray-400">
                {animal.tag} {animal.name && `"${animal.name}"`}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Types</option>
            <option value="MILK">Milk</option>
            <option value="EGGS">Eggs</option>
            <option value="WOOL">Wool</option>
            <option value="OTHER">Other</option>
          </select>
          <Link
            href={`/dashboard/livestock/${id}`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Record Production
          </Link>
        </div>
      </div>

      {/* Totals Cards */}
      {totals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {totals.map((total: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${productionColors[total.type]}`}>
                  {productionIcons[total.type]}
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total {total.type}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {Number(total._sum.quantity).toFixed(1)} {total.unit}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Production Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Production History</h3>
          <span className="text-sm text-gray-500">{production.length} records</span>
        </div>
        
        {production.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {Object.values(dailyTotals).map((day: any) => (
              <div key={day.date} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">{day.date}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {day.records.length} record{day.records.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {day.records.map((record: any) => (
                    <div key={record.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {productionIcons[record.type]}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {Number(record.quantity).toFixed(1)} {record.unit}
                        </p>
                        <p className="text-xs text-gray-500">{record.type}</p>
                        {record.notes && (
                          <p className="text-xs text-gray-400 mt-1">{record.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-gray-500">
            No production records found. Start tracking by clicking &quot;Record Production&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
