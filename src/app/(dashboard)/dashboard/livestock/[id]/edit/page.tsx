'use client';

import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  Save,
  Trash2
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
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'DECEASED', label: 'Deceased' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'SLAUGHTERED', label: 'Slaughtered' },
];

export default function EditAnimalPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        
        // Format date for input field
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
    if (!confirm('Are you sure you want to delete this animal? This will mark it as deceased.')) {
      return;
    }

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
            href={`/dashboard/livestock/${id}`}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Animal
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Update animal information
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
        {/* Animal Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Animal Type</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {animalTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                  formData.type === type.value
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

        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Status</h2>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
          <div className="grid gap-4">
            {/* Tag */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tag Number *
              </label>
              <input
                type="text"
                name="tag"
                value={formData.tag}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Breed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Breed *
              </label>
              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Color/Markings
              </label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.1"
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
            rows={4}
            placeholder="Any additional information about this animal..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium inline-flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/dashboard/livestock/${id}`}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
