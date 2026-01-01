'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const settingsSections = [
    {
      title: 'Crop Types',
      description: 'Manage crop varieties available for planting',
      href: '/dashboard/settings/crop-types',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Fields',
      description: 'Manage farm fields and their details',
      href: '/dashboard/settings/fields',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: 'bg-amber-100 text-amber-600',
    },
    {
      title: 'Inventory Categories',
      description: 'View inventory item categories',
      href: '/dashboard/settings/inventory-categories',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Animal Types',
      description: 'View livestock types and breeds',
      href: '/dashboard/settings/animal-types',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-600',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage dropdown options and master data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsSections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-green-300 transition-all"
          >
            <div className={`w-14 h-14 rounded-lg ${section.color} flex items-center justify-center mb-4`}>
              {section.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
            <p className="text-gray-600 text-sm">{section.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
