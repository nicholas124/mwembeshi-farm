'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { formatMonthYear } from '@/lib/utils';

const roleColors: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  SUPERVISOR: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  STAFF: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  ON_LEAVE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  INACTIVE: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function WorkersPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [workers, setWorkers] = useState<any[]>([]);
  const [showAttendance, setShowAttendance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect staff users - they shouldn't access this page
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user?.role === 'STAFF') {
      router.push('/dashboard');
    }
  }, [session, sessionStatus, router]);

  // Show access denied for staff users
  if (sessionStatus === 'authenticated' && session?.user?.role === 'STAFF') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">You don&apos;t have permission to view this page.</p>
        <Link 
          href="/dashboard"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  useEffect(() => {
    async function fetchWorkers() {
      try {
        const response = await fetch('/api/workers');
        const data = await response.json();
        if (data.success) {
          setWorkers(data.data.map((w: any) => ({
            ...w,
            name: `${w.firstName} ${w.lastName}`,
            role: 'STAFF',
            department: w.position,
            presentToday: w.attendances?.[0]?.status === 'PRESENT',
            joinDate: w.createdAt
          })));
        }
      } catch (error) {
        console.error('Failed to fetch workers:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkers();
  }, []);

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.phone?.includes(searchQuery) ||
      worker.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = !selectedDepartment || worker.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const departments = Array.from(new Set(workers.map(w => w.department)));
  const presentCount = workers.filter(w => w.presentToday).length;

  const handleDeleteWorker = async (workerId: string, workerName: string) => {
    if (!confirm(`Are you sure you want to terminate ${workerName}? The worker record will be kept but marked as terminated.`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/workers/${workerId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Update local state to reflect the terminated status
        setWorkers(workers.map(w => 
          w.id === workerId ? { ...w, status: 'TERMINATED' } : w
        ));
      } else {
        alert('Failed to terminate worker. Please try again.');
      }
    } catch (error) {
      console.error('Failed to terminate worker:', error);
      alert('An error occurred while terminating the worker.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Workers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your farm workers and track attendance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAttendance(!showAttendance)}
            className="inline-flex items-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Attendance
          </button>
          <Link
            href="/dashboard/workers/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Workers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{workers.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Present Today</p>
          <p className="text-2xl font-bold text-green-600">{presentCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">On Leave</p>
          <p className="text-2xl font-bold text-yellow-600">{workers.filter(w => w.status === 'ON_LEAVE').length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Attendance Rate</p>
          <p className="text-2xl font-bold text-blue-600">{Math.round((presentCount / workers.filter(w => w.status === 'ACTIVE').length) * 100)}%</p>
        </div>
      </div>

      {/* Attendance Quick View */}
      {showAttendance && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Today&apos;s Attendance</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {workers.filter(w => w.status !== 'INACTIVE').map((worker) => (
              <button
                key={worker.id}
                className={`p-3 rounded-lg border-2 transition-colors ${
                  worker.presentToday
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">{worker.department}</span>
                  {worker.presentToday ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-300" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {worker.name.split(' ')[0]}
                </p>
              </button>
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
            placeholder="Search by name, phone, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Department Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers List */}
      <div className="space-y-3">
        {filteredWorkers.map((worker) => (
          <div
            key={worker.id}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                    {worker.name.split(' ').map((n: string) => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {worker.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[worker.role]}`}>
                      {worker.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[worker.status]}`}>
                      {worker.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {worker.department} Department
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {worker.phone && (
                      <a href={`tel:${worker.phone}`} className="flex items-center gap-1 hover:text-green-600">
                        <Phone className="w-3 h-3" />
                        {worker.phone}
                      </a>
                    )}
                    {worker.email && (
                      <a href={`mailto:${worker.email}`} className="flex items-center gap-1 hover:text-green-600">
                        <Mail className="w-3 h-3" />
                        {worker.email}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Joined: {formatMonthYear(worker.joinDate)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance & Actions */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  worker.presentToday 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {worker.presentToday ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Present
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      Absent
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/workers/${worker.id}`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/dashboard/workers/${worker.id}/edit`}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteWorker(worker.id, worker.name)}
                    className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    title="Delete worker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">👷</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No workers found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || selectedDepartment
              ? 'Try adjusting your search or filter'
              : 'Get started by adding your first worker'}
          </p>
          <Link
            href="/dashboard/workers/new"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Worker
          </Link>
        </div>
      )}
    </div>
  );
}
