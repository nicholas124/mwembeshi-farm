'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Calendar,
  DollarSign,
  MapPin,
  BarChart3,
  X,
  Plus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const categoryEmoji: Record<string, string> = {
  FEED: '🌾',
  FERTILIZER: '🧪',
  PESTICIDE: '🦟',
  SEEDS: '🌱',
  FUEL: '⛽',
  MEDICINE: '💊',
  SPARE_PARTS: '🔧',
  PACKAGING: '📦',
  OTHER: '📋',
};

const transactionIcons: Record<string, React.ReactNode> = {
  PURCHASE: <TrendingUp className="w-4 h-4 text-green-500" />,
  USAGE: <Package className="w-4 h-4 text-blue-500" />,
  ADJUSTMENT: <BarChart3 className="w-4 h-4 text-yellow-500" />,
  TRANSFER: <Package className="w-4 h-4 text-purple-500" />,
  WASTE: <AlertTriangle className="w-4 h-4 text-red-500" />,
  RETURN: <TrendingDown className="w-4 h-4 text-gray-500" />,
};

export default function InventoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const id = params.id;

  async function fetchItem() {
    try {
      const response = await fetch(`/api/inventory/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory item');
      }
      const result = await response.json();
      setItem(result.data);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to deactivate this inventory item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/inventory/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/inventory');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to deactivate item');
      }
    } catch (error) {
      alert('Failed to deactivate item');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory details...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Inventory item not found</p>
          <Link
            href="/dashboard/inventory"
            className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inventory
          </Link>
        </div>
      </div>
    );
  }

  const stockLevel = Number(item.currentStock);
  const minLevel = Number(item.minStock || 0);
  const maxLevel = Number(item.maxStock || 0);
  const isLowStock = minLevel > 0 && stockLevel <= minLevel;
  const isOverStock = maxLevel > 0 && stockLevel >= maxLevel;
  const stockPercentage = maxLevel > 0 ? (stockLevel / maxLevel) * 100 : 0;

  const totalPurchased = item.transactions?.filter((t: any) => t.type === 'PURCHASE')
    .reduce((sum: number, t: any) => sum + Number(t.quantity), 0) || 0;
  const totalUsed = item.transactions?.filter((t: any) => t.type === 'USAGE')
    .reduce((sum: number, t: any) => sum + Number(t.quantity), 0) || 0;
  const totalValue = stockLevel * Number(item.unitCost || 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/inventory"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{categoryEmoji[item.category]}</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {item.name}
              </h1>
            </div>
            {item.sku && (
              <p className="text-gray-600 dark:text-gray-400">
                SKU: {item.sku}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/inventory/${id}/edit`}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 border border-red-300 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Deactivate
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowTransactionModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Plus className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Transaction</span>
          </button>
        </div>
      </div>

      {/* Stock Level Indicator */}
      {(isLowStock || isOverStock) && (
        <div className={`${isLowStock ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'} border rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
            <div>
              <h3 className={`font-medium ${isLowStock ? 'text-red-800 dark:text-red-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                {isLowStock ? 'Low Stock Alert' : 'Overstock Alert'}
              </h3>
              <p className={`text-sm mt-1 ${isLowStock ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                {isLowStock 
                  ? `Stock level (${stockLevel} ${item.unit}) is at or below minimum threshold (${minLevel} ${item.unit}). Consider reordering.`
                  : `Stock level (${stockLevel} ${item.unit}) is at or above maximum threshold (${maxLevel} ${item.unit}).`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Stock Information
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Stock Level</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stockLevel} {item.unit}
                  </p>
                </div>
                {maxLevel > 0 && (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isLowStock ? 'bg-red-500' : isOverStock ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {item.minStock && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Minimum Level</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Number(item.minStock)} {item.unit}
                    </p>
                  </div>
                )}
                {item.maxStock && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Maximum Level</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {Number(item.maxStock)} {item.unit}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Item Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Item Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {item.category.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                <p className="font-medium text-gray-900 dark:text-white">{item.unit}</p>
              </div>
              {item.unitCost && (
                <div className="flex items-start gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit Cost</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      ZMW {Number(item.unitCost).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              {item.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                    <p className="font-medium text-gray-900 dark:text-white">{item.location}</p>
                  </div>
                </div>
              )}
              {item.supplier && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Supplier</p>
                  <p className="font-medium text-gray-900 dark:text-white">{item.supplier}</p>
                </div>
              )}
              {item.expiryDate && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Expiry Date</p>
                    <p className={`font-medium ${
                      new Date(item.expiryDate) < new Date()
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {formatDate(item.expiryDate)}
                      {new Date(item.expiryDate) < new Date() && ' (Expired)'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          {item.transactions && item.transactions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction History
              </h2>
              <div className="space-y-3">
                {item.transactions.map((transaction: any) => (
                  <div
                    key={transaction.id}
                    className="flex items-start justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-start gap-3">
                      {transactionIcons[transaction.type]}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {Number(transaction.quantity)} {item.unit}
                          {transaction.unitCost && ` @ ZMW ${Number(transaction.unitCost).toFixed(2)}`}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {formatDateShort(transaction.transactionDate)}
                          {transaction.supplier && ` • ${transaction.supplier}`}
                          {transaction.reference && ` • Ref: ${transaction.reference}`}
                        </p>
                        {transaction.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                            {transaction.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    {transaction.totalCost && (
                      <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap ml-4">
                        ZMW {Number(transaction.totalCost).toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {item.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Stats */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ZMW {totalValue.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Purchased</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalPurchased.toFixed(2)} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Used</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalUsed.toFixed(2)} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {item.transactions?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  item.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {item.isActive ? 'Yes' : 'No'}
                </span>
              </div>
              {item.expiryDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Expired</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    new Date(item.expiryDate) < new Date()
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {new Date(item.expiryDate) < new Date() ? 'Yes' : 'No'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Modal */}
      {showTransactionModal && (
        <TransactionModal
          itemId={id}
          itemUnit={item.unit}
          onClose={() => setShowTransactionModal(false)}
          onSuccess={() => {
            setShowTransactionModal(false);
            fetchItem();
          }}
        />
      )}
    </div>
  );
}

// Transaction Modal Component
function TransactionModal({ itemId, itemUnit, onClose, onSuccess }: { itemId: string; itemUnit: string; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    type: 'PURCHASE',
    quantity: '',
    unitCost: '',
    supplier: '',
    reference: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/inventory/${itemId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record transaction');
      }
    } catch (error) {
      alert('Failed to record transaction');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Transaction</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transaction Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="PURCHASE">Purchase (Add Stock)</option>
              <option value="USAGE">Usage (Remove Stock)</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="TRANSFER">Transfer</option>
              <option value="WASTE">Waste/Spoilage</option>
              <option value="RETURN">Return</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantity ({itemUnit}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Unit Cost (ZMW)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {formData.type === 'PURCHASE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reference
            </label>
            <input
              type="text"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              placeholder="Invoice or receipt number"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              {isSaving ? 'Recording...' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}