'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { X, UserPlus, Calendar, Briefcase, Megaphone, DollarSign, Check } from 'lucide-react';
import { Department } from '@/lib/types';

export default function GlobalModals() {
  const { activeModal, closeModal, showToast, triggerRefresh, currentPersona } = useApp();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [empForm, setEmpForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: '',
    department_id: '',
    employment_type: 'ពេញម៉ោង (Full-Time)',
    status: 'Active',
    salary: '1200',
    location: 'រាជធានីភ្នំពេញ (Phnom Penh)',
    bio: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const [leaveForm, setLeaveForm] = useState({
    employee_id: currentPersona.id,
    leave_type: 'Annual',
    start_date: '2026-10-01',
    end_date: '2026-10-05',
    reason: '',
  });

  const [jobForm, setJobForm] = useState({
    title: '',
    department_id: '',
    location: 'រាជធានីភ្នំពេញ / Hybrid',
    type: 'Full-Time',
    experience_level: 'កម្រិតមធ្យម-ជាន់ខ្ពស់ (3+ ឆ្នាំ)',
    salary_range: '$800 - $1,600 / ខែ',
    description: '',
    requirements: '',
  });

  const [annForm, setAnnForm] = useState({
    title: '',
    content: '',
    category: 'General',
    pinned: false,
  });

  const [payrollForm, setPayrollForm] = useState({
    period: 'ខែតុលា ឆ្នាំ២០២៦ (October 2026)',
    payment_date: '2026-10-31',
  });

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0) {
            setEmpForm((f) => ({ ...f, department_id: data[0].id }));
            setJobForm((f) => ({ ...f, department_id: data[0].id }));
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    setLeaveForm((prev) => ({ ...prev, employee_id: currentPersona.id }));
  }, [currentPersona.id]);

  if (!activeModal) return null;

  // Handlers
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empForm),
      });
      if (res.ok) {
        showToast(`Employee ${empForm.first_name} ${empForm.last_name} onboarded!`, 'success');
        triggerRefresh();
        closeModal();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add employee', 'error');
      }
    } catch {
      showToast('Network error adding employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveForm),
      });
      if (res.ok) {
        showToast('Time off request submitted successfully!', 'success');
        triggerRefresh();
        closeModal();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to request leave', 'error');
      }
    } catch {
      showToast('Network error requesting leave', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm),
      });
      if (res.ok) {
        showToast(`Job posting "${jobForm.title}" published!`, 'success');
        triggerRefresh();
        closeModal();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to post job', 'error');
      }
    } catch {
      showToast('Network error posting job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...annForm,
          author_id: currentPersona.id,
          pinned: annForm.pinned ? 1 : 0,
        }),
      });
      if (res.ok) {
        showToast('Announcement posted to company bulletin!', 'success');
        triggerRefresh();
        closeModal();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to post announcement', 'error');
      }
    } catch {
      showToast('Network error posting announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'run_batch',
          period: payrollForm.period,
          payment_date: payrollForm.payment_date,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Payroll processed successfully!', 'success');
        triggerRefresh();
        closeModal();
      } else {
        showToast(data.error || 'Failed to process payroll', 'error');
      }
    } catch {
      showToast('Network error executing payroll', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            {activeModal === 'add-employee' && (
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <UserPlus size={18} />
              </div>
            )}
            {activeModal === 'request-leave' && (
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <Calendar size={18} />
              </div>
            )}
            {activeModal === 'post-job' && (
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Briefcase size={18} />
              </div>
            )}
            {activeModal === 'post-announcement' && (
              <div className="p-2 rounded-lg bg-pink-100 text-pink-700">
                <Megaphone size={18} />
              </div>
            )}
            {activeModal === 'run-payroll' && (
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <DollarSign size={18} />
              </div>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeModal === 'add-employee' && 'បញ្ចូលបុគ្គលិកថ្មី (Onboard New Employee)'}
                {activeModal === 'request-leave' && 'ពាក្យស្នើសុំច្បាប់ឈប់សម្រាក (Request Leave)'}
                {activeModal === 'post-job' && 'ប្រកាសជ្រើសរើសបុគ្គលិក (Post Job Opening)'}
                {activeModal === 'post-announcement' && 'ផ្សាយដំណឹងក្នុងក្រុមហ៊ុន (Announcement)'}
                {activeModal === 'run-payroll' && 'រៀបចំបើកប្រាក់បៀវត្សរ៍ (Run Monthly Payroll)'}
              </h2>
              <p className="text-xs text-slate-500">
                {activeModal === 'add-employee' && 'បំពេញប្រវត្តិរូប ប្រាក់បៀវត្សរ៍ និងផ្នែកការងារ'}
                {activeModal === 'request-leave' && 'ជ្រើសរើសប្រភេទច្បាប់ និងកាលបរិច្ឆេទសុំឈប់សម្រាក'}
                {activeModal === 'post-job' && 'បន្ថែមតម្រូវការការងារថ្មីក្នុងប្រព័ន្ធ ATS ក្រុមហ៊ុន'}
                {activeModal === 'post-announcement' && 'ផ្សព្វផ្សាយដំណឹងទូទៅដល់បុគ្គលិកទាំងអស់'}
                {activeModal === 'run-payroll' && 'ដំណើរការគណនាបៀវត្សរ៍ & កាត់វិភាគទាន ប.ស.ស (NSSF)'}
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm">
          {/* 1. ADD EMPLOYEE FORM */}
          {activeModal === 'add-employee' && (
            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">នាមត្រកូល (Last Name) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.last_name}
                    onChange={(e) => setEmpForm({ ...empForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="ចៅ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">នាមខ្លួន (First Name) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.first_name}
                    onChange={(e) => setEmpForm({ ...empForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="សុខា"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">អ៊ីមែលការងារ (Work Email) *</label>
                  <input
                    type="email"
                    required
                    value={empForm.email}
                    onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="sokha.chav@pulsehr.kh"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">លេខទូរស័ព្ទ (Phone Number)</label>
                  <input
                    type="text"
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="+855 12 345 678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">មុខតំណែង (Role / Title) *</label>
                  <input
                    type="text"
                    required
                    value={empForm.role}
                    onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="Senior Software Engineer / អ្នកគ្រប់គ្រង"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">នាយកដ្ឋាន / ផ្នែក (Department) *</label>
                  <select
                    value={empForm.department_id}
                    onChange={(e) => setEmpForm({ ...empForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ប្រភេទការងារ</label>
                  <select
                    value={empForm.employment_type}
                    onChange={(e) => setEmpForm({ ...empForm, employment_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="ពេញម៉ោង (Full-Time)">ពេញម៉ោង (Full-Time)</option>
                    <option value="ក្រៅម៉ោង (Part-Time)">ក្រៅម៉ោង (Part-Time)</option>
                    <option value="កិច្ចសន្យា (Contract)">កិច្ចសន្យា (Contract)</option>
                    <option value="កម្មសិក្សា (Intern)">កម្មសិក្សា (Intern)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ស្ថានភាព (Status)</label>
                  <select
                    value={empForm.status}
                    onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="Active">សកម្ម (Active)</option>
                    <option value="Remote">ធ្វើការពីផ្ទះ (Remote)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">បៀវត្សរ៍មូលដ្ឋាន ($/ខែ)</label>
                  <input
                    type="number"
                    value={empForm.salary}
                    onChange={(e) => setEmpForm({ ...empForm, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="1200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ទីតាំងការងារ (Location)</label>
                <input
                  type="text"
                  value={empForm.location}
                  onChange={(e) => setEmpForm({ ...empForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="រាជធានីភ្នំពេញ (Phnom Penh) / សៀមរាប"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30"
                >
                  {loading ? 'កំពុងបញ្ចូល...' : 'យល់ព្រមបញ្ចូលបុគ្គលិក'}
                </button>
              </div>
            </form>
          )}

          {/* 2. REQUEST LEAVE FORM */}
          {activeModal === 'request-leave' && (
            <form onSubmit={handleRequestLeave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ប្រភេទច្បាប់ (Leave Type)</label>
                <select
                  value={leaveForm.leave_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Annual">ច្បាប់ប្រចាំឆ្នាំ (Annual Leave - 18 ថ្ងៃ/ឆ្នាំ)</option>
                  <option value="Sick">ច្បាប់ឈឺ (Sick Leave - មានវេជ្ជបញ្ជា)</option>
                  <option value="Casual">ច្បាប់ធុរៈផ្ទាល់ខ្លួន (Casual / Family Leave)</option>
                  <option value="Maternity/Paternity">ច្បាប់លំហែមាតុភាព/បិតុភាព (Maternity / Paternity)</option>
                  <option value="Unpaid">ឈប់សម្រាកគ្មានប្រាក់ឈ្នួល (Unpaid Leave)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ថ្ងៃចាប់ផ្តើម (Start Date)</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ថ្ងៃបញ្ចប់ (End Date)</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">មូលហេតុ / សេចក្តីលម្អិត (Reason)</label>
                <textarea
                  rows={3}
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="ធុរៈគ្រួសារ, ទៅស្រុកកំណើត, ពិនិត្យសុខភាព..."
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
                <span>ស្នើសុំដោយ៖ <strong>{currentPersona.name}</strong></span>
                <span className="font-semibold text-amber-900">ការអនុម័តស្តង់ដារ៖ ក្នុងរង្វង់ ២៤ ម៉ោង</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30"
                >
                  {loading ? 'កំពុងផ្ញើ...' : 'ដាក់ពាក្យស្នើសុំច្បាប់'}
                </button>
              </div>
            </form>
          )}

          {/* 3. POST JOB FORM */}
          {activeModal === 'post-job' && (
            <form onSubmit={handlePostJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">មុខតំណែងជ្រើសរើស (Job Title) *</label>
                <input
                  type="text"
                  required
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="Senior Mobile Developer (Flutter / React Native)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">នាយកដ្ឋាន (Department)</label>
                  <select
                    value={jobForm.department_id}
                    onChange={(e) => setJobForm({ ...jobForm, department_id: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ទីតាំង (Location)</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="រាជធានីភ្នំពេញ / Exchange Square"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">បទពិសោធន៍ (Experience)</label>
                  <input
                    type="text"
                    value={jobForm.experience_level}
                    onChange={(e) => setJobForm({ ...jobForm, experience_level: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="កម្រិតមធ្យម / ៣+ ឆ្នាំ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">កម្រិតប្រាក់បៀវត្សរ៍ (Salary Range)</label>
                  <input
                    type="text"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    placeholder="$1,200 - $2,000 / ខែ"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ការពិពណ៌នាការងារ (Job Description)</label>
                <textarea
                  rows={2}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="ការទទួលខុសត្រូវ និងគោលដៅចម្បងនៃតួនាទី..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30"
                >
                  {loading ? 'កំពុងផ្សាយ...' : 'ប្រកាសដំណឹងការងារ'}
                </button>
              </div>
            </form>
          )}

          {/* 4. POST ANNOUNCEMENT FORM */}
          {activeModal === 'post-announcement' && (
            <form onSubmit={handlePostAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ចំណងជើងសេចក្តីជូនដំណឹង (Title) *</label>
                <input
                  type="text"
                  required
                  value={annForm.title}
                  onChange={(e) => setAnnForm({ ...annForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="សេចក្តីជូនដំណឹងស្តីពី ឈប់សម្រាកបុណ្យអុំទូក ឬគោលការណ៍ថ្មី..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ប្រភេទទូទៅ (Category)</label>
                <select
                  value={annForm.category}
                  onChange={(e) => setAnnForm({ ...annForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="General">សេចក្តីជូនដំណឹងទូទៅ (General)</option>
                  <option value="Policy">គោលការណ៍ & ច្បាប់ការងារ (Policy)</option>
                  <option value="Celebration">កម្មវិធីអបអរ & អត្ថប្រយោជន៍ (Celebration)</option>
                  <option value="Urgent">ដំណឹងបន្ទាន់ / សំខាន់ (Urgent)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ខ្លឹមសារលម្អិត (Content) *</label>
                <textarea
                  rows={4}
                  required
                  value={annForm.content}
                  onChange={(e) => setAnnForm({ ...annForm, content: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  placeholder="ចែករំលែកព័ត៌មានលម្អិតជូនបុគ្គលិកទាំងអស់..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={annForm.pinned}
                  onChange={(e) => setAnnForm({ ...annForm, pinned: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pinCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                  ខ្ទាស់សេចក្តីជូនដំណឹងនេះនៅខាងលើគេ (Pin Announcement)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm shadow-indigo-600/30"
                >
                  {loading ? 'កំពុងផ្សាយ...' : 'ផ្សាយសេចក្តីជូនដំណឹង'}
                </button>
              </div>
            </form>
          )}

          {/* 5. RUN PAYROLL FORM */}
          {activeModal === 'run-payroll' && (
            <form onSubmit={handleRunPayroll} className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sm">
                  <Check size={16} /> គណនាប្រាក់បៀវត្សរ៍ & បង់វិភាគទាន ប.ស.ស (NSSF Automated Payroll)
                </div>
                <p>
                  ប្រព័ន្ធនឹងគណនាប្រាក់ខែមូលដ្ឋាន, ប្រាក់ឧបត្ថម្ភការងារ, ប្រាក់រង្វាន់, កាត់កងវិភាគទាន ប.ស.ស (បេឡាជាតិសន្តិសុខសង្គម) តាមច្បាប់ការងារនៃព្រះរាជាណាចក្រកម្ពុជា និងពន្ធលើប្រាក់បៀវត្សរ៍ជូនបុគ្គលិកទាំងអស់។
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ខែបើកបៀវត្សរ៍ (Pay Period)</label>
                  <input
                    type="text"
                    required
                    value={payrollForm.period}
                    onChange={(e) => setPayrollForm({ ...payrollForm, period: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">កាលបរិច្ឆេទបើកប្រាក់ (Disbursement Date)</label>
                  <input
                    type="date"
                    required
                    value={payrollForm.payment_date}
                    onChange={(e) => setPayrollForm({ ...payrollForm, payment_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm shadow-emerald-600/30"
                >
                  {loading ? 'កំពុងដំណើរការ...' : 'យល់ព្រមដំណើរការបើកប្រាក់ខែ'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
