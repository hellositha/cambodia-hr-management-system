'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import HestraLogo from '@/components/HestraLogo';
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
  const { currentPersona, sidebarCollapsed, toggleSidebar, language, toggleLanguage, t } = useApp();

  const navItems = [
    { label: t('nav_dashboard'), href: '/', icon: LayoutDashboard },
    { label: t('nav_employees'), href: '/employees', icon: Users, badge: language === 'km' ? 'បុគ្គលិក' : 'Staff' },
    { label: t('nav_attendance'), href: '/attendance', icon: Clock },
    { label: t('nav_leaves'), href: '/leaves', icon: CalendarCheck, badge: language === 'km' ? 'ច្បាប់' : 'Leaves' },
    { label: t('nav_payroll'), href: '/payroll', icon: CreditCard },
    { label: t('nav_recruitment'), href: '/recruitment', icon: Briefcase, badge: language === 'km' ? 'ការងារ' : 'Jobs' },
    { label: t('nav_performance'), href: '/performance', icon: Award },
    { label: t('nav_announcements'), href: '/announcements', icon: Megaphone },
    { label: t('nav_settings'), href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`no-print fixed top-0 left-0 bottom-0 z-30 flex flex-col bg-white text-slate-700 border-r border-slate-200/90 transition-all duration-300 shadow-xs ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-100 bg-white">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
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
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/60'
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

      {/* Language Quick Toggle in Sidebar */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-100">
        {!sidebarCollapsed ? (
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-all cursor-pointer group shadow-2xs"
            title={language === 'km' ? 'ប្តូរទៅ English' : 'Switch to ភាសាខ្មែរ'}
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
              title={language === 'km' ? 'ប្តូរទៅ English' : 'Switch to ភាសាខ្មែរ'}
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
                <p className="text-xs font-bold text-slate-900 truncate">{currentPersona.name}</p>
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
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{currentPersona.title}</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              title={`${currentPersona.name} (${currentPersona.role})`}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-200"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
