'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Heart,
  Scale,
  Beef,
} from 'lucide-react';

const animalTypeEmoji: Record<string, string> = {
  GOAT: '🐐',
  COW: '🐄',
  SHEEP: '🐑',
  CHICKEN: '🐔',
  PIG: '🐷',
  OTHER: '🐾',
};

const animalTypeLabels: Record<string, string> = {
  GOAT: 'Goats',
  COW: 'Cattle',
  SHEEP: 'Sheep',
  CHICKEN: 'Poultry',
  PIG: 'Pigs',
  OTHER: 'Other',
};

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
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

export default function LivestockPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnimals() {
      try {
        const response = await fetch('/api/animals');
        const data = await response.json();
        if (data.success) {
          setAnimals(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch animals:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnimals();
  }, []);

  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = 
      animal.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = !selectedType || animal.type === selectedType;
    const matchesStatus = !selectedStatus || animal.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const totalActive = animals.filter(a => a.status === 'ACTIVE').length;
  const totalAnimals = animals.length;

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

  const handleDeleteAnimal = async (animalId: string, tag: string) => {
    if (!confirm(`Are you sure you want to delete animal ${tag}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/animals/${animalId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAnimals(animals.filter(a => a.id !== animalId));
      } else {
        alert('Failed to delete animal. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete animal:', error);
      alert('An error occurred while deleting the animal.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Livestock</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Loading your animals...</p>
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
            <Beef className="w-7 h-7 text-green-600" />
            Livestock
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {totalActive} active of {totalAnimals} total animals
          </p>
        </div>
        <Link
          href="/dashboard/livestock/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-sm font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Animal</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['GOAT', 'COW', 'SHEEP', 'CHICKEN'].map((type) => {
          const typeAnimals = animals.filter((a) => a.type === type);
          const activeCount = typeAnimals.filter(a => a.status === 'ACTIVE').length;
          const isSelected = selectedType === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(isSelected ? '' : type)}
              className={`relative p-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
                isSelected
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-sm'
                  : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-green-200 dark:hover:border-green-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{animalTypeEmoji[type]}</span>
                <div className="text-left min-w-0">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
                    {activeCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {animalTypeLabels[type]}
                  </p>
                </div>
              </div>
              {typeAnimals.length > activeCount && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 text-left">
                  +{typeAnimals.length - activeCount} inactive
                </p>
              )}
            </button>
          );
        })}
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
            All ({totalAnimals})
          </button>
          {['ACTIVE', 'SOLD', 'DECEASED', 'TRANSFERRED'].map(status => {
            const count = animals.filter(a => a.status === status && (!selectedType || a.type === selectedType)).length;
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
      {(searchQuery || selectedType || selectedStatus) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Showing {filteredAnimals.length} of {totalAnimals} animals
          {(searchQuery || selectedType || selectedStatus) && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedType(''); setSelectedStatus(''); }}
              className="ml-2 text-green-600 dark:text-green-400 hover:underline"
            >
              Clear filters
            </button>
          )}
        </p>
      )}

      {/* Animals List */}
      <div className="space-y-0">
        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Animal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Breed
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Age
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Weight
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAnimals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 group">
                  <td className="px-4 py-3.5">
                    <Link href={`/dashboard/livestock/${animal.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-xl shrink-0">
                        {animalTypeEmoji[animal.type]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {animal.tag}
                        </p>
                        {animal.name && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{animal.name}</p>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    {animal.breed || '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${
                      animal.gender === 'FEMALE' 
                        ? 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' 
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {animal.gender === 'FEMALE' ? '♀' : '♂'} {animal.gender === 'FEMALE' ? 'Female' : 'Male'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    {calculateAge(animal.dateOfBirth)}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300">
                    {animal.weight ? `${animal.weight} kg` : '-'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full ${statusColors[animal.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[animal.status]}`} />
                      {animal.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/dashboard/livestock/${animal.id}`}
                        className="p-2 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/livestock/${animal.id}/edit`}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteAnimal(animal.id, animal.tag)}
                        className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete animal"
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

        {/* Mobile & Tablet Cards */}
        <div className="lg:hidden space-y-2">
          {filteredAnimals.map((animal) => (
            <div 
              key={animal.id} 
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all active:scale-[0.99]"
            >
              <Link
                href={`/dashboard/livestock/${animal.id}`}
                className="flex items-center gap-3 p-4"
              >
                {/* Avatar */}
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-900/20 flex items-center justify-center text-3xl shrink-0">
                  {animalTypeEmoji[animal.type]}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {animal.tag}
                    </p>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded-full ${statusColors[animal.status]}`}>
                      <span className={`w-1 h-1 rounded-full ${statusDotColors[animal.status]}`} />
                      {animal.status}
                    </span>
                  </div>
                  {animal.name && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">&ldquo;{animal.name}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {animal.breed || animal.type.charAt(0) + animal.type.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className={`text-xs ${animal.gender === 'FEMALE' ? 'text-pink-600 dark:text-pink-400' : 'text-blue-600 dark:text-blue-400'}`}>
                      {animal.gender === 'FEMALE' ? '♀ Female' : '♂ Male'}
                    </span>
                    <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {calculateAge(animal.dateOfBirth)}
                    </span>
                  </div>
                  {animal.weight && (
                    <div className="flex items-center gap-1 mt-1">
                      <Scale className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{animal.weight} kg</span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0" />
              </Link>

              {/* Swipe action zone for mobile - tap card to expand */}
              {expandedCard === animal.id && (
                <div className="flex items-center justify-around px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700">
                  <Link
                    href={`/dashboard/livestock/${animal.id}`}
                    className="flex flex-col items-center gap-1 p-2 text-green-600 dark:text-green-400"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-[10px] font-medium">View</span>
                  </Link>
                  <Link
                    href={`/dashboard/livestock/${animal.id}/edit`}
                    className="flex flex-col items-center gap-1 p-2 text-blue-600 dark:text-blue-400"
                  >
                    <Edit className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Edit</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAnimal(animal.id, animal.tag);
                    }}
                    className="flex flex-col items-center gap-1 p-2 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span className="text-[10px] font-medium">Delete</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredAnimals.length === 0 && !isLoading && (
        <div className="text-center py-12 px-4">
          <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🐄</span>
          </div>
          {animals.length === 0 ? (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No animals yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                Start building your herd by adding your first animal. Track health, breeding, and production all in one place.
              </p>
              <Link
                href="/dashboard/livestock/new"
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all active:scale-95 font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Your First Animal
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No matches found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedType(''); setSelectedStatus(''); }}
                className="text-green-600 dark:text-green-400 font-medium text-sm hover:underline"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      )}

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-20">
        <Link
          href="/dashboard/livestock/new"
          className="w-14 h-14 bg-green-600 text-white rounded-full shadow-lg shadow-green-600/30 flex items-center justify-center hover:bg-green-700 transition-all active:scale-90"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>
    </div>
  );
}
