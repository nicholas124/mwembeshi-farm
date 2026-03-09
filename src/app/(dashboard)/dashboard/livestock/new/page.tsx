'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  ArrowLeft,
  Save,
  Camera,
  Calendar,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

const animalTypes = [
  { value: 'GOAT', label: 'Goat', emoji: '🐐' },
  { value: 'COW', label: 'Cow', emoji: '🐄' },
  { value: 'SHEEP', label: 'Sheep', emoji: '🐑' },
  { value: 'CHICKEN', label: 'Chicken', emoji: '🐔' },
  { value: 'PIG', label: 'Pig', emoji: '🐷' },
  { value: 'OTHER', label: 'Other', emoji: '🐾' },
];

const acquisitionMethods = [
  { value: 'BORN', label: 'Born on farm', icon: '🐣' },
  { value: 'PURCHASED', label: 'Purchased', icon: '💰' },
  { value: 'DONATED', label: 'Donated', icon: '🎁' },
  { value: 'TRADED', label: 'Traded', icon: '🤝' },
];

export default function NewAnimalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    tag: '',
    name: '',
    breed: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    acquisitionMethod: 'BORN',
    purchasePrice: '',
    color: '',
    weight: '',
    motherId: '',
    fatherId: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/animals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/livestock');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create animal');
      }
    } catch (error) {
      alert('Failed to create animal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateTag = () => {
    const prefix = formData.type ? formData.type.substring(0, 2).toUpperCase() : 'AN';
    const random = Math.floor(Math.random() * 9000) + 1000;
    setFormData(prev => ({ ...prev, tag: `${prefix}-${random}` }));
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-shadow";

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/livestock"
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Add New Animal
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Register a new animal to your livestock
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Animal Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">What type of animal? <span className="text-red-500">*</span></h2>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="e.g., GT-0001"
                  required
                  className={`${inputClasses} flex-1`}
                />
                <button
                  type="button"
                  onClick={generateTag}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Generate</span>
                </button>
              </div>
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
                placeholder="e.g., Bella"
                className={inputClasses}
              />
            </div>

            {/* Breed & Gender */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g., Boer, Brahman"
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
                  placeholder="e.g., Brown/White"
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
                placeholder="e.g., 45"
                step="0.1"
                className={inputClasses}
              />
            </div>
          </div>
        </div>

        {/* Acquisition Details */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">How was this animal acquired?</h2>
          </div>
          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {acquisitionMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, acquisitionMethod: method.value }))}
                  className={`p-3 rounded-xl border-2 transition-all active:scale-95 flex flex-col items-center gap-1 text-center ${
                    formData.acquisitionMethod === method.value
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{method.label}</span>
                </button>
              ))}
            </div>

            {formData.acquisitionMethod === 'PURCHASED' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Purchase Price (ZMW)
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  placeholder="e.g., 1500"
                  step="0.01"
                  className={inputClasses}
                />
              </div>
            )}

            {formData.acquisitionMethod === 'BORN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Mother&apos;s Tag
                  </label>
                  <input
                    type="text"
                    name="motherId"
                    value={formData.motherId}
                    onChange={handleChange}
                    placeholder="e.g., GT-0098"
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Father&apos;s Tag
                  </label>
                  <input
                    type="text"
                    name="fatherId"
                    value={formData.fatherId}
                    onChange={handleChange}
                    placeholder="e.g., GT-0045"
                    className={inputClasses}
                  />
                </div>
              </div>
            )}
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

        {/* Photo Upload Placeholder */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Photo</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:border-green-300 dark:hover:border-green-700 transition-colors cursor-pointer">
              <Camera className="w-8 h-8 text-gray-300 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tap to upload a photo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Sticky on mobile */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 sm:py-0 sm:static sm:bg-transparent border-t border-gray-200 dark:border-gray-700 sm:border-0">
          <div className="flex gap-3">
            <Link
              href="/dashboard/livestock"
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-xl text-center font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.type || !formData.tag}
              className="flex-[2] py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Saving...' : 'Save Animal'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
