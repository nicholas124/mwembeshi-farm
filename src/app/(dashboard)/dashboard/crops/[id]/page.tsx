'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Droplets,
  Sun,
  TrendingUp,
  Leaf,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { formatDate, formatDateShort } from '@/lib/utils';

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

const statusColors: Record<string, { bg: string; text: string }> = {
  PLANNED: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-800 dark:text-gray-200' },
  PLANTED: { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
  GROWING: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
  READY_TO_HARVEST: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
  HARVESTED: { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
};

const healthColors: Record<string, string> = {
  EXCELLENT: 'text-green-600',
  GOOD: 'text-green-500',
  FAIR: 'text-yellow-500',
  POOR: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

const activityIcons: Record<string, React.ReactNode> = {
  PLANTING: <Leaf className="w-4 h-4 text-green-500" />,
  FERTILIZER: <TrendingUp className="w-4 h-4 text-blue-500" />,
  WEEDING: <Sun className="w-4 h-4 text-yellow-500" />,
  SPRAYING: <Droplets className="w-4 h-4 text-purple-500" />,
  IRRIGATION: <Droplets className="w-4 h-4 text-blue-400" />,
  HARVEST: <CheckCircle className="w-4 h-4 text-green-600" />,
};

export default function CropDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [crop, setCrop] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showIrrigationModal, setShowIrrigationModal] = useState(false);
  const [showFertilizerModal, setShowFertilizerModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const id = params.id;

  useEffect(() => {
    async function fetchCrop() {
      try {
        const response = await fetch(`/api/crops/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch crop');
        }
        const result = await response.json();
        // API returns { success: true, data: planting }
        const data = result.data || result;
        
        // Transform the data to match UI expectations
        const transformed = {
          ...data,
          name: data.name || `${data.cropType?.name || 'Crop'} - ${data.field?.name || 'Field'}`,
          crop: data.cropType?.name?.toUpperCase() || 'OTHER',
          variety: data.variety || data.cropType?.variety || 'Unknown',
          fieldSize: Number(data.areaPlanted || data.field?.size || 0),
          fieldLocation: data.field?.name || data.field?.location || 'Unknown',
          expenses: data.inputs?.map((input: any) => ({
            id: input.id,
            item: input.inputType,
            quantity: `${input.quantity} ${input.unit}`,
            amount: Number(input.cost || 0),
            date: input.dateApplied,
          })) || [],
          growthProgress: data.status === 'HARVESTED' ? 100 : data.status === 'READY_TO_HARVEST' ? 90 : 50,
          estimatedYield: Number(data.expectedYield || 0),
        };
        
        setCrop(transformed);
      } catch (error) {
        console.error('Error fetching crop:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCrop();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this planting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/crops/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/crops');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete planting');
      }
    } catch (error) {
      alert('Failed to delete planting. Please try again.');
    }
  };

  if (isLoading || !crop) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totalExpenses = crop.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const daysToHarvest = crop.expectedHarvest ? Math.ceil((new Date(crop.expectedHarvest).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const daysSincePlanting = crop.plantingDate ? Math.ceil((new Date().getTime() - new Date(crop.plantingDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/crops"
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Crop Details
            </h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/crops/${id}/edit`}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Crop Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Icon */}
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center text-5xl shrink-0">
            {cropEmoji[crop.crop] || '🌱'}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {crop.name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[crop.status]?.bg || 'bg-gray-100'} ${statusColors[crop.status]?.text || 'text-gray-800'}`}>
                {crop.status.replace('_', ' ')}
              </span>
              {crop.health && (
                <span className={`flex items-center gap-1 text-sm font-medium ${healthColors[crop.health] || 'text-gray-500'}`}>
                  <Leaf className="w-4 h-4" />
                  {crop.health}
                </span>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {crop.cropType?.name || crop.crop} • {crop.variety} • {crop.fieldSize} hectares
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Planted</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatDate(crop.plantingDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Expected Harvest</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {crop.expectedHarvest ? formatDate(crop.expectedHarvest) : 'TBD'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Days to Harvest</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {daysToHarvest > 0 ? `${daysToHarvest} days` : crop.status === 'HARVESTED' ? 'Completed' : 'Ready!'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Est. Yield</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {crop.estimatedYield > 0 ? `${crop.estimatedYield.toLocaleString()} kg` : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Growth Progress Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Growth Progress</span>
            <span className="text-sm font-medium text-green-600">{crop.growthProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${crop.growthProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{daysSincePlanting} days since planting</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">{crop.fieldLocation || crop.field?.location || 'N/A'}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Droplets className="w-4 h-4 text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Irrigation</p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {crop.irrigationType?.replace('_', ' ') || crop.field?.irrigation?.replace('_', ' ') || 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <Leaf className="w-4 h-4 text-green-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Seeds Used</p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {crop.seedQuantity ? `${Number(crop.seedQuantity)} ${crop.seedUnit || 'kg'}` : 'N/A'}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Investment</p>
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">K{totalExpenses.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Activities Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Activity Log
            </h3>
            <button 
              onClick={() => setShowActivityModal(true)}
              className="text-sm text-green-600 hover:underline"
            >
              + Add Activity
            </button>
          </div>
          
          <div className="space-y-3">
            {crop.activities.map((activity: any, index: number) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    {activityIcons[activity.type] || <Leaf className="w-4 h-4 text-gray-500" />}
                  </div>
                  {index < crop.activities.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDateShort(activity.date)}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">By {activity.worker}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Expenses
            </h3>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="text-sm text-green-600 hover:underline"
            >
              + Add Expense
            </button>
          </div>
          
          <div className="space-y-2">
            {crop.expenses.map((expense: any) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{expense.item}</p>
                  <p className="text-xs text-gray-500">{expense.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">K{expense.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {formatDateShort(expense.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="font-medium text-gray-700 dark:text-gray-300">Total Investment</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">K{totalExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Seed Source</p>
            <p className="text-gray-900 dark:text-white">{crop.seedSource}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Soil Type</p>
            <p className="text-gray-900 dark:text-white">{crop.soilType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Season</p>
            <p className="text-gray-900 dark:text-white">{crop.season.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Fertilizer</p>
            <p className="text-gray-900 dark:text-white">{crop.fertilizer}</p>
          </div>
        </div>
        {crop.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
            <p className="text-gray-900 dark:text-white">{crop.notes}</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowIrrigationModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Droplets className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Log Irrigation</span>
          </button>
          <button 
            onClick={() => setShowFertilizerModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Add Fertilizer</span>
          </button>
          <button 
            onClick={() => setShowIssueModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <AlertCircle className="w-5 h-5 mx-auto mb-1 text-yellow-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Report Issue</span>
          </button>
          <button 
            onClick={() => setShowHarvestModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Harvest</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <IrrigationModal 
        isOpen={showIrrigationModal}
        onClose={() => setShowIrrigationModal(false)}
        plantingId={id}
        onSuccess={() => {
          setShowIrrigationModal(false);
          // Refresh crop data
          window.location.reload();
        }}
      />

      <FertilizerModal 
        isOpen={showFertilizerModal}
        onClose={() => setShowFertilizerModal(false)}
        plantingId={id}
        onSuccess={() => {
          setShowFertilizerModal(false);
          window.location.reload();
        }}
      />

      <IssueModal 
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        plantingId={id}
        onSuccess={() => {
          setShowIssueModal(false);
          window.location.reload();
        }}
      />

      <HarvestModal 
        isOpen={showHarvestModal}
        onClose={() => setShowHarvestModal(false)}
        plantingId={id}
        cropName={crop?.name || ''}
        onSuccess={() => {
          setShowHarvestModal(false);
          window.location.reload();
        }}
      />

      <ExpenseModal 
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        plantingId={id}
        onSuccess={() => {
          setShowExpenseModal(false);
          window.location.reload();
        }}
      />

      <ActivityModal 
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        plantingId={id}
        onSuccess={() => {
          setShowActivityModal(false);
          window.location.reload();
        }}
      />
    </div>
  );
}

// Modal Components
function IrrigationModal({ isOpen, onClose, plantingId, onSuccess }: any) {
  const [formData, setFormData] = useState({
    activityDate: new Date().toISOString().split('T')[0],
    duration: '',
    amount: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crops/${plantingId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'IRRIGATION',
          description: `Irrigation - ${formData.duration} minutes, ${formData.amount}L water`,
          activityDate: formData.activityDate,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to log irrigation');
      }
    } catch (error) {
      alert('Failed to log irrigation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Log Irrigation</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.activityDate}
              onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Water Amount (liters)
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FertilizerModal({ isOpen, onClose, plantingId, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'NPK',
    quantity: '',
    unit: 'kg',
    cost: '',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Add to inputs (fertilizer record)
      const inputResponse = await fetch(`/api/crops/${plantingId}/inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          appliedDate: formData.appliedDate,
          notes: formData.notes,
        }),
      });

      // Also add to activities
      const activityResponse = await fetch(`/api/crops/${plantingId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FERTILIZING',
          description: `Applied ${formData.name} - ${formData.quantity}${formData.unit}`,
          activityDate: formData.appliedDate,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          notes: formData.notes,
        }),
      });

      if (inputResponse.ok && activityResponse.ok) {
        onSuccess();
      } else {
        alert('Failed to add fertilizer');
      }
    } catch (error) {
      alert('Failed to add fertilizer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Fertilizer</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fertilizer Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., NPK 10-10-10, Urea"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="NPK">NPK</option>
              <option value="UREA">Urea</option>
              <option value="ORGANIC">Organic</option>
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="liters">liters</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cost (K)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Applied *
            </label>
            <input
              type="date"
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Fertilizer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function IssueModal({ isOpen, onClose, plantingId, onSuccess }: any) {
  const [formData, setFormData] = useState({
    issueType: 'PEST',
    severity: 'MEDIUM',
    description: '',
    actionTaken: '',
    reportedDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crops/${plantingId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'INSPECTION',
          description: `Issue Reported: ${formData.issueType} - ${formData.severity} severity`,
          activityDate: formData.reportedDate,
          notes: `${formData.description}\n\nAction Taken: ${formData.actionTaken}`,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to report issue');
      }
    } catch (error) {
      alert('Failed to report issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Report Issue</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Issue Type *
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="PEST">Pest Infestation</option>
              <option value="DISEASE">Disease</option>
              <option value="WEED">Weed Problem</option>
              <option value="DROUGHT">Drought Stress</option>
              <option value="FLOOD">Flooding</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Severity *
            </label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              rows={3}
              placeholder="Describe the issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Action Taken
            </label>
            <textarea
              value={formData.actionTaken}
              onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
              rows={2}
              placeholder="What actions were taken or planned..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.reportedDate}
              onChange={(e) => setFormData({ ...formData, reportedDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Reporting...' : 'Report Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HarvestModal({ isOpen, onClose, plantingId, cropName, onSuccess }: any) {
  const [formData, setFormData] = useState({
    harvestDate: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'kg',
    quality: 'GOOD',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create harvest record
      const harvestResponse = await fetch(`/api/crops/${plantingId}/harvests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestDate: formData.harvestDate,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          quality: formData.quality,
          notes: formData.notes,
        }),
      });

      // Add harvest activity
      const activityResponse = await fetch(`/api/crops/${plantingId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'HARVEST',
          description: `Harvested ${formData.quantity}${formData.unit} - ${formData.quality} quality`,
          activityDate: formData.harvestDate,
          notes: formData.notes,
        }),
      });

      // Update planting status
      await fetch(`/api/crops/${plantingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'COMPLETED',
          actualHarvest: formData.harvestDate,
        }),
      });

      if (harvestResponse.ok && activityResponse.ok) {
        onSuccess();
      } else {
        alert('Failed to record harvest');
      }
    } catch (error) {
      alert('Failed to record harvest');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Record Harvest</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{cropName}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Harvest Date *
            </label>
            <input
              type="date"
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="tons">tons</option>
                <option value="crates">crates</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Quality *
            </label>
            <select
              value={formData.quality}
              onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any observations or notes about the harvest..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Harvest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ExpenseModal({ isOpen, onClose, plantingId, onSuccess }: any) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'FERTILIZER',
    quantity: '',
    unit: 'kg',
    cost: '',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crops/${plantingId}/inputs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          appliedDate: formData.appliedDate,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to add expense');
      }
    } catch (error) {
      alert('Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Expense / Input</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g., NPK Fertilizer, Herbicide"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="FERTILIZER">Fertilizer</option>
              <option value="PESTICIDE">Pesticide</option>
              <option value="HERBICIDE">Herbicide</option>
              <option value="FUNGICIDE">Fungicide</option>
              <option value="SEED">Seed</option>
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0.01"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="bags">bags</option>
                <option value="liters">liters</option>
                <option value="packets">packets</option>
                <option value="units">units</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cost (K) *
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="Enter cost"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.appliedDate}
              onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ActivityModal({ isOpen, onClose, plantingId, onSuccess }: any) {
  const [formData, setFormData] = useState({
    type: 'WEEDING',
    description: '',
    activityDate: new Date().toISOString().split('T')[0],
    cost: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crops/${plantingId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          description: formData.description || `${formData.type.replace('_', ' ')} activity`,
          activityDate: formData.activityDate,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert('Failed to add activity');
      }
    } catch (error) {
      alert('Failed to add activity');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Activity</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Activity Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="LAND_PREP">Land Preparation</option>
              <option value="PLANTING">Planting</option>
              <option value="WEEDING">Weeding</option>
              <option value="FERTILIZING">Fertilizing</option>
              <option value="SPRAYING">Spraying</option>
              <option value="IRRIGATION">Irrigation</option>
              <option value="INSPECTION">Inspection</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="e.g., Applied herbicide to control weeds"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={formData.activityDate}
              onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cost (K)
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              min="0"
              step="0.01"
              placeholder="Labor or material cost (optional)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}