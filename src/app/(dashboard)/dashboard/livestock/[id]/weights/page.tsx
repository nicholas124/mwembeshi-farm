'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, TrendingUp, TrendingDown, Scale, Calendar } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

export default function WeightHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [animal, setAnimal] = useState<any>(null);
  const [weights, setWeights] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animalRes, weightsRes] = await Promise.all([
          fetch(`/api/animals/${id}`),
          fetch(`/api/animals/${id}/weights`),
        ]);

        if (animalRes.ok) {
          const animalData = await animalRes.json();
          setAnimal(animalData.data || animalData);
        }

        if (weightsRes.ok) {
          const weightsData = await weightsRes.json();
          setWeights(weightsData.data || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const calculateChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = ((change / previous) * 100).toFixed(1);
    return { change: change.toFixed(1), percentage };
  };

  const maxWeight = Math.max(...weights.map((w) => Number(w.weight)), 1);
  const minWeight = Math.min(...weights.map((w) => Number(w.weight)));
  const avgWeight = weights.length > 0 
    ? (weights.reduce((sum, w) => sum + Number(w.weight), 0) / weights.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/livestock/${id}`}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Weight History
            </h1>
            {animal && (
              <p className="text-gray-600 dark:text-gray-400">
                {animal.tag} {animal.name && `"${animal.name}"`}
              </p>
            )}
          </div>
        </div>
        <Link
          href={`/dashboard/livestock/${id}`}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Record Weight
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Scale className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Weight</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {animal?.weight || weights[0]?.weight || '—'} kg
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Max Weight</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{maxWeight} kg</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Min Weight</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{minWeight} kg</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{avgWeight} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weight Chart */}
      {weights.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weight Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2 overflow-x-auto pb-4">
            {weights.slice().reverse().map((record: any, index: number) => (
              <div key={record.id} className="flex flex-col items-center gap-2 min-w-[40px]">
                <div className="w-full flex justify-center" style={{ height: '200px' }}>
                  <div 
                    className="w-8 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                    style={{ height: `${(Number(record.weight) / maxWeight) * 100}%` }}
                    title={`${record.weight} kg on ${formatDateShort(record.recordedAt)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{Number(record.weight)}kg</p>
                  <p className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDateShort(record.recordedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weight Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Weight Records</h3>
        </div>
        
        {weights.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Weight</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Change</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {weights.map((record: any, index: number) => {
                  const prevRecord = weights[index + 1];
                  const change = prevRecord 
                    ? calculateChange(Number(record.weight), Number(prevRecord.weight))
                    : null;
                  
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-5 py-4 text-sm text-gray-900 dark:text-white">
                        {formatDate(record.recordedAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {Number(record.weight)} kg
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {change ? (
                          <span className={`inline-flex items-center gap-1 text-sm ${
                            Number(change.change) >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {Number(change.change) >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {Number(change.change) >= 0 ? '+' : ''}{change.change} kg ({change.percentage}%)
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {record.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-gray-500">
            No weight records found. Start tracking this animal&apos;s weight by clicking &quot;Record Weight&quot;.
          </div>
        )}
      </div>
    </div>
  );
}
