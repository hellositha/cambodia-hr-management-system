'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Laptop,
  Monitor,
  DollarSign,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface NewStaffRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultEmployeeId?: string;
  defaultEmployeeName?: string;
  defaultDepartment?: string;
  currentSalary?: number;
}

const MATERIAL_PRESETS = [
  {
    name: 'Laptop (Workstation / Pro)',
    name_km: 'កុំព្យូទ័រយួរដៃ Laptop (ការងារបច្ចេកទេស)',
    category: 'high_value_asset',
    requiresTopManagement: true,
    estimatedCost: 1200,
    icon: Laptop,
    description: 'High-performance laptop for development, design, and executive tasks',
  },
  {
    name: 'Computer (Desktop / Mac / PC)',
    name_km: 'កុំព្យូទ័រលើតុ Computer (Desktop / PC)',
    category: 'high_value_asset',
    requiresTopManagement: true,
    estimatedCost: 950,
    icon: Monitor,
    description: 'Office desktop computer workstation with dedicated peripherals',
  },
  {
    name: 'External Display (27" 4K Monitor)',
    name_km: 'អេក្រង់បន្ថែម Monitor (27" 4K)',
    category: 'standard_material',
    requiresTopManagement: false,
    estimatedCost: 220,
    icon: Monitor,
    description: 'Secondary high-resolution display for productivity',
  },
  {
    name: 'Ergonomic Office Chair & Desk',
    name_km: 'កៅអី & តុធ្វើការ Ergonomic',
    category: 'standard_material',
    requiresTopManagement: false,
    estimatedCost: 180,
    icon: Package,
    description: 'Supportive ergonomic chair or sit-stand workstation accessories',
  },
  {
    name: 'Office Stationery & General Supplies',
    name_km: 'សម្ភារៈការិយាល័យ & ក្រដាសបោះពុម្ព',
    category: 'standard_material',
    requiresTopManagement: false,
    estimatedCost: 45,
    icon: Package,
    description: 'Printing paper, ink, notebooks, pens, folders, and desk supplies',
  },
  {
    name: 'Company Uniform & Staff ID Access',
    name_km: 'ឯកសណ្ឋានក្រុមហ៊ុន & កាតបុគ្គលិក',
    category: 'standard_material',
    requiresTopManagement: false,
    estimatedCost: 35,
    icon: Package,
    description: 'Official polo uniform, staff lanyard, and NFC access card badge',
  },
];

