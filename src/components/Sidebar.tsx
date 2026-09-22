'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import HestraLogo from '@/components/HestraLogo';
import { formatLocalizedText } from '@/lib/translations';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Timer,
  CalendarCheck,
  Banknote,
  CreditCard,
  Briefcase,
  Award,
  Megaphone,
  Scale,
  BarChart3,
  UserCheck,
  Shield,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  LogOut,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentPersona, sidebarCollapsed, toggleSidebar, language, toggleLanguage, logout, t } = useApp();

  const allNavItems = [
    { label: t('nav_dashboard'), href: '/', icon: LayoutDashboard, roles: ['Manager', 'Admin'] },
    { label: t('nav_staff_portal'), href: '/portal/staff', icon: UserCheck, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_manager_portal'), href: '/portal/manager', icon: Shield, roles: ['Manager', 'Admin'] },
    { label: t('nav_employees'), href: '/employees', icon: Users, roles: ['Manager', 'Admin'] },
    { label: t('nav_departments'), href: '/departments', icon: Building2, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_attendance'), href: '/attendance', icon: Clock, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_roster'), href: '/roster', icon: CalendarDays, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_overtime'), href: '/overtime', icon: Timer, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_leaves'), href: '/leaves', icon: CalendarCheck, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_salary'), href: '/salary', icon: Banknote, roles: ['Manager', 'Admin'] },
    { label: t('nav_payroll'), href: '/payroll', icon: CreditCard, roles: ['Admin'] },
    { label: t('nav_recruitment'), href: '/recruitment', icon: Briefcase, roles: ['Admin'] },
    { label: t('nav_performance'), href: '/performance', icon: Award, roles: ['Manager', 'Admin'] },
    { label: t('nav_announcements'), href: '/announcements', icon: Megaphone, roles: ['Employee', 'Manager', 'Admin'] },
    { label: t('nav_tools'), href: '/tools', icon: Scale, roles: ['Admin'] },
    { label: t('nav_reports'), href: '/reports', icon: BarChart3, roles: ['Admin'] },
    { label: t('nav_users'), href: '/users', icon: UserCog, roles: ['Admin'] },
    { label: t('nav_settings'), href: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  const userRole = currentPersona?.role || 'Employee';
  const navItems = allNavItems.filter((item) => item.roles.includes(userRole));
  const homeHref = userRole === 'Employee' ? '/portal/staff' : '/';

  return (
    <aside
      className={`no-print fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white text-slate-700 border-r border-slate-200/90 transition-all duration-300 shadow-xs ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 bg-white">
        <Link href={homeHref} className="flex items-center gap-3 overflow-hidden">
          <HestraLogo
            size="md"
            showText={!sidebarCollapsed}
            subtext={t('brand_tagline')}
          />
        </Link>
        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group relative ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/70 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                }`}
              />
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Language Quick Toggle in Sidebar */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-100">
        {!sidebarCollapsed ? (
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
            title={language === 'km' ? 'ប្តូរទៅ English' : 'Switch to Khmer'}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{language === 'km' ? '🇰🇭' : '🇬🇧'}</span>
              <span>{language === 'km' ? 'ភាសាខ្មែរ (KM)' : 'English (EN)'}</span>
            </div>
            <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
              {language === 'km' ? 'ប្តូរ ⇄ EN' : 'Switch ⇄ KM'}
            </span>
          </button>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-base shadow-2xs transition-transform active:scale-95 cursor-pointer"
              title={language === 'km' ? 'ប្តូរទៅ English' : 'Switch to Khmer'}
            >
              {language === 'km' ? '🇰🇭' : '🇬🇧'}
            </button>
          </div>
        )}
      </div>

      {/* Persona Footer Widget (Light) */}
      <div className="p-3 bg-slate-50/60">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-900 truncate">{formatLocalizedText(currentPersona.name, language)}</p>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                  title={language === 'km' ? 'ចាកចេញ (Sign Out)' : 'Sign Out'}
                  className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-[11px] text-slate-500 truncate">{formatLocalizedText(currentPersona.title, language)}</p>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    currentPersona.role === 'Admin'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : currentPersona.role === 'Manager'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {currentPersona.role}
                </span>
              </div>
              {userRole === 'Employee' && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-amber-700 font-bold">
                  <div className="flex items-center gap-1">
                    <ShieldAlert size={12} className="text-amber-500 shrink-0" />
                    <span>{language === 'km' ? 'សិទ្ធិកម្រិតកំណត់' : 'Limited Role'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              title={`${currentPersona.name} (${currentPersona.role})`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
            />
            <button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              title={language === 'km' ? 'ចាកចេញ (Sign Out)' : 'Sign Out'}
              className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
