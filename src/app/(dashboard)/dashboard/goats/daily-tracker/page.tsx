'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Calendar,
  Clock,
  User,
  Filter,
  Utensils,
  Droplets,
  Heart,
  Scissors,
  Scale,
  Shield,
  Home,
  Hammer,
  FileText,
  Sparkles,
  Pill,
  Baby,
  Move,
  MoreHorizontal,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

type Worker = { id: string; firstName: string; lastName: string };
type Animal = { id: string; tag: string; name: string | null };

type DailyLog = {
  id: string;
  date: string;
  activity: string;
  description: string | null;
  goatsAffected: number | null;
  timeSpent: number | null;
  status: string;
  notes: string | null;
  worker: { id: string; firstName: string; lastName: string; position?: string } | null;
  animal: { id: string; tag: string; name: string | null } | null;
};

type CalendarDay = {
  total: number;
  activities: Record<string, number>;
};

const ACTIVITIES = [
  { value: 'FEEDING', label: 'Feeding', icon: Utensils, color: 'bg-amber-500' },
  { value: 'WATERING', label: 'Watering', icon: Droplets, color: 'bg-blue-500' },
  { value: 'MILKING', label: 'Milking', icon: Droplets, color: 'bg-white border-2 border-gray-300' },
  { value: 'CLEANING', label: 'Cleaning', icon: Sparkles, color: 'bg-cyan-500' },
  { value: 'HEALTH_CHECK', label: 'Health Check', icon: Heart, color: 'bg-red-500' },
  { value: 'VACCINATION', label: 'Vaccination', icon: Shield, color: 'bg-green-600' },
  { value: 'DEWORMING', label: 'Deworming', icon: Pill, color: 'bg-purple-500' },
  { value: 'HOOF_TRIMMING', label: 'Hoof Trimming', icon: Scissors, color: 'bg-orange-500' },
  { value: 'BREEDING', label: 'Breeding', icon: Heart, color: 'bg-pink-500' },
  { value: 'KIDDING_ASSIST', label: 'Kidding Assist', icon: Baby, color: 'bg-rose-400' },
  { value: 'WEIGHING', label: 'Weighing', icon: Scale, color: 'bg-indigo-500' },
  { value: 'MOVING_PASTURE', label: 'Moving Pasture', icon: Move, color: 'bg-green-500' },
  { value: 'FENCE_REPAIR', label: 'Fence Repair', icon: Hammer, color: 'bg-gray-600' },
  { value: 'SHELTER_MAINTENANCE', label: 'Shelter Maintenance', icon: Home, color: 'bg-yellow-600' },
  { value: 'RECORD_KEEPING', label: 'Record Keeping', icon: FileText, color: 'bg-slate-500' },
  { value: 'MEDICATION', label: 'Medication', icon: Pill, color: 'bg-red-400' },
  { value: 'GROOMING', label: 'Grooming', icon: Scissors, color: 'bg-teal-500' },
  { value: 'SORTING', label: 'Sorting', icon: Filter, color: 'bg-violet-500' },
  { value: 'OTHER', label: 'Other', icon: MoreHorizontal, color: 'bg-gray-400' },
];

