'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useState, useEffect, FormEvent } from 'react';

interface ExpenseFormData {
  category: string;
  description: string;
  amount: string;
  paymentMethod: string;
  reference: string;
  vendor: string;
  expenseDate: string;
  notes: string;
}

const categoryOptions = [
  { value: 'LIVESTOCK', label: 'Livestock' },
  { value: 'CROPS', label: 'Crops' },
  { value: 'LABOR', label: 'Labor' },
  { value: 'EQUIPMENT', label: 'Equipment' },
  { value: 'FUEL', label: 'Fuel' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'VETERINARY', label: 'Veterinary' },
  { value: 'SEEDS_FERTILIZER', label: 'Seeds & Fertilizer' },
  { value: 'REPAIRS', label: 'Repairs' },
  { value: 'OTHER', label: 'Other' },
];

export default function EditExpensePage() {
  const params = useParams();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<ExpenseFormData>({
    category: 'OTHER',
    description: '',
    amount: '',
    paymentMethod: '',
    reference: '',
    vendor: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    if (params.id) {
      fetchExpense();
    }
  }, [params.id]);

  const fetchExpense = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/expenses/${params.id}`);
      const result = await response.json();

      if (result.success) {
        const expense = result.data;
        setFormData({
          category: expense.category || 'OTHER',
          description: expense.description || '',
          amount: expense.amount?.toString() || '',
          paymentMethod: expense.paymentMethod || '',
          reference: expense.reference || '',
          vendor: expense.vendor || '',
          expenseDate: expense.expenseDate
            ? new Date(expense.expenseDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          notes: expense.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      setError('Failed to load expense details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/expenses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          amount: formData.amount ? parseFloat(formData.amount) : null,
          paymentMethod: formData.paymentMethod || null,
          reference: formData.reference || null,
          vendor: formData.vendor || null,
          expenseDate: formData.expenseDate ? new Date(formData.expenseDate).toISOString() : null,
          notes: formData.notes || null,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to update expense');
      }

      router.push(`/dashboard/expenses/${params.id}`);
    } catch (error: any) {
      console.error('Error updating expense:', error);
      setError(error.message || 'Failed to update expense. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/expenses/${params.id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Expense
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update expense information
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount (ZMW) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expense Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expenseDate"
                value={formData.expenseDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <input
                type="text"
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                placeholder="e.g., Cash, Mobile Money, Bank Transfer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference Number
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Transaction or invoice reference"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendor/Supplier
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
                placeholder="Name of vendor or supplier"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            placeholder="Any additional notes about this expense..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Link
            href={`/dashboard/expenses/${params.id}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
