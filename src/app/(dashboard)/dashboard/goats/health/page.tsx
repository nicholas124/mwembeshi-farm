'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Activity, AlertTriangle, Clock, Shield, Search, X, Plus, Check, CheckCheck } from 'lucide-react';

interface Treatment {
  id: string;
  type: string;
  description: string;
  date: string;
  nextDueDate: string | null;
  cost: number | null;
  notes: string | null;
  animal: { id: string; tag: string; name: string | null; breed: string; gender: string };
}

interface TreatmentStats {
  type: string;
  _count: number;
}

interface UntreatedGoat {
  id: string;
  tag: string;
  name: string | null;
  breed: string;
  gender: string;
  dateOfBirth: string | null;
}

interface ActiveGoat {
  id: string;
  tag: string;
  name: string | null;
  breed: string | null;
  gender: string;
}

export default function GoatHealthPage() {
  const [recentTreatments, setRecentTreatments] = useState<Treatment[]>([]);
  const [overdueTreatments, setOverdueTreatments] = useState<Treatment[]>([]);
  const [upcomingTreatments, setUpcomingTreatments] = useState<Treatment[]>([]);
  const [treatmentStats, setTreatmentStats] = useState<TreatmentStats[]>([]);
  const [untreatedGoats, setUntreatedGoats] = useState<UntreatedGoat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overdue' | 'upcoming' | 'recent' | 'untreated'>('overdue');
  const [search, setSearch] = useState('');

  // Bulk treatment state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [allGoats, setAllGoats] = useState<ActiveGoat[]>([]);
  const [selectedGoatIds, setSelectedGoatIds] = useState<Set<string>>(new Set());
  const [bulkForm, setBulkForm] = useState({
    type: 'VACCINATION', description: '', medication: '', dosage: '',
    cost: '', treatmentDate: '', nextDueDate: '', veterinarian: '', notes: '',
  });
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkGoatSearch, setBulkGoatSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/goats/health');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setRecentTreatments(data.recentTreatments || []);
      setOverdueTreatments(data.overdueTreatments || []);
      setUpcomingTreatments(data.upcomingTreatments || []);
      setTreatmentStats(data.treatmentStats || []);
      setUntreatedGoats(data.untreatedGoats || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch active goats for bulk modal
  const fetchGoats = useCallback(async () => {
    try {
      const res = await fetch('/api/goats?status=ACTIVE&pageSize=200');
      const data = await res.json();
      if (data.success) {
        setAllGoats((data.data || []).map((g: any) => ({
          id: g.id, tag: g.tag, name: g.name, breed: g.breed, gender: g.gender,
        })));
      }
    } catch { /* ignore */ }
  }, []);

  const openBulkModal = () => {
    fetchGoats();
    setBulkForm({
      type: 'VACCINATION', description: '', medication: '', dosage: '',
      cost: '', treatmentDate: '', nextDueDate: '', veterinarian: '', notes: '',
    });
    setSelectedGoatIds(new Set());
    setBulkGoatSearch('');
    setShowBulkModal(true);
  };

  const toggleGoat = (id: string) => {
    setSelectedGoatIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    const filtered = filteredGoats;
    const allSelected = filtered.every(g => selectedGoatIds.has(g.id));
    if (allSelected) {
      setSelectedGoatIds(prev => {
        const next = new Set(prev);
        filtered.forEach(g => next.delete(g.id));
        return next;
      });
    } else {
      setSelectedGoatIds(prev => {
        const next = new Set(prev);
        filtered.forEach(g => next.add(g.id));
        return next;
      });
    }
  };

  const filteredGoats = allGoats.filter(g => {
    if (!bulkGoatSearch) return true;
    const q = bulkGoatSearch.toLowerCase();
    return g.tag.toLowerCase().includes(q) || g.name?.toLowerCase().includes(q) || g.breed?.toLowerCase().includes(q);
  });

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoatIds.size === 0) { alert('Select at least one goat'); return; }
    setBulkSubmitting(true);
    try {
      const res = await fetch('/api/goats/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...bulkForm, animalIds: Array.from(selectedGoatIds) }),
      });
      if (res.ok) {
        const result = await res.json();
        alert(`Treatment applied to ${result.count} goats`);
        setShowBulkModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to apply bulk treatment');
      }
    } catch { alert('Failed to apply bulk treatment'); }
    finally { setBulkSubmitting(false); }
  };

  const treatmentTypeIcon = (type: string) => {
    switch (type) {
      case 'VACCINATION': return '💉';
      case 'DEWORMING': return '💊';
      case 'CHECKUP': return '🩺';
      case 'SURGERY': return '🔪';
      case 'HOOF_TRIM': return '🦶';
      default: return '💊';
    }
  };

  const treatmentTypeLabel = (type: string) =>
    type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const filterBySearch = (items: (Treatment | UntreatedGoat)[]) => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(item => {
      if ('animal' in item) {
        return item.animal.tag.toLowerCase().includes(q) ||
          item.animal.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.type?.toLowerCase().includes(q);
      }
      return item.tag.toLowerCase().includes(q) || item.name?.toLowerCase().includes(q);
    });
  };

  const tabs = [
    { key: 'overdue' as const, label: 'Overdue', count: overdueTreatments.length, icon: AlertTriangle, color: 'text-red-500' },
    { key: 'upcoming' as const, label: 'Upcoming', count: upcomingTreatments.length, icon: Clock, color: 'text-amber-500' },
    { key: 'recent' as const, label: 'Recent', count: recentTreatments.length, icon: Activity, color: 'text-green-500' },
    { key: 'untreated' as const, label: 'Untreated', count: untreatedGoats.length, icon: Shield, color: 'text-gray-500' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5 pb-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="grid grid-cols-4 gap-2"><div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" /><div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" /><div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" /><div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" /></div>
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
              <Activity className="w-6 h-6 text-green-500" /> Herd Health
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Health overview & treatment schedule</p>
          </div>
        </div>
        <button
          onClick={openBulkModal}
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Bulk Treatment</span>
          <span className="sm:hidden">Bulk</span>
        </button>
      </div>

      {/* Treatment Stats */}
      {treatmentStats.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Treatment Summary (All Time)</div>
          <div className="flex flex-wrap gap-3">
            {treatmentStats.map(stat => (
              <div key={stat.type} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span>{treatmentTypeIcon(stat.type)}</span>
                <span className="text-xs text-gray-600 dark:text-gray-300">{treatmentTypeLabel(stat.type)}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{stat._count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.key ? tab.color : ''}`} />
            <span className="truncate">{tab.label}</span>
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.key
                  ? tab.key === 'overdue' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    tab.key === 'upcoming' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-300'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search goats or treatments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {activeTab === 'untreated' ? (
          filterBySearch(untreatedGoats).length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <Shield className="w-10 h-10 text-green-300 dark:text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">All goats treated</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Every goat has at least one treatment record</p>
            </div>
          ) : (
            (filterBySearch(untreatedGoats) as UntreatedGoat[]).map(goat => (
              <Link key={goat.id} href={`/dashboard/goats/${goat.id}`} className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-sm">
                      {goat.gender === 'MALE' ? '♂' : '♀'}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{goat.tag} {goat.name && `(${goat.name})`}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{goat.breed}</div>
                    </div>
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">No treatments</span>
                </div>
              </Link>
            ))
          )
        ) : (
          (() => {
            const items = activeTab === 'overdue' ? overdueTreatments : activeTab === 'upcoming' ? upcomingTreatments : recentTreatments;
            const filtered = filterBySearch(items) as Treatment[];
            if (filtered.length === 0) {
              const emptyMessages: Record<string, { icon: typeof AlertTriangle; title: string; desc: string }> = {
                overdue: { icon: AlertTriangle, title: 'No overdue treatments', desc: 'All treatments are up to date!' },
                upcoming: { icon: Clock, title: 'No upcoming treatments', desc: 'No treatments scheduled in the next 30 days' },
                recent: { icon: Activity, title: 'No recent treatments', desc: 'No treatments recorded in the last 30 days' },
              };
              const msg = emptyMessages[activeTab];
              return (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                  <msg.icon className={`w-10 h-10 mx-auto mb-3 ${activeTab === 'overdue' ? 'text-green-300 dark:text-green-600' : 'text-gray-300 dark:text-gray-600'}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{msg.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{msg.desc}</p>
                </div>
              );
            }
            return filtered.map(treatment => {
              const daysAgo = Math.ceil((Date.now() - new Date(treatment.date).getTime()) / (1000 * 60 * 60 * 24));
              const daysUntilNext = treatment.nextDueDate
                ? Math.ceil((new Date(treatment.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <Link key={treatment.id} href={`/dashboard/goats/${treatment.animal.id}`} className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="text-xl mt-0.5">{treatmentTypeIcon(treatment.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{treatment.animal.tag}</span>
                        {treatment.animal.name && <span className="text-gray-500 dark:text-gray-400 text-xs">({treatment.animal.name})</span>}
                        <span className="text-gray-400 dark:text-gray-500 text-xs">{treatment.animal.gender === 'MALE' ? '♂' : '♀'}</span>
                      </div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{treatment.description}</div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {activeTab === 'recent' ? `${daysAgo}d ago` : new Date(treatment.date).toLocaleDateString()}
                        </span>
                        {treatment.cost && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">K{treatment.cost.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    {daysUntilNext !== null && (
                      <div className={`text-right`}>
                        <div className={`text-xs font-medium px-2 py-1 rounded-lg ${
                          daysUntilNext < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          daysUntilNext <= 7 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                          {daysUntilNext < 0 ? `${Math.abs(daysUntilNext)}d overdue` :
                           daysUntilNext === 0 ? 'Due today' :
                           `Due in ${daysUntilNext}d`}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            });
          })()
        )}
      </div>

      {/* Bulk Treatment Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg shadow-xl max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Treatment</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Apply a treatment to multiple goats at once</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Goat Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Select Goats * <span className="text-green-600 font-normal">({selectedGoatIds.size} selected)</span>
                  </label>
                  <button type="button" onClick={toggleAll} className="text-xs text-green-600 dark:text-green-400 hover:text-green-700 font-medium flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    {filteredGoats.length > 0 && filteredGoats.every(g => selectedGoatIds.has(g.id)) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search goats..."
                    value={bulkGoatSearch}
                    onChange={e => setBulkGoatSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-xl divide-y divide-gray-100 dark:divide-gray-700/50">
                  {filteredGoats.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-4">No goats found</p>
                  ) : (
                    filteredGoats.map(goat => (
                      <label key={goat.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedGoatIds.has(goat.id)}
                          onChange={() => toggleGoat(goat.id)}
                          className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{goat.tag}</span>
                          {goat.name && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1.5">({goat.name})</span>}
                        </div>
                        <span className={`text-xs ${goat.gender === 'FEMALE' ? 'text-pink-500' : 'text-blue-500'}`}>
                          {goat.gender === 'FEMALE' ? '♀' : '♂'}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Treatment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Treatment Type *</label>
                <select
                  value={bulkForm.type}
                  onChange={e => setBulkForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="VACCINATION">Vaccination</option>
                  <option value="DEWORMING">Deworming</option>
                  <option value="MEDICATION">Medication</option>
                  <option value="CHECKUP">Checkup</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
                <input
                  type="text"
                  required
                  value={bulkForm.description}
                  onChange={e => setBulkForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g. Raksha HS+BQ vaccine"
                />
              </div>

              {/* Medication & Dosage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Medication</label>
                  <input
                    type="text"
                    value={bulkForm.medication}
                    onChange={e => setBulkForm(f => ({ ...f, medication: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Drug name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Dosage</label>
                  <input
                    type="text"
                    value={bulkForm.dosage}
                    onChange={e => setBulkForm(f => ({ ...f, dosage: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. 3ml"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Treatment Date</label>
                  <input
                    type="date"
                    value={bulkForm.treatmentDate}
                    onChange={e => setBulkForm(f => ({ ...f, treatmentDate: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Next Due Date</label>
                  <input
                    type="date"
                    value={bulkForm.nextDueDate}
                    onChange={e => setBulkForm(f => ({ ...f, nextDueDate: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Vet & Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Veterinarian</label>
                  <input
                    type="text"
                    value={bulkForm.veterinarian}
                    onChange={e => setBulkForm(f => ({ ...f, veterinarian: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Vet name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Cost (ZMW)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bulkForm.cost}
                    onChange={e => setBulkForm(f => ({ ...f, cost: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Total cost"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={bulkForm.notes}
                  onChange={e => setBulkForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Optional notes"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={bulkSubmitting || selectedGoatIds.size === 0}
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-medium text-sm disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                {bulkSubmitting ? 'Applying...' : `Apply to ${selectedGoatIds.size} Goat${selectedGoatIds.size !== 1 ? 's' : ''}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
