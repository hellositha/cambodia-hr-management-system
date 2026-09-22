'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Database,
  Building,
  Code,
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, language } = useApp();

  const [companySettings, setCompanySettings] = useState({
    name: 'HESTRA HRM Technologies Inc.',
    address: 'Exchange Square, Norodom Blvd, Phnom Penh, Cambodia',
    currency: language === 'km' ? 'USD ($) & KHR (៛)' : 'USD ($) & KHR',
    workHours: '8.0',
    timezone: 'Asia/Phnom_Penh (GMT+7)',
    fiscalYearStart: 'January 1st',
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Corporate settings saved successfully!', 'success');
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
          Manage corporate parameters, database state, and infrastructure diagnostics
        </p>
      </div>

      {/* Database State & Diagnostics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database size={18} className="text-emerald-600" />
              SQLite Embedded Database & Diagnostics
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
