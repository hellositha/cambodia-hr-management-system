'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarCheck,
  Building2,
  Check,
  X,
  AlertCircle,
  Sparkles,
  TrendingUp,
  FileText,
  Mail,
  Filter,
} from 'lucide-react';

interface PendingLeaveItem {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_role: string;
  employee_avatar: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  created_at: string;
}

export default function ManagementPortalPage() {
  const { currentPersona, language, t, showToast } = useApp();

  const [pendingLeaves, setPendingLeaves] = useState<PendingLeaveItem[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [departmentName, setDepartmentName] = useState('ផ្នែកបច្ចេកវិទ្យា (Engineering)');

  // Load pending leaves
  const fetchLeaves = () => {
    fetch('/api/leaves')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const pending = data.filter((l: any) => l.status === 'Pending');
          setPendingLeaves(pending);
        }
        setLoadingLeaves(false);
      })
      .catch((err) => {
        console.error('Error loading leaves for manager:', err);
        setLoadingLeaves(false);
      });
  };

  // Load dynamic team members
  const fetchTeam = async () => {
    setLoadingTeam(true);
    try {
      const [empRes, attRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/attendance'),
      ]);
      const employees = await empRes.json();
      const attendance = await attRes.json();

      if (Array.isArray(employees)) {
        // Find current manager's record
        const managerEmp = employees.find(
          (e: any) => e.id === currentPersona.id || e.email.toLowerCase() === currentPersona.email.toLowerCase()
        );

        const targetDeptId = managerEmp?.department_id || 'dept-1';
        if (managerEmp?.department_name) {
          setDepartmentName(managerEmp.department_name);
        }

        // Filter direct reports or department members (excluding manager themselves)
        let filtered = employees.filter(
          (e: any) =>
            e.id !== currentPersona.id &&
            (e.manager_id === currentPersona.id || e.department_id === targetDeptId)
        );

        if (filtered.length === 0) {
          // fallback to engineering team if none found
          filtered = employees.filter((e: any) => e.department_id === 'dept-1' && e.id !== currentPersona.id);
        }

        const todayStr = '2026-09-21';
        const mapped = filtered.map((emp: any) => {
          const att = Array.isArray(attendance)
            ? attendance.find((a: any) => a.employee_id === emp.id && a.date === todayStr)
            : null;

          let status = 'In Office';
          let statusColor = 'bg-emerald-500';
          let clockIn = att?.clock_in ? att.clock_in.slice(0, 5) : '08:30 AM';

          if (emp.status === 'Remote' || att?.status === 'Remote') {
            status = 'Remote (WFH)';
            statusColor = 'bg-blue-500';
          } else if (emp.status === 'On Leave' || att?.status === 'Absent') {
            status = 'On Leave';
            statusColor = 'bg-amber-500';
            clockIn = '--:--';
          } else if (att?.status === 'Late') {
            status = 'Late';
            statusColor = 'bg-amber-500';
          }

          return {
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`,
            role: emp.role,
            avatar: emp.avatar,
            status,
            statusColor,
            clockIn,
            leaveBalance: `${Math.floor(12 + (emp.id.charCodeAt(emp.id.length - 1) % 6))} ថ្ងៃ`,
          };
        });

        setTeamMembers(mapped);
      }
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoadingTeam(false);
    }
  };

  const handleDecision = async (leaveId: string, decision: 'Approved' | 'Rejected') => {
    setApprovingId(leaveId);
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          reviewer_id: currentPersona.id,
          reviewer_comments:
            decision === 'Approved'
              ? 'អនុម័តដោយប្រធានផ្នែក (Approved by Manager)'
              : 'ពុំអាចអនុញ្ញាតបានដោយសារតម្រូវការការងារបន្ទាន់ (Declined due to work schedule)',
        }),
      });

      if (res.ok) {
        showToast(
          decision === 'Approved'
            ? 'បានអនុម័តសំណើសុំច្បាប់ដោយជោគជ័យ! ✓'
            : 'បានបដិសេធសំណើសុំច្បាប់',
          decision === 'Approved' ? 'success' : 'info'
        );
        fetchLeaves();
      } else {
        showToast('បរាជ័យក្នុងការអនុម័តសំណើ', 'error');
      }
    } catch (err) {
      showToast('កំហុសប្រព័ន្ធ', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchTeam();
  }, [currentPersona]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER & TOP BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Shield size={16} />
            <span>{language === 'km' ? 'ផតថលគណៈគ្រប់គ្រង & ប្រធានផ្នែក (Manager Self-Service)' : 'Manager Self-Service (MSS)'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            {language === 'km' ? 'ផ្ទាំងគ្រប់គ្រងក្រុមការងារ (Team Management Hub)' : 'Team Management Portal'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-khmer">
            {language === 'km'
              ? 'អនុម័តសំណើសុំច្បាប់ តាមដានវត្តមានផ្ទាល់របស់ក្រុម វាយតម្លៃសមិទ្ធកម្ម និងពិនិត្យកាលវិភាគការងារ។'
              : 'Approve direct report leave requests, monitor live team attendance, and ensure operational coverage.'}
          </p>
        </div>

        {/* Action badge */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200/80 text-purple-700 text-xs font-bold flex items-center gap-2">
            <Users size={15} />
            <span>{language === 'km' ? 'ទិដ្ឋភាពប្រធានផ្នែក (Manager View)' : 'Manager Persona Active'}</span>
          </span>
        </div>
      </div>

      {/* 2. TEAM OVERVIEW METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'km' ? 'សមាជិកក្រុមសរុប' : 'Direct Reports'}
          </span>
          <div className="text-2xl font-black text-slate-900 my-1 font-mono">
            {teamMembers.length} <span className="text-xs font-sans text-slate-500 font-semibold">នាក់</span>
          </div>
          <span className="text-[11px] text-slate-500">
            ផ្នែកបច្ចេកវិទ្យា (Engineering)
          </span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'km' ? 'វត្តមានថ្ងៃនេះ' : 'Attendance Rate'}
          </span>
          <div className="text-2xl font-black text-emerald-600 my-1 font-mono">
            75%
          </div>
          <span className="text-[11px] text-slate-500">
            ២ នាក់នៅការិយាល័យ &bull; ១ WFH
          </span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'km' ? 'សំណើសុំច្បាប់រង់ចាំ' : 'Pending Approvals'}
          </span>
          <div className="text-2xl font-black text-amber-600 my-1 font-mono">
            {pendingLeaves.length} <span className="text-xs font-sans text-slate-500 font-semibold">សំណើ</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {pendingLeaves.length > 0 ? 'ត្រូវការការអនុម័តជាបន្ទាន់' : 'ពុំមានសំណើរង់ចាំឡើយ'}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {language === 'km' ? 'ថវិកាផ្នែកប្រចាំឆ្នាំ' : 'Department Budget'}
          </span>
          <div className="text-2xl font-black text-indigo-700 my-1 font-mono">
            $380,000
          </div>
          <span className="text-[11px] text-slate-500">
            អត្រាប្រើប្រាស់ ៧២%
          </span>
        </div>
      </div>

      {/* 3. PENDING APPROVALS HUB (CRUCIAL MANAGER FUNCTION) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarCheck size={18} className="text-indigo-600" />
              <span>{language === 'km' ? 'ប្រអប់សំណើសុំច្បាប់កំពុងរង់ចាំការអនុម័ត (Approvals Queue)' : 'Direct Report Leave Requests (Pending Queue)'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-khmer">
              {language === 'km' ? 'ចុច ១ ដងដើម្បីអនុម័ត ឬបដិសេធពាក្យសុំច្បាប់របស់សមាជិកក្រុម' : 'One-click Approve or Reject to maintain team workflow'}
            </p>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {pendingLeaves.length} សំណើរង់ចាំ
          </span>
        </div>

        {loadingLeaves ? (
          <div className="py-12 text-center text-xs text-slate-400">កំពុងដំណើរការទិន្នន័យ...</div>
        ) : pendingLeaves.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={24} />
            </div>
            <h4 className="text-xs font-bold text-slate-700">ពុំមានសំណើសុំច្បាប់ដែលនៅសេសសល់ឡើយ!</h4>
            <p className="text-[11px] text-slate-400 mt-1">
              សំណើសុំច្បាប់ទាំងអស់របស់ក្រុមការងារត្រូវបានពិនិត្យ និងអនុម័តរួចរាល់។
            </p>
          </div>
        ) : (
          <div className="space-y-3 font-khmer">
            {pendingLeaves.map((leave) => (
              <div
                key={leave.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={leave.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces'}
                    alt={leave.employee_name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-100 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{leave.employee_name}</h4>
                      <span className="text-[10px] font-mono text-slate-400">({leave.employee_id})</span>
                    </div>
                    <p className="text-[11px] text-slate-500">{leave.employee_role}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                        {leave.leave_type} ({leave.days_count} ថ្ងៃ)
                      </span>
                      <span className="text-slate-500 font-mono">
                        {leave.start_date} ដល់ {leave.end_date}
                      </span>
                    </div>
                    {leave.reason && (
                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        &ldquo;{leave.reason}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    disabled={approvingId === leave.id}
                    onClick={() => handleDecision(leave.id, 'Approved')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <Check size={14} />
                    <span>{approvingId === leave.id ? 'កំពុងដំណើរការ...' : 'អនុម័ត (Approve)'}</span>
                  </button>

                  <button
                    disabled={approvingId === leave.id}
                    onClick={() => handleDecision(leave.id, 'Rejected')}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <X size={14} />
                    <span>បដិសេធ</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. TEAM ATTENDANCE RADAR & DIRECT REPORTS ROSTER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Team Members Roster (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users size={17} className="text-indigo-600" />
                <span>{language === 'km' ? 'បញ្ជីសមាជិកក្រុមការងារផ្ទាល់' : 'Direct Reports Roster'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'km' ? 'ព័ត៌មានលម្អិត និងស្ថានភាពវត្តមានបច្ចុប្បន្ន' : 'Current attendance and leave capacity'}
              </p>
            </div>
            <Link
              href="/employees"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
            >
              មើលទាំងអស់ &rarr;
            </Link>
          </div>

          <div className="space-y-3 font-khmer">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs text-slate-900">{member.name}</h4>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600">
                        <span className={`w-2 h-2 rounded-full ${member.statusColor}`}></span>
                        {member.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{member.role}</p>
                  </div>
                </div>

                <div className="text-right text-xs">
                  <span className="font-mono text-slate-500 block">កត់ត្រា៖ {member.clockIn}</span>
                  <span className="text-[10px] text-slate-400">ច្បាប់នៅសល់៖ {member.leaveBalance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Team Coverage & Manager Tools (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock size={17} className="text-indigo-600" />
                  <span>{language === 'km' ? 'កាលវិភាគអវត្តមានក្នុងសប្តាហ៍នេះ' : 'Team Leave Coverage'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'ធានាថាផ្នែកការងារមានកម្លាំងគ្រប់គ្រាន់' : 'Avoid team understaffing'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">ចន្ទ - សុក្រ (សប្តាហ៍នេះ)</span>
                <span className="text-emerald-600 font-bold">✓ កម្លាំងការងារគ្រប់គ្រាន់</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-khmer">
                មានសមាជិក ១ នាក់ (អ៊ុំ ម៉ាលីស) កំពុងឈប់សម្រាកច្បាប់ប្រចាំឆ្នាំ។ ការងាររចនា UI ត្រូវបានប្រគល់បណ្តោះអាសន្នជូន ចាន់ ធីតា។
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              {language === 'km' ? 'សកម្មភាពរហ័សសម្រាប់ប្រធានផ្នែក' : 'Manager Quick Launchpad'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                href="/tools?tab=letters"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <FileText size={14} className="text-indigo-600" />
                <span>ចេញលិខិតសរសើរ</span>
              </Link>

              <Link
                href="/performance"
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <TrendingUp size={14} className="text-emerald-600" />
                <span>វាយតម្លៃសមិទ្ធកម្ម</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
