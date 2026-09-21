'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Employee, Department } from '@/lib/types';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  ChevronRight,
  X,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Edit2,
  UserX,
  Trash2,
} from 'lucide-react';

export default function EmployeesPage() {
  const { openModal, showToast, triggerRefresh, refreshKey } = useApp();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected employee for deep profile drawer
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);
  const [drawerDetails, setDrawerDetails] = useState<any | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'leaves' | 'attendance' | 'payroll' | 'reviews'>('overview');

  // Load departments
  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data);
      });
  }, []);

  // Fetch employees
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedDept !== 'all') params.append('department', selectedDept);
    if (selectedStatus !== 'all') params.append('status', selectedStatus);
    if (selectedType !== 'all') params.append('type', selectedType);

    fetch(`/api/employees?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching employees:', err);
        setLoading(false);
      });
  }, [searchQuery, selectedDept, selectedStatus, selectedType, refreshKey]);

  // Load drawer details when employee selected
  useEffect(() => {
    if (!activeEmployeeId) {
      setDrawerDetails(null);
      return;
    }
    setDrawerLoading(true);
    fetch(`/api/employees/${activeEmployeeId}`)
      .then((r) => r.json())
      .then((data) => {
        setDrawerDetails(data);
        setDrawerLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setDrawerLoading(false);
      });
  }, [activeEmployeeId, refreshKey]);

  // Export CSV
  const handleExportCSV = () => {
    if (employees.length === 0) {
      showToast('No employees to export', 'error');
      return;
    }
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Role', 'Department', 'Type', 'Status', 'Salary', 'Location', 'Join Date'];
    const rows = employees.map((e) => [
      e.id,
      `"${e.first_name}"`,
      `"${e.last_name}"`,
      `"${e.email}"`,
      `"${e.role}"`,
      `"${e.department_name || ''}"`,
      `"${e.employment_type}"`,
      `"${e.status}"`,
      e.salary,
      `"${e.location}"`,
      e.join_date,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hestra_hrm_employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Employee roster exported to CSV successfully!', 'success');
  };

  // Terminate Employee
  const handleTerminate = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to mark ${name} as Terminated?`)) return;
    try {
      const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`Employee ${name} set to Terminated`, 'info');
        triggerRefresh();
        if (activeEmployeeId === id) setActiveEmployeeId(null);
      }
    } catch {
      showToast('Failed to terminate employee', 'error');
    }
  };

  // Clear All Employees
  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to remove all employees? This will clear all employee profiles, attendance, leaves, and payroll records.')) return;
    try {
      const res = await fetch('/api/employees', { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'All employees have been removed.', 'info');
        triggerRefresh();
        setActiveEmployeeId(null);
      } else {
        showToast(data.error || 'Failed to clear employees', 'error');
      }
    } catch {
      showToast('Network error clearing employees', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="text-indigo-600" size={26} />
            បញ្ជីបុគ្គលិក & ធនធានមនុស្ស (Employee Directory)
          </h1>
          <p className="text-xs text-slate-500">
            ស្វែងរក, ច្រោះតាមផ្នែក, គ្រប់គ្រងប្រវត្តិរូប, ប្រាក់បៀវត្សរ៍, វត្តមាន និងច្បាប់ឈប់សម្រាក
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClearAll}
            className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            title="លុបបុគ្គលិកទាំងអស់ចេញពីប្រព័ន្ធ"
          >
            <Trash2 size={15} /> សម្អាតបញ្ជី (Clear)
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Download size={15} /> ទាញយក CSV
          </button>
          <button
            onClick={() => openModal('add-employee')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> បញ្ចូលបុគ្គលិក (Add Staff)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="ស្វែងរកតាមឈ្មោះ, អ៊ីមែល, មុខតំណែង... (Search by name, role...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all font-sans"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-48 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
          >
            <option value="all">គ្រប់ដេប៉ាតឺម៉ង់ (All Departments)</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Employment Type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full md:w-40 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-sans"
          >
            <option value="all">គ្រប់ប្រភេទការងារ (All Types)</option>
            <option value="Full-Time">ពេញម៉ោង (Full-Time)</option>
            <option value="Part-Time">ក្រៅម៉ោង (Part-Time)</option>
            <option value="Contract">កិច្ចសន្យា (Contract)</option>
            <option value="Intern">កម្មសិក្សា (Intern)</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <TableIcon size={16} />
            </button>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'Active', 'Remote', 'On Leave', 'Terminated'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All Records' : st}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">
            Showing <strong>{employees.length}</strong> colleagues
          </span>
        </div>
      </div>

      {/* Directory Content */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-slate-500">Loading colleagues...</p>
        </div>
      ) : employees.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No employees found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or filters, or onboard a new employee.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('all');
              setSelectedStatus('all');
              setSelectedType('all');
            }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => setActiveEmployeeId(emp.id)}
              className="group bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all p-5 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="relative">
                    <img
                      src={emp.avatar}
                      alt={emp.first_name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all shadow-2xs"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                        emp.status === 'Active'
                          ? 'bg-emerald-500'
                          : emp.status === 'Remote'
                          ? 'bg-blue-500'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      title={emp.status}
                    ></span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {emp.department_name || 'Operations'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">{emp.employment_type}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {emp.first_name} {emp.last_name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500">{emp.role}</p>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{emp.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Annual Comp</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    ${emp.salary.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  View Profile <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Colleague</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Type</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Salary</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => setActiveEmployeeId(emp.id)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3 flex items-center gap-3">
                      <img
                        src={emp.avatar}
                        alt={emp.first_name}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">
                          {emp.first_name} {emp.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{emp.role}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {emp.department_name}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          emp.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : emp.status === 'Remote'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : emp.status === 'On Leave'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">{emp.employment_type}</td>
                    <td className="px-5 py-3 text-slate-500">{emp.location}</td>
                    <td className="px-5 py-3 font-bold text-slate-800">
                      ${emp.salary.toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmployeeId(emp.id);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold text-xs"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEEP PROFILE SLIDE-OVER DRAWER */}
      {activeEmployeeId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 overflow-hidden">
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4">
              {drawerLoading || !drawerDetails ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 animate-pulse"></div>
                  <div className="space-y-1">
                    <div className="w-32 h-4 bg-slate-800 rounded animate-pulse"></div>
                    <div className="w-24 h-3 bg-slate-800 rounded animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <img
                    src={drawerDetails.employee.avatar}
                    alt={drawerDetails.employee.first_name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-400/50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">
                        {drawerDetails.employee.first_name} {drawerDetails.employee.last_name}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                        {drawerDetails.employee.status}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-300">{drawerDetails.employee.role}</p>
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>{drawerDetails.employee.department_name}</span> &bull;{' '}
                      <span>{drawerDetails.employee.location}</span>
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setActiveEmployeeId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex items-center px-6 border-b border-slate-200 bg-slate-50 text-xs font-semibold overflow-x-auto">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'leaves', label: 'Leave Balances' },
                { id: 'attendance', label: 'Attendance' },
                { id: 'payroll', label: 'Compensation & Payslips' },
                { id: 'reviews', label: 'Performance Reviews' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDrawerTab(t.id as any)}
                  className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                    drawerTab === t.id
                      ? 'border-indigo-600 text-indigo-600 font-bold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 text-xs text-slate-700">
              {drawerLoading || !drawerDetails ? (
                <div className="py-20 text-center text-slate-400">Loading profile records...</div>
              ) : (
                <>
                  {/* 1. OVERVIEW TAB */}
                  {drawerTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-2">Professional Summary</h4>
                        <p className="text-slate-600 leading-relaxed">
                          {drawerDetails.employee.bio ||
                            'Dedicated team member contributing actively to corporate initiatives and cross-functional pod velocity.'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Direct Manager
                          </span>
                          <span className="font-semibold text-slate-800">
                            {drawerDetails.employee.manager_name || 'Executive Leadership'}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Hire Date
                          </span>
                          <span className="font-semibold text-slate-800">
                            {drawerDetails.employee.join_date}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Work Email
                          </span>
                          <span className="font-semibold text-slate-800 truncate block">
                            {drawerDetails.employee.email}
                          </span>
                        </div>
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">
                            Contact Phone
                          </span>
                          <span className="font-semibold text-slate-800">
                            {drawerDetails.employee.phone || 'Not recorded'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-3">Emergency Contact</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Name & Relation</span>
                            <span className="font-semibold text-slate-800">
                              {drawerDetails.employee.emergency_contact_name || 'On File with HR'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Phone Number</span>
                            <span className="font-semibold text-slate-800">
                              {drawerDetails.employee.emergency_contact_phone || '+1 (555) 999-0000'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleTerminate(drawerDetails.employee.id, `${drawerDetails.employee.first_name} ${drawerDetails.employee.last_name}`)}
                          className="px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-1.5"
                        >
                          <UserX size={15} /> Terminate Employee
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 2. LEAVE BALANCES TAB */}
                  {drawerTab === 'leaves' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-blue-700 uppercase">Annual PTO</span>
                          <div className="text-2xl font-black text-blue-900 my-1">
                            {drawerDetails.leaveBalance ? 20 - drawerDetails.leaveBalance.annual_used : 14}
                          </div>
                          <span className="text-[10px] text-blue-600">days remaining of 20</span>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">Sick Leave</span>
                          <div className="text-2xl font-black text-emerald-900 my-1">
                            {drawerDetails.leaveBalance ? 10 - drawerDetails.leaveBalance.sick_used : 8}
                          </div>
                          <span className="text-[10px] text-emerald-600">days remaining of 10</span>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                          <span className="text-[10px] font-bold text-amber-700 uppercase">Casual Days</span>
                          <div className="text-2xl font-black text-amber-900 my-1">
                            {drawerDetails.leaveBalance ? 5 - drawerDetails.leaveBalance.casual_used : 4}
                          </div>
                          <span className="text-[10px] text-amber-600">days remaining of 5</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-slate-900 mb-3">Leave Request History</h4>
                        {drawerDetails.leaves && drawerDetails.leaves.length > 0 ? (
                          <div className="space-y-2.5">
                            {drawerDetails.leaves.map((l: any) => (
                              <div key={l.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-slate-900">{l.leave_type} Leave ({l.days_count} days)</div>
                                  <div className="text-[11px] text-slate-500">{l.start_date} &rarr; {l.end_date}</div>
                                  {l.reason && <div className="text-[10px] text-slate-600 mt-1 italic">&ldquo;{l.reason}&rdquo;</div>}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  l.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : l.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {l.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">No historical leave requests recorded.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 3. ATTENDANCE TAB */}
                  {drawerTab === 'attendance' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">Recent Attendance Logs (Past 14 Days)</h4>
                      {drawerDetails.attendance && drawerDetails.attendance.length > 0 ? (
                        <div className="divide-y divide-slate-200 bg-white rounded-xl border border-slate-200 overflow-hidden">
                          {drawerDetails.attendance.map((a: any) => (
                            <div key={a.id} className="p-3 flex items-center justify-between">
                              <div>
                                <div className="font-bold text-slate-800">{a.date}</div>
                                <div className="text-[11px] text-slate-500">
                                  {a.clock_in ? `In: ${a.clock_in}` : 'No Punch In'} &bull; {a.clock_out ? `Out: ${a.clock_out}` : 'Active / Pending'}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-700">{a.work_hours} hrs</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : a.status === 'Remote' ? 'bg-blue-100 text-blue-700' : a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {a.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No attendance records for this period.</p>
                      )}
                    </div>
                  )}

                  {/* 4. PAYROLL TAB */}
                  {drawerTab === 'payroll' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-indigo-600 uppercase font-bold">Base Annual Salary</span>
                          <div className="text-2xl font-black text-indigo-950">
                            ${drawerDetails.employee.salary.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-indigo-600 uppercase font-bold">Est. Monthly Net</span>
                          <div className="text-lg font-extrabold text-indigo-900">
                            ${Math.round((drawerDetails.employee.salary / 12) * 0.72).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900">Issued Payslips</h4>
                      {drawerDetails.payrolls && drawerDetails.payrolls.length > 0 ? (
                        <div className="space-y-2">
                          {drawerDetails.payrolls.map((p: any) => (
                            <div key={p.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                              <div>
                                <span className="font-bold text-slate-800">{p.pay_period}</span>
                                <span className="text-[11px] text-slate-500 block">Disbursed on: {p.payment_date}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-black text-slate-900 block">${p.net_salary.toLocaleString()}</span>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  {p.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No payslips issued yet.</p>
                      )}
                    </div>
                  )}

                  {/* 5. PERFORMANCE REVIEWS */}
                  {drawerTab === 'reviews' && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900">Official Review Records</h4>
                      {drawerDetails.reviews && drawerDetails.reviews.length > 0 ? (
                        <div className="space-y-3">
                          {drawerDetails.reviews.map((r: any) => (
                            <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{r.review_period}</span>
                                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[11px]">
                                  Rating: {r.rating} / 5.0
                                </span>
                              </div>
                              <p className="text-xs text-slate-700"><strong>Strengths:</strong> {r.strengths}</p>
                              <p className="text-xs text-slate-600"><strong>Areas for Growth:</strong> {r.areas_for_growth}</p>
                              <div className="text-[10px] text-slate-400 pt-1">Reviewed by: {r.reviewer_name}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">No formal performance reviews logged yet.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
