'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar,
  Trash2
} from 'lucide-react';

const cropTypes = [
  { value: 'MAIZE', label: 'Maize', emoji: '🌽' },
  { value: 'VEGETABLES', label: 'Vegetables', emoji: '🥬' },
  { value: 'GROUNDNUTS', label: 'Groundnuts', emoji: '🥜' },
  { value: 'SOYBEANS', label: 'Soybeans', emoji: '🫘' },
  { value: 'COTTON', label: 'Cotton', emoji: '🌿' },
  { value: 'WHEAT', label: 'Wheat', emoji: '🌾' },
  { value: 'SUNFLOWER', label: 'Sunflower', emoji: '🌻' },
  { value: 'OTHER', label: 'Other', emoji: '🌱' },
];

const statusOptions = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'PLANTED', label: 'Planted' },
  { value: 'GROWING', label: 'Growing' },
  { value: 'READY_TO_HARVEST', label: 'Ready to Harvest' },
  { value: 'HARVESTED', label: 'Harvested' },
  { value: 'FAILED', label: 'Failed' },
];

const healthOptions = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function EditCropPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    crop: '',
    variety: '',
    fieldSize: '',
    fieldLocation: '',
    season: 'RAINY',
    status: 'GROWING',
    health: 'GOOD',
    plantingDate: '',
    expectedHarvest: '',
    seedSource: '',
    seedQuantity: '',
    irrigationType: 'RAIN_FED',
    soilType: '',
    fertilizer: '',
    notes: '',
  });

  useEffect(() => {
    async function loadCrop() {
      try {
        const response = await fetch(`/api/crops/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch crop');
        }
        const result = await response.json();
        const crop = result.data || result;
        
        // Format dates for input fields
        const plantingDate = crop.plantingDate 
          ? new Date(crop.plantingDate).toISOString().split('T')[0]
          : '';
        const expectedHarvest = crop.expectedHarvest 
          ? new Date(crop.expectedHarvest).toISOString().split('T')[0]
          : '';
        
        setFormData({
          name: crop.name || '',
          crop: crop.cropTypeId || crop.crop || '',
          variety: crop.variety || '',
          fieldSize: crop.areaPlanted ? String(crop.areaPlanted) : (crop.fieldSize ? String(crop.fieldSize) : ''),
          fieldLocation: crop.fieldLocation || crop.field?.name || '',
          season: crop.season || 'RAINY',
          status: crop.status || 'GROWING',
          health: crop.health || 'GOOD',
          plantingDate,
          expectedHarvest,
          seedSource: crop.seedSource || '',
          seedQuantity: crop.seedQuantity ? String(crop.seedQuantity) : '',
          irrigationType: crop.irrigationType || 'RAIN_FED',
          soilType: crop.soilType || '',
          fertilizer: crop.fertilizer || '',
          notes: crop.notes || '',
        });
      } catch (error) {
        console.error('Failed to load crop:', error);
        alert('Failed to load crop data');
      } finally {
        setIsLoading(false);
      }
    }
    loadCrop();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/crops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropTypeId: formData.crop, // Map to correct field name
          areaPlanted: parseFloat(formData.fieldSize) || 0, // Map to correct field name
          seedQuantity: parseFloat(formData.seedQuantity) || null,
          plantingDate: formData.plantingDate ? new Date(formData.plantingDate).toISOString() : null,
          expectedHarvest: formData.expectedHarvest ? new Date(formData.expectedHarvest).toISOString() : null,
          status: formData.status,
          season: formData.season,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/crops/${id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update planting');
      }
    } catch (error) {
      alert('Failed to update planting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/crops/${id}`}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Planting
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update crop information
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={handleDelete}
          className="inline-flex items-center gap-2 border border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Crop Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Crop Type</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {cropTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, crop: type.value }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.crop === type.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <span className="text-2xl">{type.emoji}</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status & Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Growth Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Health
              </label>
              <select
                name="health"
                value={formData.health}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {healthOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Planting Details</h2>
          <div className="grid gap-4">
            {/* Field Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field/Planting Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Maize Field A, Tomato Greenhouse"
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Variety */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Variety/Cultivar
              </label>
              <input
                type="text"
                name="variety"
                value={formData.variety}
                onChange={handleChange}
                placeholder="e.g., SC513, Roma, Chalimbana"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Field Size & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Size (hectares) *
                </label>
                <input
                  type="number"
                  name="fieldSize"
                  value={formData.fieldSize}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  step="0.1"
                  required
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Field Location
                </label>
                <input
                  type="text"
                  name="fieldLocation"
                  value={formData.fieldLocation}
                  onChange={handleChange}
                  placeholder="e.g., North Block, Section B"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Important Dates
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Planting Date
              </label>
              <input
                type="date"
                name="plantingDate"
                value={formData.plantingDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expected Harvest
              </label>
              <input
                type="date"
                name="expectedHarvest"
                value={formData.expectedHarvest}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Seeds & Inputs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Seeds & Inputs</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Source
                </label>
                <input
                  type="text"
                  name="seedSource"
                  value={formData.seedSource}
                  onChange={handleChange}
                  placeholder="e.g., Zamseed, Local market"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Quantity (kg)
                </label>
                <input
                  type="number"
                  name="seedQuantity"
                  value={formData.seedQuantity}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  step="0.5"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Irrigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Irrigation Type
              </label>
              <select
                name="irrigationType"
                value={formData.irrigationType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="RAIN_FED">Rain-fed</option>
                <option value="DRIP">Drip Irrigation</option>
                <option value="SPRINKLER">Sprinkler</option>
                <option value="FLOOD">Flood/Furrow</option>
                <option value="CENTER_PIVOT">Center Pivot</option>
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Soil Type
              </label>
              <input
                type="text"
                name="soilType"
                value={formData.soilType}
                onChange={handleChange}
                placeholder="e.g., Sandy loam, Clay"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Fertilizer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fertilizer Applied
              </label>
              <input
                type="text"
                name="fertilizer"
                value={formData.fertilizer}
                onChange={handleChange}
                placeholder="e.g., NPK 10-10-10, Urea"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any additional information about this planting..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Link
            href={`/dashboard/crops/${id}`}
            className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.crop || !formData.name || !formData.fieldSize}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
