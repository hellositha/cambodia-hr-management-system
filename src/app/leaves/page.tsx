'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { LeaveRequest } from '@/lib/types';
import {
  CalendarCheck,
  Calendar,
  Clock,
  Check,
  X,
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function LeavesPage() {
  const { currentPersona, openModal, showToast, triggerRefresh, refreshKey } = useApp();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Review comment modal or prompt state
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.append('status', statusFilter);

    fetch(`/api/leaves?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLeaves(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching leaves:', err);
        setLoading(false);
      });
  }, [statusFilter, refreshKey]);

  // Handle Approve / Reject
  const handleReview = async (id: string, status: 'Approved' | 'Rejected', employeeName: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          reviewer_id: currentPersona.id,
          reviewer_comments: status === 'Approved' ? 'Approved by manager.' : 'Unable to approve due to pod coverage requirements.',
        }),
      });

      if (res.ok) {
        showToast(
          status === 'Approved'
            ? `Leave request for ${employeeName} has been approved!`
            : `Leave request for ${employeeName} rejected`,
          status === 'Approved' ? 'success' : 'info'
        );
        triggerRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update leave', 'error');
      }
    } catch {
      showToast('Network error updating leave', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending');
  const filteredLeaves = leaves.filter((l) => {
    const matchName = (l.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (l.leave_type || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchName;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="text-amber-500" size={26} />
            គ្រប់គ្រងច្បាប់ឈប់សម្រាក (Leave Management)
          </h1>
          <p className="text-xs text-slate-500">
            ដាក់ពាក្យស្នើសុំច្បាប់, តាមដានសមតុល្យច្បាប់ប្រចាំឆ្នាំ និងការអនុម័តពីប្រធានផ្នែក
          </p>
        </div>
        <button
          onClick={() => openModal('request-leave')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> សុំច្បាប់ឈប់សម្រាក (Request Leave)
        </button>
      </div>

      {/* Persona Leave Balance Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              សមតុល្យច្បាប់ផ្ទាល់ខ្លួន ({currentPersona.name})
            </h2>
            <p className="text-[11px] text-slate-500">សិទ្ធិឈប់សម្រាកប្រចាំឆ្នាំ ស្របតាមច្បាប់ការងារកម្ពុជា</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            ផុតកំណត់ត្រឹម ៣១ ធ្នូ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-900">
              <span>ច្បាប់ប្រចាំឆ្នាំ (Annual Leave)</span>
              <span>14 / 18 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '77%' }}></div>
            </div>
            <span className="text-[10px] text-blue-700 block">ប្រើអស់ ៤ ថ្ងៃ &bull; នៅសល់ ១៤ ថ្ងៃ</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>ច្បាប់ឈឺ (Sick Leave)</span>
              <span>8 / 10 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <span className="text-[10px] text-emerald-700 block">ប្រើអស់ ២ ថ្ងៃ &bull; នៅសល់ ៨ ថ្ងៃ</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>ច្បាប់ធុរៈគ្រួសារ (Casual Days)</span>
              <span>4 / 5 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <span className="text-[10px] text-amber-700 block">ប្រើអស់ ១ ថ្ងៃ &bull; នៅសល់ ៤ ថ្ងៃ</span>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE (Admin & Manager View) */}
      {(currentPersona.role === 'Admin' || currentPersona.role === 'Manager') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Pending Approval Queue
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                {pendingLeaves.length} Pending
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Review and authorize time-off requests
            </span>
          </div>

          {pendingLeaves.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
              <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
              <div className="font-bold text-slate-800">All caught up!</div>
              <p className="mt-1">No pending leave requests in your approval queue.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingLeaves.map((req) => (
                <div
                  key={req.id}
                  className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces'}
                          alt={req.employee_name || 'Staff'}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{req.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{req.employee_role}</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {req.leave_type}
                      </span>
                    </div>

                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold">Duration:</span>
                        <span className="font-bold text-slate-900">{req.days_count} Working Days</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>Dates:</span>
                        <span>{req.start_date} &rarr; {req.end_date}</span>
                      </div>
                      {req.reason && (
                        <p className="pt-1.5 border-t border-slate-200/60 text-slate-600 text-[11px] italic">
                          &ldquo;{req.reason}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleReview(req.id, 'Approved', req.employee_name || 'colleague')}
                      disabled={actionLoading === req.id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => handleReview(req.id, 'Rejected', req.employee_name || 'colleague')}
                      disabled={actionLoading === req.id}
                      className="flex-1 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Request History Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">All Leave Requests & Historical Records</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Filter requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">Loading requests...</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">No leave requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Colleague</th>
                    <th className="px-5 py-3.5">Leave Type</th>
                    <th className="px-5 py-3.5">Duration</th>
                    <th className="px-5 py-3.5">Days</th>
                    <th className="px-5 py-3.5">Reason</th>
                    <th className="px-5 py-3.5">Reviewer / Sign-off</th>
                    <th className="px-5 py-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={l.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces'}
                          alt={l.employee_name || 'Staff'}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{l.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{l.employee_role}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{l.leave_type}</td>
                      <td className="px-5 py-3 font-medium text-slate-600">
                        {l.start_date} &rarr; {l.end_date}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">{l.days_count} d</td>
                      <td className="px-5 py-3 text-slate-600 italic max-w-xs truncate">
                        {l.reason || 'Personal leave'}
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {l.reviewer_name ? (
                          <span className="text-slate-800 font-medium">{l.reviewer_name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Pending review</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            l.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : l.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
