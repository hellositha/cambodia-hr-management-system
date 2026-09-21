'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp, PERSONAS } from '@/context/AppContext';
import { DashboardStats } from '@/lib/types';
import confetti from 'canvas-confetti';
import {
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Plus,
  AlertCircle,
  Megaphone,
  CheckCircle2,
  Cake,
  Building2,
  Bot,
  Zap,
  Activity,
  Calendar,
  Compass,
  Check,
  Shield,
  Coffee,
  PartyPopper,
  SlidersHorizontal,
} from 'lucide-react';

export default function ModernDashboardPage() {
  const { currentPersona, switchPersona, openModal, refreshKey, showToast } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<'all' | 'leave' | 'hire'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'departments' | 'weekly_trend'>('departments');

  // Real-time greeting & clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome back');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      const hours = now.getHours();
      if (hours < 12) setGreeting('Good morning');
      else if (hours < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const triggerCelebration = (name: string, event: string) => {
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }
    showToast(`Celebration wish sent to ${name} for ${event}! 🎉`, 'success');
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold text-xs">
              P
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Synthesizing organization intelligence & people telemetry...
          </p>
        </div>
      </div>
    );
  }

  const filteredActivities = stats.recentActivities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. ULTRA-MODERN HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800/80 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-950/20">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Live Operational Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Operations Normal</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-semibold font-mono">
                <Clock size={13} className="text-indigo-400" />
                <span>{currentTime || '09:00:00 AM'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 text-xs font-semibold">
                <Sparkles size={12} className="text-purple-400" />
                <span>PulseHR AI Core Active</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {greeting}, {currentPersona.name.split(' ')[0]}!
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Viewing organization in{' '}
              <strong className="text-white font-bold">{currentPersona.role} Mode</strong>. Headcount is at{' '}
              <strong className="text-white">{stats.totalEmployees}</strong> team members with{' '}
              <span className="text-emerald-400 font-bold">{stats.attendanceToday.percentage}% punctuality</span>{' '}
              today.
            </p>

            {/* Quick Switch Persona Bar directly in Dashboard */}
            <div className="pt-1 flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold">Switch View:</span>
              <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 backdrop-blur-xs">
                {PERSONAS.map((p) => {
                  const isCur = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => switchPersona(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                        isCur
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                      }`}
                    >
                      <img src={p.avatar} alt={p.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                      <span>{p.name.split(' ')[0]}</span>
                      <span className="text-[9px] opacity-70">({p.role})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Action Dock Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:w-56 shrink-0">
            <button
              onClick={() => openModal('add-employee')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <Plus size={15} /> Onboard Colleague
            </button>
            <button
              onClick={() => openModal('request-leave')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CalendarCheck size={15} /> Request Time Off
            </button>
            <button
              onClick={() => openModal('run-payroll')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CreditCard size={15} /> Run Payroll Batch
            </button>
          </div>
        </div>

        {/* Ambient Gradient Blur Orbs */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-16 -left-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. KPI TELEMETRY CARDS WITH TREND INDICATORS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Headcount */}
        <Link
          href="/employees"
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-250 hover:border-indigo-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-0.5">
              <TrendingUp size={11} /> +14.2% YoY
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Workforce
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.totalEmployees} <span className="text-xs font-semibold text-slate-400">staff</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.activeEmployees} active &bull; {stats.onLeaveEmployees} on leave &bull; 0 terminated
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
            <span>Open Directory</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 2: Attendance & Punctuality */}
        <Link
          href="/attendance"
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-250 hover:border-emerald-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Target 92% Met
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Daily Attendance Rate
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.attendanceToday.percentage}%
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {stats.attendanceToday.present} Present &bull; {stats.attendanceToday.remote} Remote &bull; {stats.attendanceToday.late} Late
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
            <span>Punch Timesheets</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 3: Pending Approvals */}
        <Link
          href="/leaves"
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-250 hover:border-amber-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
              Action Required
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending Approvals
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              {stats.pendingLeavesCount} <span className="text-xs font-semibold text-slate-400">requests</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Manager sign-off SLA: under 24 hours
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform">
            <span>Review Queue</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 4: Monthly Payroll Volume */}
        <Link
          href="/payroll"
          className="group relative bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg transition-all duration-250 hover:border-purple-300 flex flex-col justify-between overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Sept 2026 Run
            </span>
          </div>

          <div className="mt-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Monthly Net Payout
            </span>
            <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
              ${(stats.monthlyPayrollTotal / 1000).toFixed(1)}k
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              100% direct deposit disbursement ready
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-600 group-hover:translate-x-0.5 transition-transform">
            <span>View Ledger & Payslips</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>
      </div>

      {/* 3. SMART HR AI AGENT RECOMMENDATIONS & ACTION CARDS */}
      <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-pink-50/50 rounded-2xl border border-indigo-100 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Bot size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                PulseHR AI Assistant &bull; Recommended Actions
              </h3>
              <p className="text-[11px] text-slate-500">Autonomous workflow monitoring and proactive alerts</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
            3 Insights
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 bg-white/90 rounded-xl border border-indigo-100 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h4 className="font-bold text-xs text-slate-800">Review Leave Request</h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Sarah Chen requested 2 days casual time off for next week. Pod engineering coverage is verified.
              </p>
            </div>
            <Link
              href="/leaves"
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-2"
            >
              Sign Off Leave <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-3.5 bg-white/90 rounded-xl border border-indigo-100 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-xs text-slate-800">Recruitment Milestone</h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Dmitri Voronov has accepted the Staff AI Engineer offer terms. Onboarding workflow is ready.
              </p>
            </div>
            <Link
              href="/recruitment"
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 mt-2"
            >
              View in ATS Kanban <ArrowRight size={12} />
            </Link>
          </div>

          <div className="p-3.5 bg-white/90 rounded-xl border border-indigo-100 shadow-2xs space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <h4 className="font-bold text-xs text-slate-800">Payroll Cycle Sign-off</h4>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                September 2026 ledger is reconciled with zero withholding discrepancies. Direct deposit batch ready.
              </p>
            </div>
            <Link
              href="/payroll"
              className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 mt-2"
            >
              Execute Disbursement <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. INTERACTIVE VISUAL ANALYTICS: DEPARTMENT BARS & ATTENDANCE RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Department Staffing Distribution */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-indigo-600" />
                Workforce Capacity & Department Allocation
              </h2>
              <p className="text-xs text-slate-500">
                Staff distribution, headcount proportions, and team growth
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setActiveChartTab('departments')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeChartTab === 'departments'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Department Capacity
              </button>
              <button
                onClick={() => setActiveChartTab('weekly_trend')}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  activeChartTab === 'weekly_trend'
                    ? 'bg-white text-indigo-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Weekly Presence Trend
              </button>
            </div>
          </div>

          {activeChartTab === 'departments' ? (
            <div className="space-y-4">
              {stats.departmentDistribution.map((dept) => {
                const percentage = Math.round((dept.count / stats.totalEmployees) * 100);
                return (
                  <div key={dept.name} className="group space-y-1.5 cursor-pointer">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        ></span>
                        {dept.name}
                      </span>
                      <span className="text-slate-500 font-medium">
                        <strong className="text-slate-900">{dept.count}</strong> staff ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out group-hover:brightness-110"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: dept.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block font-medium">Active Divisions</span>
                  <span className="text-xl font-black text-slate-900">
                    {stats.departmentDistribution.length}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block font-medium">Primary Division</span>
                  <span className="text-xl font-black text-indigo-600">
                    {stats.departmentDistribution[0]?.name || 'Engineering'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[11px] text-slate-500 block font-medium">Avg Pod Size</span>
                  <span className="text-xl font-black text-slate-900">
                    {(stats.totalEmployees / stats.departmentDistribution.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Weekly Attendance Spark Area Visual */
            <div className="space-y-4 py-2">
              <div className="h-44 flex items-end justify-between gap-3 px-2 pt-6">
                {[
                  { day: 'Mon Sep 14', height: 95, rate: '95%' },
                  { day: 'Tue Sep 15', height: 98, rate: '98%' },
                  { day: 'Wed Sep 16', height: 92, rate: '92%' },
                  { day: 'Thu Sep 17', height: 94, rate: '94%' },
                  { day: 'Fri Sep 18', height: 89, rate: '89%' },
                  { day: 'Mon Sep 21', height: 94, rate: '94% (Today)' },
                ].map((col) => (
                  <div key={col.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.rate}
                    </span>
                    <div
                      className="w-full bg-indigo-100 group-hover:bg-indigo-600 rounded-xl transition-all duration-300"
                      style={{ height: `${col.height}%` }}
                    ></div>
                    <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap">
                      {col.day.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Punctuality maintained consistently above the 90% SLA threshold throughout the month.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Attendance Donut & Status Ring */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass size={18} className="text-emerald-600" />
                Workforce Radar Today
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                Real-Time
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Location & shift telemetry for all active staff</p>

            {/* Visual breakdown list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/80 border border-emerald-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Present (In Office)</span>
                    <span className="text-[10px] text-slate-500 block">HQ desks & conference hubs</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-700">
                  {stats.attendanceToday.present}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/80 border border-blue-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-200"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Remote / WFH</span>
                    <span className="text-[10px] text-slate-500 block">Virtual clock-in verified</span>
                  </div>
                </div>
                <span className="text-base font-black text-blue-700">
                  {stats.attendanceToday.remote}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 border border-amber-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Late Arrivals</span>
                    <span className="text-[10px] text-slate-500 block">Traffic / commute notice</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-700">
                  {stats.attendanceToday.late}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/80 border border-rose-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-200"></div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">On Leave / PTO</span>
                    <span className="text-[10px] text-slate-500 block">Authorized annual vacation</span>
                  </div>
                </div>
                <span className="text-base font-black text-rose-700">
                  {stats.attendanceToday.absent}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/attendance"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-between"
            >
              <span>View Live Daily Punch Clock</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. LOWER SECTION: LIVE HR ACTIVITY TIMELINE & CELEBRATIONS WALL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Stream */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Activity size={18} className="text-indigo-600" />
                Live HR Operations Stream
              </h2>
              <p className="text-xs text-slate-500">Chronological telemetry of requests, approvals, and events</p>
            </div>

            <div className="flex items-center gap-1 text-xs">
              {(['all', 'leave', 'hire'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    activityFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {filter === 'all' ? 'All Events' : filter === 'leave' ? 'Time Off' : 'Hiring'}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => (
              <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                    <h3 className="text-xs font-bold text-slate-900">{act.title}</h3>
                    <p className="text-[11px] text-slate-500">{act.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">{act.timestamp.slice(0, 10)}</span>
                  {act.statusBadge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-end">
            <Link
              href="/leaves"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Review Full Approval Queue <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Culture & Celebrations Card with Confetti Trigger */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Cake size={18} className="text-pink-500" />
                Team Celebrations & Culture
              </h2>
              <span className="text-xs text-slate-400">Next 30 Days</span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Send congratulatory wishes and trigger team confetti!
            </p>

            <div className="space-y-3">
              {stats.upcomingBirthdaysAndAnniversaries.map((cel) => (
                <div
                  key={cel.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-pink-50/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={cel.avatar}
                      alt={cel.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 truncate">{cel.name}</p>
                      <p className="text-[10px] text-pink-600 font-semibold truncate">{cel.subtitle}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerCelebration(cel.name, cel.subtitle)}
                    className="p-1.5 rounded-lg bg-white border border-pink-200 text-pink-600 hover:bg-pink-600 hover:text-white transition-all shadow-2xs cursor-pointer shrink-0"
                    title="Send celebration confetti"
                  >
                    <PartyPopper size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <Link
              href="/announcements"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center justify-between"
            >
              <span>Company Announcements Bulletin</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
