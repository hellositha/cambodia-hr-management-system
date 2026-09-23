'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Settings,
  Database,
  Building,
  Code,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Save,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const { showToast, language, openModal, currentPersona, companySettings, updateCompanySettingsContext } = useApp();

  const [formData, setFormData] = useState({
    name: companySettings?.name || 'HESTRA HRM Technologies Inc.',
    address: companySettings?.address || 'Exchange Square, Norodom Blvd, Phnom Penh, Cambodia',
    currency: companySettings?.currency || (language === 'km' ? 'USD ($) & KHR (៛)' : 'USD ($) & KHR'),
    workHours: companySettings?.workHours || '8.0',
    timezone: companySettings?.timezone || 'Asia/Phnom_Penh (GMT+7)',
    fiscalYearStart: companySettings?.fiscalYearStart || 'January 1st',
  });
  const [saving, setSaving] = useState(false);

  // Synchronize form when companySettings loads or updates from backend
  useEffect(() => {
    if (companySettings) {
      setFormData({
        name: companySettings.name || '',
        address: companySettings.address || '',
        currency: companySettings.currency || '',
        workHours: companySettings.workHours || '8.0',
        timezone: companySettings.timezone || 'Asia/Phnom_Penh (GMT+7)',
        fiscalYearStart: companySettings.fiscalYearStart || 'January 1st',
      });
    }
  }, [companySettings]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateCompanySettingsContext(formData);
    setSaving(false);
    if (success) {
      showToast(
        language === 'km'
          ? `បានរក្សាទុកព័ត៌មានក្រុមហ៊ុន "${formData.name}" ដោយជោគជ័យ! ✓`
          : `Corporate settings for "${formData.name}" saved successfully! ✓`,
        'success'
      );
    } else {
      showToast(
        language === 'km'
          ? 'មានបញ្ហាក្នុងការរក្សាទុកការកំណត់ សូមព្យាយាមម្តងទៀត'
          : 'Failed to save corporate settings. Please try again.',
        'error'
      );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
          <Settings className="text-slate-700" size={26} />
          {language === 'km' ? 'ការកំណត់ប្រព័ន្ធ & រចនាសម្ព័ន្ធស្ថាប័ន' : 'System Settings & Platform Configuration'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'km'
            ? 'គ្រប់គ្រងព័ត៌មានក្រុមហ៊ុន ច្បាប់បៀវត្សរ៍ ស្ថានភាពទិន្នន័យ SQLite និងសុវត្ថិភាពគណនី'
            : 'Manage corporate parameters, payroll currency, database state, and platform diagnostics'}
        </p>
      </div>

      {/* Live Corporate Entity Preview Card */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 p-5 rounded-2xl border border-indigo-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/20 shrink-0">
            <Building size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-full">
                {language === 'km' ? 'ស្ថាប័នផ្លូវការសកម្ម' : 'Active Legal Entity'}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                <CheckCircle2 size={13} />
                <span>{language === 'km' ? 'បានផ្ទៀងផ្ទាត់' : 'Verified'}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
              {companySettings?.name || formData.name}
            </h2>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-slate-400 shrink-0" />
              <span>{companySettings?.address || formData.address}</span>
            </p>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs font-semibold text-slate-600 bg-white/80 px-3 py-2 rounded-xl border border-indigo-100 self-stretch sm:self-auto justify-between sm:justify-center">
          <div className="flex items-center gap-1.5">
            <Coins size={14} className="text-amber-500" />
            <span>{companySettings?.currency || formData.currency}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock size={13} className="text-indigo-400" />
            <span>{companySettings?.workHours || formData.workHours}h / day</span>
          </div>
        </div>
      </div>

      {/* Database State & Diagnostics */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database size={18} className="text-emerald-600" />
              SQLite Embedded Database & Diagnostics
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
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

      {/* Account Security & Password */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                {language === 'km' ? 'សុវត្ថិភាពគណនី & ពាក្យសម្ងាត់' : 'Account Security & Password'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'km'
                  ? 'គ្រប់គ្រងពាក្យសម្ងាត់ផ្ទាល់ខ្លួនរបស់អ្នក ដើម្បីការពារគណនីក្នុងប្រព័ន្ធ HESTRA HRM'
                  : 'Manage your credentials and change your password to keep your account secure'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2.5">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">{currentPersona.name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono">{currentPersona.email || currentPersona.id}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentPersona.role}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openModal('change-password')}
            className="px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <KeyRound size={15} />
            <span>{language === 'km' ? 'ប្តូរពាក្យសម្ងាត់ (Change Password)' : 'Change Password'}</span>
          </button>
        </div>
      </div>

      {/* Corporate Parameters Form */}
      <form onSubmit={handleSaveCompany} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building size={18} className="text-indigo-600" />
              {language === 'km' ? 'ប៉ារ៉ាម៉ែត្រទូទៅរបស់ក្រុមហ៊ុន' : 'Corporate Parameters'}
            </h2>
            <p className="text-slate-500 mt-0.5">
              {language === 'km'
                ? 'ឈ្មោះនីតិបុគ្គលផ្លូវការ រូបិយប័ណ្ណបៀវត្សរ៍ ម៉ោងធ្វើការស្តង់ដារ និងទីស្នាក់ការកណ្តាល'
                : 'Global payroll currency, standard hours, headquarters address, and fiscal calendar'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'km' ? 'ឈ្មោះស្ថាប័ន / ក្រុមហ៊ុនផ្លូវការ' : 'Company Legal Entity'}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="e.g. HESTRA HRM Technologies Inc."
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'km' ? 'និមិត្តសញ្ញារូបិយប័ណ្ណ & កូដ' : 'Currency Symbol & Code'}
            </label>
            <input
              type="text"
              required
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="e.g. USD ($) & KHR (៛)"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            {language === 'km' ? 'អាសយដ្ឋានទីស្នាក់ការកណ្តាល' : 'Headquarters Address'}
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            placeholder="e.g. Exchange Square, Norodom Blvd, Phnom Penh, Cambodia"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'km' ? 'ម៉ោងការងារស្តង់ដារ/ថ្ងៃ' : 'Standard Daily Work Hours'}
            </label>
            <input
              type="text"
              required
              value={formData.workHours}
              onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="8.0"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'km' ? 'តំបន់ម៉ោងប្រព័ន្ធ' : 'System Timezone'}
            </label>
            <input
              type="text"
              required
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="Asia/Phnom_Penh (GMT+7)"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {language === 'km' ? 'ដើមឆ្នាំសារពើពន្ធ' : 'Fiscal Year Start'}
            </label>
            <input
              type="text"
              required
              value={formData.fiscalYearStart}
              onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              placeholder="January 1st"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            {language === 'km'
              ? '* ការផ្លាស់ប្តូរនឹងត្រូវរក្សាទុកក្នុងមូលដ្ឋានទិន្នន័យ SQLite ជាអចិន្ត្រៃយ៍'
              : '* Changes are saved permanently to the SQLite database'}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm shadow-indigo-600/25 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>{language === 'km' ? 'កំពុងរក្សាទុក...' : 'Saving...'}</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{language === 'km' ? 'រក្សាទុកការកំណត់' : 'Save Corporate Settings'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Technology Stack Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-3 shadow-md">
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
