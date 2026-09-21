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
  PartyPopper,
  Palette,
  Sun,
  Moon,
  Flame,
  UserPlus,
  RotateCcw,
} from 'lucide-react';

type DashboardTheme = 'midnight' | 'nordic' | 'indigo';

export default function StyledDashboardPage() {
  const { currentPersona, switchPersona, openModal, refreshKey, triggerRefresh, showToast } = useApp();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<'all' | 'leave' | 'hire'>('all');
  const [activeChartTab, setActiveChartTab] = useState<'departments' | 'weekly_trend'>('departments');
  const [theme, setTheme] = useState<DashboardTheme>('midnight');

  // Real-time greeting & clock
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome back');

  useEffect(() => {
    const savedTheme = localStorage.getItem('pulsehr_theme') as DashboardTheme | null;
    if (savedTheme) setTheme(savedTheme);

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

  const changeTheme = (newTheme: DashboardTheme) => {
    setTheme(newTheme);
    localStorage.setItem('pulsehr_theme', newTheme);
    showToast(`Dashboard style changed to ${newTheme.toUpperCase()}`, 'info');
  };

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

  const handleQuickSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        showToast('Demo data seeded successfully!', 'success');
        triggerRefresh();
      }
    } catch {
      showToast('Failed to seed demo data', 'error');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[65vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium tracking-wide">
            Rendering dashboard telemetry...
          </p>
        </div>
      </div>
    );
  }

  // Theme-specific styling tokens
  const themeClasses = {
    midnight: {
      wrapper: 'bg-zinc-950 text-zinc-100 min-h-screen p-2 sm:p-4 rounded-3xl border border-zinc-900',
      hero: 'bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 text-white shadow-2xl',
      card: 'bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 hover:border-zinc-700 shadow-sm',
      cardHighlight: 'bg-zinc-900/90 border border-indigo-500/30 text-zinc-100',
      textMuted: 'text-zinc-400',
      subtleBox: 'bg-zinc-900 border border-zinc-800',
      badge: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
      accentText: 'text-indigo-400',
      pillActive: 'bg-indigo-600 text-white shadow-sm',
      pillInactive: 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800',
    },
    nordic: {
      wrapper: 'bg-slate-50 text-slate-900 min-h-screen p-2 sm:p-4 rounded-3xl border border-slate-200',
      hero: 'bg-white border border-slate-200/90 text-slate-900 shadow-xl shadow-slate-200/40',
      card: 'bg-white border border-slate-200/90 text-slate-800 hover:border-slate-300 shadow-xs hover:shadow-md',
      cardHighlight: 'bg-slate-50 border border-slate-300 text-slate-900',
      textMuted: 'text-slate-500',
      subtleBox: 'bg-slate-50 border border-slate-200',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200',
      accentText: 'text-indigo-600',
      pillActive: 'bg-slate-900 text-white shadow-xs',
      pillInactive: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    },
    indigo: {
      wrapper: 'bg-slate-900 text-slate-100 min-h-screen p-2 sm:p-4 rounded-3xl border border-indigo-950',
      hero: 'bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 border border-indigo-800/60 text-white shadow-2xl shadow-indigo-950/40',
      card: 'bg-slate-800/80 border border-slate-700/70 text-slate-200 hover:border-indigo-500/40 shadow-sm',
      cardHighlight: 'bg-indigo-950/60 border border-indigo-500/40 text-white',
      textMuted: 'text-slate-400',
      subtleBox: 'bg-slate-800/90 border border-slate-700',
      badge: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
      accentText: 'text-cyan-400',
      pillActive: 'bg-indigo-600 text-white shadow-sm',
      pillInactive: 'text-slate-400 hover:text-white hover:bg-slate-800',
    },
  }[theme];

  const filteredActivities = stats.recentActivities.filter((act) => {
    if (activityFilter === 'all') return true;
    return act.type === activityFilter;
  });

  return (
    <div className={`space-y-6 transition-colors duration-300 ${themeClasses.wrapper}`}>
      {/* TOP STYLE SWITCHER & QUICK BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-2 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Palette size={16} className={themeClasses.accentText} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-80">
              Dashboard Theme:
            </span>
          </div>

          <div className={`flex items-center p-1 rounded-xl text-xs font-semibold ${themeClasses.subtleBox}`}>
            <button
              onClick={() => changeTheme('midnight')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === 'midnight' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Moon size={13} /> Midnight Obsidian
            </button>
            <button
              onClick={() => changeTheme('nordic')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === 'nordic' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Sun size={13} /> Nordic Minimal
            </button>
            <button
              onClick={() => changeTheme('indigo')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                theme === 'indigo' ? themeClasses.pillActive : themeClasses.pillInactive
              }`}
            >
              <Flame size={13} /> Indigo Electric
            </button>
          </div>
        </div>

        {/* Persona quick preview */}
        <div className="flex items-center gap-2 text-xs">
          <span className={`text-[11px] font-semibold ${themeClasses.textMuted}`}>Active View:</span>
          <div className={`flex items-center gap-1 p-1 rounded-xl ${themeClasses.subtleBox}`}>
            {PERSONAS.map((p) => {
              const isCur = p.id === currentPersona.id;
              return (
                <button
                  key={p.id}
                  onClick={() => switchPersona(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCur ? themeClasses.pillActive : themeClasses.pillInactive
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. HERO BENTO BANNER */}
      <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all ${themeClasses.hero}`}>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>All Systems Operational</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Clock size={13} />
                <span>{currentTime || '09:00:00 AM'}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/10 border border-purple-500/30 text-purple-400">
                <Sparkles size={12} />
                <span>Q3 Fiscal 2026</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {greeting}, {currentPersona.name.split(' ')[0]}!
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed max-w-xl ${themeClasses.textMuted}`}>
              Currently operating in{' '}
              <strong className="text-current font-bold">{currentPersona.role} Mode</strong> ({currentPersona.title}).
              {stats.totalEmployees > 0 ? (
                <> Headcount is at <strong className="text-current">{stats.totalEmployees} staff</strong> with <span className="text-emerald-400 font-bold">{stats.attendanceToday.percentage}% attendance</span> today.</>
              ) : (
                <> The workforce roster is currently clear. You can onboard new staff or restore demo data with 1 click.</>
              )}
            </p>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2.5 lg:w-52 shrink-0">
            <button
              onClick={() => openModal('add-employee')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <UserPlus size={15} /> Onboard Employee
            </button>
            <button
              onClick={() => openModal('request-leave')}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                theme === 'nordic' ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CalendarCheck size={15} /> Request Time Off
            </button>
            <button
              onClick={() => openModal('run-payroll')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              <CreditCard size={15} /> Run Payroll
            </button>
          </div>
        </div>

        {/* Ambient Subtle Gradients */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* ZERO EMPLOYEES ONBOARDING PROMPT (If cleared) */}
      {stats.totalEmployees === 0 && (
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${themeClasses.cardHighlight}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Workforce Roster is Currently Empty</h3>
              <p className={`text-xs mt-0.5 ${themeClasses.textMuted}`}>
                You can start fresh by onboarding your first colleague, or instantly restore the 18 sample employees.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => openModal('add-employee')}
              className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={15} /> Onboard Hire
            </button>
            <button
              onClick={handleQuickSeed}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${themeClasses.subtleBox}`}
            >
              <RotateCcw size={14} /> Restore 18 Demo Staff
            </button>
          </div>
        </div>
      )}

      {/* 2. BENTO METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Headcount */}
        <Link
          href="/employees"
          className={`group rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${themeClasses.card}`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <TrendingUp size={11} /> Directory
            </span>
          </div>

          <div className="mt-4">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${themeClasses.textMuted}`}>
              Total Workforce
            </span>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              {stats.totalEmployees} <span className="text-xs font-semibold opacity-60">colleagues</span>
            </div>
            <p className={`text-[11px] mt-1 ${themeClasses.textMuted}`}>
              {stats.activeEmployees} active &bull; {stats.onLeaveEmployees} on leave
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold border-current/10 ${themeClasses.accentText}`}>
            <span>Open Directory</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 2: Attendance Rate */}
        <Link
          href="/attendance"
          className={`group rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${themeClasses.card}`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Clock size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Roster
            </span>
          </div>

          <div className="mt-4">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${themeClasses.textMuted}`}>
              Attendance Today
            </span>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              {stats.attendanceToday.percentage}%
            </div>
            <p className={`text-[11px] mt-1 ${themeClasses.textMuted}`}>
              {stats.attendanceToday.present} In Office &bull; {stats.attendanceToday.remote} Remote
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold border-current/10 ${themeClasses.accentText}`}>
            <span>Punch Timesheets</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 3: Pending Approvals */}
        <Link
          href="/leaves"
          className={`group rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${themeClasses.card}`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
              <CalendarCheck size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Approvals
            </span>
          </div>

          <div className="mt-4">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${themeClasses.textMuted}`}>
              Pending Time-Off
            </span>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              {stats.pendingLeavesCount} <span className="text-xs font-semibold opacity-60">requests</span>
            </div>
            <p className={`text-[11px] mt-1 ${themeClasses.textMuted}`}>
              Manager review SLA: 24h
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold border-current/10 ${themeClasses.accentText}`}>
            <span>Review Queue</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>

        {/* Card 4: Monthly Payroll */}
        <Link
          href="/payroll"
          className={`group rounded-2xl p-5 transition-all duration-200 flex flex-col justify-between ${themeClasses.card}`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
              <CreditCard size={20} />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Sept 2026
            </span>
          </div>

          <div className="mt-4">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${themeClasses.textMuted}`}>
              Monthly Payroll
            </span>
            <div className="text-3xl font-black tracking-tight mt-0.5">
              ${(stats.monthlyPayrollTotal / 1000).toFixed(1)}k
            </div>
            <p className={`text-[11px] mt-1 ${themeClasses.textMuted}`}>
              Direct deposits processed
            </p>
          </div>

          <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs font-semibold border-current/10 ${themeClasses.accentText}`}>
            <span>Ledger & Payslips</span>
            <ArrowUpRight size={15} />
          </div>
        </Link>
      </div>

      {/* 3. AI AGENT INSIGHTS HUB */}
      <div className={`rounded-2xl p-5 border ${themeClasses.cardHighlight}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot size={17} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm">
                PulseHR AI Operations Copilot
              </h3>
              <p className={`text-[11px] ${themeClasses.textMuted}`}>
                Autonomous HR intelligence & proactive compliance telemetry
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            Real-Time Analysis
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${themeClasses.subtleBox}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Leave Approval Monitoring</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${themeClasses.textMuted}`}>
                {stats.pendingLeavesCount > 0
                  ? `${stats.pendingLeavesCount} leave requests pending manager review. Pod coverage requirements verified.`
                  : 'No pending leave approvals in the queue. All teammate requests are up to date.'}
              </p>
            </div>
            <Link
              href="/leaves"
              className={`text-[11px] font-bold flex items-center gap-1 mt-3 ${themeClasses.accentText}`}
            >
              Open Approvals <ArrowRight size={12} />
            </Link>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-between ${themeClasses.subtleBox}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Recruitment SLA Status</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${themeClasses.textMuted}`}>
                {stats.openPositionsCount} active job requisitions published. Candidate pipeline health is optimal.
              </p>
            </div>
            <Link
              href="/recruitment"
              className={`text-[11px] font-bold flex items-center gap-1 mt-3 ${themeClasses.accentText}`}
            >
              Review ATS Pipeline <ArrowRight size={12} />
            </Link>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-between ${themeClasses.subtleBox}`}>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                <span>Compensation Audit</span>
              </div>
              <p className={`text-[11px] mt-1.5 leading-relaxed ${themeClasses.textMuted}`}>
                {stats.totalEmployees > 0
                  ? `September 2026 payroll reconciled at $${(stats.monthlyPayrollTotal / 1000).toFixed(1)}k with zero tax discrepancies.`
                  : 'Payroll ledger is clear. Ready for employee additions and compensation configuration.'}
              </p>
            </div>
            <Link
              href="/payroll"
              className={`text-[11px] font-bold flex items-center gap-1 mt-3 ${themeClasses.accentText}`}
            >
              Inspect Payslips <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. DUAL-VIEW ANALYTICS BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Capacity Bars */}
        <div className={`lg:col-span-2 rounded-2xl p-6 border space-y-5 ${themeClasses.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Building2 size={18} className={themeClasses.accentText} />
                Department Allocation & Team Proportions
              </h2>
              <p className={`text-xs ${themeClasses.textMuted}`}>
                Staff distribution across all active business pods
              </p>
            </div>

            <div className={`flex items-center p-1 rounded-xl text-xs shrink-0 ${themeClasses.subtleBox}`}>
              <button
                onClick={() => setActiveChartTab('departments')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeChartTab === 'departments' ? themeClasses.pillActive : themeClasses.pillInactive
                }`}
              >
                Divisions
              </button>
              <button
                onClick={() => setActiveChartTab('weekly_trend')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeChartTab === 'weekly_trend' ? themeClasses.pillActive : themeClasses.pillInactive
                }`}
              >
                Weekly Trend
              </button>
            </div>
          </div>

          {activeChartTab === 'departments' ? (
            <div className="space-y-4">
              {stats.departmentDistribution.map((dept) => {
                const percentage =
                  stats.totalEmployees > 0 ? Math.round((dept.count / stats.totalEmployees) * 100) : 0;

                return (
                  <div key={dept.name} className="group space-y-1.5 cursor-pointer">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: dept.color }}
                        ></span>
                        {dept.name}
                      </span>
                      <span className={themeClasses.textMuted}>
                        <strong className="text-current font-bold">{dept.count}</strong> staff ({percentage}%)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-current/10 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(2, percentage)}%`,
                          backgroundColor: dept.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}

              <div className="mt-6 pt-4 border-t border-current/10 grid grid-cols-3 gap-4 text-center">
                <div className={`p-3 rounded-xl ${themeClasses.subtleBox}`}>
                  <span className={`text-[11px] block font-medium ${themeClasses.textMuted}`}>
                    Active Divisions
                  </span>
                  <span className="text-xl font-black mt-0.5 block">
                    {stats.departmentDistribution.length}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${themeClasses.subtleBox}`}>
                  <span className={`text-[11px] block font-medium ${themeClasses.textMuted}`}>
                    Primary Division
                  </span>
                  <span className={`text-xl font-black mt-0.5 block ${themeClasses.accentText}`}>
                    {stats.departmentDistribution[0]?.name.split(' ')[0] || 'Engineering'}
                  </span>
                </div>
                <div className={`p-3 rounded-xl ${themeClasses.subtleBox}`}>
                  <span className={`text-[11px] block font-medium ${themeClasses.textMuted}`}>
                    Avg Pod Size
                  </span>
                  <span className="text-xl font-black mt-0.5 block">
                    {stats.departmentDistribution.length > 0
                      ? (stats.totalEmployees / stats.departmentDistribution.length).toFixed(1)
                      : '0'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Weekly Presence Trend */
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
                    <span className="text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {col.rate}
                    </span>
                    <div
                      className="w-full bg-indigo-500/30 group-hover:bg-indigo-600 rounded-xl transition-all duration-300"
                      style={{ height: `${col.height}%` }}
                    ></div>
                    <span className={`text-[10px] font-semibold ${themeClasses.textMuted}`}>
                      {col.day.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
              <p className={`text-center text-[11px] ${themeClasses.textMuted}`}>
                Punctuality maintained consistently above 90% SLA throughout the operating cycle.
              </p>
            </div>
          )}
        </div>

        {/* Right 1 Col: Workforce Presence Radar */}
        <div className={`rounded-2xl p-6 border flex flex-col justify-between space-y-4 ${themeClasses.card}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Compass size={18} className="text-emerald-500" />
                Workforce Radar
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30">
                Live
              </span>
            </div>
            <p className={`text-xs mb-4 ${themeClasses.textMuted}`}>
              Location & shift telemetry for all staff
            </p>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.subtleBox}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></div>
                  <div>
                    <span className="text-xs font-bold block">Present (In Office)</span>
                    <span className={`text-[10px] ${themeClasses.textMuted}`}>HQ desks & meeting hubs</span>
                  </div>
                </div>
                <span className="text-base font-black text-emerald-500">
                  {stats.attendanceToday.present}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.subtleBox}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30"></div>
                  <div>
                    <span className="text-xs font-bold block">Remote (WFH)</span>
                    <span className={`text-[10px] ${themeClasses.textMuted}`}>Virtual clock-in verified</span>
                  </div>
                </div>
                <span className="text-base font-black text-blue-500">
                  {stats.attendanceToday.remote}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.subtleBox}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/30"></div>
                  <div>
                    <span className="text-xs font-bold block">Late Arrivals</span>
                    <span className={`text-[10px] ${themeClasses.textMuted}`}>Punched in after 9:30 AM</span>
                  </div>
                </div>
                <span className="text-base font-black text-amber-500">
                  {stats.attendanceToday.late}
                </span>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.subtleBox}`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></div>
                  <div>
                    <span className="text-xs font-bold block">On Leave / PTO</span>
                    <span className={`text-[10px] ${themeClasses.textMuted}`}>Authorized annual vacation</span>
                  </div>
                </div>
                <span className="text-base font-black text-rose-500">
                  {stats.attendanceToday.absent}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-current/10">
            <Link
              href="/attendance"
              className={`text-xs font-bold flex items-center justify-between ${themeClasses.accentText}`}
            >
              <span>View Live Daily Punch Clock</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 5. TIMELINE & CULTURE CELEBRATIONS BENTO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Operations Stream */}
        <div className={`lg:col-span-2 rounded-2xl p-6 border space-y-4 ${themeClasses.card}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Activity size={18} className={themeClasses.accentText} />
                Live Operations Stream
              </h2>
              <p className={`text-xs ${themeClasses.textMuted}`}>
                Chronological event stream of approvals, hires, and payroll
              </p>
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-xl text-xs ${themeClasses.subtleBox}`}>
              {(['all', 'leave', 'hire'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    activityFilter === filter ? themeClasses.pillActive : themeClasses.pillInactive
                  }`}
                >
                  {filter === 'all' ? 'All Events' : filter === 'leave' ? 'Time Off' : 'Hiring'}
                </button>
              ))}
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className={`py-12 text-center text-xs ${themeClasses.textMuted}`}>
              No recent activity logged in this category.
            </div>
          ) : (
            <div className="divide-y divide-current/10">
              {filteredActivities.map((act) => (
                <div key={act.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        act.type === 'leave'
                          ? 'bg-amber-500/15 text-amber-500'
                          : act.type === 'hire'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-indigo-500/15 text-indigo-500'
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
                      <h3 className="text-xs font-bold">{act.title}</h3>
                      <p className={`text-[11px] ${themeClasses.textMuted}`}>{act.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] ${themeClasses.textMuted}`}>
                      {act.timestamp.slice(0, 10)}
                    </span>
                    {act.statusBadge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${themeClasses.badge}`}>
                        {act.statusBadge}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-current/10 flex justify-end">
            <Link
              href="/leaves"
              className={`text-xs font-bold flex items-center gap-1 ${themeClasses.accentText}`}
            >
              Review Full Approval Queue <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Culture & Celebrations */}
        <div className={`rounded-2xl p-6 border flex flex-col justify-between space-y-4 ${themeClasses.card}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Cake size={18} className="text-pink-500" />
                Team Celebrations
              </h2>
              <span className={`text-xs ${themeClasses.textMuted}`}>Next 30 Days</span>
            </div>
            <p className={`text-xs mb-4 ${themeClasses.textMuted}`}>
              Send congratulations and fire confetti cannons!
            </p>

            {stats.upcomingBirthdaysAndAnniversaries.length === 0 ? (
              <div className={`py-8 text-center text-xs ${themeClasses.textMuted}`}>
                No upcoming milestones scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcomingBirthdaysAndAnniversaries.map((cel) => (
                  <div
                    key={cel.id}
                    className={`flex items-center justify-between p-3 rounded-xl border ${themeClasses.subtleBox}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={cel.avatar}
                        alt={cel.name}
                        className="w-9 h-9 rounded-xl object-cover shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{cel.name}</p>
                        <p className="text-[10px] text-pink-500 font-semibold truncate">{cel.subtitle}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => triggerCelebration(cel.name, cel.subtitle)}
                      className="p-1.5 rounded-lg bg-pink-500/10 text-pink-500 hover:bg-pink-500 hover:text-white transition-all cursor-pointer shrink-0 border border-pink-500/20"
                      title="Send celebration confetti"
                    >
                      <PartyPopper size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-current/10">
            <Link
              href="/announcements"
              className={`text-xs font-bold flex items-center justify-between ${themeClasses.accentText}`}
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