const STATUS_OPTIONS = [
  { value: 'COMPLETED', label: 'Completed', icon: CheckCircle2, color: 'text-green-600' },
  { value: 'IN_PROGRESS', label: 'In Progress', icon: Clock, color: 'text-blue-600' },
  { value: 'PLANNED', label: 'Planned', icon: Circle, color: 'text-gray-500' },
  { value: 'SKIPPED', label: 'Skipped', icon: XCircle, color: 'text-red-500' },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getActivityInfo(activity: string) {
  return ACTIVITIES.find(a => a.value === activity) || ACTIVITIES[ACTIVITIES.length - 1];
}

export default function GoatDailyTrackerPage() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [calendarData, setCalendarData] = useState<Record<string, CalendarDay>>({});
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [goats, setGoats] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterWorker, setFilterWorker] = useState('');
  const [filterActivity, setFilterActivity] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [dayLogs, setDayLogs] = useState<DailyLog[]>([]);
  const [form, setForm] = useState({
    date: '',
    workerId: '',
    activity: 'FEEDING',
    description: '',
    goatsAffected: '',
    animalId: '',
    timeSpent: '',
    status: 'COMPLETED',
    notes: '',
  });

  const monthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

  const fetchMonthData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month: monthKey });
      if (filterWorker) params.set('workerId', filterWorker);
      if (filterActivity) params.set('activity', filterActivity);

      const res = await fetch(`/api/goats/daily-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setCalendarData(data.calendarData);
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error('Error fetching month data:', error);
    } finally {
      setLoading(false);
    }
  }, [monthKey, filterWorker, filterActivity]);

  // Fetch goats for the form dropdown
  const fetchGoats = useCallback(async () => {
    try {
      const res = await fetch('/api/goats?pageSize=200');
      if (res.ok) {
        const data = await res.json();
        setGoats(data.goats?.map((g: { id: string; tag: string; name: string | null }) => ({
          id: g.id,
          tag: g.tag,
          name: g.name,
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching goats:', error);
    }
  }, []);

  useEffect(() => {
    fetchMonthData();
  }, [fetchMonthData]);

  useEffect(() => {
    fetchGoats();
  }, [fetchGoats]);

  // When a date is selected, filter logs for that day
  useEffect(() => {
    if (selectedDate) {
      const filtered = logs.filter(
        (l) => new Date(l.date).toISOString().split('T')[0] === selectedDate
      );
      setDayLogs(filtered);
    } else {
      setDayLogs([]);
    }
  }, [selectedDate, logs]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    const todayStr = today.toISOString().split('T')[0];
    setSelectedDate(todayStr);
  };

  // Build calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  const todayStr = today.toISOString().split('T')[0];

  const openAddForDate = (dateStr: string) => {
    setForm(f => ({
      ...f,
      date: dateStr,
      workerId: '',
      activity: 'FEEDING',
      description: '',
      goatsAffected: '',
      animalId: '',
      timeSpent: '',
      status: 'COMPLETED',
      notes: '',
    }));
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/goats/daily-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAddModal(false);
        fetchMonthData();
      }
    } catch (error) {
      console.error('Error creating log:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Delete this activity log?')) return;
    try {
      const res = await fetch(`/api/goats/daily-logs/${logId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMonthData();
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  const getDateKey = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

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
            <span>Daily Tracker</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Daily Management Tracker
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track daily goat activities and worker tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() => {
              const dateStr = selectedDate || todayStr;
              openAddForDate(dateStr);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Log Activity
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterWorker}
            onChange={(e) => setFilterWorker(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            <option value="">All Workers</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>
            ))}
          </select>
          <select
            value={filterActivity}
            onChange={(e) => setFilterActivity(e.target.value)}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
          >
            <option value="">All Activities</option>
            {ACTIVITIES.map(a => (
              <option key={a.value} value={a.value}>{a.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
          </div>
        ) : (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
              {DAYS.map(day => (
                <div key={day} className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarCells.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="min-h-[80px] sm:min-h-[100px] bg-gray-50/50 dark:bg-gray-800/50 border-b border-r border-gray-100 dark:border-gray-700/50" />;
                }

                const dateKey = getDateKey(day);
                const isToday = dateKey === todayStr;
                const isSelected = dateKey === selectedDate;
                const data = calendarData[dateKey];
                const activityCount = data?.total || 0;

                // Get top 3 activity colors for dots
                const topActivities = data
                  ? Object.entries(data.activities)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                  : [];

                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(dateKey === selectedDate ? null : dateKey)}
                    className={`min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-gray-100 dark:border-gray-700/50 text-left transition-colors relative ${
                      isSelected
                        ? 'bg-green-50 dark:bg-green-900/20 ring-2 ring-inset ring-green-500'
                        : isToday
                        ? 'bg-blue-50/50 dark:bg-blue-900/10'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                    }`}
                  >
                    <span className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full ${
                      isToday
                        ? 'bg-blue-600 text-white'
                        : isSelected
                        ? 'bg-green-600 text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day}
                    </span>

                    {activityCount > 0 && (
                      <div className="mt-1 space-y-0.5">
                        <div className="flex flex-wrap gap-0.5">
                          {topActivities.map(([act]) => {
                            const info = getActivityInfo(act);
                            return (
                              <span
                                key={act}
                                className={`w-2 h-2 rounded-full ${info.color}`}
                                title={info.label}
                              />
                            );
                          })}
                        </div>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                          {activityCount} {activityCount === 1 ? 'activity' : 'activities'}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Activity Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity Legend</h3>
        <div className="flex flex-wrap gap-3">
          {ACTIVITIES.slice(0, 12).map(a => (
            <div key={a.value} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${a.color}`} />
              <span className="text-xs text-gray-600 dark:text-gray-400">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      {selectedDate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {dayLogs.length} {dayLogs.length === 1 ? 'activity' : 'activities'} logged
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAddForDate(selectedDate)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
              <button
                onClick={() => setSelectedDate(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {dayLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">No activities logged for this day</p>
              <button
                onClick={() => openAddForDate(selectedDate)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Log First Activity
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {dayLogs.map((log) => {
                const actInfo = getActivityInfo(log.activity);
                const statusInfo = STATUS_OPTIONS.find(s => s.value === log.status);
                const ActIcon = actInfo.icon;
                const StatusIcon = statusInfo?.icon || Circle;

                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${actInfo.color} ${actInfo.value === 'MILKING' ? '' : 'text-white'} flex-shrink-0 mt-0.5`}>
                        <ActIcon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {actInfo.label}
                          </h4>
                          <span className={`inline-flex items-center gap-1 text-xs ${statusInfo?.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo?.label}
                          </span>
                        </div>

                        {log.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{log.description}</p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {log.worker && (
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.worker.firstName} {log.worker.lastName}
                            </span>
                          )}
                          {log.animal && (
                            <span className="inline-flex items-center gap-1">
                              🐐 {log.animal.tag} {log.animal.name && `(${log.animal.name})`}
                            </span>
                          )}
                          {log.goatsAffected && (
                            <span>{log.goatsAffected} goats</span>
                          )}
                          {log.timeSpent && (
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.timeSpent}h
                            </span>
                          )}
                        </div>

                        {log.notes && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">{log.notes}</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(log.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Log Activity</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {form.date && new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long', month: 'long', day: 'numeric',
                  })}
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                />
              </div>

              {/* Activity Type - Grid */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity *</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {ACTIVITIES.map(a => {
                    const Icon = a.icon;
                    return (
                      <button
                        key={a.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, activity: a.value }))}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-colors text-center ${
                          form.activity === a.value
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${a.color} ${a.value === 'MILKING' ? '' : 'text-white'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300 leading-tight">{a.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Worker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Worker</label>
                <select
                  value={form.workerId}
                  onChange={(e) => setForm(f => ({ ...f, workerId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="">— Select worker —</option>
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>{w.firstName} {w.lastName}</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  placeholder="e.g. Fed morning ration of pellets + hay"
                />
              </div>

              {/* Specific Goat (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Specific Goat <span className="text-gray-400">(optional)</span>
                </label>
                <select
                  value={form.animalId}
                  onChange={(e) => setForm(f => ({ ...f, animalId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                >
                  <option value="">— All goats / general —</option>
                  {goats.map(g => (
                    <option key={g.id} value={g.id}>{g.tag} {g.name && `(${g.name})`}</option>
                  ))}
                </select>
              </div>

              {/* Row: Goats Affected, Time Spent, Status */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"># Goats</label>
                  <input
                    type="number"
                    value={form.goatsAffected}
                    onChange={(e) => setForm(f => ({ ...f, goatsAffected: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hours</label>
                  <input
                    type="number"
                    step="0.25"
                    value={form.timeSpent}
                    onChange={(e) => setForm(f => ({ ...f, timeSpent: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                    placeholder="0.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !form.activity || !form.date}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Saving...' : 'Log Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
