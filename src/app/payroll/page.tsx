'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { PayrollRecord } from '@/lib/types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  CheckCircle2,
  Clock,
  Building2,
  ShieldCheck,
  FileText,
  X,
  Plus,
  ArrowUpRight,
} from 'lucide-react';

export default function PayrollPage() {
  const { openModal, showToast, triggerRefresh, refreshKey } = useApp();

  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('September 2026');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected payslip for modal
  const [activePayslip, setActivePayslip] = useState<PayrollRecord | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedPeriod !== 'all') params.append('period', selectedPeriod);
    if (statusFilter !== 'all') params.append('status', statusFilter);

    fetch(`/api/payroll?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPayrolls(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching payroll:', err);
        setLoading(false);
      });
  }, [selectedPeriod, statusFilter, refreshKey]);

  // Aggregate totals
  const totalNet = payrolls.reduce((acc, p) => acc + p.net_salary, 0);
  const totalBase = payrolls.reduce((acc, p) => acc + p.base_salary, 0);
  const totalTax = payrolls.reduce((acc, p) => acc + p.tax_deduction, 0);
  const totalAllowances = payrolls.reduce((acc, p) => acc + p.allowances + p.bonuses, 0);

  const filteredPayrolls = payrolls.filter((p) => {
    const matchName = (p.employee_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.employee_role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (p.department_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchName;
  });

  // Mark status as Paid
  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/payroll/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Paid' }),
      });
      if (res.ok) {
        showToast('Payslip status updated to Paid!', 'success');
        triggerRefresh();
        if (activePayslip && activePayslip.id === id) {
          setActivePayslip({ ...activePayslip, status: 'Paid' });
        }
      }
    } catch {
      showToast('Failed to update status', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CreditCard className="text-indigo-600" size={26} />
            Payroll & Compensation Management
          </h1>
          <p className="text-xs text-slate-500">
            Monthly payroll ledgers, itemized tax withholdings, and digital payslips
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openModal('run-payroll')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
          >
            <Plus size={16} /> Run Monthly Payroll
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Net Payout
          </span>
          <div className="text-2xl font-black text-slate-900 my-1">
            ${totalNet.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">For {selectedPeriod}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Base Salaries
          </span>
          <div className="text-2xl font-black text-indigo-600 my-1">
            ${totalBase.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Aggregated baseline</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Tax & Withholdings
          </span>
          <div className="text-2xl font-black text-rose-600 my-1">
            ${totalTax.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Federal & State withholdings</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Allowances & Bonuses
          </span>
          <div className="text-2xl font-black text-emerald-600 my-1">
            ${totalAllowances.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Health, tech & performance</span>
        </div>
      </div>

      {/* Period Selector & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs">
            <Calendar size={15} className="text-slate-500" />
            <span className="text-slate-500 font-semibold">Pay Period:</span>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-hidden"
            >
              <option value="all">All Periods</option>
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search employee or team..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Payroll Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">Loading payroll ledger...</div>
        ) : filteredPayrolls.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No payroll entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Base Monthly</th>
                  <th className="px-5 py-3.5">Stipends/Bonus</th>
                  <th className="px-5 py-3.5">Deductions</th>
                  <th className="px-5 py-3.5">Net Pay</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayrolls.map((p) => {
                  const deductions = p.tax_deduction + p.insurance_deduction + p.other_deductions;
                  const additions = p.allowances + p.bonuses;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        <img
                          src={p.employee_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces'}
                          alt={p.employee_name || 'Staff'}
                          className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.employee_name}</div>
                          <div className="text-[11px] text-slate-400">{p.employee_role}</div>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-700">{p.department_name}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">
                        ${p.base_salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-emerald-600 font-medium">
                        +${additions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-rose-600 font-medium">
                        -${deductions.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 font-extrabold text-slate-900 text-sm">
                        ${p.net_salary.toLocaleString()}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'Paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setActivePayslip(p)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs transition-colors"
                        >
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED DIGITAL PAYSLIP MODAL */}
      {activePayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Controls Bar */}
            <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                <span className="font-bold text-sm text-slate-900">
                  Official Payslip &bull; {activePayslip.pay_period}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer size={14} /> Print / PDF
                </button>
                {activePayslip.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkPaid(activePayslip.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setActivePayslip(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Printable Payslip Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-800 text-xs">
              {/* Company Branding Header */}
              <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-extrabold flex items-center justify-center text-2xl">
                    P
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">PulseHR Technologies Inc.</h2>
                    <p className="text-[11px] text-slate-500">500 Howard Street, Suite 400 &bull; San Francisco, CA 94105</p>
                    <p className="text-[11px] text-slate-500">EIN: 84-2918291 &bull; support@pulsehr.io</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Payslip Voucher
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900">{activePayslip.id}</span>
                  <span className="text-xs text-slate-500 block mt-1">Disbursed: {activePayslip.payment_date}</span>
                </div>
              </div>

              {/* Employee & Payroll Meta */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee Name</span>
                  <span className="text-sm font-bold text-slate-900">{activePayslip.employee_name}</span>
                  <span className="text-slate-500 block mt-0.5">{activePayslip.employee_role}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department & ID</span>
                  <span className="text-sm font-bold text-slate-900">{activePayslip.department_name}</span>
                  <span className="text-slate-500 block mt-0.5">Emp ID: {activePayslip.employee_id}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="grid grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Gross Earnings
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span>Basic Monthly Salary</span>
                      <span className="font-bold font-mono">${activePayslip.base_salary.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tech & Housing Allowance</span>
                      <span className="font-mono">${activePayslip.allowances.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Performance Bonus</span>
                      <span className="font-mono">${activePayslip.bonuses.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                      <span>Total Gross Pay</span>
                      <span className="font-mono">
                        ${(activePayslip.base_salary + activePayslip.allowances + activePayslip.bonuses).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Statutory Deductions
                  </div>
                  <div className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Income Tax (Fed/State 22%)</span>
                      <span className="font-mono text-rose-600">-${activePayslip.tax_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Health & Dental Plan</span>
                      <span className="font-mono text-rose-600">-${activePayslip.insurance_deduction.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>401(k) Retirement Plan</span>
                      <span className="font-mono text-rose-600">-${activePayslip.other_deductions.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-600">
                        -${(activePayslip.tax_deduction + activePayslip.insurance_deduction + activePayslip.other_deductions).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay Callout */}
              <div className="p-5 rounded-2xl bg-indigo-950 text-white flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-indigo-300 uppercase font-bold tracking-wider block">
                    Net Take-Home Pay
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-mono mt-0.5 text-emerald-400">
                    ${activePayslip.net_salary.toLocaleString()}
                  </div>
                  <p className="text-[11px] text-indigo-200 mt-1">
                    Disbursed via {activePayslip.payment_method} &bull; Trans ID: ACH-9928192
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Status: {activePayslip.status}
                  </span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-200">
                This is a computer-generated tax and wage statement authorized by PulseHR Inc. People Operations.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
