'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  Heart,
  Scale,
  Baby,
  Activity,
  Syringe,
  ChevronRight,
  Package,
  Calendar,
} from 'lucide-react';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200',
  SOLD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200',
  DECEASED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  TRANSFERRED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-200',
  SLAUGHTERED: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
};

const statusDotColors: Record<string, string> = {
  ACTIVE: 'bg-green-500',
  SOLD: 'bg-blue-500',
  DECEASED: 'bg-gray-400',
  TRANSFERRED: 'bg-yellow-500',
  SLAUGHTERED: 'bg-red-500',
};

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function GoatsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [goats, setGoats] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchGoats() {
      try {
        const response = await fetch('/api/goats');
        const data = await response.json();
        if (data.success) {
          setGoats(data.data);
          setStats(data.stats);
        }
      } catch (error) {
        console.error('Failed to fetch goats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGoats();
  }, []);

  const filteredGoats = goats.filter((goat) => {
    const matchesSearch = 
      goat.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      goat.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = !selectedGender || goat.gender === selectedGender;
    const matchesStatus = !selectedStatus || goat.status === selectedStatus;
    return matchesSearch && matchesGender && matchesStatus;
  });

  const calculateAge = (dob: string) => {
    if (!dob) return '-';
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const adjustedMonths = months < 0 ? 12 + months : months;
    const adjustedYears = months < 0 ? years - 1 : years;
    if (adjustedYears > 0) return `${adjustedYears}y ${adjustedMonths}m`;
    if (adjustedMonths > 0) return `${adjustedMonths}m`;
    return 'Newborn';
  };

  const isKid = (dob: string) => {
    if (!dob) return false;
    const birth = new Date(dob);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return birth > sixMonthsAgo;
  };

  const handleDeleteGoat = async (goatId: string, tag: string) => {
    if (!confirm(`Are you sure you want to remove goat ${tag}? This will mark it as deceased.`)) {
      return;
    }
    try {
      const response = await fetch(`/api/goats/${goatId}`, { method: 'DELETE' });
      if (response.ok) {
        setGoats(goats.map(g => g.id === goatId ? { ...g, status: 'DECEASED' } : g));
      } else {
        alert('Failed to remove goat. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete goat:', error);
      alert('An error occurred.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goat Management</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Loading your herd...</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🐐 Goat Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {stats?.total || 0} active goats in herd
          </p>
        </div>
        <Link
          href="/dashboard/goats/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Goat</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🐐</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.total || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Active</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setSelectedGender(selectedGender === 'MALE' ? '' : 'MALE'); setSelectedStatus(''); }}
          className={`p-4 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${
            selectedGender === 'MALE'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">♂️</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.bucks || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bucks</p>
            </div>
          </div>
        </button>
        <button
          onClick={() => { setSelectedGender(selectedGender === 'FEMALE' ? '' : 'FEMALE'); setSelectedStatus(''); }}
          className={`p-4 rounded-xl border-2 transition-all active:scale-[0.97] text-left ${
            selectedGender === 'FEMALE'
              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/30'
              : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-pink-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">♀️</span>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.does || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Does</p>
            </div>
          </div>
        </button>
        <div className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤰</span>
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.pregnant || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pregnant</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Baby className="w-6 h-6 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.kids || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Kids (&lt;6m)</p>
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <Syringe className="w-6 h-6 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.recentTreatments || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Treatments (30d)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/dashboard/goats/breeding"
          className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
        >
          <Heart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-purple-900 dark:text-purple-200">Breeding</p>
            <p className="text-xs text-purple-600 dark:text-purple-400">Manage breeding program</p>
          </div>
          <ChevronRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/dashboard/goats/health"
          className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
        >
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">Health</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Vaccinations & treatments</p>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/dashboard/goats/inventory"
          className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors group"
        >
          <Package className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Inventory</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Feed, medicine & supplies</p>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/dashboard/goats/daily-tracker"
          className="flex items-center gap-3 p-4 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors group"
        >
          <Calendar className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">Daily Tracker</p>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">Worker activity calendar</p>
          </div>
          <ChevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="/dashboard/goats/new"
          className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
        >
          <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-900 dark:text-green-200">Register</p>
            <p className="text-xs text-green-600 dark:text-green-400">Add a new goat</p>
          </div>
          <ChevronRight className="w-4 h-4 text-green-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tag, name, or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setSelectedStatus('')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !selectedStatus
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All ({goats.length})
          </button>
          {['ACTIVE', 'SOLD', 'DECEASED', 'TRANSFERRED'].map(status => {
            const count = goats.filter(g => g.status === status && (!selectedGender || g.gender === selectedGender)).length;
            return (
              <button
                key={status}
                onClick={() => setSelectedStatus(selectedStatus === status ? '' : status)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  selectedStatus === status
                    ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[status]}`} />
                {status.charAt(0) + status.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      {(searchQuery || selectedGender || selectedStatus) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredGoats.length} of {goats.length} goats
          <button 
            onClick={() => { setSearchQuery(''); setSelectedGender(''); setSelectedStatus(''); }}
            className="ml-2 text-green-600 dark:text-green-400 hover:underline"
          >
            Clear filters
          </button>
        </p>
      )}

      {/* Goats List */}
      <div className="space-y-0">
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Goat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Breed</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sex</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Age</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Weight</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Info</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredGoats.map((goat) => (
                <tr key={goat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/goats/${goat.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-xl shrink-0">
                        {isKid(goat.dateOfBirth) ? '🐐' : '🐐'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {goat.tag}
                        </p>
                        {goat.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{goat.name}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    {goat.breed || '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                      goat.gender === 'FEMALE' 
                        ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {goat.gender === 'FEMALE' ? '♀ Doe' : '♂ Buck'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    <div>
                      {calculateAge(goat.dateOfBirth)}
                      {isKid(goat.dateOfBirth) && (
                        <span className="ml-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                          Kid
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    {goat.weight ? `${goat.weight} kg` : '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${statusColors[goat.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[goat.status]}`} />
                      {goat.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {goat.breedingRecords?.length > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                          Pregnant
                        </span>
                      )}
                      {goat._count?.offspringAsMother > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {goat._count.offspringAsMother} offspring
                        </span>
                      )}
                      {goat._count?.treatments > 0 && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {goat._count.treatments} tx
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/goats/${goat.id}`}
                        className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/goats/${goat.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteGoat(goat.id, goat.tag)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-2">
          {filteredGoats.map((goat) => (
            <div 
              key={goat.id} 
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all active:scale-[0.99]"
            >
              <Link href={`/dashboard/goats/${goat.id}`} className="flex items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-2xl shrink-0">
                  🐐
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{goat.tag}</p>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${statusColors[goat.status]}`}>
                      <span className={`w-1 h-1 rounded-full ${statusDotColors[goat.status]}`} />
                      {goat.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {goat.name ? `${goat.name} · ` : ''}{goat.breed || 'Unknown breed'} · {goat.gender === 'FEMALE' ? 'Doe' : 'Buck'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    {goat.dateOfBirth && <span>{calculateAge(goat.dateOfBirth)}</span>}
                    {goat.weight && <span>{goat.weight} kg</span>}
                    {isKid(goat.dateOfBirth) && (
                      <span className="font-medium text-orange-600 dark:text-orange-400">Kid</span>
                    )}
                    {goat.breedingRecords?.length > 0 && (
                      <span className="font-medium text-purple-600 dark:text-purple-400">Pregnant</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredGoats.length === 0 && !isLoading && (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <span className="text-6xl mb-4 block">🐐</span>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {goats.length === 0 ? 'No goats yet' : 'No goats match your filters'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {goats.length === 0 
              ? 'Start building your herd by registering your first goat.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {goats.length === 0 && (
            <Link
              href="/dashboard/goats/new"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Register First Goat
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
