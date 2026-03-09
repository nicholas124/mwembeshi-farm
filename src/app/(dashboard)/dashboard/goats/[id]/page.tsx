'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Edit, Trash2, Calendar, Scale, Heart, Syringe,
  Baby, X, Milk, Activity, Plus, ChevronRight, AlertCircle,
  Tag, Clock, MapPin, TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

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

const breedingStatusColors: Record<string, string> = {
  BRED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  PREGNANT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  BIRTHED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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

function SectionCard({ title, icon, action, children }: { title: string; icon: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 text-sm">{icon}{title}</h3>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export default function GoatDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const id = params.id;

  const [goat, setGoat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [maleGoats, setMaleGoats] = useState<any[]>([]);

  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showProductionModal, setShowProductionModal] = useState(false);
  const [showBreedingModal, setShowBreedingModal] = useState(false);

  const [weightForm, setWeightForm] = useState({ weight: '', recordedAt: '', notes: '' });
  const [treatmentForm, setTreatmentForm] = useState({
    type: 'VACCINATION', description: '', medication: '', dosage: '',
    cost: '', treatmentDate: '', nextDueDate: '', veterinarian: '', notes: '',
  });
  const [productionForm, setProductionForm] = useState({
    type: 'MILK', quantity: '', unit: 'liters', recordedAt: '', notes: '',
  });
  const [breedingForm, setBreedingForm] = useState({
    maleId: '', breedingDate: '', expectedDue: '', status: 'BRED', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchGoat() {
      try {
        const response = await fetch(`/api/goats/${id}`);
        if (!response.ok) throw new Error('Not found');
        const result = await response.json();
        const data = result.data;
        setGoat({
          ...data,
          offspring: [...(data.offspringAsMother || []), ...(data.offspringAsFather || [])],
        });
      } catch (error) {
        console.error('Error fetching goat:', error);
      } finally {
        setIsLoading(false);
      }
    }

    async function fetchMaleGoats() {
      try {
        const response = await fetch('/api/animals?type=GOAT&gender=MALE&status=ACTIVE');
        if (response.ok) {
          const result = await response.json();
          setMaleGoats(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching bucks:', error);
      }
    }

    fetchGoat();
    fetchMaleGoats();
  }, [id]);

  const refreshData = async () => {
    const response = await fetch(`/api/goats/${id}`);
    if (response.ok) {
      const result = await response.json();
      const data = result.data;
      setGoat({
        ...data,
        offspring: [...(data.offspringAsMother || []), ...(data.offspringAsFather || [])],
      });
    }
  };

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
        const err = await response.json();
        alert(err.error || 'Failed to add weight record');
      }
    } catch { alert('Failed to add weight record'); }
    finally { setSubmitting(false); }
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
        setTreatmentForm({ type: 'VACCINATION', description: '', medication: '', dosage: '', cost: '', treatmentDate: '', nextDueDate: '', veterinarian: '', notes: '' });
        refreshData();
      } else {
        const err = await response.json();
        alert(err.error || 'Failed to add treatment');
      }
    } catch { alert('Failed to add treatment'); }
    finally { setSubmitting(false); }
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
        const err = await response.json();
        alert(err.error || 'Failed to add production record');
      }
    } catch { alert('Failed to add production record'); }
    finally { setSubmitting(false); }
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
        const err = await response.json();
        alert(err.error || 'Failed to add breeding record');
      }
    } catch { alert('Failed to add breeding record'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this goat? This will mark it as deceased.')) return;
    try {
      const response = await fetch(`/api/goats/${id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/goats');
      } else {
        alert('Failed to remove goat');
      }
    } catch { alert('Failed to remove goat'); }
  };

  if (isLoading || !goat) {
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
    if (!dob) return '-';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const adjustedMonths = months < 0 ? 12 + months : months;
    const adjustedYears = months < 0 ? years - 1 : years;
    if (adjustedYears > 0) return `${adjustedYears}y ${adjustedMonths}m`;
    if (adjustedMonths > 0) return `${adjustedMonths} months`;
    return 'Newborn';
  };

  const status = statusConfig[goat.status] || statusConfig.ACTIVE;
  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/goats" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{goat.tag}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/goats/${id}/edit`} className="inline-flex items-center gap-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
            <Edit className="w-4 h-4" /><span className="hidden sm:inline">Edit</span>
          </Link>
          <button onClick={handleDelete} className="inline-flex items-center gap-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
            <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-400" />
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/20 rounded-2xl flex items-center justify-center text-5xl sm:text-6xl shrink-0 mx-auto sm:mx-0">
              🐐
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{goat.name || goat.tag}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />{status.label}
                </span>
              </div>
              {goat.name && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1 justify-center sm:justify-start">
                  <Tag className="w-3.5 h-3.5" /> {goat.tag}
                </p>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {goat.breed || 'Unknown breed'} Goat
                <span className="mx-1.5 text-gray-300 dark:text-gray-600">•</span>
                <span className={goat.gender === 'FEMALE' ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}>
                  {goat.gender === 'FEMALE' ? '♀ Doe' : '♂ Buck'}
                </span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Age', value: calculateAge(goat.dateOfBirth), icon: <Clock className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Weight', value: goat.weight ? `${goat.weight} kg` : '-', icon: <Scale className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Color', value: goat.color || '-', icon: <MapPin className="w-3.5 h-3.5 text-gray-400" /> },
                  { label: 'Acquired', value: goat.acquisitionMethod || '-', icon: <Calendar className="w-3.5 h-3.5 text-gray-400" /> },
                ].map((stat) => (
                  <div key={stat.label} className="bg-gray-50 dark:bg-gray-700/40 rounded-lg p-2.5">
                    <div className="flex items-center gap-1 mb-0.5">
                      {stat.icon}
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">{stat.label}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{stat.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {goat.notes && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">Notes:</span> {goat.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button onClick={() => setShowWeightModal(true)} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 transition-all active:scale-[0.97] group">
          <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0"><Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" /></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-700 text-left">Record Weight</span>
        </button>
        <button onClick={() => setShowTreatmentModal(true)} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 transition-all active:scale-[0.97] group">
          <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0"><Syringe className="w-4 h-4 text-purple-600 dark:text-purple-400" /></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-purple-700 text-left">Treatment</span>
        </button>
        <button onClick={() => setShowProductionModal(true)} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-cyan-50 dark:hover:bg-cyan-900/10 hover:border-cyan-200 transition-all active:scale-[0.97] group">
          <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0"><Milk className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /></div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-cyan-700 text-left">Milk Record</span>
        </button>
        {goat.gender === 'FEMALE' ? (
          <button onClick={() => setShowBreedingModal(true)} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-200 transition-all active:scale-[0.97] group">
            <div className="w-9 h-9 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center shrink-0"><Baby className="w-4 h-4 text-pink-600 dark:text-pink-400" /></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-700 text-left">Breeding</span>
          </button>
        ) : (
          <Link href={`/dashboard/goats/${id}/edit`} className="flex items-center gap-3 p-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-all active:scale-[0.97] group">
            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0"><Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" /></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-left">Edit Info</span>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Lineage */}
        <SectionCard title="Lineage" icon={<Baby className="w-4 h-4 text-pink-500" />}>
          <div className="space-y-3">
            {goat.mother && (
              <Link href={`/dashboard/goats/${goat.mother.id}`} className="flex items-center justify-between p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🐐</span>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Dam (Mother)</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{goat.mother.tag} {goat.mother.name && `"${goat.mother.name}"`}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-pink-500 transition-colors" />
              </Link>
            )}
            {goat.father && (
              <Link href={`/dashboard/goats/${goat.father.id}`} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🐐</span>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-medium">Sire (Father)</p>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{goat.father.tag} {goat.father.name && `"${goat.father.name}"`}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </Link>
            )}
            {!goat.mother && !goat.father && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">No parent records</p>
            )}
          </div>
          {goat.offspring?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-2">Offspring ({goat.offspring.length})</p>
              <div className="space-y-1.5">
                {goat.offspring.map((kid: any) => (
                  <Link key={kid.id} href={`/dashboard/goats/${kid.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">🐐</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{kid.tag} {kid.name && `"${kid.name}"`}</p>
                        <p className="text-[10px] text-gray-400">{kid.gender === 'FEMALE' ? 'Doe' : 'Buck'} • {kid.dateOfBirth ? calculateAge(kid.dateOfBirth) : '-'}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        {/* Weight History */}
        <SectionCard
          title="Weight History"
          icon={<Scale className="w-4 h-4 text-blue-500" />}
          action={<button onClick={() => setShowWeightModal(true)} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>}
        >
          {goat.weightRecords?.length > 0 ? (
            <div className="space-y-2">
              {goat.weightRecords.slice(0, 10).map((record: any) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{Number(record.weight)} kg</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateShort(record.recordedAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No weight records yet</p>
          )}
        </SectionCard>

        {/* Treatments */}
        <SectionCard
          title="Treatments & Health"
          icon={<Syringe className="w-4 h-4 text-purple-500" />}
          action={<button onClick={() => setShowTreatmentModal(true)} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>}
        >
          {goat.treatments?.length > 0 ? (
            <div className="space-y-3">
              {goat.treatments.slice(0, 10).map((treatment: any) => (
                <div key={treatment.id} className="flex items-start gap-3 py-2 border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                  <div className="mt-0.5">{treatmentIcons[treatment.type] || treatmentIcons.OTHER}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900 dark:text-white">{treatment.type}</span>
                      <span className="text-[10px] text-gray-400">{formatDateShort(treatment.treatmentDate)}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{treatment.description}</p>
                    {treatment.medication && <p className="text-[10px] text-gray-400 mt-0.5">💊 {treatment.medication} {treatment.dosage && `- ${treatment.dosage}`}</p>}
                    {treatment.nextDueDate && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">📅 Next due: {formatDateShort(treatment.nextDueDate)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No treatment records yet</p>
          )}
        </SectionCard>

        {/* Breeding Records (Does only) */}
        {goat.gender === 'FEMALE' && (
          <SectionCard
            title="Breeding Records"
            icon={<Heart className="w-4 h-4 text-pink-500" />}
            action={<button onClick={() => setShowBreedingModal(true)} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>}
          >
            {goat.breedingRecords?.length > 0 ? (
              <div className="space-y-3">
                {goat.breedingRecords.map((record: any) => (
                  <div key={record.id} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${breedingStatusColors[record.status]}`}>{record.status}</span>
                      <span className="text-[10px] text-gray-400">{formatDateShort(record.breedingDate)}</span>
                    </div>
                    {record.maleAnimal && (
                      <p className="text-xs text-gray-600 dark:text-gray-400">♂ Buck: {record.maleAnimal.tag} {record.maleAnimal.name && `"${record.maleAnimal.name}"`}</p>
                    )}
                    {record.expectedDue && <p className="text-xs text-gray-500 mt-1">Expected: {formatDate(record.expectedDue)}</p>}
                    {record.actualBirthDate && <p className="text-xs text-green-600 mt-0.5">Born: {formatDate(record.actualBirthDate)} {record.offspring && `(${record.offspring} kids)`}</p>}
                    {record.notes && <p className="text-[10px] text-gray-400 mt-1">{record.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">No breeding records yet</p>
            )}
          </SectionCard>
        )}

        {/* Milk Production */}
        <SectionCard
          title="Milk Production"
          icon={<Milk className="w-4 h-4 text-cyan-500" />}
          action={<button onClick={() => setShowProductionModal(true)} className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Add</button>}
        >
          {goat.productionRecords?.length > 0 ? (
            <div className="space-y-2">
              {goat.productionRecords.map((record: any) => (
                <div key={record.id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                  <div className="flex items-center gap-2">
                    <Milk className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{Number(record.quantity)} {record.unit}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500">{record.type}</span>
                  </div>
                  <span className="text-xs text-gray-400">{formatDateShort(record.recordedAt)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">No production records yet</p>
          )}
        </SectionCard>
      </div>

      {/* Weight Modal */}
      <Modal isOpen={showWeightModal} onClose={() => setShowWeightModal(false)} title="Record Weight">
        <form onSubmit={handleWeightSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg) *</label>
            <input type="number" step="0.1" required value={weightForm.weight} onChange={(e) => setWeightForm({ ...weightForm, weight: e.target.value })} className={inputClasses} placeholder="e.g., 35.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
            <input type="date" value={weightForm.recordedAt} onChange={(e) => setWeightForm({ ...weightForm, recordedAt: e.target.value })} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
            <input type="text" value={weightForm.notes} onChange={(e) => setWeightForm({ ...weightForm, notes: e.target.value })} className={inputClasses} placeholder="Optional notes" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : 'Save Weight'}
          </button>
        </form>
      </Modal>

      {/* Treatment Modal */}
      <Modal isOpen={showTreatmentModal} onClose={() => setShowTreatmentModal(false)} title="Add Treatment">
        <form onSubmit={handleTreatmentSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type *</label>
            <select value={treatmentForm.type} onChange={(e) => setTreatmentForm({ ...treatmentForm, type: e.target.value })} className={inputClasses}>
              <option value="VACCINATION">Vaccination</option>
              <option value="DEWORMING">Deworming</option>
              <option value="MEDICATION">Medication</option>
              <option value="SURGERY">Surgery</option>
              <option value="CHECKUP">Checkup</option>
              <option value="INJURY">Injury</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
            <input type="text" required value={treatmentForm.description} onChange={(e) => setTreatmentForm({ ...treatmentForm, description: e.target.value })} className={inputClasses} placeholder="e.g., PPR Vaccine" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medication</label>
              <input type="text" value={treatmentForm.medication} onChange={(e) => setTreatmentForm({ ...treatmentForm, medication: e.target.value })} className={inputClasses} placeholder="Drug name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dosage</label>
              <input type="text" value={treatmentForm.dosage} onChange={(e) => setTreatmentForm({ ...treatmentForm, dosage: e.target.value })} className={inputClasses} placeholder="e.g., 2ml" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
              <input type="date" value={treatmentForm.treatmentDate} onChange={(e) => setTreatmentForm({ ...treatmentForm, treatmentDate: e.target.value })} className={inputClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Next Due</label>
              <input type="date" value={treatmentForm.nextDueDate} onChange={(e) => setTreatmentForm({ ...treatmentForm, nextDueDate: e.target.value })} className={inputClasses} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Veterinarian</label>
            <input type="text" value={treatmentForm.veterinarian} onChange={(e) => setTreatmentForm({ ...treatmentForm, veterinarian: e.target.value })} className={inputClasses} placeholder="Vet name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cost (ZMW)</label>
            <input type="number" step="0.01" value={treatmentForm.cost} onChange={(e) => setTreatmentForm({ ...treatmentForm, cost: e.target.value })} className={inputClasses} placeholder="0.00" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : 'Save Treatment'}
          </button>
        </form>
      </Modal>

      {/* Production Modal */}
      <Modal isOpen={showProductionModal} onClose={() => setShowProductionModal(false)} title="Record Milk Production">
        <form onSubmit={handleProductionSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Quantity *</label>
            <input type="number" step="0.1" required value={productionForm.quantity} onChange={(e) => setProductionForm({ ...productionForm, quantity: e.target.value })} className={inputClasses} placeholder="e.g., 1.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Unit</label>
            <select value={productionForm.unit} onChange={(e) => setProductionForm({ ...productionForm, unit: e.target.value })} className={inputClasses}>
              <option value="liters">Liters</option>
              <option value="ml">Milliliters</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
            <input type="date" value={productionForm.recordedAt} onChange={(e) => setProductionForm({ ...productionForm, recordedAt: e.target.value })} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
            <input type="text" value={productionForm.notes} onChange={(e) => setProductionForm({ ...productionForm, notes: e.target.value })} className={inputClasses} placeholder="Optional notes" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </Modal>

      {/* Breeding Modal */}
      <Modal isOpen={showBreedingModal} onClose={() => setShowBreedingModal(false)} title="Add Breeding Record">
        <form onSubmit={handleBreedingSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Buck (Sire)</label>
            <select value={breedingForm.maleId} onChange={(e) => setBreedingForm({ ...breedingForm, maleId: e.target.value })} className={inputClasses}>
              <option value="">Select buck</option>
              {maleGoats.map((buck) => (
                <option key={buck.id} value={buck.id}>{buck.tag} {buck.name && `- ${buck.name}`}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Breeding Date *</label>
            <input type="date" required value={breedingForm.breedingDate} onChange={(e) => setBreedingForm({ ...breedingForm, breedingDate: e.target.value })} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expected Due Date</label>
            <input type="date" value={breedingForm.expectedDue} onChange={(e) => setBreedingForm({ ...breedingForm, expectedDue: e.target.value })} className={inputClasses} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
            <select value={breedingForm.status} onChange={(e) => setBreedingForm({ ...breedingForm, status: e.target.value })} className={inputClasses}>
              <option value="BRED">Bred</option>
              <option value="PREGNANT">Pregnant (Confirmed)</option>
              <option value="BIRTHED">Birthed/Kidded</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
            <textarea value={breedingForm.notes} onChange={(e) => setBreedingForm({ ...breedingForm, notes: e.target.value })} rows={2} className={inputClasses} placeholder="Optional notes" />
          </div>
          <button type="submit" disabled={submitting} className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 transition-colors">
            {submitting ? 'Saving...' : 'Save Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
