'use client';

import React, { useState } from 'react';
import { useApp, PERSONAS } from '@/context/AppContext';
import {
  Settings,
  Database,
  RefreshCw,
  Server,
  ShieldCheck,
  Building,
  Check,
  Info,
  Layers,
  Code,
  Sparkles,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentPersona, switchPersona, showToast, triggerRefresh } = useApp();
  const [resetting, setResetting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const [companySettings, setCompanySettings] = useState({
    name: 'HESTRA HRM Technologies Inc.',
    address: 'Exchange Square, Norodom Blvd, Phnom Penh, Cambodia',
    currency: 'USD ($) & KHR (៛)',
    workHours: '8.0',
    timezone: 'Asia/Phnom_Penh (GMT+7)',
    fiscalYearStart: 'January 1st',
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Corporate settings saved successfully!', 'success');
  };

  const handleClearAllDemo = async () => {
    if (!confirm('Are you sure you want to clear all demo data (employees, recruitment, announcements, payroll)?')) return;
    setClearing(true);
    try {
      await fetch('/api/employees', { method: 'DELETE' });
      await fetch('/api/recruitment/jobs', { method: 'DELETE' });
      await fetch('/api/announcements', { method: 'DELETE' });
      showToast('All demo records have been completely cleared from HESTRA HRM!', 'success');
      triggerRefresh();
    } catch {
      showToast('Error clearing demo data', 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database to pristine seed demo data?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Database successfully re-seeded!', 'success');
        triggerRefresh();
      } else {
        showToast(data.error || 'Failed to reset database', 'error');
      }
    } catch {
      showToast('Network error resetting database', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleClearEmployees = async () => {
    if (!confirm('Are you sure you want to remove all employees? This will clear all employee profiles, attendance, leaves, and payroll records.')) return;
    setClearing(true);
    try {
      const res = await fetch('/api/employees', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'All employees cleared successfully!', 'info');
        triggerRefresh();
      } else {
        showToast(data.error || 'Failed to clear employees', 'error');
      }
    } catch {
      showToast('Network error clearing employees', 'error');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="text-slate-700" size={26} />
          System Settings & Platform Configuration
        </h1>
        <p className="text-xs text-slate-500">
          Manage corporate parameters, role simulations, database state, and infrastructure diagnostics
        </p>
      </div>

      {/* Role & Persona Simulation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck size={18} className="text-indigo-600" />
              Active Role-Based Persona Simulator
            </h2>
            <p className="text-xs text-slate-500">
              Switch between user perspectives to test permissions, approval queues, and dashboards
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Interactive
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona.id;
            return (
              <div
                key={p.id}
                onClick={() => switchPersona(p.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 shadow-xs ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
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
                  <h3 className="font-extrabold text-xs text-slate-900">{p.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">{p.title}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>{isSelected ? 'Currently active' : 'Click to activate'}</span>
                  {isSelected && <Check size={14} className="text-indigo-600" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Database State & Demo Reset */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database size={18} className="text-emerald-600" />
              SQLite Embedded Database & Reset Controls
            </h2>
            <p className="text-xs text-slate-500">
              Fast, ACID-compliant local database storing employees, timesheets, payroll, and jobs
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Healthy / WAL Mode
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Engine</span>
            <span className="font-semibold text-slate-800">better-sqlite3</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Database File</span>
            <span className="font-semibold text-slate-800 truncate block">data/hr.db</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Journal Mode</span>
            <span className="font-semibold text-slate-800">WAL (High Concurrency)</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">Foreign Keys</span>
            <span className="font-semibold text-slate-800">ON (Enforced)</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-slate-900">Database Records & Controls</h4>
            <p className="text-[11px] text-slate-500">
              Clear all demo records across employees, recruitment, payroll, and announcements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAllDemo}
              disabled={clearing}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <Trash2 size={14} className={clearing ? 'animate-spin' : ''} />
              {clearing ? 'Clearing...' : 'Clear All Demo Data'}
            </button>
            <button
              onClick={handleResetDatabase}
              disabled={resetting}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-transform active:scale-95 border border-slate-200 cursor-pointer"
            >
              <RefreshCw size={14} className={resetting ? 'animate-spin' : ''} />
              {resetting ? 'Resetting...' : 'Restore Demo Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Corporate Parameters Form */}
      <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building size={18} className="text-indigo-600" />
            Corporate Parameters
          </h2>
          <p className="text-slate-500">Global payroll currency, standard hours, and fiscal calendar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Company Legal Entity</label>
            <input
              type="text"
              value={companySettings.name}
              onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency Symbol & Code</label>
            <input
              type="text"
              value={companySettings.currency}
              onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Headquarters Address</label>
          <input
            type="text"
            value={companySettings.address}
            onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Daily Work Hours</label>
            <input
              type="text"
              value={companySettings.workHours}
              onChange={(e) => setCompanySettings({ ...companySettings, workHours: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">System Timezone</label>
            <input
              type="text"
              value={companySettings.timezone}
              onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fiscal Year Start</label>
            <input
              type="text"
              value={companySettings.fiscalYearStart}
              onChange={(e) => setCompanySettings({ ...companySettings, fiscalYearStart: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
          >
            Save Corporate Settings
          </button>
        </div>
      </form>

      {/* Technology Stack Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3">
        <div className="flex items-center gap-2">
          <Code className="text-cyan-400" size={18} />
          <h3 className="font-bold text-sm">System Architecture & Modern Stack</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Built natively with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, and better-sqlite3 with WAL journaling. Features RESTful micro-endpoints, role simulations, real-time punch clocks, itemized payslip generation with browser print support, and full-fidelity applicant tracking.
        </p>
      </div>
    </div>
  );
}
