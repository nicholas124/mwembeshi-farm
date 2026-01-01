'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Fuel
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

const equipmentEmoji: Record<string, string> = {
  TRACTOR: '🚜',
  PUMP: '💧',
  SPRAYER: '🔫',
  GENERATOR: '⚡',
  PLOUGH: '🔧',
  CHAINSAW: '🪚',
  VEHICLE: '🚗',
  OTHER: '🔩',
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  IN_USE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const conditionColors: Record<string, string> = {
  EXCELLENT: 'text-green-600',
  GOOD: 'text-green-500',
  FAIR: 'text-yellow-500',
  NEEDS_REPAIR: 'text-orange-500',
  POOR: 'text-red-500',
};

export default function EquipmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipment() {
      try {
        const response = await fetch('/api/equipment');
        const data = await response.json();
        if (data.success) {
          setEquipment(data.data.map((e: any) => ({
            ...e,
            type: e.category,
            nextMaintenance: e.maintenances?.[0]?.nextMaintenanceDate
          })));
        }
      } catch (error) {
        console.error('Failed to fetch equipment:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEquipment();
  }, []);

  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const needsMaintenanceSoon = equipment.filter(e => {
    const nextMaint = new Date(e.nextMaintenance);
    const now = new Date();
    const daysUntil = Math.ceil((nextMaint.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntil <= 30;
  }).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Equipment
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage farm equipment and track maintenance
          </p>
        </div>
        <Link
          href="/dashboard/equipment/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Equipment
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Equipment</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{equipment.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
          <p className="text-2xl font-bold text-green-600">{equipment.filter(e => e.status === 'AVAILABLE').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">In Use</p>
          <p className="text-2xl font-bold text-blue-600">{equipment.filter(e => e.status === 'IN_USE').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance Due</p>
            {needsMaintenanceSoon > 0 && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
          </div>
          <p className="text-2xl font-bold text-yellow-600">{needsMaintenanceSoon}</p>
        </div>
      </div>

      {/* Maintenance Alerts */}
      {needsMaintenanceSoon > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Maintenance Alerts</h3>
          </div>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {needsMaintenanceSoon} equipment item(s) need maintenance within the next 30 days
          </p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, type, or serial number..."
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
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
        </div>
      </div>

      {/* Equipment List */}
      <div className="space-y-3">
        {filteredEquipment.map((item) => {
          const nextMaint = new Date(item.nextMaintenance);
          const now = new Date();
          const daysUntilMaint = Math.ceil((nextMaint.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const maintenanceOverdue = daysUntilMaint < 0;

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center text-2xl">
                    {equipmentEmoji[item.type] || '🔩'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                        {item.status.replace('_', ' ')}
                      </span>
                      {maintenanceOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.type} • {item.model} • {item.serialNumber}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                      <span className={`flex items-center gap-1 ${conditionColors[item.condition]}`}>
                        <Wrench className="w-3 h-3" />
                        {item.condition.replace('_', ' ')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Next service: {formatDateShort(item.nextMaintenance)}
                        {daysUntilMaint <= 30 && daysUntilMaint > 0 && (
                          <span className="text-yellow-600 ml-1">({daysUntilMaint}d)</span>
                        )}
                      </span>
                      {item.fuelLevel !== null && (
                        <span className="flex items-center gap-1">
                          <Fuel className="w-3 h-3" />
                          {item.fuelLevel}% fuel
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        📍 {item.location}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/equipment/${item.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/equipment/${item.id}/edit`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No equipment found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedStatus
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first equipment'}
          </p>
          <Link
            href="/dashboard/equipment/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </Link>
        </div>
      )}
    </div>
  );
}
