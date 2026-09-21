'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { DashboardStats } from '@/lib/types';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Cake,
  Building2,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentPersona, openModal, refreshKey } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading dashboard stats:', err);
        setLoading(false);
      });
  }, [refreshKey]);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Loading HR intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} className="text-indigo-400" />
              <span>HR Intelligence & People Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Good day, {currentPersona.name}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              You are currently viewing PulseHR as{' '}
              <span className="font-semibold text-white">{currentPersona.title}</span> (
              {currentPersona.role} mode). Headcount is stable, attendance is at{' '}
              <span className="text-emerald-400 font-bold">{stats.attendanceToday.percentage}%</span>,
              and {stats.pendingLeavesCount} leave approvals need attention.
            </p>
          </div>

          {/* Quick Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => openModal('add-employee')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <Plus size={16} /> Onboard Employee
            </button>
            <button
              onClick={() => openModal('request-leave')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 flex items-center gap-2 transition-colors"
            >
              <CalendarCheck size={16} /> Request Leave
            </button>
            <button
              onClick={() => openModal('run-payroll')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
            >
              <CreditCard size={16} /> Run Payroll
            </button>
          </div>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Headcount */}
        <Link
          href="/employees"
          className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-indigo-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Headcount
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalEmployees}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              <TrendingUp size={12} className="mr-0.5" /> +{stats.newHiresThisMonth} this year
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>{stats.activeEmployees} active &bull; {stats.onLeaveEmployees} on leave</span>
            <ArrowUpRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </div>
        </Link>

        {/* Card 2: Attendance Today */}
        <Link
          href="/attendance"
          className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-emerald-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Attendance Today
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {stats.attendanceToday.percentage}%
            </span>
            <span className="text-xs font-semibold text-emerald-600">On Target</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {stats.attendanceToday.present} Present &bull; {stats.attendanceToday.remote} Remote
            </span>
            <ArrowUpRight size={15} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
        </Link>

        {/* Card 3: Pending Time-Off Requests */}
        <Link
          href="/leaves"
          className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-amber-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{stats.pendingLeavesCount}</span>
            <span className="text-xs font-semibold text-amber-600">Action Required</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Requires manager sign-off</span>
            <ArrowUpRight size={15} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>
        </Link>

        {/* Card 4: Monthly Payroll */}
        <Link
          href="/payroll"
          className="group bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all hover:border-indigo-300"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Payroll
            </span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              ${(stats.monthlyPayrollTotal / 1000).toFixed(1)}k
            </span>
            <span className="text-xs font-semibold text-slate-600">Sept 2026</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Direct deposit batch ready</span>
            <ArrowUpRight size={15} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Headcount Bar Chart (Custom Tailwind Visuals) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                Department Headcount Distribution
              </h2>
              <p className="text-xs text-slate-500">
                Staff allocation across active business divisions
              </p>
            </div>
            <Link
              href="/employees"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View Directory <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.departmentDistribution.map((dept) => {
              const percentage = Math.round((dept.count / stats.totalEmployees) * 100);
              return (
                <div key={dept.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      ></span>
                      {dept.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {dept.count} team {dept.count === 1 ? 'member' : 'members'} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: dept.color,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Total Teams</span>
              <span className="text-lg font-bold text-slate-900">
                {stats.departmentDistribution.length}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Largest Team</span>
              <span className="text-lg font-bold text-indigo-600">
                {stats.departmentDistribution[0]?.name.split(' ')[0] || 'Engineering'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <span className="text-[11px] text-slate-500 block">Avg Team Size</span>
              <span className="text-lg font-bold text-slate-900">
                {(stats.totalEmployees / stats.departmentDistribution.length).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Today's Attendance Real-time Radial / Donut breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock size={18} className="text-emerald-600" />
                Live Attendance Status
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Today
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Real-time daily presence, remote WFH, and leave indicators
            </p>

            {/* Visual Attendance Progress Stack */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Present in Office</span>
                    <span className="text-[10px] text-slate-500 block">HQ & Hub locations</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-700">
                  {stats.attendanceToday.present}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Working Remotely</span>
                    <span className="text-[10px] text-slate-500 block">WFH approved</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-700">
                  {stats.attendanceToday.remote}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">Late Arrivals</span>
                    <span className="text-[10px] text-slate-500 block">After 09:30 AM</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-amber-700">
                  {stats.attendanceToday.late}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/70 border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">On Leave / Absent</span>
                    <span className="text-[10px] text-slate-500 block">Approved PTO</span>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-rose-700">
                  {stats.attendanceToday.absent}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/attendance"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Open Live Timesheet & Punch Log <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Lower Grid: Recent Activity Stream & Celebrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent HR Events & Activity</h2>
              <p className="text-xs text-slate-500">Live operational timeline across company</p>
            </div>
            <Link
              href="/leaves"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Review Approvals <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      act.type === 'leave'
                        ? 'bg-amber-50 text-amber-600'
                        : act.type === 'hire'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-indigo-50 text-indigo-600'
                    }`}
                  >
                    {act.type === 'leave' ? (
                      <CalendarCheck size={18} />
                    ) : act.type === 'hire' ? (
                      <Users size={18} />
                    ) : (
                      <CreditCard size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{act.title}</h3>
                    <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                  </div>
                </div>
                {act.statusBadge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      act.statusBadge === 'Approved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : act.statusBadge === 'Pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {act.statusBadge}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Celebrations & Anniversaries */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cake size={18} className="text-pink-500" />
                Upcoming Milestones
              </h2>
              <span className="text-xs text-slate-400">Next 30 Days</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Celebrate team birthdays and work tenure milestones!
            </p>

            <div className="space-y-3">
              {stats.upcomingBirthdaysAndAnniversaries.map((cel) => (
                <div
                  key={cel.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-pink-50/30 transition-colors"
                >
                  <img
                    src={cel.avatar}
                    alt={cel.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{cel.name}</p>
                    <p className="text-[11px] text-pink-600 font-medium truncate">{cel.subtitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 px-2 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                      {cel.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/announcements"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Post a Celebration Wish on Bulletin <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
