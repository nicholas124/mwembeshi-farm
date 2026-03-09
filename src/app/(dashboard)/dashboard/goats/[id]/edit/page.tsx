'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

const goatBreeds = [
  'Boer', 'Kalahari Red', 'Savanna', 'Anglo-Nubian', 'Saanen', 'Toggenburg',
  'Alpine', 'LaMancha', 'Oberhasli', 'Nigerian Dwarf', 'Pygmy', 'Angora',
  'Cashmere', 'Damascus', 'Jamnapari', 'Beetal', 'Barbari', 'Black Bengal',
  'Local/Indigenous', 'Cross-breed', 'Other',
];

const statusOptions = [
  { value: 'ACTIVE', label: 'Active', color: 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
  { value: 'SOLD', label: 'Sold', color: 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
  { value: 'DECEASED', label: 'Deceased', color: 'border-gray-400 bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
  { value: 'TRANSFERRED', label: 'Transferred', color: 'border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' },
  { value: 'SLAUGHTERED', label: 'Slaughtered', color: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
];

export default function EditGoatPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = resolvedParams.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tag: '',
    name: '',
    breed: '',
    gender: 'FEMALE',
    dateOfBirth: '',
    acquisitionMethod: 'BORN',
    purchasePrice: '',
    color: '',
    weight: '',
    status: 'ACTIVE',
    notes: '',
  });

  useEffect(() => {
    async function fetchGoat() {
      try {
        const response = await fetch(`/api/goats/${id}`);
        if (!response.ok) throw new Error('Not found');
        const result = await response.json();
        const data = result.data;
        setFormData({
          tag: data.tag || '',
          name: data.name || '',
          breed: data.breed || '',
          gender: data.gender || 'FEMALE',
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
          acquisitionMethod: data.acquisitionMethod || 'BORN',
          purchasePrice: data.purchasePrice ? String(data.purchasePrice) : '',
          color: data.color || '',
          weight: data.weight ? String(data.weight) : '',
          status: data.status || 'ACTIVE',
          notes: data.notes || '',
        });
      } catch (error) {
        console.error('Error fetching goat:', error);
        alert('Failed to load goat data');
        router.push('/dashboard/goats');
      } finally {
        setIsLoading(false);
      }
    }
    fetchGoat();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/goats/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
          purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : null,
          weight: formData.weight ? parseFloat(formData.weight) : null,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/goats/${id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update goat');
      }
    } catch (error) {
      alert('Failed to update goat. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this goat? This will mark it as deceased.')) return;
    try {
      const response = await fetch(`/api/goats/${id}`, { method: 'DELETE' });
      if (response.ok) {
        router.push('/dashboard/goats');
      } else {
        alert('Failed to remove goat');
      }
    } catch { alert('Failed to remove goat'); }
  };

  const inputClasses = "w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm transition-shadow";

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 pb-8 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/goats/${id}`} className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🐐 Edit {formData.tag}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Update goat information</p>
        </div>
        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm">
          <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Remove</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Status */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Status</h2>
          </div>
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, status: opt.value }))}
                  className={`py-2.5 rounded-xl border-2 text-xs font-medium transition-all active:scale-95 ${
                    formData.status === opt.value ? opt.color : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {opt.label}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tag Number *</label>
              <input type="text" name="tag" value={formData.tag} onChange={handleChange} required className={inputClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Optional" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Breed *</label>
                <select name="breed" value={formData.breed} onChange={handleChange} required className={inputClasses}>
                  <option value="">Select breed</option>
                  {goatBreeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Sex</label>
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
                    ♀ Doe
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
                    ♂ Buck
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Color/Markings</label>
                <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputClasses} placeholder="e.g., Brown/White" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg)</label>
              <input type="number" name="weight" value={formData.weight} onChange={handleChange} step="0.1" className={inputClasses} placeholder="Current weight" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className={inputClasses} placeholder="Additional notes" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="sticky bottom-20 lg:bottom-4 flex gap-3 bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-t border-gray-200 dark:border-gray-700 lg:border-0 lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none lg:py-0 lg:mx-0 lg:px-0">
          <Link
            href={`/dashboard/goats/${id}`}
            className="flex-1 lg:flex-none px-6 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !formData.tag || !formData.breed}
            className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
