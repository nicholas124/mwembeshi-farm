'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

const animalTypes = [
  { value: 'GOAT', label: 'Goat', emoji: '🐐' },
  { value: 'COW', label: 'Cow', emoji: '🐄' },
  { value: 'SHEEP', label: 'Sheep', emoji: '🐑' },
  { value: 'CHICKEN', label: 'Chicken', emoji: '🐔' },
  { value: 'PIG', label: 'Pig', emoji: '🐷' },
  { value: 'OTHER', label: 'Other', emoji: '🐾' },
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'SOLD', label: 'Sold', color: 'blue' },
  { value: 'DECEASED', label: 'Deceased', color: 'gray' },
  { value: 'TRANSFERRED', label: 'Transferred', color: 'purple' },
  { value: 'SLAUGHTERED', label: 'Slaughtered', color: 'red' },
];

export default function EditAnimalPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    type: 'GOAT',
    breed: '',
    gender: 'MALE',
    dateOfBirth: '',
    acquisitionMethod: 'BORN',
    color: '',
    weight: '',
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    async function loadAnimal() {
      try {
        const response = await fetch(`/api/animals/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch animal');
        }
        const result = await response.json();
        const animal = result.data || result;
        
        const dateOfBirth = animal.dateOfBirth 
          ? new Date(animal.dateOfBirth).toISOString().split('T')[0]
          : '';
        
        setFormData({
          tag: animal.tag || '',
          name: animal.name || '',
          type: animal.type || 'GOAT',
          breed: animal.breed || '',
          gender: animal.gender || 'MALE',
          dateOfBirth,
          acquisitionMethod: animal.acquisitionMethod || 'BORN',
          color: animal.color || '',
          weight: animal.weight ? String(animal.weight) : '',
          status: animal.status || 'ACTIVE',
          notes: animal.notes || '',
        });
      } catch (error) {
        console.error('Failed to load animal:', error);
        alert('Failed to load animal data');
      } finally {
        setIsLoading(false);
      }
    }
    loadAnimal();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/animals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/livestock/${id}`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update animal');
      }
    } catch (error) {
      alert('Failed to update animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/animals/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/livestock');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete animal');
      }
    } catch (error) {
      alert('Failed to delete animal. Please try again.');
    }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-shadow";

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-32 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/livestock/${id}`}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Edit Animal
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {formData.tag}{formData.name ? ` - ${formData.name}` : ''}
            </p>
          </div>
        </div>
        <button 
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 sm:px-3 sm:py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95"
        >
          <Trash2 className="w-4 h-4 sm:hidden" />
          <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </span>
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg shrink-0">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">Delete this animal?</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">This will mark the animal as deceased. This action cannot be easily undone.</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleDelete}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors active:scale-95"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 text-xs font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Animal Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Animal Type</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {animalTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                  className={`p-3 sm:p-4 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center gap-1.5 ${
                    formData.type === type.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-sm shadow-green-500/10'
                      : 'border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                  }`}
                >
                  <span className="text-3xl">{type.emoji}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Status</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: status.value }))}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                    formData.status === status.value
                      ? status.color === 'green' ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-600'
                      : status.color === 'blue' ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-600'
                      : status.color === 'purple' ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-600'
                      : status.color === 'red' ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600'
                      : 'border-gray-500 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Basic Information</h2>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tag Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Name <span className="text-xs text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            {/* Breed & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Breed <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'FEMALE' }))}
                    className={`py-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                      formData.gender === 'FEMALE'
                        ? 'border-pink-400 bg-pink-50 text-pink-700 dark:border-pink-600 dark:bg-pink-900/20 dark:text-pink-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ♀ Female
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, gender: 'MALE' }))}
                    className={`py-3 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${
                      formData.gender === 'MALE'
                        ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-blue-600 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ♂ Male
                  </button>
                </div>
              </div>
            </div>

            {/* Date of Birth & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Color/Markings
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Current Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Additional Notes</h2>
          </div>
          <div className="p-4 sm:p-5">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any additional information about this animal..."
              className={`${inputClasses} resize-none`}
            />
          </div>
        </div>

        {/* Action Buttons - Sticky on mobile */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 sm:static sm:bg-transparent border-t border-gray-200 dark:border-gray-700 sm:border-0">
          <div className="flex gap-3">
            <Link
              href={`/dashboard/livestock/${id}`}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-center font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
