'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  UserCheck,
  Clock,
  CalendarCheck,
  CreditCard,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Printer,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface StaffPayslip {
  id: string;
  period: string;
  payment_date: string;
  base_salary: number;
  allowances: number;
  nssf_deduction: number;
  tax_deduction: number;
  net_salary: number;
}

export default function StaffPortalPage() {
  const { currentPersona, language, t, isClockedIn, clockInTime, toggleClock, openModal, showToast } = useApp();

  const [activePayslipModal, setActivePayslipModal] = useState<StaffPayslip | null>(null);

  // Sample employee data matching active persona
  const staffData = {
    name: currentPersona.name,
    role: currentPersona.title,
    empId: currentPersona.id.toUpperCase(),
    email: currentPersona.email,
    department: 'ផ្នែកបច្ចេកវិទ្យា & វិស្វកម្ម (Engineering & Tech)',
    location: 'រាជធានីភ្នំពេញ (Phnom Penh Office)',
    joinDate: '2023-03-15',
    phone: '+855 12 778 990',
    managerName: 'វ៉ាន់ សុភ័ក្ត្រ (Van Sopheak)',
    managerRole: 'នាយកផ្នែកបច្ចេកវិទ្យា (VP of Engineering)',
    managerEmail: 'van.sopheak@hestra.kh',
  };

  const leaveBalances = {
    annual: { total: 18, used: 4, remaining: 14 },
    sick: { total: 10, used: 2, remaining: 8 },
    casual: { total: 5, used: 0, remaining: 5 },
  };

  const myLeaveHistory = [
    {
      id: 'l-01',
      type: 'Annual Leave (ច្បាប់ប្រចាំឆ្នាំ)',
      startDate: '2026-10-12',
      endDate: '2026-10-14',
      days: 3,
      reason: 'ចូលរួមពិធីបុណ្យគ្រួសារនៅខេត្តសៀមរាប',
      status: 'Approved',
      reviewer: 'វ៉ាន់ សុភ័ក្ត្រ',
    },
    {
      id: 'l-02',
      type: 'Sick Leave (ច្បាប់ឈឺ)',
      startDate: '2026-09-04',
      endDate: '2026-09-05',
      days: 2,
      reason: 'គ្រុនផ្តាសាយធំ មានវេជ្ជបញ្ជាពីគ្លីនិក',
      status: 'Approved',
      reviewer: 'វ៉ាន់ សុភ័ក្ត្រ',
    },
    {
      id: 'l-03',
      type: 'Casual Leave (ច្បាប់ធុរៈផ្ទាល់ខ្លួន)',
      startDate: '2026-11-02',
      endDate: '2026-11-02',
      days: 1,
      reason: 'បន្តសុពលភាពលិខិតឆ្លងដែន',
      status: 'Pending',
      reviewer: 'វ៉ាន់ សុភ័ក្ត្រ',
    },
  ];

  const myPayslips: StaffPayslip[] = [
    {
      id: 'PAY-2026-09-018',
      period: 'ខែកញ្ញា ២០២៦ (September 2026)',
      payment_date: '2026-09-30',
      base_salary: 2200,
      allowances: 150,
      nssf_deduction: 5.85,
      tax_deduction: 145.2,
      net_salary: 2198.95,
    },
    {
      id: 'PAY-2026-08-018',
      period: 'ខែសីហា ២០២៦ (August 2026)',
      payment_date: '2026-08-31',
      base_salary: 2200,
      allowances: 150,
      nssf_deduction: 5.85,
      tax_deduction: 145.2,
      net_salary: 2198.95,
    },
    {
      id: 'PAY-2026-07-018',
      period: 'ខែកក្កដា ២០២៦ (July 2026)',
      payment_date: '2026-07-31',
      base_salary: 2200,
      allowances: 150,
      nssf_deduction: 5.85,
      tax_deduction: 145.2,
      net_salary: 2198.95,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. HEADER & BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <UserCheck size={16} />
            <span>{language === 'km' ? 'ផតថលបុគ្គលិកស្វ័យសេវា (Employee Self-Service)' : 'Employee Self-Service (ESS)'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            {language === 'km' ? 'កន្លែងធ្វើការផ្ទាល់ខ្លួន (My Workspace)' : 'My Staff Workspace'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-khmer">
            {language === 'km'
              ? 'គ្រប់គ្រងវត្តមានផ្ទាល់ខ្លួន ស្នើសុំច្បាប់ឈប់សម្រាក ពិនិត្យប័ណ្ណបើកប្រាក់បៀវត្សរ៍ និងទាក់ទងប្រធានផ្នែក។'
              : 'Punch attendance, request leaves, download official payslips, and check company announcements.'}
          </p>
        </div>

        {/* Quick actions dock */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openModal('request-leave')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <CalendarCheck size={15} />
            <span>{language === 'km' ? 'ស្នើសុំច្បាប់សម្រាក' : 'Request Time Off'}</span>
          </button>

          <Link
            href="/tools?tab=letters"
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
          >
            <FileText size={15} className="text-indigo-600" />
            <span>{language === 'km' ? 'ស្នើសុំលិខិតបញ្ជាក់' : 'Request HR Letter'}</span>
          </Link>
        </div>
      </div>

      {/* 2. TOP HERO BENTO: DIGITAL ID & CLOCKING STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Digital Employee ID Badge (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start gap-4">
            <img
              src={currentPersona.avatar}
              alt={currentPersona.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-100 shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 font-khmer">
                  {staffData.name}
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {staffData.empId}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {currentPersona.role}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-600 font-khmer">{staffData.role}</p>
              <p className="text-[11px] text-slate-400 font-khmer">{staffData.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="truncate text-[11px] font-mono">{staffData.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] font-mono">{staffData.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span className="text-[11px] truncate">{staffData.location}</span>
            </div>
          </div>
        </div>

        {/* Live Attendance Punch Card (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                {language === 'km' ? 'កត់ត្រាវត្តមានផ្ទាល់ខ្លួន' : 'Personal Attendance Punch'}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isClockedIn ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`}></span>
                {isClockedIn ? (language === 'km' ? 'កំពុងធ្វើការ' : 'Active On Duty') : (language === 'km' ? 'បានកត់ត្រាចេញ' : 'Off Duty')}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-wider text-white">
                {isClockedIn ? (clockInTime || '08:30:00 AM') : '--:--:--'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                {isClockedIn
                  ? (language === 'km' ? 'ម៉ោងកត់ត្រាចូលថ្ងៃនេះ (Timesheet Logged)' : 'Clocked in today at office')
                  : (language === 'km' ? 'មិនទាន់កត់ត្រាវត្តមានចូលនៅឡើយ' : 'Not clocked in yet today')}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={toggleClock}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                isClockedIn
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
              }`}
            >
              <Clock size={16} />
              <span>{isClockedIn ? (language === 'km' ? 'កត់ត្រាចេញពីការងារ (Clock Out)' : 'Clock Out Now') : (language === 'km' ? 'កត់ត្រាចូលធ្វើការ (Clock In)' : 'Clock In Now')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LEAVE BALANCES RADAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Annual Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'km' ? 'ច្បាប់ប្រចាំឆ្នាំ (Annual Leave)' : 'Annual Leave'}
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
              {leaveBalances.annual.remaining} ថ្ងៃនៅសល់
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {leaveBalances.annual.remaining} <span className="text-xs text-slate-400 font-sans">/ {leaveBalances.annual.total} ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${(leaveBalances.annual.remaining / leaveBalances.annual.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
            <span>បានប្រើ៖ {leaveBalances.annual.used} ថ្ងៃ</span>
            <span className="text-indigo-600 font-bold cursor-pointer" onClick={() => openModal('request-leave')}>+ ស្នើសុំ</span>
          </div>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'km' ? 'ច្បាប់ឈឺ (Sick Leave)' : 'Sick Leave'}
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
              {leaveBalances.sick.remaining} ថ្ងៃនៅសល់
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {leaveBalances.sick.remaining} <span className="text-xs text-slate-400 font-sans">/ {leaveBalances.sick.total} ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full"
                style={{ width: `${(leaveBalances.sick.remaining / leaveBalances.sick.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
            <span>បានប្រើ៖ {leaveBalances.sick.used} ថ្ងៃ</span>
            <span>មានវិញ្ញាបនបត្រពេទ្យ</span>
          </div>
        </div>

        {/* Casual Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {language === 'km' ? 'ច្បាប់ធុរៈ (Casual Leave)' : 'Casual Leave'}
            </span>
            <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              {leaveBalances.casual.remaining} ថ្ងៃនៅសល់
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {leaveBalances.casual.remaining} <span className="text-xs text-slate-400 font-sans">/ {leaveBalances.casual.total} ថ្ងៃ</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(leaveBalances.casual.remaining / leaveBalances.casual.total) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex justify-between pt-2 border-t border-slate-100">
            <span>បានប្រើ៖ {leaveBalances.casual.used} ថ្ងៃ</span>
            <span>ធុរៈបន្ទាន់ផ្ទាល់ខ្លួន</span>
          </div>
        </div>
      </div>

      {/* 4. MY LEAVE REQUESTS & RECENT PAYSLIPS DUAL SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: My Leave Requests History (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarCheck size={17} className="text-indigo-600" />
                <span>{language === 'km' ? 'ប្រវត្តិនៃការសុំច្បាប់ឈប់សម្រាក' : 'My Leave Requests History'}</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'km' ? 'តាមដានស្ថានភាពការអនុម័តពីប្រធានផ្នែក' : 'Review status and manager comments'}
              </p>
            </div>
            <button
              onClick={() => openModal('request-leave')}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
            >
              + ស្នើសុំថ្មី
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">ប្រភេទច្បាប់ (Type)</th>
                  <th className="py-2.5 px-3">កាលបរិច្ឆេទ (Dates)</th>
                  <th className="py-2.5 px-3">ចំនួន</th>
                  <th className="py-2.5 px-3">ស្ថានភាព (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-khmer">
                {myLeaveHistory.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{req.type}</span>
                      <span className="text-[11px] text-slate-400">{req.reason}</span>
                    </td>
                    <td className="py-3 px-3 font-mono whitespace-nowrap">
                      {req.startDate} ដល់ {req.endDate}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold">
                      {req.days} ថ្ងៃ
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {req.status === 'Approved' ? '✓ បានអនុម័ត' : '⏳ រង់ចាំពិនិត្យ'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: My Official Payslips (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard size={17} className="text-emerald-600" />
                  <span>{language === 'km' ? 'ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ (Payslips)' : 'My Digital Payslips'}</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === 'km' ? 'មើល និងទាញយកប័ណ្ណបើកប្រាក់ផ្លូវការ' : 'View, verify, and print official slips'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {myPayslips.map((pay) => (
                <div
                  key={pay.id}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-slate-50 transition-all flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-slate-900 block font-khmer">{pay.period}</span>
                    <span className="text-[10px] text-slate-400 font-mono">បើកថ្ងៃ៖ {pay.payment_date}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-black text-emerald-600 font-mono block">
                      ${pay.net_salary.toLocaleString()}
                    </span>
                    <button
                      onClick={() => setActivePayslipModal(pay)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer mt-0.5"
                    >
                      <span>មើលប័ណ្ណ</span>
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>គណនីធនាគារ៖ ABA Bank (002 918 288)</span>
            <span className="font-bold text-emerald-600">✓ ផ្ទៀងផ្ទាត់រួច</span>
          </div>
        </div>
      </div>

      {/* 5. LINE MANAGER & TEAM POD */}
      <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            VS
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-500 block">
              {language === 'km' ? 'ប្រធានផ្នែកផ្ទាល់ (Direct Line Manager)' : 'Direct Line Manager'}
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-khmer">
              {staffData.managerName}
            </h4>
            <p className="text-[11px] text-slate-500">{staffData.managerRole} &bull; {staffData.managerEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${staffData.managerEmail}`}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-2xs"
          >
            ផ្ញើអ៊ីមែល (Email)
          </a>
        </div>
      </div>

      {/* MODAL: OFFICIAL PAYSLIP VIEW */}
      {activePayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 p-1">
                  <img src="/hestra-logo.svg" alt="HESTRA" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-khmer">HESTRA HRM CAMBODIA</h3>
                  <span className="text-xs text-slate-500 font-khmer-moul text-indigo-700 block mt-0.5">
                    ប័ណ្ណបើកប្រាក់បៀវត្សរ៍
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActivePayslipModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ឈ្មោះបុគ្គលិក</span>
                <span className="font-bold text-slate-900">{staffData.name}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">អត្តលេខ</span>
                <span className="font-mono font-bold text-slate-900">{staffData.empId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">ការិយាល័យ</span>
                <span className="font-bold text-slate-900">{activePayslipModal.period}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">កាលបរិច្ឆេទ</span>
                <span className="font-mono font-bold text-slate-900">{activePayslipModal.payment_date}</span>
              </div>
            </div>

            {/* Financial itemization */}
            <div className="space-y-2 text-xs border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">ប្រាក់ខែគោល (Basic Salary):</span>
                <span className="font-mono font-bold">${activePayslipModal.base_salary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">ប្រាក់ឧបត្ថម្ភការងារ (Allowances):</span>
                <span className="font-mono font-bold text-emerald-600">+${activePayslipModal.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">កាត់វិភាគទាន ប.ស.ស (NSSF Pension 2%):</span>
                <span className="font-mono font-bold text-rose-600">-${activePayslipModal.nssf_deduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">កាត់ពន្ធលើប្រាក់បៀវត្សរ៍ (TOS GDT):</span>
                <span className="font-mono font-bold text-rose-600">-${activePayslipModal.tax_deduction.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black text-slate-900 font-khmer">
                <span>ប្រាក់បៀវត្សរ៍សុទ្ធទទួលបាន (Net Take-home):</span>
                <span className="font-mono text-indigo-700">${activePayslipModal.net_salary.toLocaleString()} USD</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.print()}
                className="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={15} />
                <span>បោះពុម្ពប័ណ្ណ (Print)</span>
              </button>

              <button
                onClick={() => setActivePayslipModal(null)}
                className="py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                បិទ (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
