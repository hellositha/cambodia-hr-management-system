'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AttendanceRecord } from '@/lib/types';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Home,
  UserX,
  Plus,
  Play,
  Square,
  TrendingUp,
  Download,
  Printer,
  FileText,
  Building2,
  UserCheck,
  Briefcase,
  ChevronRight,
  Shield,
  Layers,
} from 'lucide-react';

export default function AttendancePage() {
  const { currentPersona, isClockedIn, clockInTime, toggleClock, refreshKey, triggerRefresh, showToast, language } = useApp();

  const isEmployee = currentPersona.role === 'Employee';

  // Mode: for Employee, default to 'my-report'; for Manager/Admin, default to 'roster' but allow switching
  const [viewMode, setViewMode] = useState<'my-report' | 'roster'>(isEmployee ? 'my-report' : 'roster');

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-09-21');
  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Live timer for the clock banner
  const [currentTime, setCurrentTime] = useState<string>('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    employee_id: currentPersona.id,
    date: selectedDate,
    clock_in: '09:00:00',
    clock_out: '17:30:00',
    status: 'Present',
    work_hours: '8.5',
    notes: 'Office presence',
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update view mode when persona changes
  useEffect(() => {
    if (currentPersona.role === 'Employee') {
      setViewMode('my-report');
    }
  }, [currentPersona.role]);

  // Fetch Attendance Records
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (viewMode === 'my-report') {
      // Fetch entire month for personal attendance report
      if (selectedMonth) params.append('month', selectedMonth);
      params.append('employee_id', currentPersona.id);
    } else {
      // Daily team roster view
      if (selectedDate) params.append('date', selectedDate);
    }

    fetch(`/api/attendance?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching attendance:', err);
        setLoading(false);
      });
  }, [viewMode, selectedDate, selectedMonth, currentPersona.id, refreshKey]);

  // Calculations for stats
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const remoteCount = records.filter((r) => r.status === 'Remote').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const totalRecords = records.length;
  const totalHours = records.reduce((sum, r) => sum + (Number(r.work_hours) || 0), 0);
  const attendanceRate = totalRecords > 0 ? Math.round(((presentCount + remoteCount) / totalRecords) * 100) : 100;

  // Filtered rows
  const filteredRecords = records.filter((r) => {
    const matchName = (r.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (r.employee_role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (r.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchName && matchStatus;
  });

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manualForm),
      });
      if (res.ok) {
        showToast('បានកត់ត្រាវត្តមានដោយជោគជ័យ! ✓ (Attendance logged successfully)', 'success');
        setManualModalOpen(false);
        triggerRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'បរាជ័យក្នុងការកត់ត្រា', 'error');
      }
    } catch {
      showToast('Network error saving record', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const headers = ['Date', 'Employee Name', 'Role', 'Clock In', 'Clock Out', 'Logged Hours', 'Status', 'Notes'];
    const rows = filteredRecords.map((r) => [
      r.date,
      `"${r.employee_name || currentPersona.name}"`,
      `"${r.employee_role || currentPersona.title}"`,
      r.clock_in || '--',
      r.clock_out || '--',
      r.work_hours || 0,
      r.status,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HESTRA-Attendance-Report-${selectedMonth || selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('របាយការណ៍វត្តមានត្រូវបានទាញយកជា CSV រួចរាល់! ✓', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="text-emerald-600" size={26} />
            {isEmployee || viewMode === 'my-report'
              ? 'របាយការណ៍វត្តមានផ្ទាល់ខ្លួន (My Attendance Report)'
              : 'វត្តមាន & ម៉ោងធ្វើការបុគ្គលិក (Attendance & Time Tracking)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployee || viewMode === 'my-report'
              ? `របាយការណ៍វត្តមាន ម៉ោងធ្វើការ និងអត្រាចូលបម្រើការងាររបស់៖ ${currentPersona.name} (${currentPersona.title})`
              : 'កត់ត្រាវត្តមានជាក់ស្តែង, តាមដានម៉ោងធ្វើការបុគ្គលិកទូទាំងស្ថាប័ន និងរបាយការណ៍ប្រចាំថ្ងៃ'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode toggle for Manager/Admin */}
          {!isEmployee && (
            <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('roster')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'roster'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                តារាងរួម (Roster)
              </button>
              <button
                onClick={() => setViewMode('my-report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'my-report'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                របាយការណ៍ខ្ញុំ (My Report)
              </button>
            </div>
          )}

          {/* Export and Print Buttons */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer size={15} className="text-slate-600" />
            <span>បោះពុម្ព (Print)</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download size={15} className="text-indigo-600" />
            <span>ទាញយក CSV</span>
          </button>

          {/* Manual Entry for Admins/Managers only */}
          {!isEmployee && (
            <button
              onClick={() => setManualModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={16} /> កត់ត្រាវត្តមានដោយដៃ (Manual Shift)
            </button>
          )}
        </div>
      </div>

      {/* Official Printable Document Header (shown only when printing) */}
      <div className="hidden print:block p-4 border-b-2 border-slate-800 mb-6 font-khmer">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase">HESTRA HRM - របាយការណ៍វត្តមានផ្លូវការ</h1>
            <p className="text-xs text-slate-600">OFFICIAL MONTHLY ATTENDANCE & TIMESHEET REPORT</p>
          </div>
          <div className="text-right text-xs">
            <span className="font-bold">កាលបរិច្ឆេទចេញ៖ {new Date().toLocaleDateString('km-KH')}</span>
            <p className="text-[10px] text-slate-500">Page 1 of 1</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-4 pt-3 border-t border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">ឈ្មោះបុគ្គលិក (Employee Name):</span>
            <span className="font-bold text-slate-900">{currentPersona.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">អត្តលេខ (Staff ID):</span>
            <span className="font-bold font-mono text-slate-900">{currentPersona.id.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">តួនាទី (Designation):</span>
            <span className="font-bold text-slate-900">{currentPersona.title}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px]">ខែរាយការណ៍ (Period):</span>
            <span className="font-bold text-slate-900">{selectedMonth}</span>
          </div>
        </div>
      </div>

      {/* Live Punch Clock Widget Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 sm:p-7 rounded-2xl text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row items-center justify-between gap-6 no-print">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>នាឡិកាកត់ត្រាវត្តមានផ្ទាល់ (Live Punch Clock)</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-emerald-400">
            {currentTime || '08:30:00 AM'}
          </div>
          <p className="text-xs text-slate-300">
            កត់ត្រាវត្តមានសម្រាប់៖ <span className="font-bold text-white">{currentPersona.name}</span> ({currentPersona.title})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center px-6">
            <span className="text-[10px] text-slate-300 block uppercase font-bold">ស្ថានភាពវេនការងារ</span>
            <span className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              {isClockedIn ? 'កំពុងបំពេញការងារ (Clocked In)' : 'មិនទាន់កត់ត្រាចូល (Shift Inactive)'}
            </span>
          </div>

          <button
            onClick={toggleClock}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer ${
              isClockedIn
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square size={16} className="fill-current" /> កត់ត្រាចេញ (Clock Out)
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" /> កត់ត្រាចូល (Clock In)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Attendance Report Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">វត្តមានការិយាល័យ</span>
            <Building2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 my-1 font-mono">{presentCount} ថ្ងៃ</div>
          <span className="text-[10px] text-slate-500">Office Attendance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">ធ្វើការពីផ្ទះ (WFH)</span>
            <Home size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-600 my-1 font-mono">{remoteCount} ថ្ងៃ</div>
          <span className="text-[10px] text-slate-500">Remote Work Sessions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">មកយឺត (Late)</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 my-1 font-mono">{lateCount} ថ្ងៃ</div>
          <span className="text-[10px] text-slate-500">ក្រោយ ០៨:៣០ ព្រឹក</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">ច្បាប់ / អវត្តមាន</span>
            <UserX size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 my-1 font-mono">{absentCount} ថ្ងៃ</div>
          <span className="text-[10px] text-slate-500">Leaves / Excused</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">ម៉ោងការងារសរុប</span>
            <Clock size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 my-1 font-mono">{totalHours.toFixed(1)} ម៉ោង</div>
          <span className="text-[10px] text-slate-500">Total Hours Logged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase">អត្រាវត្តមាន</span>
            <TrendingUp size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 my-1 font-mono">{attendanceRate}%</div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, attendanceRate)}%` }}></div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {viewMode === 'my-report' ? (
            /* Month Selector for Personal Report */
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar size={15} className="text-indigo-600" />
              <span className="text-slate-500 font-semibold">ខែរាយការណ៍ (Month):</span>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer"
              />
            </div>
          ) : (
            /* Date Picker for Team Roster */
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
              <Calendar size={15} className="text-slate-500" />
              <span className="text-slate-500 font-semibold">Date:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-900 font-bold focus:outline-hidden cursor-pointer"
              />
            </div>
          )}

          {/* Preset Month / Date shortcuts */}
          {viewMode === 'my-report' ? (
            <div className="flex items-center gap-1">
              {['2026-09', '2026-08', '2026-07'].map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    selectedMonth === m ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {m === '2026-09' ? 'ខែកញ្ញា (Current)' : m}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {['2026-09-21', '2026-09-20', '2026-09-19'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                    selectedDate === d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {d === '2026-09-21' ? 'Today' : d.slice(5)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder={viewMode === 'my-report' ? 'Filter by notes or dates...' : 'Search staff...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">ស្ថានភាពទាំងអស់ (All)</option>
            <option value="Present">វត្តមាន (Present)</option>
            <option value="Remote">ធ្វើការពីផ្ទះ (Remote)</option>
            <option value="Late">មកយឺត (Late)</option>
            <option value="Absent">អវត្តមាន (Absent)</option>
          </select>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {viewMode === 'my-report'
                ? `ប្រវត្តិនៃការកត់ត្រាវត្តមានប្រចាំខែ (${filteredRecords.length} ថ្ងៃ)`
                : `បញ្ជីវត្តមានប្រចាំថ្ងៃ (${filteredRecords.length} នាក់)`}
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {viewMode === 'my-report' ? `Period: ${selectedMonth}` : `Date: ${selectedDate}`}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">កំពុងទាញយកទិន្នន័យវត្តមាន...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs px-4">
            {viewMode === 'my-report'
              ? 'លោកអ្នកមិនទាន់មានកំណត់ត្រាវត្តមានក្នុងខែនេះនៅឡើយទេ។ សូមចុចប៊ូតុង "កត់ត្រាចូល (Clock In)" ខាងលើដើម្បីកត់ត្រា។'
              : 'រកមិនឃើញទិន្នន័យវត្តមានសម្រាប់កាលបរិច្ឆេទនេះឡើយ។'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">កាលបរិច្ឆេទ (Date)</th>
                  {viewMode !== 'my-report' && <th className="px-5 py-3.5">បុគ្គលិក (Employee)</th>}
                  <th className="px-5 py-3.5">ម៉ោងកត់ត្រាចូល (Clock In)</th>
                  <th className="px-5 py-3.5">ម៉ោងកត់ត្រាចេញ (Clock Out)</th>
                  <th className="px-5 py-3.5 font-mono">ម៉ោងសរុប (Hours)</th>
                  <th className="px-5 py-3.5">ស្ថានភាព (Status)</th>
                  <th className="px-5 py-3.5">កំណត់សម្គាល់ (Activity Notes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors font-khmer">
                    <td className="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={13} className="text-slate-400 shrink-0" />
                        <span className="font-mono">{rec.date}</span>
                      </div>
                    </td>

                    {viewMode !== 'my-report' && (
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={rec.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces'}
                          alt={rec.employee_name || 'Staff'}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{rec.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{rec.employee_role}</div>
                        </div>
                      </td>
                    )}

                    <td className="px-5 py-3 font-mono font-medium whitespace-nowrap">
                      {rec.clock_in ? (
                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rec.clock_in}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">--:--:--</span>
                      )}
                    </td>

                    <td className="px-5 py-3 font-mono font-medium whitespace-nowrap">
                      {rec.clock_out ? (
                        <span className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                          {rec.clock_out}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">--:--:--</span>
                      )}
                    </td>

                    <td className="px-5 py-3 font-bold font-mono text-slate-900 whitespace-nowrap">
                      {rec.work_hours || 0} hrs
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Remote'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rec.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status === 'Present'
                          ? '✓ វត្តមាន (Present)'
                          : rec.status === 'Remote'
                          ? '🏠 ធ្វើការពីផ្ទះ (WFH)'
                          : rec.status === 'Late'
                          ? '⏰ មកយឺត (Late)'
                          : '✕ អវត្តមាន (Absent)'}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-slate-500 text-[11px] max-w-xs truncate">
                      {rec.notes || 'កត់ត្រាតាមប្រព័ន្ធស្វ័យប្រវត្តិ'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Sign-off Footer (shown only when printing) */}
      <div className="hidden print:grid grid-cols-2 gap-12 pt-12 mt-12 border-t-2 border-slate-300 font-khmer text-xs">
        <div className="space-y-12">
          <p className="font-semibold text-slate-700">ហត្ថលេខាបុគ្គលិក (Employee Signature):</p>
          <div className="border-b border-dashed border-slate-400 w-48"></div>
          <p className="text-[11px] text-slate-500">កាលបរិច្ឆេទ៖ ..... / ..... / .........</p>
        </div>

        <div className="space-y-12 text-right">
          <p className="font-semibold text-slate-700">ហត្ថលេខាប្រធានផ្នែក / HR (Approved By):</p>
          <div className="border-b border-dashed border-slate-400 w-48 ml-auto"></div>
          <p className="text-[11px] text-slate-500">កាលបរិច្ឆេទ៖ ..... / ..... / .........</p>
        </div>
      </div>

      {/* Manual Entry Shift Modal (for Admin & Manager) */}
      {manualModalOpen && !isEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-indigo-600" />
                <span>កត់ត្រាវត្តមានដោយដៃ (Manual Shift Entry)</span>
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">កាលបរិច្ឆេទ (Date)</label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ម៉ោងចូល (Clock In)</label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={manualForm.clock_in}
                    onChange={(e) => setManualForm({ ...manualForm, clock_in: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ម៉ោងចេញ (Clock Out)</label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={manualForm.clock_out}
                    onChange={(e) => setManualForm({ ...manualForm, clock_out: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ស្ថានភាព (Status)</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Present">Present</option>
                    <option value="Remote">Remote</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ម៉ោងការងារ (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={manualForm.work_hours}
                    onChange={(e) => setManualForm({ ...manualForm, work_hours: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">កំណត់សម្គាល់ (Notes)</label>
                <input
                  type="text"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  placeholder="មូលហេតុ ឬសេចក្តីលម្អិតវេន..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm cursor-pointer"
                >
                  រក្សាទុកវត្តមាន
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
