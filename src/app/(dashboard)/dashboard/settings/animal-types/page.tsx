'use client';

import Link from 'next/link';

const ANIMAL_TYPES = [
  { name: 'Goat', value: 'GOAT', icon: '🐐' },
  { name: 'Cow', value: 'COW', icon: '🐄' },
  { name: 'Sheep', value: 'SHEEP', icon: '🐑' },
  { name: 'Chicken', value: 'CHICKEN', icon: '🐔' },
  { name: 'Pig', value: 'PIG', icon: '🐷' },
  { name: 'Other', value: 'OTHER', icon: '🐾' },
];

const ANIMAL_STATUSES = [
  { name: 'Active', value: 'ACTIVE', description: 'Currently on farm', color: 'bg-green-100 text-green-700' },
  { name: 'Sold', value: 'SOLD', description: 'Sold to buyer', color: 'bg-blue-100 text-blue-700' },
  { name: 'Deceased', value: 'DECEASED', description: 'Died on farm', color: 'bg-gray-100 text-gray-700' },
  { name: 'Transferred', value: 'TRANSFERRED', description: 'Moved to another location', color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Slaughtered', value: 'SLAUGHTERED', description: 'Processed for meat', color: 'bg-red-100 text-red-700' },
];

export default function AnimalTypesPage() {
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Animal Types</h1>
          <p className="text-gray-600 text-sm">System-defined livestock types and statuses</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-amber-800 font-medium">System Types</p>
            <p className="text-sm text-amber-700">Animal types and statuses are built into the system. Contact support if you need additional types.</p>
          </div>
        </div>
      </div>

      {/* Animal Types */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Animal Types</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-6">
          {ANIMAL_TYPES.map((type) => (
            <div
              key={type.value}
              className="border border-gray-200 rounded-lg p-4 text-center hover:border-green-300 transition-colors"
            >
              <div className="text-4xl mb-2">{type.icon}</div>
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              <span className="text-xs text-gray-500 font-mono">{type.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Animal Statuses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Animal Statuses</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {ANIMAL_STATUSES.map((status) => (
            <div
              key={status.value}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                  {status.name}
                </span>
                <span className="text-xs text-gray-500 font-mono">{status.value}</span>
              </div>
              <p className="text-sm text-gray-600">{status.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
