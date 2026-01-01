'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  Package,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Edit,
  Eye,
  ArrowUpDown
} from 'lucide-react';

const categoryColors: Record<string, string> = {
  FEED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  FERTILIZER: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  FUEL: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  VETERINARY: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  CHEMICALS: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  SEEDS: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const categoryEmoji: Record<string, string> = {
  FEED: '🌾',
  FERTILIZER: '🧪',
  FUEL: '⛽',
  VETERINARY: '💉',
  CHEMICALS: '🧴',
  SEEDS: '🌱',
  OTHER: '📦',
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value'>('name');
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInventory() {
      try {
        const response = await fetch('/api/inventory');
        const data = await response.json();
        
        // Transform API data to match UI expectations
        const transformed = data.map((item: any) => ({
          ...item,
          quantity: Number(item.currentStock),
          unitPrice: Number(item.unitCost || 0),
          minStock: Number(item.minStock || 0),
          maxStock: Number(item.maxStock || 100),
        }));
        
        setInventory(transformed);
      } catch (error) {
        console.error('Error fetching inventory:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInventory();
  }, []);

  const filteredInventory = inventory
    .filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'quantity') return b.quantity - a.quantity;
      if (sortBy === 'value') return (b.quantity * b.unitPrice) - (a.quantity * a.unitPrice);
      return 0;
    });

  const lowStockItems = inventory.filter(i => i.quantity <= i.minStock);
  const totalValue = inventory.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
  const categories = Array.from(new Set(inventory.map(i => i.category)));

  const getStockLevel = (item: any) => {
    const ratio = item.quantity / item.maxStock;
    if (item.quantity <= item.minStock) return { level: 'low', color: 'bg-red-500' };
    if (ratio < 0.5) return { level: 'medium', color: 'bg-yellow-500' };
    return { level: 'good', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track farm supplies and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory/movements"
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowUpDown className="w-4 h-4" />
            Stock Movements
          </Link>
          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{inventory.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Value</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            K{totalValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock</p>
            {lowStockItems.length > 0 && <AlertTriangle className="w-4 h-4 text-red-500" />}
          </div>
          <p className="text-2xl font-bold text-red-600">{lowStockItems.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800 dark:text-red-200">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-red-700 dark:text-red-300 mb-2">
            {lowStockItems.length} item(s) are below minimum stock levels:
          </p>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.id} className="px-2 py-1 bg-red-100 dark:bg-red-900/50 rounded text-xs font-medium text-red-800 dark:text-red-200">
                {item.name} ({item.quantity} {item.unit})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity' | 'value')}
          className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
        >
          <option value="name">Sort by Name</option>
          <option value="quantity">Sort by Quantity</option>
          <option value="value">Sort by Value</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock Level</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInventory.map((item) => {
                const stock = getStockLevel(item);
                const stockPercentage = Math.min((item.quantity / item.maxStock) * 100, 100);
                
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{categoryEmoji[item.category] || '📦'}</span>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">K{item.unitPrice}/{item.unit}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[item.category]}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="w-24">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`${item.quantity <= item.minStock ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                            {Math.round(stockPercentage)}%
                          </span>
                          {item.quantity <= item.minStock && (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stock.color}`}
                            style={{ width: `${stockPercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${item.quantity <= item.minStock ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {item.quantity} {item.unit}
                      </span>
                      <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 dark:text-white">
                        K{(item.quantity * item.unitPrice).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.location}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/inventory/${item.id}`}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/dashboard/inventory/${item.id}/edit`}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No items found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedCategory
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first inventory item'}
          </p>
          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        </div>
      )}
    </div>
  );
}
