'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  DollarSign,
  Tag,
  User,
  FileText,
  Receipt,
  AlertCircle
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

export default function ExpenseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        setExpense(result.data);
      } else {
        router.push('/dashboard/expenses');
      }
    } catch (error) {
      console.error('Error fetching expense:', error);
      router.push('/dashboard/expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/expenses/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/expenses');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
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
        <div className="text-gray-500 dark:text-gray-400">Loading expense details...</div>
      </div>
    );
  }

  if (!expense) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/expenses"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Expense Details
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {categoryLabels[expense.category] || expense.category}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/expenses/${expense.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Expense
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Amount Card */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
        <p className="text-red-100 text-sm font-medium mb-2">Amount Paid</p>
        <p className="text-4xl font-bold">{formatCurrency(expense.amount)}</p>
      </div>

      {/* Basic Information */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Description</label>
            <p className="text-gray-900 dark:text-white font-medium">{expense.description}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Tag className="w-4 h-4" />
                Category
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {categoryLabels[expense.category] || expense.category}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Expense Date
              </label>
              <p className="text-gray-900 dark:text-white font-medium">
                {formatDate(expense.expenseDate)}
              </p>
            </div>
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
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Payment Method
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {expense.paymentMethod || 'Not specified'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Receipt className="w-4 h-4" />
              Reference
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {expense.reference || 'Not specified'}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <User className="w-4 h-4" />
              Vendor
            </label>
            <p className="text-gray-900 dark:text-white font-medium">
              {expense.vendor || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {expense.notes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notes
          </h2>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {expense.notes}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Created on {formatDate(expense.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
