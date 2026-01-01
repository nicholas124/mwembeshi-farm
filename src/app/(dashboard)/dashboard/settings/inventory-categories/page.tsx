'use client';

import Link from 'next/link';

const INVENTORY_CATEGORIES = [
  { name: 'Feed', value: 'FEED', description: 'Animal feed and supplements' },
  { name: 'Fertilizer', value: 'FERTILIZER', description: 'Crop fertilizers and soil amendments' },
  { name: 'Pesticide', value: 'PESTICIDE', description: 'Pest control products' },
  { name: 'Seeds', value: 'SEEDS', description: 'Planting seeds and seedlings' },
  { name: 'Fuel', value: 'FUEL', description: 'Diesel, petrol, and lubricants' },
  { name: 'Medicine', value: 'MEDICINE', description: 'Veterinary medicines and vaccines' },
  { name: 'Spare Parts', value: 'SPARE_PARTS', description: 'Equipment spare parts' },
  { name: 'Packaging', value: 'PACKAGING', description: 'Bags, crates, and containers' },
  { name: 'Other', value: 'OTHER', description: 'Miscellaneous items' },
];

export default function InventoryCategoriesPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Categories</h1>
          <p className="text-gray-600 text-sm">System-defined inventory categories</p>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-amber-800 font-medium">System Categories</p>
            <p className="text-sm text-amber-700">These categories are built into the system and cannot be modified. They cover all common farm inventory needs.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {INVENTORY_CATEGORIES.map((category) => (
            <div
              key={category.value}
              className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <span className="text-xs text-gray-500 font-mono">{category.value}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
