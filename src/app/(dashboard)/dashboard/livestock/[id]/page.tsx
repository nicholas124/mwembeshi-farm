'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Scale,
  Heart,
  Syringe,
  TrendingUp,
  Baby,
  X,
  Milk,
  Egg,
  Activity,
  Plus,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useEffect, useState, use } from 'react';
import { formatDate, formatDateShort, formatMonth } from '@/lib/utils';

const animalTypeEmoji: Record<string, string> = {
  GOAT: '🐐',
  COW: '🐄',
  SHEEP: '🐑',
  CHICKEN: '🐔',
  PIG: '🐷',
  OTHER: '🐾',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  SOLD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  DECEASED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  TRANSFERRED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  SLAUGHTERED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const treatmentIcons: Record<string, React.ReactNode> = {
  VACCINATION: <Syringe className="w-4 h-4 text-blue-500" />,
  DEWORMING: <Heart className="w-4 h-4 text-purple-500" />,
  MEDICATION: <Heart className="w-4 h-4 text-red-500" />,
  SURGERY: <Activity className="w-4 h-4 text-orange-500" />,
  CHECKUP: <Activity className="w-4 h-4 text-green-500" />,
  INJURY: <AlertCircle className="w-4 h-4 text-red-500" />,
  OTHER: <Heart className="w-4 h-4 text-gray-500" />,
};

const productionIcons: Record<string, React.ReactNode> = {
  MILK: <Milk className="w-4 h-4 text-blue-500" />,
  EGGS: <Egg className="w-4 h-4 text-yellow-500" />,
  WOOL: <Activity className="w-4 h-4 text-gray-500" />,
  OTHER: <Activity className="w-4 h-4 text-gray-500" />,
};

const breedingStatusColors: Record<string, string> = {
  BRED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  PREGNANT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  BIRTHED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

// Modal Component
function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function AnimalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [animal, setAnimal] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [maleAnimals, setMaleAnimals] = useState<any[]>([]);
  
  // Modal states
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);
  
  // Form states
  const [weightForm, setWeightForm] = useState({ weight: '', recordedAt: '', notes: '' });
  const [treatmentForm, setTreatmentForm] = useState({
    type: 'VACCINATION',
    description: '',
    medication: '',
    dosage: '',
    cost: '',
    treatmentDate: '',
    nextDueDate: '',
    veterinarian: '',
    notes: '',
  });
  const [productionForm, setProductionForm] = useState({
    type: 'MILK',
    quantity: '',
    unit: 'liters',
    recordedAt: '',
    notes: '',
  });
  const [breedingForm, setBreedingForm] = useState({
    maleId: '',
    breedingDate: '',
    expectedDue: '',
    status: 'BRED',
    notes: '',
  });
  
  const [submitting, setSubmitting] = useState(false);

  // Fetch animal and male animals for breeding
  useEffect(() => {
    async function fetchAnimal() {
      try {
        const response = await fetch(`/api/animals/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch animal');
        }
        const result = await response.json();
        const data = result.data || result;
        
        // Transform the data to match UI expectations
        const transformed = {
          ...data,
          offspring: [...(data.offspringAsMother || []), ...(data.offspringAsFather || [])],
          weightHistory: (data.weights || []).map((w: any) => ({
            id: w.id,
            date: w.recordedAt,
            weight: Number(w.weight),
            notes: w.notes,
          })),
          productions: data.productions || [],
          breeding: data.breeding || [],
        };
        
        setAnimal(transformed);
      } catch (error) {
        console.error('Error fetching animal:', error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchMaleAnimals() {
      try {
        const response = await fetch('/api/animals?gender=MALE&status=ACTIVE');
        if (response.ok) {
          const result = await response.json();
          setMaleAnimals(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching male animals:', error);
      }
    }

    fetchAnimal();
    fetchMaleAnimals();
  }, [id]);

  const refreshData = async () => {
    const response = await fetch(`/api/animals/${id}`);
    if (response.ok) {
      const result = await response.json();
      const data = result.data || result;
      const transformed = {
        ...data,
        offspring: [...(data.offspringAsMother || []), ...(data.offspringAsFather || [])],
        weightHistory: (data.weights || []).map((w: any) => ({
          id: w.id,
          date: w.recordedAt,
          weight: Number(w.weight),
          notes: w.notes,
        })),
        productions: data.productions || [],
        breeding: data.breeding || [],
      };
      setAnimal(transformed);
    }
  };

  // Form submission handlers
  const handleWeightSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${id}/weights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(weightForm),
      });
      if (response.ok) {
        setShowWeightModal(false);
        setWeightForm({ weight: '', recordedAt: '', notes: '' });
        refreshData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add weight record');
      }
    } catch (error) {
      alert('Failed to add weight record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${id}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentForm),
      });
      if (response.ok) {
        setShowTreatmentModal(false);
        setTreatmentForm({
          type: 'VACCINATION',
          description: '',
          medication: '',
          dosage: '',
          cost: '',
          treatmentDate: '',
          nextDueDate: '',
          veterinarian: '',
          notes: '',
        });
        refreshData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add treatment record');
      }
    } catch (error) {
      alert('Failed to add treatment record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${id}/production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productionForm),
      });
      if (response.ok) {
        setShowProductionModal(false);
        setProductionForm({ type: 'MILK', quantity: '', unit: 'liters', recordedAt: '', notes: '' });
        refreshData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add production record');
      }
    } catch (error) {
      alert('Failed to add production record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBreedingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`/api/animals/${id}/breeding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(breedingForm),
      });
      if (response.ok) {
        setShowBreedingModal(false);
        setBreedingForm({ maleId: '', breedingDate: '', expectedDue: '', status: 'BRED', notes: '' });
        refreshData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add breeding record');
      }
    } catch (error) {
      alert('Failed to add breeding record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this animal? This will mark it as deceased.')) {
      return;
    }

    try {
      const response = await fetch(`/api/animals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/livestock');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete animal');
      }
    } catch (error) {
      alert('Failed to delete animal. Please try again.');
    }
  };

  if (isLoading || !animal) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) {
      if (months < 0) return `${years - 1} years, ${12 + months} months`;
      return `${years} years, ${months} months`;
    }
    return `${months} months`;
  };

  const maxWeight = Math.max(...animal.weightHistory.map((w: any) => w.weight));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/livestock"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Animal Details
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/livestock/${id}/edit`}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Animal Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Photo/Avatar */}
          <div className="w-32 h-32 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center text-6xl shrink-0">
            {animalTypeEmoji[animal.type]}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {animal.tag}
              </h2>
              {animal.name && (
                <span className="text-xl text-gray-600 dark:text-gray-400">&quot;{animal.name}&quot;</span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[animal.status]}`}>
                {animal.status}
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {animal.breed} {animal.type.charAt(0) + animal.type.slice(1).toLowerCase()} • {animal.gender === 'FEMALE' ? 'Female' : 'Male'}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Age</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {calculateAge(animal.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Weight</p>
                <p className="font-semibold text-gray-900 dark:text-white">{animal.weight} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Color</p>
                <p className="font-semibold text-gray-900 dark:text-white">{animal.color}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Acquired</p>
                <p className="font-semibold text-gray-900 dark:text-white">{animal.acquisitionMethod}</p>
              </div>
            </div>
          </div>
        </div>
        
        {animal.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Notes:</span> {animal.notes}
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lineage */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Baby className="w-5 h-5 text-pink-500" />
            Lineage
          </h3>
          
          <div className="space-y-3">
            {animal.mother && (
              <div className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Mother</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {animal.mother.tag} {animal.mother.name && `"${animal.mother.name}"`}
                  </p>
                </div>
                <Link href={`/dashboard/livestock/${animal.mother.tag}`} className="text-sm text-green-600 hover:underline">
                  View
                </Link>
              </div>
            )}
            
            {animal.father && (
              <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Father</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {animal.father.tag} {animal.father.name && `"${animal.father.name}"`}
                  </p>
                </div>
                <Link href={`/dashboard/livestock/${animal.father.tag}`} className="text-sm text-green-600 hover:underline">
                  View
                </Link>
              </div>
            )}
            
            {animal.offspring.length > 0 && (
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-2">Offspring ({animal.offspring.length})</p>
                <div className="space-y-2">
                  {animal.offspring.map((child: any) => (
                    <div key={child.tag} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {child.tag} {child.name && `"${child.name}"`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Born: {formatDate(child.dateOfBirth)}
                        </p>
                      </div>
                      <Link href={`/dashboard/livestock/${child.tag}`} className="text-xs text-green-600 hover:underline">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Treatments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Syringe className="w-5 h-5 text-blue-500" />
              Recent Treatments
            </h3>
            <button 
              onClick={() => setShowTreatmentModal(true)}
              className="text-sm text-green-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          
          <div className="space-y-3">
            {animal.treatments && animal.treatments.length > 0 ? (
              animal.treatments.map((treatment: any) => (
                <div key={treatment.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="mt-0.5">
                    {treatmentIcons[treatment.type] || <Heart className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {treatment.description || treatment.type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateShort(treatment.treatmentDate)}
                      </p>
                    </div>
                    {treatment.medication && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {treatment.medication} {treatment.dosage && `- ${treatment.dosage}`}
                      </p>
                    )}
                    {treatment.notes && (
                      <p className="text-xs text-gray-500 mt-1">{treatment.notes}</p>
                    )}
                    {treatment.nextDueDate && (
                      <p className="text-xs text-blue-600 mt-1">
                        Next due: {formatDateShort(treatment.nextDueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No treatments recorded</p>
            )}
          </div>
        </div>
      </div>

      {/* Production Records (for milk/egg producing animals) */}
      {(animal.type === 'COW' || animal.type === 'GOAT' || animal.type === 'CHICKEN' || animal.type === 'SHEEP') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {animal.type === 'CHICKEN' ? (
                <Egg className="w-5 h-5 text-yellow-500" />
              ) : (
                <Milk className="w-5 h-5 text-blue-500" />
              )}
              Production Records
            </h3>
            <button 
              onClick={() => setShowProductionModal(true)}
              className="text-sm text-green-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Record Production
            </button>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {animal.productions && animal.productions.length > 0 ? (
              animal.productions.slice(0, 6).map((prod: any) => (
                <div key={prod.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  {productionIcons[prod.type] || <Activity className="w-4 h-4 text-gray-500" />}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {prod.quantity} {prod.unit}
                    </p>
                    <p className="text-xs text-gray-500">{formatDateShort(prod.recordedAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 col-span-full text-center py-4">No production records</p>
            )}
          </div>
          
          {animal.productions && animal.productions.length > 6 && (
            <Link 
              href={`/dashboard/livestock/${id}/production`}
              className="mt-4 text-sm text-green-600 hover:underline flex items-center justify-center gap-1"
            >
              View all production records <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Breeding Records (for female animals) */}
      {animal.gender === 'FEMALE' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Breeding Records
            </h3>
            <button 
              onClick={() => setShowBreedingModal(true)}
              className="text-sm text-green-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add Breeding Record
            </button>
          </div>
          
          <div className="space-y-3">
            {animal.breeding && animal.breeding.length > 0 ? (
              animal.breeding.map((record: any) => (
                <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Baby className="w-4 h-4 text-pink-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        Breeding Date: {formatDateShort(record.breedingDate)}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${breedingStatusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </div>
                    {record.expectedDue && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Expected: {formatDateShort(record.expectedDue)}
                      </p>
                    )}
                    {record.actualBirthDate && (
                      <p className="text-xs text-green-600">
                        Birth: {formatDateShort(record.actualBirthDate)} - {record.offspring} offspring
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-1">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No breeding records</p>
            )}
          </div>
        </div>
      )}

      {/* Weight History Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Weight History
          </h3>
          <button 
            onClick={() => setShowWeightModal(true)}
            className="text-sm text-green-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Record Weight
          </button>
        </div>
        
        {animal.weightHistory && animal.weightHistory.length > 0 ? (
          <div className="h-48 flex items-end justify-between gap-2">
            {animal.weightHistory.map((record: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex justify-center" style={{ height: '160px' }}>
                  <div 
                    className="w-8 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                    style={{ height: `${(record.weight / maxWeight) * 100}%` }}
                    title={`${record.weight} kg on ${formatDateShort(record.date)}`}
                  />
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium text-gray-900 dark:text-white">{record.weight}kg</p>
                  <p className="text-xs text-gray-500">
                    {formatMonth(record.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No weight records. Click "Record Weight" to add the first entry.</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowWeightModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Scale className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Weight</span>
          </button>
          <button 
            onClick={() => setShowTreatmentModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Syringe className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Add Treatment</span>
          </button>
          <button 
            onClick={() => setShowProductionModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Milk className="w-5 h-5 mx-auto mb-1 text-cyan-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Production</span>
          </button>
          {animal.gender === 'FEMALE' && (
            <button 
              onClick={() => setShowBreedingModal(true)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              <Baby className="w-5 h-5 mx-auto mb-1 text-pink-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Add Breeding</span>
            </button>
          )}
        </div>
      </div>

      {/* Weight Modal */}
      <Modal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)} title="Record Weight">
        <form onSubmit={handleWeightSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              required
              value={weightForm.weight}
              onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter weight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={weightForm.recordedAt}
              onChange={(e) => setWeightForm({ ...weightForm, recordedAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={weightForm.notes}
              onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowWeightModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Treatment Modal */}
      <Modal isOpen={showTreatmentModal} onClose={() => setShowTreatmentModal(false)} title="Add Treatment">
        <form onSubmit={handleTreatmentSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Treatment Type *
            </label>
            <select
              required
              value={treatmentForm.type}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="VACCINATION">Vaccination</option>
              <option value="DEWORMING">Deworming</option>
              <option value="MEDICATION">Medication</option>
              <option value="SURGERY">Surgery</option>
              <option value="CHECKUP">Checkup</option>
              <option value="INJURY">Injury Treatment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={treatmentForm.description}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Annual vaccination"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medication
              </label>
              <input
                type="text"
                value={treatmentForm.medication}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, medication: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Dosage
              </label>
              <input
                type="text"
                value={treatmentForm.dosage}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, dosage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., 2ml"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Treatment Date
              </label>
              <input
                type="date"
                value={treatmentForm.treatmentDate}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, treatmentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Next Due Date
              </label>
              <input
                type="date"
                value={treatmentForm.nextDueDate}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, nextDueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cost (ZMW)
              </label>
              <input
                type="number"
                step="0.01"
                value={treatmentForm.cost}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Veterinarian
              </label>
              <input
                type="text"
                value={treatmentForm.veterinarian}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, veterinarian: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={treatmentForm.notes}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Additional notes"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowTreatmentModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Production Modal */}
      <Modal isOpen={showProductionModal} onClose={() => setShowProductionModal(false)} title="Record Production">
        <form onSubmit={handleProductionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Production Type *
            </label>
            <select
              required
              value={productionForm.type}
              onChange={(e) => setProductionForm({ ...productionForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="MILK">Milk</option>
              <option value="EGGS">Eggs</option>
              <option value="WOOL">Wool</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={productionForm.quantity}
                onChange={(e) => setProductionForm({ ...productionForm, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Amount"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit *
              </label>
              <select
                required
                value={productionForm.unit}
                onChange={(e) => setProductionForm({ ...productionForm, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="liters">Liters</option>
                <option value="count">Count</option>
                <option value="kg">Kilograms</option>
                <option value="grams">Grams</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={productionForm.recordedAt}
              onChange={(e) => setProductionForm({ ...productionForm, recordedAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={productionForm.notes}
              onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowProductionModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Breeding Modal */}
      <Modal isOpen={showBreedingModal} onClose={() => setShowBreedingModal(false)} title="Add Breeding Record">
        <form onSubmit={handleBreedingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Male Animal
            </label>
            <select
              value={breedingForm.maleId}
              onChange={(e) => setBreedingForm({ ...breedingForm, maleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select male animal</option>
              {maleAnimals
                .filter((m) => m.type === animal.type)
                .map((male) => (
                  <option key={male.id} value={male.id}>
                    {male.tag} {male.name && `- ${male.name}`} ({male.breed})
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Breeding Date *
            </label>
            <input
              type="date"
              required
              value={breedingForm.breedingDate}
              onChange={(e) => setBreedingForm({ ...breedingForm, breedingDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expected Due Date
            </label>
            <input
              type="date"
              value={breedingForm.expectedDue}
              onChange={(e) => setBreedingForm({ ...breedingForm, expectedDue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={breedingForm.status}
              onChange={(e) => setBreedingForm({ ...breedingForm, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="BRED">Bred</option>
              <option value="PREGNANT">Pregnant (Confirmed)</option>
              <option value="BIRTHED">Birthed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={breedingForm.notes}
              onChange={(e) => setBreedingForm({ ...breedingForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBreedingModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
