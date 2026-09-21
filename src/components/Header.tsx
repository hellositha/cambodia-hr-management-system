'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp, PERSONAS } from '@/context/AppContext';
import {
  Search,
  Bell,
  Clock,
  Plus,
  ChevronDown,
  UserCheck,
  CalendarPlus,
  Briefcase,
  DollarSign,
  Megaphone,
  User,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  const {
    currentPersona,
    switchPersona,
    isClockedIn,
    clockInTime,
    toggleClock,
    openModal,
    sidebarCollapsed,
  } = useApp();

  const [personaOpen, setPersonaOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const personaRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (personaRef.current && !personaRef.current.contains(event.target as Node)) {
        setPersonaOpen(false);
      }
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setQuickActionOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 1,
      title: '3 Leave Requests Pending',
      time: '10m ago',
      unread: true,
      href: '/leaves',
      icon: CalendarPlus,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 2,
      title: 'Offer stage reached: Dmitri Voronov',
      time: '1h ago',
      unread: true,
      href: '/recruitment',
      icon: Briefcase,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 3,
      title: 'September Payroll Draft Ready',
      time: '3h ago',
      unread: false,
      href: '/payroll',
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
    },
  ];

  return (
    <header
      className={`no-print sticky top-0 z-20 h-16 bg-white border-b border-slate-200 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search employees, departments, jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        {/* Live Clock-In / Out Toggle */}
        <button
          onClick={toggleClock}
          title={isClockedIn ? 'Click to clock out' : 'Click to clock in'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border shadow-xs ${
            isClockedIn
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {isClockedIn && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
          </span>
          <Clock size={14} />
          <span>{isClockedIn ? `Clocked In (${clockInTime || '09:00 AM'})` : 'Clock In'}</span>
        </button>

        {/* Quick Action Button */}
        <div className="relative" ref={actionRef}>
          <button
            onClick={() => setQuickActionOpen(!quickActionOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-colors"
          >
            <Plus size={15} />
            <span>Quick Action</span>
            <ChevronDown size={14} className={quickActionOpen ? 'rotate-180 transition-transform' : ''} />
          </button>

          {quickActionOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Create & Request
              </div>
              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('add-employee');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
                  <UserCheck size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Add New Employee</div>
                  <div className="text-[10px] text-slate-500">Onboard hire & set salary</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('request-leave');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <CalendarPlus size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Request Time Off</div>
                  <div className="text-[10px] text-slate-500">Annual, sick, or casual</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('post-job');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-purple-50 text-purple-600">
                  <Briefcase size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Post Job Opening</div>
                  <div className="text-[10px] text-slate-500">Publish role to ATS pipeline</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('run-payroll');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                  <DollarSign size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Run Monthly Payroll</div>
                  <div className="text-[10px] text-slate-500">Process batch pay slips</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setQuickActionOpen(false);
                  openModal('post-announcement');
                }}
                className="w-full text-left px-3 py-2 text-xs flex items-center gap-2.5 hover:bg-slate-50 transition-colors"
              >
                <div className="p-1.5 rounded-md bg-pink-50 text-pink-600">
                  <Megaphone size={14} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">New Announcement</div>
                  <div className="text-[10px] text-slate-500">Pin bulletin to company feed</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                <span className="font-bold text-xs text-slate-900">Notifications</span>
                <span className="text-[10px] font-semibold text-indigo-600 hover:underline cursor-pointer">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const Icon = n.icon;
                  return (
                    <Link
                      key={n.id}
                      href={n.href}
                      onClick={() => setNotificationsOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${n.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                        <p className="text-[11px] text-slate-400">{n.time}</p>
                      </div>
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5"></span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative" ref={personaRef}>
          <button
            onClick={() => setPersonaOpen(!personaOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300"
            />
            <div className="hidden sm:block text-left text-xs leading-tight pr-1">
              <div className="font-semibold text-slate-800">{currentPersona.name}</div>
              <div className="text-[10px] text-slate-500 font-medium">{currentPersona.role} View</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {personaOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Role / View
              </div>
              <div className="space-y-1">
                {PERSONAS.map((p) => {
                  const isSelected = p.id === currentPersona.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setPersonaOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        isSelected ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              p.role === 'Admin'
                                ? 'bg-purple-100 text-purple-700'
                                : p.role === 'Manager'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{p.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
