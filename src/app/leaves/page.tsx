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
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function LeavesPage() {
  const { currentPersona, openModal, showToast, triggerRefresh, refreshKey } = useApp();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQueueTab, setActiveQueueTab] = useState<'step2' | 'step1'>('step2');

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

  // Handle Review action (Step 1 Line Manager or Step 2 Administrator)
  const handleReview = async (
    id: string,
    decision: 'Approved' | 'Rejected',
    employeeName: string,
    stage?: 'manager' | 'admin'
  ) => {
    setActionLoading(id);
    try {
      const isLineManagerStage = stage === 'manager' || (currentPersona.role === 'Manager' && decision === 'Approved');

      const res = await fetch(`/api/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision === 'Rejected' ? 'Rejected' : isLineManagerStage ? 'Pending Admin' : 'Approved',
          stage: stage || (currentPersona.role === 'Manager' ? 'manager' : 'admin'),
          reviewer_id: currentPersona.id,
          reviewer_role: currentPersona.role,
          reviewer_comments:
            decision === 'Rejected'
              ? `ពុំអាចអនុញ្ញាតបានដោយសារតម្រូវការការងារបន្ទាន់ (Declined by ${currentPersona.name}).`
              : isLineManagerStage
              ? `អនុម័តជំហានទី១ ដោយប្រធានផ្នែក ${currentPersona.name}។ បានបញ្ជូនទៅរដ្ឋបាល HR Admin (Step 1 Approved by Line Manager. Forwarded to Admin).`
              : `អនុម័តជាស្ថាពរដោយរដ្ឋបាល HR Admin ${currentPersona.name} (Step 2 Final Approval granted by HR Administrator).`,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        if (decision === 'Rejected') {
          showToast(`សំណើសុំច្បាប់របស់ ${employeeName} ត្រូវបានបដិសេធ`, 'info');
        } else if (updated.status === 'Pending Admin') {
          showToast(`បានអនុម័តជំហានទី១ សម្រាប់ ${employeeName} និងបញ្ជូនទៅរដ្ឋបាលរួចរាល់! ✓`, 'success');
        } else {
          showToast(`បានអនុម័តជាស្ថាពរសម្រាប់ ${employeeName} (2/2 ជំហាន)! ✓`, 'success');
        }
        triggerRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'បរាជ័យក្នុងការអនុម័ត', 'error');
      }
    } catch {
      showToast('Network error updating leave', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const isEmployee = currentPersona?.role === 'Employee';
  const isManager = currentPersona?.role === 'Manager';
  const isAdmin = currentPersona?.role === 'Admin';

  // Step 1: Pending Line Manager Approval
  const step1Leaves = leaves.filter((l) => l.status === 'Pending Manager' || l.status === 'Pending');
  // Step 2: Pending Administrator Final Approval
  const step2Leaves = leaves.filter((l) => l.status === 'Pending Admin');

  // Personal leaves for calculating balances & displaying
  const myLeaves = leaves.filter((l) => {
    return (
      l.employee_id === currentPersona?.id ||
      (l.employee_name && currentPersona?.name && l.employee_name.toLowerCase() === currentPersona.name.toLowerCase()) ||
      (l.employee_name && currentPersona?.name && l.employee_name.toLowerCase().includes(currentPersona.name.toLowerCase()))
    );
  });

  const myApprovedLeaves = myLeaves.filter((l) => l.status === 'Approved');
  const annualUsed = myApprovedLeaves.filter((l) => l.leave_type === 'Annual').reduce((acc, cur) => acc + (Number(cur.days_count) || 0), 0);
  const sickUsed = myApprovedLeaves.filter((l) => l.leave_type === 'Sick').reduce((acc, cur) => acc + (Number(cur.days_count) || 0), 0);
  const casualUsed = myApprovedLeaves.filter((l) => l.leave_type === 'Casual').reduce((acc, cur) => acc + (Number(cur.days_count) || 0), 0);

  const displayLeaves = isEmployee ? myLeaves : leaves;

  const filteredLeaves = displayLeaves.filter((l) => {
    const matchName = (l.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (l.leave_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (l.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (l.line_manager_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (l.admin_reviewer_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchName;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="text-amber-500" size={26} />
            {isEmployee ? 'ពាក្យស្នើសុំ និងសមតុល្យច្បាប់ (My Leaves & Requests)' : 'គ្រប់គ្រងច្បាប់ឈប់សម្រាក (Two-Stage Leave Management)'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEmployee
              ? 'ដាក់ពាក្យស្នើសុំច្បាប់ តាមដានដំណើរការអនុម័ត ២ ជំហាន (ប្រធានផ្នែក ➔ រដ្ឋបាល) និងសមតុល្យច្បាប់ផ្ទាល់ខ្លួន'
              : 'ប្រព័ន្ធអនុម័តច្បាប់ ២ ជំហាន៖ ជំហានទី១ ប្រធានផ្នែក (Line Manager) ➔ ជំហានទី២ រដ្ឋបាល (Administrator)'}
          </p>
        </div>
        <button
          onClick={() => openModal('request-leave')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus size={16} /> សុំច្បាប់ឈប់សម្រាក (Request Leave)
        </button>
      </div>

      {/* Two-Stage Workflow Explanation Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
            <ShieldCheck className="text-indigo-400" size={22} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              ដំណើរការអនុម័ត ២ ជំហានស្តង់ដារ (Two-Stage Approval Chain)
            </h3>
            <p className="text-[11px] text-slate-300 mt-0.5">
              បុគ្គលិកស្នើសុំ ➔ ជំហានទី ១៖ ប្រធានផ្នែក (Line Manager) ➔ ជំហានទី ២៖ រដ្ឋបាល (Administrator) ➔ អនុម័តជាស្ថាពរ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">1</span>
            <span>Line Manager</span>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <span className="w-4 h-4 rounded-full bg-indigo-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">2</span>
            <span>Administrator</span>
          </div>
          <ArrowRight size={14} className="text-slate-400" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span>Approved</span>
          </div>
        </div>
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
              <span>{Math.max(0, 18 - annualUsed)} / 18 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min(100, Math.round((Math.max(0, 18 - annualUsed) / 18) * 100))}%` }}></div>
            </div>
            <span className="text-[10px] text-blue-700 block">ប្រើអស់ {annualUsed} ថ្ងៃ &bull; នៅសល់ {Math.max(0, 18 - annualUsed)} ថ្ងៃ</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span>ច្បាប់ឈឺ (Sick Leave)</span>
              <span>{Math.max(0, 10 - sickUsed)} / 10 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${Math.min(100, Math.round((Math.max(0, 10 - sickUsed) / 10) * 100))}%` }}></div>
            </div>
            <span className="text-[10px] text-emerald-700 block">ប្រើអស់ {sickUsed} ថ្ងៃ &bull; នៅសល់ {Math.max(0, 10 - sickUsed)} ថ្ងៃ</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span>ច្បាប់ធុរៈគ្រួសារ (Casual Days)</span>
              <span>{Math.max(0, 5 - casualUsed)} / 5 ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.min(100, Math.round((Math.max(0, 5 - casualUsed) / 5) * 100))}%` }}></div>
            </div>
            <span className="text-[10px] text-amber-700 block">ប្រើអស់ {casualUsed} ថ្ងៃ &bull; នៅសល់ {Math.max(0, 5 - casualUsed)} ថ្ងៃ</span>
          </div>
        </div>
      </div>

      {/* MULTI-STAGE PENDING APPROVAL QUEUES (Admin & Manager View) */}
      {(isAdmin || isManager) && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>កម្រងសំណើសុំច្បាប់កំពុងរង់ចាំការអនុម័ត (Pending Approval Queues)</span>
              </h2>
              <p className="text-xs text-slate-500">
                {isAdmin
                  ? 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Admin) ទទួលខុសត្រូវលើជំហានទី២ (Final Approval) និងអាចត្រួតពិនិត្យជំហានទី១'
                  : 'ប្រធានផ្នែក (Line Manager) ទទួលខុសត្រូវលើការអនុម័តជំហានទី១ រួចបញ្ជូនទៅកាន់ Administrator'}
              </p>
            </div>

            {/* Queue Stage Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setActiveQueueTab('step2')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeQueueTab === 'step2'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>ជំហាន ២៖ រដ្ឋបាល Admin</span>
                <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px]">
                  {step2Leaves.length}
                </span>
              </button>

              <button
                onClick={() => setActiveQueueTab('step1')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeQueueTab === 'step1'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>ជំហាន ១៖ ប្រធានផ្នែក Line Manager</span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px]">
                  {step1Leaves.length}
                </span>
              </button>
            </div>
          </div>

          {/* Active Queue Content */}
          {activeQueueTab === 'step2' ? (
            /* STEP 2: Awaiting Administrator Queue */
            <div>
              {step2Leaves.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <div className="font-bold text-slate-800">គ្មានសំណើរង់ចាំការអនុម័តពីរដ្ឋបាលទេ! (No pending Step 2 requests)</div>
                  <p className="mt-1">គ្រប់សំណើទាំងអស់ត្រូវបានអនុម័ត ឬកំពុងស្ថិតក្នុងជំហានទី១ នៅឡើយ។</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {step2Leaves.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-5 rounded-2xl border-2 border-indigo-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                            ជំហាន ២/២
                          </span>
                        </div>

                        {/* Step 1 Approval Stamp */}
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-[11px] text-emerald-900 flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">បានអនុម័តដោយ Line Manager: </span>
                            <span>{req.line_manager_name || 'Line Manager'}</span>
                            {req.line_manager_comments && (
                              <p className="text-[10px] text-emerald-700 italic mt-0.5">
                                &ldquo;{req.line_manager_comments}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-semibold">ប្រភេទច្បាប់៖</span>
                            <span className="font-bold text-slate-900">{req.leave_type} ({req.days_count} ថ្ងៃ)</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>កាលបរិច្ឆេទ៖</span>
                            <span>{req.start_date} &rarr; {req.end_date}</span>
                          </div>
                          {req.reason && (
                            <p className="pt-1.5 border-t border-slate-200/60 text-slate-600 text-[11px] italic">
                              &ldquo;{req.reason}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100">
                        {isAdmin ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleReview(req.id, 'Approved', req.employee_name || 'colleague', 'admin')}
                              disabled={actionLoading === req.id}
                              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
                            >
                              <Check size={14} /> អនុម័តចុងក្រោយ (Final Admin Sign-off)
                            </button>
                            <button
                              onClick={() => handleReview(req.id, 'Rejected', req.employee_name || 'colleague', 'admin')}
                              disabled={actionLoading === req.id}
                              className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="p-2 bg-slate-50 rounded-xl text-center text-slate-500 text-[11px] font-medium border border-slate-200/80">
                            ⏳ កំពុងរង់ចាំការអនុម័តចុងក្រោយពីរដ្ឋបាល HR Admin
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* STEP 1: Awaiting Line Manager Queue */
            <div>
              {step1Leaves.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
                  <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                  <div className="font-bold text-slate-800">គ្មានសំណើរង់ចាំប្រធានផ្នែកទេ! (No pending Step 1 requests)</div>
                  <p className="mt-1">គ្រប់សំណើទាំងអស់ត្រូវបានប្រធានផ្នែកពិនិត្យរួចរាល់។</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {step1Leaves.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white p-5 rounded-2xl border-2 border-amber-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
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
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            ជំហាន ១/២
                          </span>
                        </div>

                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-slate-700">
                            <span className="font-semibold">ប្រភេទច្បាប់៖</span>
                            <span className="font-bold text-slate-900">{req.leave_type} ({req.days_count} ថ្ងៃ)</span>
                          </div>
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span>កាលបរិច្ឆេទ៖</span>
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
                          onClick={() => handleReview(req.id, 'Approved', req.employee_name || 'colleague', 'manager')}
                          disabled={actionLoading === req.id}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-emerald-600/20 cursor-pointer"
                        >
                          <Check size={14} /> អនុម័តជំហាន១ ➔ បញ្ជូនទៅរដ្ឋបាល
                        </button>
                        <button
                          onClick={() => handleReview(req.id, 'Rejected', req.employee_name || 'colleague', 'manager')}
                          disabled={actionLoading === req.id}
                          className="py-2 px-3 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <X size={14} /> បដិសេធ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Request History Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">
            {isEmployee
              ? 'ប្រវត្តិនៃការស្នើសុំច្បាប់ផ្ទាល់ខ្លួន (My Leave Requests & History)'
              : 'បញ្ជីស្នើសុំច្បាប់ទាំងអស់ (All Leave Requests & Historical Records)'}
          </h2>
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
              <option value="all">ស្ថានភាពទាំងអស់ (All Statuses)</option>
              <option value="Pending Manager">ជំហាន ១៖ រង់ចាំប្រធានផ្នែក (Line Manager)</option>
              <option value="Pending Admin">ជំហាន ២៖ រង់ចាំរដ្ឋបាល (Administrator)</option>
              <option value="Approved">បានអនុម័តពេញលេញ (Fully Approved)</option>
              <option value="Rejected">បានបដិសេធ (Rejected)</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">កំពុងទាញយកទិន្នន័យ...</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs px-4">
              {isEmployee
                ? 'លោកអ្នកមិនទាន់មានសំណើសុំច្បាប់នៅឡើយទេ។ ចុចប៊ូតុង "សុំច្បាប់ឈប់សម្រាក" ខាងលើដើម្បីស្នើសុំ (No leave requests yet. Click "Request Leave" above).'
                : 'រកមិនឃើញសំណើសុំច្បាប់ដែលត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ។'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">អ្នកស្នើសុំ (Applicant)</th>
                    <th className="px-5 py-3.5">ប្រភេទច្បាប់ (Type)</th>
                    <th className="px-5 py-3.5">កាលបរិច្ឆេទ (Duration)</th>
                    <th className="px-5 py-3.5">ចំនួន (Days)</th>
                    <th className="px-5 py-3.5">ដំណើរការអនុម័ត ២ ជំហាន (2-Stage Approval Chain)</th>
                    <th className="px-5 py-3.5 text-right">ស្ថានភាពរួម (Status)</th>
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
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        <span>{l.leave_type}</span>
                        {l.reason && (
                          <span className="block text-[11px] text-slate-400 max-w-xs truncate font-normal">
                            {l.reason}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-600 whitespace-nowrap">
                        {l.start_date} &rarr; {l.end_date}
                      </td>
                      <td className="px-5 py-3 font-bold text-slate-900">{l.days_count} d</td>
                      <td className="px-5 py-3">
                        <div className="flex flex-col gap-1 text-[11px]">
                          {/* Stage 1: Line Manager */}
                          <div className="flex items-center gap-1.5">
                            {l.status === 'Approved' || l.status === 'Pending Admin' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                <span>ជំហាន ១: {l.line_manager_name || 'ប្រធានផ្នែក'} ✓</span>
                              </span>
                            ) : l.status === 'Rejected' && !l.line_manager_id ? (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                                <span>ជំហាន ១: Line Manager</span>
                              </span>
                            ) : l.status === 'Rejected' && l.line_manager_id ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                                <XCircle size={12} className="text-rose-600" />
                                <span>ជំហាន ១: បដិសេធដោយប្រធានផ្នែក</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                                <Clock size={12} className="text-amber-600 animate-pulse" />
                                <span>ជំហាន ១: រង់ចាំប្រធានផ្នែក</span>
                              </span>
                            )}
                          </div>

                          {/* Stage 2: Administrator */}
                          <div className="flex items-center gap-1.5">
                            {l.status === 'Approved' ? (
                              <span className="inline-flex items-center gap-1 text-indigo-700 font-medium">
                                <CheckCircle2 size={12} className="text-indigo-600" />
                                <span>ជំហាន ២: {l.admin_reviewer_name || 'រដ្ឋបាល HR'} ✓</span>
                              </span>
                            ) : l.status === 'Pending Admin' ? (
                              <span className="inline-flex items-center gap-1 text-indigo-700 font-bold">
                                <Clock size={12} className="text-indigo-600 animate-pulse" />
                                <span>ជំហាន ២: រង់ចាំរដ្ឋបាល HR Admin</span>
                              </span>
                            ) : l.status === 'Rejected' && l.admin_reviewer_id ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                                <XCircle size={12} className="text-rose-600" />
                                <span>ជំហាន ២: បដិសេធដោយរដ្ឋបាល</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                <span>ជំហាន ២: រដ្ឋបាល (រង់ចាំជំហាន១)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span
                          className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            l.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : l.status === 'Pending Admin'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold'
                              : l.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {l.status === 'Approved'
                            ? '✓ បានអនុម័តពេញលេញ'
                            : l.status === 'Pending Admin'
                            ? '⏳ រង់ចាំរដ្ឋបាល (Admin)'
                            : l.status === 'Rejected'
                            ? '✕ បានបដិសេធ'
                            : '⏳ រង់ចាំប្រធានផ្នែក'}
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
