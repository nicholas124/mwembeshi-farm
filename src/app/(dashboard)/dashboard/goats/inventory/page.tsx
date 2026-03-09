'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  Pill,
  Wheat,
  Wrench,
  Box,
  ShoppingCart,
  Minus,
  RotateCcw,
  Trash2,
  ArrowLeftRight,
  X,
  Edit,
} from 'lucide-react';

type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  unit: string;
  minStock: number | null;
  maxStock: number | null;
  unitCost: number | null;
  location: string | null;
  supplier: string | null;
  expiryDate: string | null;
  notes: string | null;
  transactions: Transaction[];
};

type Transaction = {
  id: string;
  type: string;
  quantity: number;
  unitCost: number | null;
  totalCost: number | null;
  reference: string | null;
  supplier: string | null;
  notes: string | null;
  transactionDate: string;
};

type Stats = {
  totalItems: number;
  lowStockCount: number;
  totalValue: number;
  categoryBreakdown: Record<string, number>;
};

const GOAT_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'FEED', label: 'Feed & Hay' },
  { value: 'MEDICINE', label: 'Medicine & Vaccines' },
  { value: 'OTHER', label: 'Supplements & Minerals' },
  { value: 'SPARE_PARTS', label: 'Equipment & Tools' },
];

const CATEGORY_ICONS: Record<string, typeof Package> = {
  FEED: Wheat,
  MEDICINE: Pill,
  SPARE_PARTS: Wrench,
  OTHER: Box,
};

