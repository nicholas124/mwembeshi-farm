'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatDate, formatDateShort } from '@/lib/utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  TERMINATED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const workerTypeLabels: Record<string, string> = {
  PERMANENT: 'Permanent',
  CASUAL: 'Casual',
  SEASONAL: 'Seasonal',
  CONTRACT: 'Contract',
};

const attendanceIcons: Record<string, React.ReactNode> = {
  PRESENT: <CheckCircle className="w-4 h-4 text-green-500" />,
  ABSENT: <XCircle className="w-4 h-4 text-red-500" />,
  HALF_DAY: <AlertCircle className="w-4 h-4 text-yellow-500" />,
  LEAVE: <Clock className="w-4 h-4 text-blue-500" />,
  SICK: <AlertCircle className="w-4 h-4 text-orange-500" />,
  HOLIDAY: <Calendar className="w-4 h-4 text-purple-500" />,
};

export default function WorkerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const id = params.id;

  async function fetchWorker() {
    try {
      const response = await fetch(`/api/workers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch worker');
      }
      const result = await response.json();
      setWorker(result.data);
    } catch (error) {
      console.error('Error fetching worker:', error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchWorker();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to terminate this worker?')) {
      return;
    }

    try {
      const response = await fetch(`/api/workers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/workers');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to terminate worker');
      }
    } catch (error) {
      alert('Failed to terminate worker');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading worker details...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Worker not found</p>
          <Link
            href="/dashboard/workers"
            className="mt-4 inline-flex items-center gap-2 text-green-600 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Workers
          </Link>
        </div>
      </div>
    );
  }

  const totalPayments = worker.payments?.reduce((sum: number, p: any) => sum + Number(p.amount), 0) || 0;
  const presentDays = worker.attendances?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const totalDays = worker.attendances?.length || 0;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/workers"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {worker.firstName} {worker.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Employee ID: {worker.employeeId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/workers/${id}/edit`}
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
            Terminate
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button 
            onClick={() => setShowAttendanceModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Attendance</span>
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
          >
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Record Payment</span>
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[worker.status]}`}>
          {worker.status.replace('_', ' ')}
        </span>
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          {workerTypeLabels[worker.workerType]}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Position</p>
                  <p className="font-medium text-gray-900 dark:text-white">{worker.position}</p>
                </div>
              </div>
              {worker.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{worker.phone}</p>
                  </div>
                </div>
              )}
              {worker.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
                    <p className="font-medium text-gray-900 dark:text-white">{worker.address}</p>
                  </div>
                </div>
              )}
              {worker.nrc && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">NRC</p>
                    <p className="font-medium text-gray-900 dark:text-white">{worker.nrc}</p>
                  </div>
                </div>
              )}
              {worker.dateOfBirth && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(worker.dateOfBirth)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Hire Date</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(worker.hireDate)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation */}
          {(worker.dailyRate || worker.monthlyRate) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compensation
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worker.dailyRate && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ZMW {Number(worker.dailyRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
                {worker.monthlyRate && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ZMW {Number(worker.monthlyRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(worker.emergencyContact || worker.emergencyPhone) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Emergency Contact
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {worker.emergencyContact && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Contact Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {worker.emergencyContact}
                      </p>
                    </div>
                  </div>
                )}
                {worker.emergencyPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {worker.emergencyPhone}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Attendance */}
          {worker.attendances && worker.attendances.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Attendance
              </h2>
              <div className="space-y-3">
                {worker.attendances.slice(0, 10).map((attendance: any) => (
                  <div
                    key={attendance.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {attendanceIcons[attendance.status]}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDate(attendance.date)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {attendance.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {attendance.hoursWorked && (
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {Number(attendance.hoursWorked).toFixed(1)}h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {worker.notes && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {worker.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Stats & Payments */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ZMW {totalPayments.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendanceRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {presentDays} of {totalDays} days
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tasks Assigned</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {worker.taskAssignments?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Payments */}
          {worker.payments && worker.payments.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Payments
              </h2>
              <div className="space-y-3">
                {worker.payments.slice(0, 5).map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {payment.paymentType}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDateShort(payment.paymentDate)}
                      </p>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ZMW {Number(payment.amount).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance Modal */}
      {showAttendanceModal && (
        <AttendanceModal
          workerId={id}
          onClose={() => setShowAttendanceModal(false)}
          onSuccess={() => {
            setShowAttendanceModal(false);
            fetchWorker();
          }}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          workerId={id}
          workerRate={worker.dailyRate || worker.monthlyRate}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            setShowPaymentModal(false);
            fetchWorker();
          }}
        />
      )}
    </div>
  );
}

// Attendance Modal Component
function AttendanceModal({ workerId, onClose, onSuccess }: { workerId: string; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'PRESENT',
    hoursWorked: '8',
    overtime: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/workers/${workerId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record attendance');
      }
    } catch (error) {
      alert('Failed to record attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Attendance</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="LEAVE">Leave</option>
              <option value="SICK">Sick</option>
              <option value="HOLIDAY">Holiday</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hours Worked
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.hoursWorked}
                onChange={(e) => setFormData({ ...formData, hoursWorked: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overtime
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.overtime}
                onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
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
              <Clock className="w-4 h-4" />
              {isSaving ? 'Recording...' : 'Record Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Payment Modal Component
function PaymentModal({ workerId, workerRate, onClose, onSuccess }: { workerId: string; workerRate?: number; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    amount: workerRate ? String(workerRate) : '',
    paymentType: 'SALARY',
    paymentDate: new Date().toISOString().split('T')[0],
    daysWorked: '',
    deductions: '',
    bonus: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/workers/${workerId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to record payment');
      }
    } catch (error) {
      alert('Failed to record payment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-lg w-full my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Record Payment</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (ZMW) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.paymentType}
                onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="SALARY">Salary</option>
                <option value="WAGE">Wage</option>
                <option value="BONUS">Bonus</option>
                <option value="ADVANCE">Advance</option>
                <option value="OVERTIME">Overtime</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Date
              </label>
              <input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Days Worked
              </label>
              <input
                type="number"
                value={formData.daysWorked}
                onChange={(e) => setFormData({ ...formData, daysWorked: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deductions
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.deductions}
                onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bonus
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.bonus}
                onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="CASH">Cash</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="BANK">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
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
              <DollarSign className="w-4 h-4" />
              {isSaving ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}