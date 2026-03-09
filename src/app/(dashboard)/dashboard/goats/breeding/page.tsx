'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Plus, Heart, Baby, Calendar, Search, X } from 'lucide-react';

interface BreedingRecord {
  id: string;
  breedingDate: string;
  expectedDueDate: string | null;
  actualBirthDate: string | null;
  numberOfOffspring: number | null;
  notes: string | null;
  sire: { id: string; tag: string; name: string | null; breed: string };
  dam: { id: string; tag: string; name: string | null; breed: string };
}

interface GoatOption {
  id: string;
  tag: string;
  name: string | null;
  breed: string;
  dateOfBirth: string | null;
}

interface BreedingStats {
  totalPregnant: number;
  totalBred: number;
  totalBirthed: number;
}

export default function GoatBreedingPage() {
  const [records, setRecords] = useState<BreedingRecord[]>([]);
  const [stats, setStats] = useState<BreedingStats>({ totalPregnant: 0, totalBred: 0, totalBirthed: 0 });
  const [availableBucks, setAvailableBucks] = useState<GoatOption[]>([]);
  const [availableDoes, setAvailableDoes] = useState<GoatOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pregnant' | 'birthed'>('all');
  const [formData, setFormData] = useState({
    sireId: '',
    damId: '',
    breedingDate: new Date().toISOString().split('T')[0],
    expectedDueDate: '',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/goats/breeding');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRecords(data.data || []);
      setStats(data.stats || { totalPregnant: 0, totalBred: 0, totalBirthed: 0 });
      setAvailableBucks(data.availableBucks || []);
      setAvailableDoes(data.availableDoes || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBreedingDateChange = (date: string) => {
    const d = new Date(date);
    const due = new Date(d);
    due.setDate(due.getDate() + 150); // ~5 months gestation for goats
    setFormData(prev => ({
      ...prev,
      breedingDate: date,
      expectedDueDate: due.toISOString().split('T')[0],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/goats/breeding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          breedingDate: new Date(formData.breedingDate).toISOString(),
          expectedDueDate: formData.expectedDueDate ? new Date(formData.expectedDueDate).toISOString() : null,
        }),
      });
      if (response.ok) {
        setShowModal(false);
        setFormData({ sireId: '', damId: '', breedingDate: new Date().toISOString().split('T')[0], expectedDueDate: '', notes: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record breeding');
      }
    } catch { alert('Failed to record breeding'); }
  };

  const filteredRecords = records.filter(r => {
    if (filter === 'pregnant') return r.expectedDueDate && !r.actualBirthDate;
    if (filter === 'birthed') return !!r.actualBirthDate;
    return true;
  }).filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return r.sire.tag.toLowerCase().includes(q) || r.dam.tag.toLowerCase().includes(q) ||
      r.sire.name?.toLowerCase().includes(q) || r.dam.name?.toLowerCase().includes(q);
  });

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm";

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="grid grid-cols-3 gap-3"><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" /><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" /><div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" /></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/goats" className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" /> Breeding Program
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Manage goat breeding & kidding</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 bg-pink-600 text-white px-4 py-2.5 rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Record Breeding
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <button onClick={() => setFilter(f => f === 'pregnant' ? 'all' : 'pregnant')} className={`bg-white dark:bg-gray-800 rounded-xl border p-3 sm:p-4 text-left transition-all ${filter === 'pregnant' ? 'border-pink-500 ring-1 ring-pink-500' : 'border-gray-200 dark:border-gray-700'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">🤰 Pregnant</div>
          <div className="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">{stats.totalPregnant}</div>
        </button>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">💑 Total Bred</div>
          <div className="text-lg sm:text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.totalBred}</div>
        </div>
        <button onClick={() => setFilter(f => f === 'birthed' ? 'all' : 'birthed')} className={`bg-white dark:bg-gray-800 rounded-xl border p-3 sm:p-4 text-left transition-all ${filter === 'birthed' ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200 dark:border-gray-700'}`}>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">🍼 Birthed</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalBirthed}</div>
        </button>
      </div>

      {/* Available Bucks & Does */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">♂ Available Bucks</div>
          {availableBucks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No bucks available</p>
          ) : (
            <div className="space-y-1.5">
              {availableBucks.slice(0, 5).map(buck => (
                <Link key={buck.id} href={`/dashboard/goats/${buck.id}`} className="flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">{buck.tag}</span>
                  {buck.name && <span className="text-gray-500 dark:text-gray-400">({buck.name})</span>}
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto">{buck.breed}</span>
                </Link>
              ))}
              {availableBucks.length > 5 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">+{availableBucks.length - 5} more</p>
              )}
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wider mb-2">♀ Available Does</div>
          {availableDoes.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No does available for breeding</p>
          ) : (
            <div className="space-y-1.5">
              {availableDoes.slice(0, 5).map(doe => (
                <Link key={doe.id} href={`/dashboard/goats/${doe.id}`} className="flex items-center gap-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 p-1.5 rounded-lg transition-colors">
                  <span className="font-medium text-gray-900 dark:text-white">{doe.tag}</span>
                  {doe.name && <span className="text-gray-500 dark:text-gray-400">({doe.name})</span>}
                  <span className="text-gray-400 dark:text-gray-500 text-xs ml-auto">{doe.breed}</span>
                </Link>
              ))}
              {availableDoes.length > 5 && (
                <p className="text-xs text-gray-400 dark:text-gray-500 pt-1">+{availableDoes.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search breeding records..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {(filter !== 'all' || search) && (
          <button onClick={() => { setFilter('all'); setSearch(''); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Records */}
      <div className="space-y-3">
        {filteredRecords.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No breeding records</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Start by recording a breeding event</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-1.5 bg-pink-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-pink-700 transition-colors">
              <Plus className="w-4 h-4" /> Record Breeding
            </button>
          </div>
        ) : (
          filteredRecords.map(record => {
            const isPregnant = record.expectedDueDate && !record.actualBirthDate;
            const hasBirthed = !!record.actualBirthDate;
            const daysUntilDue = record.expectedDueDate && !record.actualBirthDate
              ? Math.ceil((new Date(record.expectedDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isPregnant && (
                      <span className="px-2 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs font-medium rounded-full">
                        🤰 Pregnant
                      </span>
                    )}
                    {hasBirthed && (
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                        🍼 Birthed {record.numberOfOffspring ? `(${record.numberOfOffspring})` : ''}
                      </span>
                    )}
                    {!isPregnant && !hasBirthed && (
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full">
                        Bred
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(record.breedingDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <Link href={`/dashboard/goats/${record.dam.id}`} className="flex-1 bg-pink-50 dark:bg-pink-900/10 rounded-lg p-2.5 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-colors">
                    <div className="text-[10px] uppercase tracking-wider text-pink-500 dark:text-pink-400 font-medium">♀ Dam</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{record.dam.tag}</div>
                    {record.dam.name && <div className="text-xs text-gray-500 dark:text-gray-400">{record.dam.name}</div>}
                  </Link>
                  <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                  <Link href={`/dashboard/goats/${record.sire.id}`} className="flex-1 bg-blue-50 dark:bg-blue-900/10 rounded-lg p-2.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-colors">
                    <div className="text-[10px] uppercase tracking-wider text-blue-500 dark:text-blue-400 font-medium">♂ Sire</div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{record.sire.tag}</div>
                    {record.sire.name && <div className="text-xs text-gray-500 dark:text-gray-400">{record.sire.name}</div>}
                  </Link>
                </div>

                {daysUntilDue !== null && (
                  <div className={`text-xs font-medium mt-2 px-2 py-1 rounded-lg inline-block ${
                    daysUntilDue < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                    daysUntilDue <= 14 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                    {daysUntilDue < 0
                      ? `⚠️ ${Math.abs(daysUntilDue)} days overdue`
                      : daysUntilDue === 0
                      ? '🔔 Due today!'
                      : `📅 Due in ${daysUntilDue} days (${new Date(record.expectedDueDate!).toLocaleDateString()})`
                    }
                  </div>
                )}

                {record.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">{record.notes}</p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> Record Breeding
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">♂ Sire (Buck) *</label>
                <select value={formData.sireId} onChange={e => setFormData(p => ({ ...p, sireId: e.target.value }))} required className={inputClasses}>
                  <option value="">Select buck</option>
                  {availableBucks.map(b => (
                    <option key={b.id} value={b.id}>{b.tag} {b.name ? `(${b.name})` : ''} - {b.breed}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">♀ Dam (Doe) *</label>
                <select value={formData.damId} onChange={e => setFormData(p => ({ ...p, damId: e.target.value }))} required className={inputClasses}>
                  <option value="">Select doe</option>
                  {availableDoes.map(d => (
                    <option key={d.id} value={d.id}>{d.tag} {d.name ? `(${d.name})` : ''} - {d.breed}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Breeding Date *</label>
                <input type="date" value={formData.breedingDate} onChange={e => handleBreedingDateChange(e.target.value)} required className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Expected Due Date</label>
                <input type="date" value={formData.expectedDueDate} onChange={e => setFormData(p => ({ ...p, expectedDueDate: e.target.value }))} className={inputClasses} />
                <p className="text-xs text-gray-400 mt-1">Auto-calculated: ~150 days (5 months) gestation</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} rows={2} className={inputClasses} placeholder="Breeding notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cancel
                </button>
                <button type="submit" disabled={!formData.sireId || !formData.damId} className="flex-1 bg-pink-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-pink-700 disabled:opacity-50 transition-colors">
                  Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
