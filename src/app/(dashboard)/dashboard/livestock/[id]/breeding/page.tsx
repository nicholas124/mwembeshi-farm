'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Baby, Calendar, Heart, AlertCircle } from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const breedingStatusColors: Record<string, string> = {
  BRED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  PREGNANT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  BIRTHED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

const breedingStatusIcons: Record<string, React.ReactNode> = {
  BRED: <Heart className="w-4 h-4" />,
  PREGNANT: <Baby className="w-4 h-4" />,
  BIRTHED: <Baby className="w-4 h-4" />,
  FAILED: <AlertCircle className="w-4 h-4" />,
};

export default function BreedingHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [animal, setAnimal] = useState<any>(null);
  const [breeding, setBreeding] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [animalRes, breedingRes] = await Promise.all([
          fetch(`/api/animals/${id}`),
          fetch(`/api/animals/${id}/breeding`),
        ]);

        if (animalRes.ok) {
          const animalData = await animalRes.json();
          setAnimal(animalData.data || animalData);
        }

        if (breedingRes.ok) {
          const breedingData = await breedingRes.json();
          setBreeding(breedingData.data || []);
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

  // Calculate statistics
  const totalOffspring = breeding.reduce((sum, b) => sum + (b.offspring || 0), 0);
  const successfulBreedings = breeding.filter(b => b.status === 'BIRTHED').length;
  const pregnantNow = breeding.filter(b => b.status === 'PREGNANT').length;
  const failedBreedings = breeding.filter(b => b.status === 'FAILED').length;

  // Check if any breeding is currently pregnant with expected due date
  const currentPregnancy = breeding.find(b => b.status === 'PREGNANT' && b.expectedDue);

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
              Breeding Records
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
          Add Breeding Record
        </Link>
      </div>

      {/* Current Pregnancy Alert */}
      {currentPregnancy && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-5">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Baby className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">
                Currently Pregnant
              </h3>
              <p className="text-purple-700 dark:text-purple-300">
                Expected due date: <strong>{formatDate(currentPregnancy.expectedDue)}</strong>
              </p>
              {currentPregnancy.male && (
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  Sire: {currentPregnancy.male.tag} {currentPregnancy.male.name && `"${currentPregnancy.male.name}"`}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <Baby className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Offspring</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalOffspring}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Heart className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{successfulBreedings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pregnant</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pregnantNow}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Failed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{failedBreedings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breeding Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Breeding History</h3>
        </div>
        
        {breeding.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {breeding.map((record: any) => (
              <div key={record.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${breedingStatusColors[record.status]}`}>
                    {breedingStatusIcons[record.status]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Breeding: {formatDate(record.breedingDate)}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${breedingStatusColors[record.status]}`}>
                            {record.status}
                          </span>
                        </div>
                        
                        {record.male && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Sire: <Link href={`/dashboard/livestock/${record.male.id}`} className="text-green-600 hover:underline">
                              {record.male.tag} {record.male.name && `"${record.male.name}"`}
                            </Link>
                            {record.male.breed && ` (${record.male.breed})`}
                          </p>
                        )}
                        
                        {record.expectedDue && (
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            Expected: {formatDate(record.expectedDue)}
                          </p>
                        )}
                        
                        {record.actualBirthDate && (
                          <p className="text-sm text-green-600 dark:text-green-400">
                            Birth: {formatDate(record.actualBirthDate)} - {record.offspring} offspring
                          </p>
                        )}
                        
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2">{record.notes}</p>
                        )}
                      </div>
                      
                      {record.status === 'BIRTHED' && record.offspring > 0 && (
                        <div className="text-right shrink-0">
                          <div className="bg-green-100 dark:bg-green-900/40 px-3 py-2 rounded-lg">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {record.offspring}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              offspring
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center text-gray-500">
            No breeding records found. Add a breeding record to start tracking reproductive history.
          </div>
        )}
      </div>
    </div>
  );
}
