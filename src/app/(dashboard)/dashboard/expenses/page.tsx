'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingDown, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Tag,
  User,
  ChevronRight
} from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: string | null;
  reference: string | null;
  vendor: string | null;
  expenseDate: string;
  receipt: string | null;
  notes: string | null;
  createdAt: string;
}

const categoryLabels: Record<string, string> = {
  LIVESTOCK: 'Livestock',
  CROPS: 'Crops',
  LABOR: 'Labor',
  EQUIPMENT: 'Equipment',
  FUEL: 'Fuel',
  UTILITIES: 'Utilities',
  TRANSPORT: 'Transport',
  VETERINARY: 'Veterinary',
  SEEDS_FERTILIZER: 'Seeds & Fertilizer',
  REPAIRS: 'Repairs',
  OTHER: 'Other',
};

const categoryColors: Record<string, string> = {
  LIVESTOCK: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  CROPS: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  LABOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  EQUIPMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  FUEL: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  UTILITIES: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  TRANSPORT: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  VETERINARY: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  SEEDS_FERTILIZER: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  REPAIRS: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory]);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/expenses');
      const result = await response.json();
      
      if (result.success) {
        setExpenses(result.data);
        calculateTotal(result.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(
        (expense) =>
          expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((expense) => expense.category === selectedCategory);
    }

    setFilteredExpenses(filtered);
    calculateTotal(filtered);
  };

  const calculateTotal = (expenseList: Expense[]) => {
    const total = expenseList.reduce((sum, expense) => sum + Number(expense.amount), 0);
    setTotalExpenses(total);
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
        <div className="text-gray-500 dark:text-gray-400">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Expenses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage farm expenses
          </p>
        </div>
        <Link
          href="/dashboard/expenses/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </Link>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 text-sm font-medium">Total Expenses</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
            <p className="text-red-100 text-sm mt-2">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
            </p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg">
            <TrendingDown className="w-8 h-8" />
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
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white appearance-none"
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

      {/* Expenses List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingDown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No expenses found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || selectedCategory
                ? 'Try adjusting your filters'
                : 'Start by adding your first expense'}
            </p>
            {!searchTerm && !selectedCategory && (
              <Link
                href="/dashboard/expenses/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add First Expense
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredExpenses.map((expense) => (
              <Link
                key={expense.id}
                href={`/dashboard/expenses/${expense.id}`}
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${
                          categoryColors[expense.category] || categoryColors.OTHER
                        }`}
                      >
                        {categoryLabels[expense.category] || expense.category}
                      </span>
                      {expense.vendor && (
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {expense.vendor}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                      {expense.description}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(expense.expenseDate)}
                      </span>
                      {expense.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {expense.paymentMethod}
                        </span>
                      )}
                      {expense.reference && (
                        <span className="flex items-center gap-1">
                          <Tag className="w-4 h-4" />
                          {expense.reference}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(expense.amount)}
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
