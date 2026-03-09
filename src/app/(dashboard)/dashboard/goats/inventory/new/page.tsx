'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft,
  Package,
  Wheat,
  Pill,
  Wrench,
  Box,
  Plus,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'FEED', label: 'Feed & Hay', icon: Wheat, description: 'Goat pellets, hay, grains, browse, fodder' },
  { value: 'MEDICINE', label: 'Medicine & Vaccines', icon: Pill, description: 'Dewormers, antibiotics, vaccines, supplements' },
  { value: 'SPARE_PARTS', label: 'Equipment & Tools', icon: Wrench, description: 'Hoof trimmers, ear tags, feeders, water troughs' },
  { value: 'OTHER', label: 'Other Supplies', icon: Box, description: 'Bedding, disinfectants, minerals, grooming' },
];

// Quick-add presets for common goat inventory items
const QUICK_ADD_PRESETS = [
  { name: 'Goat Pellets', category: 'FEED', unit: 'kg', minStock: 50 },
  { name: 'Lucerne / Alfalfa Hay', category: 'FEED', unit: 'bales', minStock: 10 },
  { name: 'Grass Hay', category: 'FEED', unit: 'bales', minStock: 10 },
  { name: 'Maize Bran', category: 'FEED', unit: 'kg', minStock: 25 },
  { name: 'Mineral Block', category: 'OTHER', unit: 'pieces', minStock: 2 },
  { name: 'Salt Lick', category: 'OTHER', unit: 'pieces', minStock: 2 },
  { name: 'Ivermectin (Dewormer)', category: 'MEDICINE', unit: 'ml', minStock: 100 },
  { name: 'Albendazole (Dewormer)', category: 'MEDICINE', unit: 'ml', minStock: 50 },
  { name: 'Oxytetracycline', category: 'MEDICINE', unit: 'ml', minStock: 50 },
  { name: 'Penicillin Injection', category: 'MEDICINE', unit: 'ml', minStock: 50 },
  { name: 'PPR Vaccine', category: 'MEDICINE', unit: 'doses', minStock: 20 },
  { name: 'CDT Vaccine', category: 'MEDICINE', unit: 'doses', minStock: 20 },
  { name: 'Multivitamin Injection', category: 'MEDICINE', unit: 'ml', minStock: 50 },
  { name: 'Wound Spray / Purple Spray', category: 'MEDICINE', unit: 'bottles', minStock: 2 },
  { name: 'Hoof Trimming Shears', category: 'SPARE_PARTS', unit: 'pieces', minStock: 1 },
  { name: 'Ear Tags', category: 'SPARE_PARTS', unit: 'pieces', minStock: 20 },
  { name: 'Ear Tag Applicator', category: 'SPARE_PARTS', unit: 'pieces', minStock: 1 },
  { name: 'Drenching Gun', category: 'SPARE_PARTS', unit: 'pieces', minStock: 1 },
  { name: 'Feeding Trough', category: 'SPARE_PARTS', unit: 'pieces', minStock: 2 },
  { name: 'Water Trough', category: 'SPARE_PARTS', unit: 'pieces', minStock: 2 },
  { name: 'Bedding / Straw', category: 'OTHER', unit: 'bales', minStock: 5 },
  { name: 'Disinfectant (Livestock)', category: 'OTHER', unit: 'liters', minStock: 5 },
  { name: 'Molasses', category: 'FEED', unit: 'liters', minStock: 10 },
  { name: 'Dairy Meal', category: 'FEED', unit: 'kg', minStock: 25 },
  { name: 'Syringe (10ml)', category: 'SPARE_PARTS', unit: 'pieces', minStock: 20 },
  { name: 'Syringe (20ml)', category: 'SPARE_PARTS', unit: 'pieces', minStock: 10 },
  { name: 'Milk Replacer (Kid)', category: 'FEED', unit: 'kg', minStock: 5 },
  { name: 'Copper Bolus', category: 'OTHER', unit: 'pieces', minStock: 10 },
];

