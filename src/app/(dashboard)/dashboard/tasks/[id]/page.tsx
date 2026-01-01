'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Users,
  Plus,
  X,
  Check,
  UserPlus
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const categoryEmoji: Record<string, string> = {
  LIVESTOCK: '🐄',
  CROPS: '🌾',
  EQUIPMENT: '🔧',
  MAINTENANCE: '🛠️',
  GENERAL: '📋',
  ADMINISTRATIVE: '📊',
};

export default function TaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [workers, setWorkers] = useState<any[]>([]);
  const id = params.id;

  async function fetchTask() {
    try {
      const response = await fetch(`/api/tasks/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }
      const result = await response.json();
      setTask(result.data);
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchTask();
    // Fetch workers for assignment modal
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => setWorkers(data.data || []))
      .catch(console.error);
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/tasks');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to cancel task');
      }
    } catch (error) {
      alert('Failed to cancel task');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading task details...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Task not found</p>
          <Link
            href="/dashboard/tasks"
            className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  const durationDays = task.startedAt && task.completedAt
    ? Math.ceil((new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/tasks"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl">{categoryEmoji[task.category]}</span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {task.title}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {task.category.replace('_', ' ')} Task
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/tasks/${id}/edit`}
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
            Cancel
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
          {task.status.replace('_', ' ')}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[task.priority]}`}>
          {task.priority} Priority
        </span>
        {isOverdue && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            Overdue
          </span>
        )}
      </div>

      {/* Quick Actions */}
      {task.status !== 'COMPLETED' && task.status !== 'CANCELLED' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button 
              onClick={() => setShowWorkerModal(true)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              <UserPlus className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Assign Workers</span>
            </button>
            <button 
              onClick={() => setShowCompleteModal(true)}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              <Check className="w-5 h-5 mx-auto mb-1 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Complete Task</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {task.description && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(task.createdAt)}
                  </p>
                </div>
              </div>
              {task.dueDate && (
                <div className="flex items-start gap-3">
                  <Clock className={`w-5 h-5 mt-0.5 ${isOverdue ? 'text-red-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                      {formatDate(task.dueDate)}
                      {isOverdue && ' (Overdue)'}
                    </p>
                  </div>
                </div>
              )}
              {task.startedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Started</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(task.startedAt)}
                    </p>
                  </div>
                </div>
              )}
              {task.completedAt && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(task.completedAt)}
                    </p>
                    {durationDays && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Took {durationDays} day{durationDays !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Created By</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {task.createdBy?.name || 'Unknown'}
                  </p>
                  {task.createdBy?.email && (
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {task.createdBy.email}
                    </p>
                  )}
                </div>
              </div>
              {task.assignedTo && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {task.assignedTo.name}
                    </p>
                    {task.assignedTo.email && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        {task.assignedTo.email}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Assigned Workers */}
          {task.workers && task.workers.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Assigned Workers
              </h2>
              <div className="space-y-3">
                {task.workers.map((tw: any) => (
                  <div
                    key={tw.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tw.worker.firstName} {tw.worker.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {tw.worker.position}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      Assigned {formatDateShort(tw.assignedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Effort Tracking */}
          {(task.estimatedHours || task.actualHours) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Effort Tracking
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {task.estimatedHours && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Number(task.estimatedHours).toFixed(1)}h
                    </p>
                  </div>
                )}
                {task.actualHours && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Actual Hours</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Number(task.actualHours).toFixed(1)}h
                    </p>
                  </div>
                )}
              </div>
              {task.estimatedHours && task.actualHours && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Variance:{' '}
                    <span className={Number(task.actualHours) > Number(task.estimatedHours) ? 'text-red-600' : 'text-green-600'}>
                      {(Number(task.actualHours) - Number(task.estimatedHours)).toFixed(1)}h
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          {task.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {task.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Info
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.status.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Priority</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.priority}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.category.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Workers Assigned</p>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {task.workers?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Overdue Alert */}
          {isOverdue && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-300">
                    Task Overdue
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    This task was due on {formatDateShort(task.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Worker Assignment Modal */}
      {showWorkerModal && (
        <WorkerAssignmentModal
          taskId={id}
          assignedWorkers={task.workers || []}
          availableWorkers={workers}
          onClose={() => setShowWorkerModal(false)}
          onSuccess={() => {
            setShowWorkerModal(false);
            fetchTask();
          }}
        />
      )}

      {/* Complete Task Modal */}
      {showCompleteModal && (
        <CompleteTaskModal
          taskId={id}
          estimatedHours={task.estimatedHours}
          onClose={() => setShowCompleteModal(false)}
          onSuccess={() => {
            setShowCompleteModal(false);
            fetchTask();
          }}
        />
      )}
    </div>
  );
}

// Worker Assignment Modal Component
function WorkerAssignmentModal({ 
  taskId, 
  assignedWorkers, 
  availableWorkers, 
  onClose, 
  onSuccess 
}: { 
  taskId: string; 
  assignedWorkers: any[]; 
  availableWorkers: any[]; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const assignedWorkerIds = assignedWorkers.map((tw: any) => tw.worker.id);
  const unassignedWorkers = availableWorkers.filter(
    (w: any) => !assignedWorkerIds.includes(w.id) && w.status === 'ACTIVE'
  );

  const handleAssign = async () => {
    if (!selectedWorkerId) return;
    setIsAssigning(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: selectedWorkerId }),
      });

      if (response.ok) {
        setSelectedWorkerId('');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign worker');
      }
    } catch (error) {
      alert('Failed to assign worker');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async (workerId: string) => {
    setIsRemoving(workerId);

    try {
      const response = await fetch(`/api/tasks/${taskId}/workers?workerId=${workerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove worker');
      }
    } catch (error) {
      alert('Failed to remove worker');
    } finally {
      setIsRemoving(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assign Workers</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Assign new worker */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Add Worker
          </label>
          <div className="flex gap-2">
            <select
              value={selectedWorkerId}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select worker...</option>
              {unassignedWorkers.map((worker: any) => (
                <option key={worker.id} value={worker.id}>
                  {worker.firstName} {worker.lastName} - {worker.position}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssign}
              disabled={!selectedWorkerId || isAssigning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {isAssigning ? '...' : 'Add'}
            </button>
          </div>
        </div>

        {/* Currently assigned workers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Assigned Workers ({assignedWorkers.length})
          </label>
          {assignedWorkers.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-3 text-center">
              No workers assigned yet
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {assignedWorkers.map((tw: any) => (
                <div
                  key={tw.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {tw.worker.firstName} {tw.worker.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {tw.worker.position}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(tw.worker.id)}
                    disabled={isRemoving === tw.worker.id}
                    className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// Complete Task Modal Component
function CompleteTaskModal({ 
  taskId, 
  estimatedHours, 
  onClose, 
  onSuccess 
}: { 
  taskId: string; 
  estimatedHours: number | null; 
  onClose: () => void; 
  onSuccess: () => void 
}) {
  const [formData, setFormData] = useState({
    actualHours: estimatedHours ? String(estimatedHours) : '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to complete task');
      }
    } catch (error) {
      alert('Failed to complete task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Task</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Actual Hours Spent
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.actualHours}
              onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
              placeholder="Enter hours worked"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
            />
            {estimatedHours && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Estimated: {Number(estimatedHours).toFixed(1)} hours
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Completion Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Any notes about the completed work..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
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
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {isSaving ? 'Completing...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}