export default function NewStaffRequestModal({
  isOpen,
  onClose,
  onSuccess,
  defaultEmployeeId,
  defaultEmployeeName,
  defaultDepartment,
  currentSalary = 1200,
}: NewStaffRequestModalProps) {
  const { currentPersona, language, showToast } = useApp();

  const [requestCategory, setRequestCategory] = useState<'material' | 'salary'>('material');
  const [selectedPreset, setSelectedPreset] = useState<string>(MATERIAL_PRESETS[0].name);
  const [customItemName, setCustomItemName] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(MATERIAL_PRESETS[0].estimatedCost);
  const [urgency, setUrgency] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [reason, setReason] = useState('');

  // Salary Increase Form
  const [empSalary, setEmpSalary] = useState(currentSalary);
  const [proposedSalary, setProposedSalary] = useState(currentSalary + 300);
  const [effectiveDate, setEffectiveDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(false);

  // Sync preset selection
  const handlePresetSelect = (preset: typeof MATERIAL_PRESETS[0]) => {
    setSelectedPreset(preset.name);
    setEstimatedCost(preset.estimatedCost);
  };

  // Determine if current selection requires Top Management
  const requiresTopManagement =
    requestCategory === 'salary' ||
    selectedPreset.toLowerCase().includes('laptop') ||
    selectedPreset.toLowerCase().includes('computer') ||
    customItemName.toLowerCase().includes('laptop') ||
    customItemName.toLowerCase().includes('computer') ||
    customItemName.toLowerCase().includes('salary') ||
    estimatedCost >= 500;

  const salaryDiff = Math.max(0, proposedSalary - empSalary);
  const salaryDiffPercent = empSalary > 0 ? Math.round((salaryDiff / empSalary) * 1000) / 10 : 0;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      showToast(language === 'km' ? 'សូមបញ្ចូលមូលហេតុ និងភាពចាំបាច់' : 'Please provide a justification reason', 'error');
      return;
    }

    setLoading(true);
    try {
      const empId = defaultEmployeeId || currentPersona.id;
      const finalItemName = requestCategory === 'salary'
        ? `Increase Salary (+$${salaryDiff.toLocaleString()}/mo)`
        : customItemName.trim() || selectedPreset;

      const payload = {
        employee_id: empId,
        request_type: requestCategory === 'salary' ? 'Salary Increase' : 'Material / Equipment',
        item_name: finalItemName,
        item_category: requestCategory === 'salary'
          ? 'salary_increase'
          : requiresTopManagement
          ? 'high_value_asset'
          : 'standard_material',
        current_salary: requestCategory === 'salary' ? empSalary : 0,
        proposed_salary: requestCategory === 'salary' ? proposedSalary : 0,
        estimated_cost: requestCategory === 'material' ? estimatedCost * quantity : 0,
        quantity: requestCategory === 'material' ? quantity : 1,
        urgency,
        reason: requestCategory === 'salary'
          ? `[Effective: ${effectiveDate}] ${reason}`
          : reason,
        specifications,
      };

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(
          language === 'km'
            ? `សំណើ ${data.request_number} ត្រូវបានបញ្ជូនជោគជ័យទៅកាន់ប្រធានផ្នែក!`
            : `Request ${data.request_number} submitted to Line Manager for approval!`,
          'success'
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        showToast(data.error || 'Failed to submit request', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error creating request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-bold uppercase tracking-wider backdrop-blur-xs">
              {language === 'km' ? 'ស្វ័យសេវាបុគ្គលិក (Staff Portal)' : 'Staff Requisition'}
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {language === 'km' ? 'បង្កើតសំណើសម្ភារៈ ឬដំឡើងបៀវត្សរ៍' : 'New Approval Request'}
          </h2>
          <p className="text-xs text-indigo-100 mt-1 font-khmer">
            {language === 'km'
              ? 'ដំណើរការអនុម័តពហុថ្នាក់៖ ប្រធានផ្នែក (Line Manager) ➔ ធនធានមនុស្ស (HR) ➔ គណៈគ្រប់គ្រងកំពូល (Top Management)'
              : 'Multi-tier workflow: Line Manager ➔ HR Department ➔ Top Management (CEO)'}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* CATEGORY SWITCHER */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setRequestCategory('material')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                requestCategory === 'material'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Package size={16} />
              <span>{language === 'km' ? 'សម្ភារៈ & ឧបករណ៍ (Materials & Equipment)' : 'Material & Equipment'}</span>
            </button>
            <button
              type="button"
              onClick={() => setRequestCategory('salary')}
              className={`py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                requestCategory === 'salary'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <DollarSign size={16} />
              <span>{language === 'km' ? 'ដំឡើងប្រាក់បៀវត្សរ៍ (Salary Increase)' : 'Increase Salary'}</span>
            </button>
          </div>

          {/* MATERIAL SECTION */}
          {requestCategory === 'material' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'km' ? 'ជ្រើសរើសប្រភេទសម្ភារៈ (Select Material Preset)' : 'Select Item / Material'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MATERIAL_PRESETS.map((p) => {
                    const Icon = p.icon;
                    const isSelected = selectedPreset === p.name;
                    return (
                      <div
                        key={p.name}
                        onClick={() => handlePresetSelect(p)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                              <Icon size={14} />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {language === 'km' ? p.name_km : p.name}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-slate-500">
                            ~${p.estimatedCost}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          {p.requiresTopManagement ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              {language === 'km' ? 'ត្រូវការអនុម័តពី CEO' : 'Needs Top Mgmt'}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              {language === 'km' ? 'អនុម័តចុងក្រោយដោយ HR' : 'HR Final Approval'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Item Name (if needed) */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'ឈ្មោះសម្ភារៈជាក់លាក់ ឬម៉ូឌែល (Specific Item / Model Name)' : 'Custom Item / Model Specification'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. MacBook Pro M3 16-inch, 32GB RAM"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Quantity & Estimated Cost */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ចំនួន (Quantity)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'តម្លៃប៉ាន់ស្មានសរុប (Total Cost $)' : 'Estimated Cost ($)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={estimatedCost * quantity}
                    onChange={(e) => setEstimatedCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* SALARY INCREASE SECTION */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">
                    {language === 'km' ? 'គោលការណ៍ស្នើសុំដំឡើងបៀវត្សរ៍ (Salary Increase Protocol)' : 'Executive Salary Increase Protocol'}
                  </p>
                  <p className="mt-0.5 text-amber-800 dark:text-amber-300 font-khmer">
                    {language === 'km'
                      ? 'សំណើដំឡើងប្រាក់ខែតម្រូវឱ្យមានការអនុម័ត ៣ ដំណាក់កាលជាប់ជានិច្ច៖ ប្រធានផ្នែកផ្ទាល់ ➔ នាយកដ្ឋានធនធានមនុស្ស (HR) ➔ អគ្គនាយក/គណៈគ្រប់គ្រងកំពូល (CEO/Top Management)។'
                      : 'Salary adjustments strictly require 3-tier authorization: Line Manager ➔ HR Department ➔ Top Management (CEO). Upon CEO approval, salary will automatically update in payroll.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                    {language === 'km' ? 'ប្រាក់បៀវត្សរ៍បច្ចុប្បន្ន (Current Salary)' : 'Current Base Salary'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      disabled
                      value={empSalary}
                      className="w-full text-xs font-bold pl-7 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    {language === 'km' ? 'ប្រាក់បៀវត្សរ៍ស្នើសុំថ្មី (Proposed Salary) *' : 'Proposed Salary *'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-indigo-600 font-bold">$</span>
                    <input
                      type="number"
                      required
                      min={empSalary}
                      step="50"
                      value={proposedSalary}
                      onChange={(e) => setProposedSalary(Math.max(empSalary, parseFloat(e.target.value) || 0))}
                      className="w-full text-xs font-black pl-7 pr-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-mono focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* LIVE DELTA SUMMARY */}
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {language === 'km' ? 'ចំនួនទឹកប្រាក់កើនឡើង៖' : 'Increase Amount:'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 font-mono">
                    +${salaryDiff.toLocaleString()} / mo
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-mono">
                    +{salaryDiffPercent}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  {language === 'km' ? 'កាលបរិច្ឆេទចាប់ផ្តើមអនុវត្ត (Effective Date)' : 'Effective Date'}
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {/* URGENCY & BUSINESS REASON */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                {language === 'km' ? 'កម្រិតបន្ទាន់ (Urgency Priority)' : 'Urgency Priority'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Urgent'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      urgency === lvl
                        ? lvl === 'Urgent'
                          ? 'bg-rose-600 text-white'
                          : lvl === 'High'
                          ? 'bg-amber-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'km' ? 'មូលហេតុ និងភាពចាំបាច់ក្នុងការងារ (Business Justification & Reason) *' : 'Business Reason & Justification *'}
              </label>
              <textarea
                required
                rows={3}
                placeholder={
                  requestCategory === 'salary'
                    ? language === 'km'
                      ? 'រៀបរាប់ពីស្នាដៃការងារ សមិទ្ធផលសម្រេចបាន និងការទទួលខុសត្រូវបន្ថែម...'
                      : 'Detail recent performance achievements, added responsibilities, and value delivered...'
                    : language === 'km'
                    ? 'បញ្ជាក់ពីមូលហេតុត្រូវការសម្ភារៈនេះសម្រាប់បំពេញការងារប្រចាំថ្ងៃ...'
                    : 'Explain project needs or operational requirements for this equipment...'
                }
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 3-TIER APPROVAL FLOW VISUALIZER BANNER */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span>{language === 'km' ? 'ខ្សែសង្វាក់នៃការអនុម័ត (Approval Route):' : 'Routing & Verification Stages:'}</span>
              {requiresTopManagement ? (
                <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                  <ShieldCheck size={13} />
                  <span>{language === 'km' ? '៣ ដំណាក់កាល (រហូតដល់ CEO)' : '3-Tier (Up to Top Mgmt)'}</span>
                </span>
              ) : (
                <span className="text-purple-600 dark:text-purple-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 size={13} />
                  <span>{language === 'km' ? '២ ដំណាក់កាល (បញ្ចប់ត្រឹម HR)' : '2-Tier (Finalizes at HR)'}</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              {/* Stage 1 */}
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="font-bold text-blue-800 dark:text-blue-300 block">Stage 1</span>
                <span className="text-slate-600 dark:text-slate-400 font-khmer">
                  {language === 'km' ? 'ប្រធានផ្នែក (Manager)' : 'Line Manager'}
                </span>
              </div>

              {/* Stage 2 */}
              <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
                <span className="font-bold text-purple-800 dark:text-purple-300 block">Stage 2</span>
                <span className="text-slate-600 dark:text-slate-400 font-khmer">
                  {language === 'km' ? 'ធនធានមនុស្ស (HR)' : 'HR Department'}
                </span>
                {!requiresTopManagement && (
                  <span className="block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ✓ Final
                  </span>
                )}
              </div>

              {/* Stage 3 */}
              <div
                className={`p-2 rounded-xl border ${
                  requiresTopManagement
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                    : 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-50'
                }`}
              >
                <span
                  className={`font-bold block ${
                    requiresTopManagement ? 'text-amber-800 dark:text-amber-300' : 'text-slate-400'
                  }`}
                >
                  Stage 3
                </span>
                <span className="text-slate-600 dark:text-slate-400 font-khmer">
                  {language === 'km' ? 'គណៈគ្រប់គ្រង (CEO)' : 'Top Management'}
                </span>
                {requiresTopManagement ? (
                  <span className="block text-[9px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                    ✓ Final
                  </span>
                ) : (
                  <span className="block text-[9px] text-slate-400 mt-0.5">Not Required</span>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'km' ? 'បោះបង់' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
            >
              {loading ? (
                <span>{language === 'km' ? 'កំពុងបញ្ជូន...' : 'Submitting...'}</span>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{language === 'km' ? 'បញ្ជូនសំណើទៅកាន់ប្រធានផ្នែក' : 'Submit for Approval'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
