'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Calendar,
  Trash2,
  Droplets,
  Sprout,
  Ruler,
  FlaskConical,
  Target
} from 'lucide-react';

const statusOptions = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'PLANTED', label: 'Planted' },
  { value: 'GROWING', label: 'Growing' },
  { value: 'HARVESTING', label: 'Harvesting' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
];

const healthOptions = [
  { value: 'EXCELLENT', label: 'Excellent' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
  { value: 'CRITICAL', label: 'Critical' },
];

const plantingMethods = [
  { value: 'DIRECT_SEEDING', label: 'Direct Seeding' },
  { value: 'TRANSPLANTING', label: 'Transplanting' },
  { value: 'BROADCASTING', label: 'Broadcasting' },
  { value: 'DIBBLING', label: 'Dibbling' },
];

const seasons = [
  { value: 'RAINY', label: 'Rainy Season (Nov-Apr)' },
  { value: 'DRY', label: 'Dry/Cool Season (May-Aug)' },
  { value: 'HOT_DRY', label: 'Hot Dry Season (Sep-Nov)' },
  { value: 'IRRIGATED', label: 'Irrigated (Year-round)' },
];

const irrigationTypes = [
  { value: 'RAIN_FED', label: 'Rain-fed' },
  { value: 'DRIP', label: 'Drip Irrigation' },
  { value: 'SPRINKLER', label: 'Sprinkler' },
  { value: 'FLOOD', label: 'Flood/Furrow' },
  { value: 'CENTER_PIVOT', label: 'Center Pivot' },
  { value: 'MANUAL', label: 'Manual (Watering Can/Bucket)' },
];

// Common Zambian seed sources
const seedSources = ['Zamseed', 'SeedCo', 'MRI Sinda', 'Pannar', 'Klein Karoo', 'Local Market', 'Saved Seed', 'Other'];

// Common fertilizers used in Zambia
const basalFertilizers = ['D-Compound', 'Compound X', 'Compound C', 'DAP', 'TSP', 'Manure/Compost', 'None'];
const topDressFertilizers = ['Urea', 'CAN', 'Ammonium Nitrate', 'Foliar Feed', 'None'];

export default function EditCropPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cropTypesList, setCropTypesList] = useState<any[]>([]);
  const [fieldsList, setFieldsList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    cropTypeId: '',
    fieldId: '',
    variety: '',
    areaPlanted: '',
    season: 'RAINY',
    status: 'GROWING',
    health: 'GOOD',
    plantingDate: '',
    expectedHarvest: '',
    seedSource: '',
    seedQuantity: '',
    seedUnit: 'kg',
    seedCost: '',
    seedTreatment: '',
    plantingMethod: 'DIRECT_SEEDING',
    spacingRows: '',
    spacingPlants: '',
    irrigationType: 'RAIN_FED',
    basalFertilizer: '',
    topDressFertilizer: '',
    expectedYield: '',
    notes: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch crop types, fields, and planting data in parallel
        const [cropTypesRes, fieldsRes, plantingRes] = await Promise.all([
          fetch('/api/crop-types'),
          fetch('/api/fields'),
          fetch(`/api/crops/${id}`),
        ]);

        if (cropTypesRes.ok) {
          const data = await cropTypesRes.json();
          setCropTypesList(data.data || data);
        }

        if (fieldsRes.ok) {
          const data = await fieldsRes.json();
          setFieldsList(data.data || data);
        }

        if (!plantingRes.ok) throw new Error('Failed to fetch crop');
        const result = await plantingRes.json();
        const crop = result.data || result;
        
        const plantingDate = crop.plantingDate 
          ? new Date(crop.plantingDate).toISOString().split('T')[0]
          : '';
        const expectedHarvest = crop.expectedHarvest 
          ? new Date(crop.expectedHarvest).toISOString().split('T')[0]
          : '';
        
        setFormData({
          cropTypeId: crop.cropTypeId || '',
          fieldId: crop.fieldId || '',
          variety: crop.variety || '',
          areaPlanted: crop.areaPlanted ? String(crop.areaPlanted) : '',
          season: crop.season || 'RAINY',
          status: crop.status || 'GROWING',
          health: crop.health || 'GOOD',
          plantingDate,
          expectedHarvest,
          seedSource: crop.seedSource || '',
          seedQuantity: crop.seedQuantity ? String(crop.seedQuantity) : '',
          seedUnit: crop.seedUnit || 'kg',
          seedCost: crop.seedCost ? String(crop.seedCost) : '',
          seedTreatment: crop.seedTreatment || '',
          plantingMethod: crop.plantingMethod || 'DIRECT_SEEDING',
          spacingRows: crop.spacingRows ? String(crop.spacingRows) : '',
          spacingPlants: crop.spacingPlants ? String(crop.spacingPlants) : '',
          irrigationType: crop.irrigationType || crop.field?.irrigation || 'RAIN_FED',
          basalFertilizer: crop.basalFertilizer || '',
          topDressFertilizer: crop.topDressFertilizer || '',
          expectedYield: crop.expectedYield ? String(crop.expectedYield) : '',
          notes: crop.notes || '',
        });
      } catch (error) {
        console.error('Failed to load crop:', error);
        alert('Failed to load crop data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
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
          cropTypeId: formData.cropTypeId,
          fieldId: formData.fieldId,
          areaPlanted: parseFloat(formData.areaPlanted) || 0,
          variety: formData.variety || null,
          plantingDate: formData.plantingDate ? new Date(formData.plantingDate).toISOString() : null,
          expectedHarvest: formData.expectedHarvest ? new Date(formData.expectedHarvest).toISOString() : null,
          status: formData.status,
          health: formData.health,
          season: formData.season,
          seedSource: formData.seedSource || null,
          seedQuantity: formData.seedQuantity ? parseFloat(formData.seedQuantity) : null,
          seedUnit: formData.seedUnit || null,
          seedCost: formData.seedCost ? parseFloat(formData.seedCost) : null,
          seedTreatment: formData.seedTreatment || null,
          plantingMethod: formData.plantingMethod,
          spacingRows: formData.spacingRows ? parseFloat(formData.spacingRows) : null,
          spacingPlants: formData.spacingPlants ? parseFloat(formData.spacingPlants) : null,
          basalFertilizer: formData.basalFertilizer || null,
          topDressFertilizer: formData.topDressFertilizer || null,
          expectedYield: formData.expectedYield ? parseFloat(formData.expectedYield) : null,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/crops/${id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update planting');
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
        {/* Crop Type & Field Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Crop & Field</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Type *
              </label>
              <select
                name="cropTypeId"
                value={formData.cropTypeId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select crop type</option>
                {cropTypesList.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name} {type.localName ? `(${type.localName})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Field *
              </label>
              <select
                name="fieldId"
                value={formData.fieldId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select field</option>
                {fieldsList.map((field) => (
                  <option key={field.id} value={field.id}>
                    {field.name} - {field.size} ha {field.location ? `(${field.location})` : ''}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Planting Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Planting Details
          </h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Area Planted (hectares) *
                </label>
                <input
                  type="number"
                  name="areaPlanted"
                  value={formData.areaPlanted}
                  onChange={handleChange}
                  placeholder="e.g., 2.5"
                  step="0.01"
                  min="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Planting Method
                </label>
                <select
                  name="plantingMethod"
                  value={formData.plantingMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {plantingMethods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Growing Season
                </label>
                <select
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {seasons.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Spacing */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Row Spacing (cm)
                </label>
                <input
                  type="number"
                  name="spacingRows"
                  value={formData.spacingRows}
                  onChange={handleChange}
                  placeholder="e.g., 75"
                  step="1"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Plant Spacing (cm)
                </label>
                <input
                  type="number"
                  name="spacingPlants"
                  value={formData.spacingPlants}
                  onChange={handleChange}
                  placeholder="e.g., 25"
                  step="1"
                  min="0"
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
                <select
                  name="seedSource"
                  value={formData.seedSource}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select source</option>
                  {seedSources.map((src) => (
                    <option key={src} value={src}>{src}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Treatment
                </label>
                <input
                  type="text"
                  name="seedTreatment"
                  value={formData.seedTreatment}
                  onChange={handleChange}
                  placeholder="e.g., Apron Star, Cruiser"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Quantity
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit
                </label>
                <select
                  name="seedUnit"
                  value={formData.seedUnit}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="kg">kg</option>
                  <option value="g">grams</option>
                  <option value="packets">Packets</option>
                  <option value="bags">Bags (50kg)</option>
                  <option value="stems">Stems/Cuttings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Seed Cost (ZMW)
                </label>
                <input
                  type="number"
                  name="seedCost"
                  value={formData.seedCost}
                  onChange={handleChange}
                  placeholder="e.g., 350"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Irrigation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Irrigation Type
              </label>
              <select
                name="irrigationType"
                value={formData.irrigationType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {irrigationTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Fertilizer & Yield */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-600" />
            Fertilizer & Expected Yield
          </h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Basal Fertilizer
                </label>
                <select
                  name="basalFertilizer"
                  value={formData.basalFertilizer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select basal fertilizer</option>
                  {basalFertilizers.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Top Dressing
                </label>
                <select
                  name="topDressFertilizer"
                  value={formData.topDressFertilizer}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select top dressing</option>
                  {topDressFertilizers.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-600" />
                Expected Yield (kg)
              </label>
              <input
                type="number"
                name="expectedYield"
                value={formData.expectedYield}
                onChange={handleChange}
                placeholder="e.g., 5000"
                step="1"
                min="0"
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Target harvest weight for this planting
              </p>
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
            disabled={isSubmitting || !formData.cropTypeId || !formData.fieldId || !formData.areaPlanted}
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