export default function AddGoatInventoryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPresets, setShowPresets] = useState(true);
  const [form, setForm] = useState({
    name: '',
    category: 'FEED',
    currentStock: '',
    unit: 'kg',
    minStock: '',
    maxStock: '',
    unitCost: '',
    location: 'Goat Section',
    supplier: '',
    expiryDate: '',
    notes: '',
  });

  const handlePresetClick = (preset: typeof QUICK_ADD_PRESETS[0]) => {
    setForm(f => ({
      ...f,
      name: preset.name,
      category: preset.category,
      unit: preset.unit,
      minStock: preset.minStock.toString(),
    }));
    setShowPresets(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/goats/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          currentStock: parseFloat(form.currentStock) || 0,
          unit: form.unit,
          minStock: form.minStock ? parseFloat(form.minStock) : null,
          maxStock: form.maxStock ? parseFloat(form.maxStock) : null,
          unitCost: form.unitCost ? parseFloat(form.unitCost) : null,
          location: form.location || 'Goat Section',
          supplier: form.supplier || null,
          expiryDate: form.expiryDate || null,
          notes: form.notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create item');
      }

      router.push('/dashboard/goats/inventory');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
          <Link href="/dashboard/goats/inventory" className="hover:text-green-600 flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            Goat Inventory
          </Link>
          <span>/</span>
          <span>Add Item</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add Inventory Item
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Add feed, medicine, equipment, or other supplies to goat inventory
        </p>
      </div>

      {/* Quick Add Presets */}
      {showPresets && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Add — Common Items</h2>
            <button
              onClick={() => setShowPresets(false)}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Custom Item
            </button>
          </div>

          {CATEGORY_OPTIONS.map((cat) => {
            const presets = QUICK_ADD_PRESETS.filter(p => p.category === cat.value);
            if (presets.length === 0) return null;
            return (
              <div key={cat.value} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <cat.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat.label}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetClick(preset)}
                      className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORY_OPTIONS.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm(f => ({ ...f, category: cat.value }))}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                  form.category === cat.value
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <cat.icon className={`w-6 h-6 ${form.category === cat.value ? 'text-green-600' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium text-center ${form.category === cat.value ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Item Name *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="e.g. Goat Pellets Premium"
          />
        </div>

        {/* Stock & Unit */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Stock
            </label>
            <input
              type="number"
              step="0.01"
              value={form.currentStock}
              onChange={(e) => setForm(f => ({ ...f, currentStock: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit *
            </label>
            <select
              value={form.unit}
              onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="grams">Grams (g)</option>
              <option value="liters">Liters (L)</option>
              <option value="ml">Milliliters (ml)</option>
              <option value="bales">Bales</option>
              <option value="bags">Bags</option>
              <option value="pieces">Pieces</option>
              <option value="doses">Doses</option>
              <option value="bottles">Bottles</option>
              <option value="packets">Packets</option>
              <option value="rolls">Rolls</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Cost (K)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.unitCost}
              onChange={(e) => setForm(f => ({ ...f, unitCost: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Min/Max Stock */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Minimum Stock (Reorder Level)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.minStock}
              onChange={(e) => setForm(f => ({ ...f, minStock: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Alert when below this"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Maximum Stock
            </label>
            <input
              type="number"
              step="0.01"
              value={form.maxStock}
              onChange={(e) => setForm(f => ({ ...f, maxStock: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Maximum capacity"
            />
          </div>
        </div>

        {/* Location & Supplier */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Storage Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="e.g. Goat Shed Store"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Supplier
            </label>
            <input
              type="text"
              value={form.supplier}
              onChange={(e) => setForm(f => ({ ...f, supplier: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Supplier name"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm(f => ({ ...f, expiryDate: e.target.value }))}
            className="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            placeholder="Dosage info, special instructions, etc."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/dashboard/goats/inventory"
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium text-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting || !form.name}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add to Inventory
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
