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
  MapPin,
  Tag,
  Clock,
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

const statusConfig: Record<string, { bg: string; dot: string; label: string }> = {
  ACTIVE: { bg: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200', dot: 'bg-green-500', label: 'Active' },
  SOLD: { bg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200', dot: 'bg-blue-500', label: 'Sold' },
  DECEASED: { bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200', dot: 'bg-gray-400', label: 'Deceased' },
  TRANSFERRED: { bg: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200', dot: 'bg-yellow-500', label: 'Transferred' },
  SLAUGHTERED: { bg: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200', dot: 'bg-red-500', label: 'Slaughtered' },
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
      <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// Section Card Component
function SectionCard({ 
  title, 
  icon, 
  action, 
  children, 
  className = '' 
}: { 
  title: string; 
  icon: React.ReactNode; 
  action?: React.ReactNode; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      <div className="p-4 sm:p-5">
        {children}
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
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    );
  }

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const adjustedMonths = months < 0 ? 12 + months : months;
    const adjustedYears = months < 0 ? years - 1 : years;
    
    if (adjustedYears > 0) {
      return `${adjustedYears}y ${adjustedMonths}m`;
    }
    return `${adjustedMonths} months`;
  };

  const maxWeight = animal.weightHistory.length > 0 
    ? Math.max(...animal.weightHistory.map((w: any) => w.weight)) 
    : 0;

  const status = statusConfig[animal.status] || statusConfig.ACTIVE;

  return (
    <div className="space-y-5">
      {/* Page Header - Mobile Optimized */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/livestock"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
            {animal.tag}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/livestock/${id}/edit`}
            className="inline-flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Animal Profile Card - Redesigned */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Coloured header strip */}
        <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-400" />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Photo/Avatar */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-900/20 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shrink-0 mx-auto sm:mx-0">
              {animalTypeEmoji[animal.type]}
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {animal.name || animal.tag}
                </h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
              </div>
              {animal.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1 justify-center sm:justify-start">
                  <Tag className="w-3.5 h-3.5" /> {animal.tag}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {animal.breed} {animal.type.charAt(0) + animal.type.slice(1).toLowerCase()} 
                <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>
                <span className={animal.gender === 'FEMALE' ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}>
                  {animal.gender === 'FEMALE' ? '♀ Female' : '♂ Male'}
                </span>
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Age', value: calculateAge(animal.dateOfBirth), icon: <Clock className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Weight', value: `${animal.weight || '-'} kg`, icon: <Scale className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Color', value: animal.color || '-', icon: <MapPin className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Acquired', value: animal.acquisitionMethod, icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      {stat.icon}
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">{stat.label}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {animal.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {animal.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions - Mobile Prominent */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button 
          onClick={() => setShowWeightModal(true)}
          className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 transition-all active:scale-[0.97] group"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Scale className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-left">Record Weight</span>
        </button>
        <button 
          onClick={() => setShowTreatmentModal(true)}
          className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800 transition-all active:scale-[0.97] group"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <Syringe className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 text-left">Treatment</span>
        </button>
        <button 
          onClick={() => setShowProductionModal(true)}
          className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/10 hover:border-cyan-200 dark:hover:border-cyan-800 transition-all active:scale-[0.97] group"
        >
          <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0">
            <Milk className="w-4.5 h-4.5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 text-left">Production</span>
        </button>
        {animal.gender === 'FEMALE' ? (
          <button 
            onClick={() => setShowBreedingModal(true)}
            className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-200 dark:hover:border-pink-800 transition-all active:scale-[0.97] group"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
              <Baby className="w-4.5 h-4.5 text-pink-600 dark:text-pink-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-700 dark:group-hover:text-pink-300 text-left">Breeding</span>
          </button>
        ) : (
          <Link 
            href={`/dashboard/livestock/${id}/edit`}
            className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.97] group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
              <Edit className="w-4.5 h-4.5 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left">Edit Info</span>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Lineage */}
        <SectionCard 
          title="Lineage" 
          icon={<Baby className="w-4 h-4 text-pink-500" />}
        >
          
          <div className="space-y-3">
            {animal.mother && (
              <Link href={`/dashboard/livestock/${animal.mother.tag}`} className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🐄</span>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Mother</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {animal.mother.tag} {animal.mother.name && `"${animal.mother.name}"`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-pink-500 transition-colors" />
              </Link>
            )}
            
            {animal.father && (
              <Link href={`/dashboard/livestock/${animal.father.tag}`} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🐂</span>
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Father</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {animal.father.tag} {animal.father.name && `"${animal.father.name}"`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            )}
            
            {!animal.mother && !animal.father && animal.offspring.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No lineage records</p>
            )}

            {animal.offspring.length > 0 && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium mb-2">
                  Offspring ({animal.offspring.length})
                </p>
                <div className="space-y-2">
                  {animal.offspring.map((child: any) => (
                    <Link 
                      key={child.tag} 
                      href={`/dashboard/livestock/${child.tag}`}
                      className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🐾</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {child.tag} {child.name && `"${child.name}"`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Born: {formatDate(child.dateOfBirth)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Treatments */}
        <SectionCard
          title="Recent Treatments"
          icon={<Syringe className="w-4 h-4 text-blue-500" />}
          action={
            <button 
              onClick={() => setShowTreatmentModal(true)}
              className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          }
        >
          
          <div className="space-y-2.5">
            {animal.treatments && animal.treatments.length > 0 ? (
              animal.treatments.map((treatment: any) => (
                <div key={treatment.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <div className="mt-0.5 w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                    {treatmentIcons[treatment.type] || <Heart className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {treatment.description || treatment.type}
                      </p>
                      <p className="text-[10px] text-gray-500 shrink-0 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                        {formatDateShort(treatment.treatmentDate)}
                      </p>
                    </div>
                    {treatment.medication && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {treatment.medication} {treatment.dosage && `• ${treatment.dosage}`}
                      </p>
                    )}
                    {treatment.nextDueDate && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Next: {formatDateShort(treatment.nextDueDate)}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Syringe className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No treatments recorded</p>
                <button 
                  onClick={() => setShowTreatmentModal(true)}
                  className="text-xs text-green-600 dark:text-green-400 mt-1 hover:underline"
                >
                  Add first treatment
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Production Records */}
      {(animal.type === 'COW' || animal.type === 'GOAT' || animal.type === 'CHICKEN' || animal.type === 'SHEEP') && (
        <SectionCard
          title="Production Records"
          icon={animal.type === 'CHICKEN' 
            ? <Egg className="w-4 h-4 text-yellow-500" /> 
            : <Milk className="w-4 h-4 text-blue-500" />
          }
          action={
            <button 
              onClick={() => setShowProductionModal(true)}
              className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Record
            </button>
          }
        >
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {animal.productions && animal.productions.length > 0 ? (
              animal.productions.slice(0, 6).map((prod: any) => (
                <div key={prod.id} className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 shadow-sm">
                    {productionIcons[prod.type] || <Activity className="w-4 h-4 text-gray-500" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {prod.quantity} {prod.unit}
                    </p>
                    <p className="text-[10px] text-gray-500">{formatDateShort(prod.recordedAt)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-6">
                <Milk className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No production records</p>
                <button 
                  onClick={() => setShowProductionModal(true)}
                  className="text-xs text-green-600 dark:text-green-400 mt-1 hover:underline"
                >
                  Record first production
                </button>
              </div>
            )}
          </div>
          
          {animal.productions && animal.productions.length > 6 && (
            <Link 
              href={`/dashboard/livestock/${id}/production`}
              className="mt-4 text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-1"
            >
              View all production records <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </SectionCard>
      )}

      {/* Breeding Records */}
      {animal.gender === 'FEMALE' && (
        <SectionCard
          title="Breeding Records"
          icon={<Baby className="w-4 h-4 text-pink-500" />}
          action={
            <button 
              onClick={() => setShowBreedingModal(true)}
              className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          }
        >
          
          <div className="space-y-2.5">
            {animal.breeding && animal.breeding.length > 0 ? (
              animal.breeding.map((record: any) => (
                <div key={record.id} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0">
                    <Baby className="w-4 h-4 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {formatDateShort(record.breedingDate)}
                        </p>
                        {record.expectedDue && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            Due: {formatDateShort(record.expectedDue)}
                          </p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${breedingStatusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </div>
                    {record.actualBirthDate && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Birth: {formatDateShort(record.actualBirthDate)} — {record.offspring} offspring
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{record.notes}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Baby className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No breeding records</p>
                <button 
                  onClick={() => setShowBreedingModal(true)}
                  className="text-xs text-green-600 dark:text-green-400 mt-1 hover:underline"
                >
                  Add first breeding record
                </button>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Weight History Chart */}
      <SectionCard
        title="Weight History"
        icon={<TrendingUp className="w-4 h-4 text-green-500" />}
        action={
          <button 
            onClick={() => setShowWeightModal(true)}
            className="text-xs text-green-600 hover:text-green-700 dark:text-green-400 font-medium flex items-center gap-1 px-2 py-1 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Record
          </button>
        }
      >
        
        {animal.weightHistory && animal.weightHistory.length > 0 ? (
          <div className="h-48 flex items-end justify-between gap-1.5 sm:gap-2">
            {animal.weightHistory.map((record: any, index: number) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <div className="w-full flex justify-center" style={{ height: '140px' }}>
                  <div 
                    className="w-full max-w-[40px] bg-gradient-to-t from-green-600 to-green-400 rounded-t-md hover:from-green-700 hover:to-green-500 transition-colors cursor-pointer relative group"
                    style={{ height: `${maxWeight > 0 ? (record.weight / maxWeight) * 100 : 0}%`, minHeight: '4px' }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {record.weight}kg
                    </div>
                  </div>
                </div>
                <div className="text-center w-full">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{record.weight}<span className="text-[10px] font-normal text-gray-500">kg</span></p>
                  <p className="text-[10px] text-gray-500 truncate">
                    {formatMonth(record.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Scale className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No weight records yet</p>
            <button 
              onClick={() => setShowWeightModal(true)}
              className="text-xs text-green-600 dark:text-green-400 mt-1 hover:underline"
            >
              Record first weight
            </button>
          </div>
        )}
      </SectionCard>

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