const CATEGORY_COLORS: Record<string, string> = {
  FEED: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  MEDICINE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  SPARE_PARTS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OTHER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

const TRANSACTION_TYPES = [
  { value: 'PURCHASE', label: 'Purchase (Stock In)', icon: ShoppingCart, color: 'text-green-600' },
  { value: 'USAGE', label: 'Usage (Stock Out)', icon: Minus, color: 'text-red-600' },
  { value: 'ADJUSTMENT', label: 'Stock Adjustment', icon: ArrowUpDown, color: 'text-blue-600' },
  { value: 'WASTE', label: 'Waste / Expired', icon: Trash2, color: 'text-orange-600' },
  { value: 'RETURN', label: 'Return', icon: RotateCcw, color: 'text-purple-600' },
  { value: 'TRANSFER', label: 'Transfer Out', icon: ArrowLeftRight, color: 'text-gray-600' },
];

export default function GoatInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionItem, setTransactionItem] = useState<InventoryItem | null>(null);
  const [transactionForm, setTransactionForm] = useState({
    type: 'PURCHASE',
    quantity: '',
    unitCost: '',
    reference: '',
    supplier: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'FEED',
    currentStock: '',
    unit: 'kg',
    minStock: '',
    maxStock: '',
    unitCost: '',
    location: '',
    supplier: '',
    expiryDate: '',
    notes: '',
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (showLowStock) params.set('lowStock', 'true');

      const res = await fetch(`/api/goats/inventory?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, showLowStock]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const isLowStock = (item: InventoryItem) =>
    item.minStock !== null && parseFloat(item.currentStock.toString()) <= parseFloat(item.minStock.toString());

  const isExpiringSoon = (item: InventoryItem) => {
    if (!item.expiryDate) return false;
    const daysUntilExpiry = (new Date(item.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (item: InventoryItem) => {
    if (!item.expiryDate) return false;
    return new Date(item.expiryDate) < new Date();
  };

  const handleRecordTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionItem || submitting) return;

    setSubmitting(true);
    try {
      const totalCost = transactionForm.unitCost && transactionForm.quantity
        ? parseFloat(transactionForm.unitCost) * parseFloat(transactionForm.quantity)
        : null;

      const res = await fetch(`/api/goats/inventory/${transactionItem.id}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transactionForm,
          quantity: parseFloat(transactionForm.quantity),
          unitCost: transactionForm.unitCost ? parseFloat(transactionForm.unitCost) : null,
          totalCost,
        }),
      });

      if (res.ok) {
        setShowTransactionModal(false);
        setTransactionForm({ type: 'PURCHASE', quantity: '', unitCost: '', reference: '', supplier: '', notes: '' });
        setTransactionItem(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Error recording transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      currentStock: item.currentStock.toString(),
      unit: item.unit,
      minStock: item.minStock?.toString() || '',
      maxStock: item.maxStock?.toString() || '',
      unitCost: item.unitCost?.toString() || '',
      location: item.location || '',
      supplier: item.supplier || '',
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      notes: item.notes || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/goats/inventory/${editItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          category: editForm.category,
          currentStock: parseFloat(editForm.currentStock),
          unit: editForm.unit,
          minStock: editForm.minStock ? parseFloat(editForm.minStock) : null,
          maxStock: editForm.maxStock ? parseFloat(editForm.maxStock) : null,
          unitCost: editForm.unitCost ? parseFloat(editForm.unitCost) : null,
          location: editForm.location || null,
          supplier: editForm.supplier || null,
          expiryDate: editForm.expiryDate || null,
          notes: editForm.notes || null,
        }),
      });
      if (res.ok) {
        setShowEditModal(false);
        setEditItem(null);
        setSelectedItem(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Error updating inventory item:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/goats/inventory/${deleteItem.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setShowDeleteConfirm(false);
        setDeleteItem(null);
        setSelectedItem(null);
        fetchInventory();
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setDeleting(false);
    }
  };

  const getCategoryLabel = (cat: string) =>
    GOAT_CATEGORIES.find(c => c.value === cat)?.label || cat;

  const CategoryIcon = ({ category: cat }: { category: string }) => {
    const Icon = CATEGORY_ICONS[cat] || Package;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Link href="/dashboard/goats" className="hover:text-green-600 flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Goats
            </Link>
            <span>/</span>
            <span>Inventory</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Goat Inventory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage feed, medicine, supplements, and equipment for your goat herd
          </p>
        </div>
        <Link
          href="/dashboard/goats/inventory/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalItems}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.lowStockCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  K{stats.totalValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Wheat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(stats.categoryBreakdown).length}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            {GOAT_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showLowStock
                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                : 'bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            Low Stock
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {items.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              No inventory items yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Start by adding feed, medicine, or supplies for your goats
            </p>
            <Link
              href="/dashboard/goats/inventory/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add First Item
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Unit Cost</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Supplier</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item) => {
                    const low = isLowStock(item);
                    const expiring = isExpiringSoon(item);
                    const expired = isExpired(item);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                        onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.OTHER}`}>
                            <CategoryIcon category={item.category} />
                            {getCategoryLabel(item.category)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className={`font-semibold text-sm ${low ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            {parseFloat(item.currentStock.toString()).toLocaleString()} {item.unit}
                          </p>
                          {item.minStock !== null && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Min: {parseFloat(item.minStock.toString())} {item.unit}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-white">
                          {item.unitCost ? `K${parseFloat(item.unitCost.toString()).toLocaleString()}` : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                          {item.supplier || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {low && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                <TrendingDown className="w-3 h-3" />
                                Low
                              </span>
                            )}
                            {expired && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-full text-xs font-medium">
                                Expired
                              </span>
                            )}
                            {expiring && !expired && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-medium">
                                Expiring
                              </span>
                            )}
                            {!low && !expired && !expiring && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                <TrendingUp className="w-3 h-3" />
                                OK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(item);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteItem(item);
                                setShowDeleteConfirm(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTransactionItem(item);
                                setShowTransactionModal(true);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                            >
                              <ArrowUpDown className="w-3 h-3" />
                              Record
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {items.map((item) => {
                const low = isLowStock(item);
                const expired = isExpired(item);
                const expiring = isExpiringSoon(item);

                return (
                  <div
                    key={item.id}
                    className="p-4 space-y-3"
                    onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.OTHER}`}>
                        <CategoryIcon category={item.category} />
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-lg font-bold ${low ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                          {parseFloat(item.currentStock.toString()).toLocaleString()} {item.unit}
                        </p>
                        {item.unitCost && (
                          <p className="text-xs text-gray-500">K{parseFloat(item.unitCost.toString())} per {item.unit}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {low && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">Low</span>
                        )}
                        {(expired || expiring) && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${expired ? 'bg-gray-100 text-gray-700' : 'bg-amber-100 text-amber-700'}`}>
                            {expired ? 'Expired' : 'Expiring'}
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTransactionItem(item);
                            setShowTransactionModal(true);
                          }}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium"
                        >
                          Record
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(item);
                          }}
                          className="px-2.5 py-1.5 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteItem(item);
                            setShowDeleteConfirm(true);
                          }}
                          className="px-2.5 py-1.5 text-red-700 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Item Detail Drawer */}
      {selectedItem && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedItem.name}</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(selectedItem)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit
              </button>
              <button
                onClick={() => {
                  setDeleteItem(selectedItem);
                  setShowDeleteConfirm(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">SKU</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.sku}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.location || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Supplier</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedItem.supplier || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expiry</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : '—'}
              </p>
            </div>
          </div>

          {selectedItem.notes && (
            <div className="mb-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.notes}</p>
            </div>
          )}

          {/* Recent Transactions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Recent Transactions</h4>
            {selectedItem.transactions.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">No transactions recorded yet</p>
            ) : (
              <div className="space-y-2">
                {selectedItem.transactions.map((tx) => {
                  const txType = TRANSACTION_TYPES.find(t => t.value === tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex items-center gap-3">
                        {txType && <txType.icon className={`w-4 h-4 ${txType.color}`} />}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {txType?.label || tx.type}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                            {tx.reference && ` · ${tx.reference}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${
                          tx.type === 'PURCHASE' || tx.type === 'RETURN' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.type === 'PURCHASE' || tx.type === 'RETURN' ? '+' : '-'}
                          {parseFloat(tx.quantity.toString()).toLocaleString()}
                        </p>
                        {tx.totalCost && (
                          <p className="text-xs text-gray-500">K{parseFloat(tx.totalCost.toString()).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Inventory Item</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{editItem.name}</p>
              </div>
              <button
                onClick={() => { setShowEditModal(false); setEditItem(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    {GOAT_CATEGORIES.filter(c => c.value).map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit *</label>
                  <select
                    value={editForm.unit}
                    onChange={(e) => setEditForm(f => ({ ...f, unit: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="L">Litres (L)</option>
                    <option value="mL">Millilitres (mL)</option>
                    <option value="pcs">Pieces (pcs)</option>
                    <option value="bags">Bags</option>
                    <option value="bales">Bales</option>
                    <option value="bottles">Bottles</option>
                    <option value="doses">Doses</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Stock *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.currentStock}
                    onChange={(e) => setEditForm(f => ({ ...f, currentStock: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Min Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.minStock}
                    onChange={(e) => setEditForm(f => ({ ...f, minStock: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Stock</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.maxStock}
                    onChange={(e) => setEditForm(f => ({ ...f, maxStock: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit Cost (K)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.unitCost}
                    onChange={(e) => setEditForm(f => ({ ...f, unitCost: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={editForm.expiryDate}
                    onChange={(e) => setEditForm(f => ({ ...f, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="Storage location"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
                  <input
                    type="text"
                    value={editForm.supplier}
                    onChange={(e) => setEditForm(f => ({ ...f, supplier: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="Supplier name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditItem(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Item</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-medium text-gray-900 dark:text-white">{deleteItem.name}</span>? This will deactivate the item.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTransactionModal && transactionItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Transaction</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{transactionItem.name}</p>
              </div>
              <button
                onClick={() => { setShowTransactionModal(false); setTransactionItem(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordTransaction} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={transactionForm.type}
                  onChange={(e) => setTransactionForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  {TRANSACTION_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity ({transactionItem.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transactionForm.quantity}
                  onChange={(e) => setTransactionForm(f => ({ ...f, quantity: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  placeholder="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current stock: {parseFloat(transactionItem.currentStock.toString()).toLocaleString()} {transactionItem.unit}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit Cost (K)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.unitCost}
                    onChange={(e) => setTransactionForm(f => ({ ...f, unitCost: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={transactionForm.reference}
                    onChange={(e) => setTransactionForm(f => ({ ...f, reference: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="Invoice #"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  value={transactionForm.supplier}
                  onChange={(e) => setTransactionForm(f => ({ ...f, supplier: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  placeholder="Supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={transactionForm.notes}
                  onChange={(e) => setTransactionForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowTransactionModal(false); setTransactionItem(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
