'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  CreditCard,
  Briefcase,
  Award,
  Megaphone,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentPersona, sidebarCollapsed, toggleSidebar } = useApp();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Employees', href: '/employees', icon: Users, badge: '18' },
    { label: 'Attendance', href: '/attendance', icon: Clock },
    { label: 'Time Off & Leaves', href: '/leaves', icon: CalendarCheck, badge: '3 Pending' },
    { label: 'Payroll & Comp', href: '/payroll', icon: CreditCard },
    { label: 'Recruitment (ATS)', href: '/recruitment', icon: Briefcase, badge: '4 Jobs' },
    { label: 'Performance', href: '/performance', icon: Award },
    { label: 'Announcements', href: '/announcements', icon: Megaphone },
    { label: 'Settings & DB', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`no-print fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-indigo-500/20 shrink-0">
            P
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white text-lg tracking-tight flex items-center gap-1.5">
                PulseHR
                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </span>
              <span className="text-xs text-slate-400">Enterprise HRMS</span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={sidebarCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <Icon
                size={20}
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`}
              />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.badge.includes('Pending')
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : isActive
                          ? 'bg-indigo-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Persona Footer Widget */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-white truncate">{currentPersona.name}</p>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    currentPersona.role === 'Admin'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : currentPersona.role === 'Manager'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {currentPersona.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{currentPersona.title}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              title={`${currentPersona.name} (${currentPersona.role})`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/40"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
