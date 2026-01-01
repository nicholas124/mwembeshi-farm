'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useEffect, useState, FormEvent } from 'react';

interface InventoryFormData {
  name: string;
  sku: string;
  category: string;
  currentStock: string;
  unit: string;
  minStock: string;
  maxStock: string;
  unitCost: string;
  location: string;
  supplier: string;
  expiryDate: string;
  isActive: boolean;
  notes: string;
}

export default function EditInventoryPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    sku: '',
    category: 'FEED',
    currentStock: '',
    unit: 'kg',
    minStock: '',
    maxStock: '',
    unitCost: '',
    location: '',
    supplier: '',
    expiryDate: '',
    isActive: true,
    notes: '',
  });

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch(`/api/inventory/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch inventory item');
        }
        const result = await response.json();
        const item = result.data;

        setFormData({
          name: item.name || '',
          sku: item.sku || '',
          category: item.category || 'FEED',
          currentStock: item.currentStock?.toString() || '',
          unit: item.unit || 'kg',
          minStock: item.minStock?.toString() || '',
          maxStock: item.maxStock?.toString() || '',
          unitCost: item.unitCost?.toString() || '',
          location: item.location || '',
          supplier: item.supplier || '',
          expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
          isActive: item.isActive ?? true,
          notes: item.notes || '',
        });
      } catch (error) {
        console.error('Error fetching inventory:', error);
        setError('Failed to load inventory data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventory();
  }, [params.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/inventory/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          sku: formData.sku || null,
          category: formData.category,
          currentStock: parseFloat(formData.currentStock),
          unit: formData.unit,
          minStock: formData.minStock ? parseFloat(formData.minStock) : null,
          maxStock: formData.maxStock ? parseFloat(formData.maxStock) : null,
          unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null,
          location: formData.location || null,
          supplier: formData.supplier || null,
          expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
          isActive: formData.isActive,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory item');
      }

      router.push(`/dashboard/inventory/${params.id}`);
    } catch (error) {
      console.error('Error updating inventory:', error);
      setError('Failed to update inventory item. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/inventory/${params.id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Inventory Item
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update inventory information
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SKU / Code
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="FEED">Feed</option>
                <option value="FERTILIZER">Fertilizer</option>
                <option value="PESTICIDE">Pesticide</option>
                <option value="SEEDS">Seeds</option>
                <option value="FUEL">Fuel</option>
                <option value="MEDICINE">Medicine</option>
                <option value="SPARE_PARTS">Spare Parts</option>
                <option value="PACKAGING">Packaging</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="L">Liters (L)</option>
                <option value="mL">Milliliters (mL)</option>
                <option value="pieces">Pieces</option>
                <option value="bags">Bags</option>
                <option value="boxes">Boxes</option>
                <option value="bottles">Bottles</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Storage location"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
              </label>
              <input
                type="text"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stock Levels
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                name="currentStock"
                value={formData.currentStock}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Stock Level
              </label>
              <input
                type="number"
                step="0.01"
                name="minStock"
                value={formData.minStock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                placeholder="Reorder level"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Stock Level
              </label>
              <input
                type="number"
                step="0.01"
                name="maxStock"
                value={formData.maxStock}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Expiry */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pricing & Expiry
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit Cost (ZMW)
              </label>
              <input
                type="number"
                step="0.01"
                name="unitCost"
                value={formData.unitCost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status
          </h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Item is active
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Inactive items will not appear in the main inventory list
          </p>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Additional Notes
          </h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            placeholder="Any additional notes about the item..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            href={`/dashboard/inventory/${params.id}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
