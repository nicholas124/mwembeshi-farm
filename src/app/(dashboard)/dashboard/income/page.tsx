'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Tag,
  User,
  ChevronRight
} from 'lucide-react';

interface Income {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string | null;
  reference: string | null;
  buyer: string | null;
  incomeDate: string;
  notes: string | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  LIVESTOCK_SALE: 'Livestock Sale',
  CROP_SALE: 'Crop Sale',
  MILK_SALE: 'Milk Sale',
  EGG_SALE: 'Egg Sale',
  PRODUCE_SALE: 'Produce Sale',
  SERVICES: 'Services',
  OTHER: 'Other',
};

const categoryColors: Record<string, string> = {
  LIVESTOCK_SALE: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  CROP_SALE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MILK_SALE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  EGG_SALE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  PRODUCE_SALE: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  SERVICES: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function IncomePage() {
  const [income, setIncome] = useState<Income[]>([]);
  const [filteredIncome, setFilteredIncome] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    fetchIncome();
  }, []);

  useEffect(() => {
    filterIncome();
  }, [income, searchTerm, selectedCategory]);

  const fetchIncome = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/income');
      const result = await response.json();
      
      if (result.success) {
        setIncome(result.data);
        calculateTotal(result.data);
      }
    } catch (error) {
      console.error('Error fetching income:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterIncome = () => {
    let filtered = income;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.buyer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredIncome(filtered);
    calculateTotal(filtered);
  };

  const calculateTotal = (incomeList: Income[]) => {
    const total = incomeList.reduce((sum, item) => sum + Number(item.amount), 0);
    setTotalIncome(total);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">Loading income records...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Income
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage farm income
          </p>
        </div>
        <Link
          href="/dashboard/income/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Income
        </Link>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium">Total Income</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalIncome)}</p>
            <p className="text-green-100 text-sm mt-2">
              {filteredIncome.length} {filteredIncome.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search income records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="">All Categories</option>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {filteredIncome.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No income records found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your filters'
                : 'Start by adding your first income record'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Link
                href="/dashboard/income/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add First Income
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredIncome.map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/income/${item.id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          categoryColors[item.category] || categoryColors.OTHER
                        }`}
                      >
                        {categoryLabels[item.category] || item.category}
                      </span>
                      {item.buyer && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.buyer}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {item.description}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(item.incomeDate)}
                      </span>
                      {item.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {item.paymentMethod}
                        </span>
                      )}
                      {item.reference && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {item.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(item.amount)}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
