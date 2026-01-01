'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Syringe, Heart, Activity, AlertCircle, Calendar, Clock, DollarSign } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const treatmentIcons: Record<string, React.ReactNode> = {
  VACCINATION: <Syringe className="w-5 h-5 text-blue-500" />,
  DEWORMING: <Heart className="w-5 h-5 text-purple-500" />,
  MEDICATION: <Heart className="w-5 h-5 text-red-500" />,
  SURGERY: <Activity className="w-5 h-5 text-orange-500" />,
  CHECKUP: <Activity className="w-5 h-5 text-green-500" />,
  INJURY: <AlertCircle className="w-5 h-5 text-red-500" />,
  OTHER: <Heart className="w-5 h-5 text-gray-500" />,
};

const treatmentColors: Record<string, string> = {
  VACCINATION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  DEWORMING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  MEDICATION: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  SURGERY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  CHECKUP: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  INJURY: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function TreatmentsHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [animal, setAnimal] = useState<any>(null);
  const [treatments, setTreatments] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animalRes, treatmentsRes] = await Promise.all([
          fetch(`/api/animals/${id}`),
          fetch(`/api/animals/${id}/treatments${filterType ? `?type=${filterType}` : ''}`),
        ]);

        if (animalRes.ok) {
          const animalData = await animalRes.json();
          setAnimal(animalData.data || animalData);
        }

        if (treatmentsRes.ok) {
          const treatmentsData = await treatmentsRes.json();
          setTreatments(treatmentsData.data || []);
          setUpcoming(treatmentsData.upcoming || []);
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

  // Calculate statistics
  const totalCost = treatments.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);
  const treatmentsByType = treatments.reduce((acc: any, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
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
              Treatment History
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
            <option value="VACCINATION">Vaccination</option>
            <option value="DEWORMING">Deworming</option>
            <option value="MEDICATION">Medication</option>
            <option value="SURGERY">Surgery</option>
            <option value="CHECKUP">Checkup</option>
            <option value="INJURY">Injury</option>
            <option value="OTHER">Other</option>
          </select>
          <Link
            href={`/dashboard/livestock/${id}`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Treatment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Syringe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Treatments</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{treatments.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                K{totalCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{upcoming.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Treatments */}
      {upcoming.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-5">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Treatments
          </h3>
          <div className="space-y-3">
            {upcoming.map((treatment: any) => (
              <div key={treatment.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {treatmentIcons[treatment.type]}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{treatment.description}</p>
                    <p className="text-sm text-gray-500">{treatment.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-yellow-600 dark:text-yellow-400">
                    {formatDateShort(treatment.nextDueDate)}
                  </p>
                  <p className="text-xs text-gray-500">Due Date</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treatment History Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">All Treatments</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(treatmentsByType).map(([type, count]) => (
              <span key={type} className={`px-2 py-1 rounded-full text-xs font-medium ${treatmentColors[type]}`}>
                {type}: {count as number}
              </span>
            ))}
          </div>
        </div>
        
        {treatments.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {treatments.map((treatment: any) => (
              <div key={treatment.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {treatmentIcons[treatment.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">{treatment.description}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${treatmentColors[treatment.type]}`}>
                            {treatment.type}
                          </span>
                        </div>
                        {treatment.medication && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Medication: {treatment.medication}
                            {treatment.dosage && ` - ${treatment.dosage}`}
                          </p>
                        )}
                        {treatment.veterinarian && (
                          <p className="text-sm text-gray-500">
                            Administered by: {treatment.veterinarian}
                          </p>
                        )}
                        {treatment.notes && (
                          <p className="text-sm text-gray-500 mt-2">{treatment.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(treatment.treatmentDate)}
                        </p>
                        {treatment.cost && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            K{Number(treatment.cost).toFixed(2)}
                          </p>
                        )}
                        {treatment.nextDueDate && (
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            Next: {formatDateShort(treatment.nextDueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-gray-500">
            No treatment records found. Add a treatment to start tracking health history.
          </div>
        )}
      </div>
    </div>
  );
}
