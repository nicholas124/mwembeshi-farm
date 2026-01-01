'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Wrench,
  Calendar,
  DollarSign,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  X,
  PlayCircle,
  User
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const equipmentEmoji: Record<string, string> = {
  VEHICLE: '🚗',
  TRACTOR: '🚜',
  HAND_TOOL: '🔨',
  POWER_TOOL: '🔌',
  IRRIGATION: '💧',
  STORAGE: '📦',
  PROCESSING: '⚙️',
  OTHER: '🔧',
};

const statusColors: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  IN_USE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  BROKEN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  RETIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const conditionColors: Record<string, string> = {
  EXCELLENT: 'text-green-600 dark:text-green-400',
  GOOD: 'text-green-500 dark:text-green-300',
  FAIR: 'text-yellow-500 dark:text-yellow-400',
  POOR: 'text-red-500 dark:text-red-400',
};

export default function EquipmentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [equipment, setEquipment] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const id = params.id;

  async function fetchEquipment() {
    try {
      const response = await fetch(`/api/equipment/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch equipment');
      }
      const result = await response.json();
      setEquipment(result.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEquipment();
    // Fetch users for usage modal
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => setUsers(data.data || []))
      .catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to retire this equipment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/equipment');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to retire equipment');
      }
    } catch (error) {
      alert('Failed to retire equipment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading equipment details...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Equipment not found</p>
          <Link
            href="/dashboard/equipment"
            className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment
          </Link>
        </div>
      </div>
    );
  }

  const totalMaintenanceCost = equipment.maintenances?.reduce(
    (sum: number, m: any) => sum + Number(m.cost || 0),
    0
  ) || 0;

  const totalUsageHours = equipment.usageRecords?.reduce(
    (sum: number, u: any) => sum + Number(u.hoursUsed || 0),
    0
  ) || 0;

  const depreciation = equipment.purchasePrice && equipment.currentValue
    ? Number(equipment.purchasePrice) - Number(equipment.currentValue)
    : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/equipment"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{equipmentEmoji[equipment.category]}</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {equipment.name}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Code: {equipment.code}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/equipment/${id}/edit`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 border border-red-300 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Retire
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowMaintenanceModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Wrench className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Maintenance</span>
          </button>
          <button 
            onClick={() => setShowUsageModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <PlayCircle className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Usage</span>
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[equipment.status]}`}>
          {equipment.status.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${conditionColors[equipment.condition]}`}>
          Condition: {equipment.condition}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Equipment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {equipment.category.replace('_', ' ')}
                </p>
              </div>
              {equipment.brand && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Brand</p>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.brand}</p>
                </div>
              )}
              {equipment.model && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Model</p>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.model}</p>
                </div>
              )}
              {equipment.serialNumber && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Serial Number</p>
                  <p className="font-medium text-gray-900 dark:text-white">{equipment.serialNumber}</p>
                </div>
              )}
              {equipment.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{equipment.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Information */}
          {(equipment.purchasePrice || equipment.currentValue) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Financial Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {equipment.purchasePrice && (
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Purchase Price</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ZMW {Number(equipment.purchasePrice).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                {equipment.currentValue && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Current Value</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ZMW {Number(equipment.currentValue).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                {depreciation !== null && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Depreciation</p>
                    <p className="font-medium text-red-600 dark:text-red-400">
                      -ZMW {depreciation.toFixed(2)}
                    </p>
                  </div>
                )}
              </div>
              {equipment.purchaseDate && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Purchased on {formatDate(equipment.purchaseDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Service Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Service Schedule
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.lastServiceDate && (
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Last Service</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(equipment.lastServiceDate)}
                    </p>
                  </div>
                </div>
              )}
              {equipment.nextServiceDate && (
                <div className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Next Service Due</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(equipment.nextServiceDate)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance History */}
          {equipment.maintenances && equipment.maintenances.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Maintenance History
              </h2>
              <div className="space-y-3">
                {equipment.maintenances.map((maintenance: any) => (
                  <div
                    key={maintenance.id}
                    className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {maintenance.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {maintenance.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDateShort(maintenance.maintenanceDate)}
                          {maintenance.performedBy && ` • ${maintenance.performedBy}`}
                        </p>
                      </div>
                    </div>
                    {maintenance.cost && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap ml-4">
                        ZMW {Number(maintenance.cost).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Records */}
          {equipment.usageRecords && equipment.usageRecords.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Usage
              </h2>
              <div className="space-y-3">
                {equipment.usageRecords.slice(0, 10).map((usage: any) => (
                  <div
                    key={usage.id}
                    className="flex items-start justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{usage.purpose}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {usage.usedBy?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {formatDateShort(usage.checkoutTime)}
                        {usage.returnTime && ` - ${formatDateShort(usage.returnTime)}`}
                      </p>
                    </div>
                    {usage.hoursUsed && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Number(usage.hoursUsed).toFixed(1)}h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {equipment.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {equipment.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Maintenance Cost</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ZMW {totalMaintenanceCost.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Usage Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsageHours.toFixed(1)}h
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Maintenance Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {equipment.maintenances?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Usage Records</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {equipment.usageRecords?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {equipment.status === 'MAINTENANCE' || equipment.status === 'BROKEN' && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-300">
                    Attention Required
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    This equipment is currently {equipment.status.toLowerCase().replace('_', ' ')}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Service Alert */}
          {equipment.nextServiceDate && new Date(equipment.nextServiceDate) < new Date() && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300">
                    Service Overdue
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Service was due on {formatDateShort(equipment.nextServiceDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Maintenance Modal */}
      {showMaintenanceModal && (
        <MaintenanceModal
          equipmentId={id}
          onClose={() => setShowMaintenanceModal(false)}
          onSuccess={() => {
            setShowMaintenanceModal(false);
            fetchEquipment();
          }}
        />
      )}

      {/* Usage Modal */}
      {showUsageModal && (
        <UsageModal
          equipmentId={id}
          users={users}
          onClose={() => setShowUsageModal(false)}
          onSuccess={() => {
            setShowUsageModal(false);
            fetchEquipment();
          }}
        />
      )}
    </div>
  );
}

// Maintenance Modal Component
function MaintenanceModal({ equipmentId, onClose, onSuccess }: { equipmentId: string; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'PREVENTIVE',
    description: '',
    performedBy: '',
    cost: '',
    parts: '',
    maintenanceDate: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/equipment/${equipmentId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record maintenance');
      }
    } catch (error) {
      alert('Failed to record maintenance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Maintenance</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="PREVENTIVE">Preventive</option>
                <option value="REPAIR">Repair</option>
                <option value="INSPECTION">Inspection</option>
                <option value="REPLACEMENT">Replacement</option>
                <option value="CLEANING">Cleaning</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={(e) => setFormData({ ...formData, maintenanceDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Performed By
              </label>
              <input
                type="text"
                value={formData.performedBy}
                onChange={(e) => setFormData({ ...formData, performedBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cost (ZMW)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Parts Replaced
            </label>
            <input
              type="text"
              value={formData.parts}
              onChange={(e) => setFormData({ ...formData, parts: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Next Service Due
            </label>
            <input
              type="date"
              value={formData.nextDueDate}
              onChange={(e) => setFormData({ ...formData, nextDueDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              {isSaving ? 'Recording...' : 'Record Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Usage Modal Component
function UsageModal({ equipmentId, users, onClose, onSuccess }: { equipmentId: string; users: any[]; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    usedById: '',
    purpose: '',
    checkoutTime: new Date().toISOString().slice(0, 16),
    returnTime: '',
    hoursUsed: '',
    fuelUsed: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/equipment/${equipmentId}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record usage');
      }
    } catch (error) {
      alert('Failed to record usage');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Equipment Usage</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Used By <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.usedById}
              onChange={(e) => setFormData({ ...formData, usedById: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select worker...</option>
              {users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.position}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Purpose <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Field plowing, Transport, Spraying"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Checkout Time
              </label>
              <input
                type="datetime-local"
                value={formData.checkoutTime}
                onChange={(e) => setFormData({ ...formData, checkoutTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Return Time
              </label>
              <input
                type="datetime-local"
                value={formData.returnTime}
                onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hours Used
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.hoursUsed}
                onChange={(e) => setFormData({ ...formData, hoursUsed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fuel Used (Liters)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.fuelUsed}
                onChange={(e) => setFormData({ ...formData, fuelUsed: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              {isSaving ? 'Recording...' : 'Record Usage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}