'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AttendanceRecord, Department } from '@/lib/types';
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
} from 'lucide-react';

export default function AttendancePage() {
  const { currentPersona, isClockedIn, clockInTime, toggleClock, refreshKey, triggerRefresh, showToast } = useApp();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('2026-09-21');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Live timer for the banner
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

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedDate) params.append('date', selectedDate);

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
  }, [selectedDate, refreshKey]);

  // Calculations for stats
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const remoteCount = records.filter((r) => r.status === 'Remote').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const total = records.length;
  const rate = total > 0 ? Math.round(((presentCount + remoteCount + lateCount) / total) * 100) : 100;

  // Filtered rows
  const filteredRecords = records.filter((r) => {
    const matchName = (r.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (r.employee_role || '').toLowerCase().includes(searchQuery.toLowerCase());
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
        showToast('Attendance logged successfully!', 'success');
        setManualModalOpen(false);
        triggerRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to log attendance', 'error');
      }
    } catch {
      showToast('Network error saving record', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="text-emerald-600" size={26} />
            Attendance & Time Tracking
          </h1>
          <p className="text-xs text-slate-500">
            Real-time punch clock, timesheets, remote presence, and daily rosters
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={16} /> Log Manual Shift
          </button>
        </div>
      </div>

      {/* Live Punch Clock Widget Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 p-6 sm:p-7 rounded-2xl text-white shadow-xl shadow-slate-900/10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Punch Clock</span>
          </div>
          <div className="text-3xl sm:text-4xl font-black font-mono tracking-wider text-emerald-400">
            {currentTime || '09:00:00 AM'}
          </div>
          <p className="text-xs text-slate-300">
            Logging shifts for: <span className="font-bold text-white">{currentPersona.name}</span> ({currentPersona.title})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-center px-6">
            <span className="text-[10px] text-slate-300 block uppercase font-bold">Shift Status</span>
            <span className="text-sm font-extrabold text-white flex items-center justify-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isClockedIn ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
              {isClockedIn ? 'Currently Clocked In' : 'Shift Inactive'}
            </span>
          </div>

          <button
            onClick={toggleClock}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 ${
              isClockedIn
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {isClockedIn ? (
              <>
                <Square size={16} className="fill-current" /> End Shift (Clock Out)
              </>
            ) : (
              <>
                <Play size={16} className="fill-current" /> Begin Shift (Clock In)
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Present in Office</span>
          <div className="text-2xl font-black text-emerald-600 my-1">{presentCount}</div>
          <span className="text-[11px] text-slate-500">HQ Desk punches</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Remote (WFH)</span>
          <div className="text-2xl font-black text-blue-600 my-1">{remoteCount}</div>
          <span className="text-[11px] text-slate-500">Virtual attendance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Late Arrivals</span>
          <div className="text-2xl font-black text-amber-600 my-1">{lateCount}</div>
          <span className="text-[11px] text-slate-500">Checked in &gt; 9:30 AM</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">On Leave / Away</span>
          <div className="text-2xl font-black text-rose-600 my-1">{absentCount}</div>
          <span className="text-[11px] text-slate-500">Approved leave</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Attendance Rate</span>
          <div className="text-2xl font-black text-slate-900 my-1">{rate}%</div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp size={12} /> Target 95% met
          </span>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-slate-500 font-semibold">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden"
            />
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1">
            {['2026-09-21', '2026-09-20', '2026-09-19', '2026-09-18'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedDate === d ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {d === '2026-09-21' ? 'Today' : d.slice(5)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search roster..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Remote">Remote</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading attendance log...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No records found for selected date and filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Clock In</th>
                  <th className="px-5 py-3.5">Clock Out</th>
                  <th className="px-5 py-3.5">Logged Hours</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Activity Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
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
                    <td className="px-5 py-3 font-medium text-slate-700">{rec.department_name}</td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-800">
                      {rec.clock_in || '--:--'}
                    </td>
                    <td className="px-5 py-3 font-mono font-semibold text-slate-800">
                      {rec.clock_out || (rec.status === 'Absent' ? '--:--' : 'Active')}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-900">{rec.work_hours} hrs</td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rec.status === 'Present'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rec.status === 'Remote'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : rec.status === 'Late'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 italic max-w-xs truncate">
                      {rec.notes || 'Normal office shift'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Log Manual Attendance Shift</h3>
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Shift Date</label>
                <input
                  type="date"
                  required
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clock In Time</label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={manualForm.clock_in}
                    onChange={(e) => setManualForm({ ...manualForm, clock_in: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clock Out Time</label>
                  <input
                    type="time"
                    step="1"
                    required
                    value={manualForm.clock_out}
                    onChange={(e) => setManualForm({ ...manualForm, clock_out: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={manualForm.status}
                    onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Present">Present</option>
                    <option value="Remote">Remote</option>
                    <option value="Late">Late</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={manualForm.work_hours}
                    onChange={(e) => setManualForm({ ...manualForm, work_hours: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <input
                  type="text"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm({ ...manualForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="On-site customer meeting, travel day..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
