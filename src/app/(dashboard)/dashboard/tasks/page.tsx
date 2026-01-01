'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Circle,
  Calendar,
  User,
  MoreHorizontal
} from 'lucide-react';
import { formatDateShort } from '@/lib/utils';

const priorityColors: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Circle className="w-4 h-4 text-gray-400" />,
  IN_PROGRESS: <Clock className="w-4 h-4 text-blue-500" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-green-500" />,
  OVERDUE: <AlertCircle className="w-4 h-4 text-red-500" />,
};

const categoryColors: Record<string, string> = {
  LIVESTOCK: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  CROPS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  EQUIPMENT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  MAINTENANCE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  INVENTORY: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  ADMIN: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export default function TasksPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        if (data.success) {
          setTasks(data.data.map((t: any) => ({
            ...t,
            assignee: t.assignedTo?.name || 'Unassigned'
          })));
        }
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assignee?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return formatDateShort(dateString);
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'COMPLETED') return false;
    return new Date(dueDate) < new Date();
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      if (response.ok) {
        setTasks(tasks.map(t => 
          t.id === taskId ? { ...t, status: 'COMPLETED' } : t
        ));
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and track farm tasks
          </p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
        </div>
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {Math.round((completedCount / tasks.length) * 100)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="pl-4 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Categories</option>
            <option value="LIVESTOCK">Livestock</option>
            <option value="CROPS">Crops</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="INVENTORY">Inventory</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const overdue = isOverdue(task.dueDate, task.status);
          return (
            <div
              key={task.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border p-4 hover:shadow-md transition-shadow ${
                overdue 
                  ? 'border-red-300 dark:border-red-800' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <button 
                    className="mt-1"
                    onClick={() => task.status !== 'COMPLETED' && handleCompleteTask(task.id)}
                    title={task.status === 'COMPLETED' ? 'Task completed' : 'Click to mark as complete'}
                  >
                    {overdue ? statusIcons['OVERDUE'] : statusIcons[task.status]}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold ${
                        task.status === 'COMPLETED' 
                          ? 'text-gray-500 line-through' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {task.assignee}
                      </span>
                      <span className={`flex items-center gap-1 ${overdue ? 'text-red-500 font-medium' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        Due: {formatDate(task.dueDate)}
                        {overdue && ' (Overdue)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {task.status !== 'COMPLETED' && (
                    <button 
                      onClick={() => handleCompleteTask(task.id)}
                      className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg"
                      title="Mark as complete"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  <Link
                    href={`/dashboard/tasks/${task.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="View details"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedStatus || selectedCategory
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first task'}
          </p>
          <Link
            href="/dashboard/tasks/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </Link>
        </div>
      )}
    </div>
  );
}
