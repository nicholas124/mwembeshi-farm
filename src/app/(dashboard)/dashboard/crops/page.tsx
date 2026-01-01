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
  Trash2,
  Calendar,
  Droplets,
  Sun
} from 'lucide-react';
import { formatDate as formatDateUtil } from '@/lib/utils';

const cropEmoji: Record<string, string> = {
  MAIZE: '🌽',
  VEGETABLES: '🥬',
  GROUNDNUTS: '🥜',
  SOYBEANS: '🫘',
  COTTON: '🌿',
  WHEAT: '🌾',
  SUNFLOWER: '🌻',
  OTHER: '🌱',
};

const statusColors: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  PLANTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  GROWING: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  READY_TO_HARVEST: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARVESTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const healthColors: Record<string, string> = {
  EXCELLENT: 'text-green-600',
  GOOD: 'text-green-500',
  FAIR: 'text-yellow-500',
  POOR: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

export default function CropsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [crops, setCrops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const response = await fetch('/api/crops');
        const data = await response.json();
        if (data.success) {
          setCrops(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch crops:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCrops();
  }, []);

  const filteredCrops = crops.filter((crop) => {
    const cropName = crop.cropType?.name || crop.name || '';
    const cropVariety = crop.cropType?.variety || crop.variety || '';
    const fieldName = crop.field?.name || '';
    
    const matchesSearch = 
      cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cropVariety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fieldName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || crop.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return formatDateUtil(dateString);
  };

  const getDaysUntilHarvest = (harvestDate: string) => {
    const harvest = new Date(harvestDate);
    const now = new Date();
    const days = Math.ceil((harvest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const handleDeleteCrop = async (cropId: string, cropName: string) => {
    if (!confirm(`Are you sure you want to delete "${cropName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/crops/${cropId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCrops(crops.filter(c => c.id !== cropId));
      } else {
        alert('Failed to delete crop. Please try again.');
      }
    } catch (error) {
      console.error('Failed to delete crop:', error);
      alert('An error occurred while deleting the crop.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crops
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your plantings and harvests
          </p>
        </div>
        <Link
          href="/dashboard/crops/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Planting
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Plantings</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{crops.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Area</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{crops.reduce((sum, c) => sum + c.fieldSize, 0).toFixed(1)} ha</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Ready to Harvest</p>
          <p className="text-2xl font-bold text-yellow-600">{crops.filter(c => c.status === 'READY_TO_HARVEST').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Growing</p>
          <p className="text-2xl font-bold text-green-600">{crops.filter(c => c.status === 'GROWING').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, crop, or variety..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Status</option>
            <option value="PLANNED">Planned</option>
            <option value="PLANTED">Planted</option>
            <option value="GROWING">Growing</option>
            <option value="READY_TO_HARVEST">Ready to Harvest</option>
            <option value="HARVESTED">Harvested</option>
          </select>
        </div>
      </div>

      {/* Crops List */}
      <div className="space-y-3">
        {filteredCrops.map((crop) => {
          const daysUntil = crop.expectedHarvest ? getDaysUntilHarvest(crop.expectedHarvest) : 0;
          const cropTypeName = crop.cropType?.name?.toUpperCase() || 'OTHER';
          const displayName = `${crop.cropType?.name || 'Crop'} - ${crop.field?.name || 'Field'}`;
          const variety = crop.cropType?.variety || 'Unknown';
          const areaPlanted = Number(crop.areaPlanted || 0);
          
          return (
            <div
              key={crop.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center text-2xl">
                    {cropEmoji[cropTypeName] || '🌱'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {displayName}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[crop.status]}`}>
                        {crop.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {crop.cropType?.name} • {variety} • {areaPlanted} ha
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Planted: {formatDate(crop.plantingDate)}
                      </span>
                      {crop.status !== 'HARVESTED' && crop.expectedHarvest && (
                        <span className="flex items-center gap-1">
                          <Sun className="w-3 h-3" />
                          {daysUntil > 0 ? `${daysUntil} days to harvest` : 'Ready!'}
                        </span>
                      )}
                      {crop.health && (
                        <span className={`flex items-center gap-1 ${healthColors[crop.health]}`}>
                          <Droplets className="w-3 h-3" />
                          {crop.health}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/crops/${crop.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/crops/${crop.id}/edit`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteCrop(crop.id, displayName)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Delete crop"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCrops.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🌱</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No crops found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedStatus
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first planting'}
          </p>
          <Link
            href="/dashboard/crops/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Planting
          </Link>
        </div>
      )}
    </div>
  );
}
