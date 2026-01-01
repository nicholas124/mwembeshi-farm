'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

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

export default function LivestockPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [animals, setAnimals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    return matchesSearch && matchesType;
  });

  const calculateAge = (dob: string) => {
    const birth = new Date(dob);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) return `${years}y`;
    if (months > 0) return `${months}m`;
    return 'New';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Livestock
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your goats, cows, sheep, and chickens
          </p>
        </div>
        <Link
          href="/dashboard/livestock/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Animal
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by tag, name, or breed..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Types</option>
            <option value="GOAT">Goats</option>
            <option value="COW">Cows</option>
            <option value="SHEEP">Sheep</option>
            <option value="CHICKEN">Chickens</option>
          </select>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4">
        {['GOAT', 'COW', 'SHEEP', 'CHICKEN'].map((type) => {
          const count = animals.filter((a) => a.type === type && a.status === 'ACTIVE').length;
          return (
            <button
              key={type}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedType === type
                  ? 'bg-green-50 border-green-300 dark:bg-green-900/50 dark:border-green-700'
                  : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-lg">{animalTypeEmoji[type]}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Animals Table/Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Animal
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
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
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAnimals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{animalTypeEmoji[animal.type]}</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{animal.tag}</p>
                        {animal.name && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">{animal.name}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {animal.type.toLowerCase()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {animal.breed || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                    {animal.gender.toLowerCase()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {calculateAge(animal.dateOfBirth)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[animal.status]}`}>
                      {animal.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/livestock/${animal.id}`}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/dashboard/livestock/${animal.id}/edit`}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400">
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
        <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredAnimals.map((animal) => (
            <div key={animal.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{animalTypeEmoji[animal.type]}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{animal.tag}</p>
                    {animal.name && (
                      <p className="text-sm text-gray-500 dark:text-gray-400">{animal.name}</p>
                    )}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {animal.breed} • {animal.gender.toLowerCase()} • {calculateAge(animal.dateOfBirth)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[animal.status]}`}>
                    {animal.status}
                  </span>
                  <button className="p-2 text-gray-500">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredAnimals.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No animals found</p>
            <Link
              href="/dashboard/livestock/new"
              className="inline-flex items-center gap-2 mt-4 text-green-600 hover:text-green-700"
            >
              <Plus className="w-4 h-4" />
              Add your first animal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
