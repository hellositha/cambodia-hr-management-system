'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { JobPosting, JobCandidate, CandidateStage } from '@/lib/types';
import {
  Briefcase,
  Users,
  Search,
  Plus,
  Star,
  MapPin,
  ChevronRight,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Building,
} from 'lucide-react';

const PIPELINE_STAGES: CandidateStage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export default function RecruitmentPage() {
  const { openModal, showToast, triggerRefresh, refreshKey } = useApp();

  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<JobCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [addCandModal, setAddCandModal] = useState(false);
  const [candForm, setCandForm] = useState({
    job_id: '',
    name: '',
    email: '',
    phone: '',
    stage: 'Applied' as CandidateStage,
    rating: 4,
    notes: '',
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/recruitment/jobs').then((r) => r.json()),
      fetch('/api/recruitment/candidates').then((r) => r.json()),
    ])
      .then(([jobsData, candidatesData]) => {
        if (Array.isArray(jobsData)) {
          setJobs(jobsData);
          if (jobsData.length > 0 && !candForm.job_id) {
            setCandForm((f) => ({ ...f, job_id: jobsData[0].id }));
          }
        }
        if (Array.isArray(candidatesData)) setCandidates(candidatesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshKey]);

  // Move candidate to another stage
  const handleMoveStage = async (id: string, newStage: CandidateStage, candidateName: string) => {
    try {
      const res = await fetch('/api/recruitment/candidates', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, stage: newStage }),
      });
      if (res.ok) {
        showToast(`Moved ${candidateName} to ${newStage} stage!`, 'success');
        triggerRefresh();
      }
    } catch {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recruitment/candidates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candForm),
      });
      if (res.ok) {
        showToast(`Candidate ${candForm.name} added to pipeline!`, 'success');
        setAddCandModal(false);
        triggerRefresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to add candidate', 'error');
      }
    } catch {
      showToast('Network error adding candidate', 'error');
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (selectedJobId === 'all') return true;
    return c.job_id === selectedJobId;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="text-purple-600" size={26} />
            ជ្រើសរើសបុគ្គលិក & ប្រព័ន្ធ ATS (Recruitment Pipeline)
          </h1>
          <p className="text-xs text-slate-500">
            គ្រប់គ្រងការប្រកាសដំណឹងការងារ, តាមដានបេក្ខជន, វគ្គសម្ភាស និងការផ្តល់ការងារ
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setAddCandModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <Plus size={15} /> បញ្ចូលបេក្ខជន (Add Candidate)
          </button>
          <button
            onClick={() => openModal('post-job')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus size={16} /> ប្រកាសការងារ (Post Job)
          </button>
        </div>
      </div>

      {/* Top Requisitions Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">មុខតំណែងកំពុងប្រកាសជ្រើសរើស (Job Requisitions)</h2>
          <span className="text-xs text-slate-500">{jobs.length} មុខតំណែងសកម្ម</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJobId(selectedJobId === job.id ? 'all' : job.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedJobId === job.id
                  ? 'bg-purple-50/80 border-purple-400 shadow-sm ring-1 ring-purple-400'
                  : 'bg-white border-slate-200 hover:border-purple-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2">
                  <span className="uppercase">{job.department_name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {job.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-xs leading-snug">{job.title}</h3>
                <div className="mt-2 space-y-1 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  <div className="font-semibold text-slate-700">{job.salary_range}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-purple-700">
                  {candidates.filter((c) => c.job_id === job.id).length} in pipeline
                </span>
                <span className="text-[10px] text-slate-400">
                  {selectedJobId === job.id ? 'Filtered (click to clear)' : 'Filter pipeline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban Candidate Pipeline Board */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Interactive Candidate Pipeline</h2>
            {selectedJobId !== 'all' && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                Filtered: {jobs.find((j) => j.id === selectedJobId)?.title}
              </span>
            )}
          </div>
          <span className="text-xs text-slate-400">Click &rarr; to advance stage</span>
        </div>

        {/* 5-Column Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);

            return (
              <div
                key={stage}
                className="bg-slate-100/80 rounded-2xl p-3 flex flex-col min-h-[450px] border border-slate-200"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        stage === 'Offer'
                          ? 'bg-emerald-500'
                          : stage === 'Interview'
                          ? 'bg-indigo-500'
                          : stage === 'Screening'
                          ? 'bg-amber-500'
                          : stage === 'Hired'
                          ? 'bg-cyan-500'
                          : 'bg-slate-400'
                      }`}
                    ></span>
                    {stage}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 shadow-2xs">
                    {stageCandidates.length}
                  </span>
                </div>

                {/* Candidate Cards */}
                <div className="space-y-3 flex-1">
                  {stageCandidates.map((cand) => {
                    const currentStageIdx = PIPELINE_STAGES.indexOf(stage);
                    const nextStage = PIPELINE_STAGES[currentStageIdx + 1];

                    return (
                      <div
                        key={cand.id}
                        className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-900 leading-tight">
                            {cand.name}
                          </h4>
                          <div className="flex items-center text-amber-500">
                            <Star size={12} className="fill-amber-400 text-amber-400 mr-0.5" />
                            <span className="text-[10px] font-bold text-slate-700">{cand.rating}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-purple-700 font-semibold truncate">
                          {cand.job_title}
                        </p>

                        <div className="text-[10px] text-slate-500 space-y-0.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate">{cand.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{cand.phone || 'No phone on file'}</span>
                          </div>
                        </div>

                        {cand.notes && (
                          <div className="p-2 bg-slate-50 rounded-lg text-[10px] text-slate-600 italic border border-slate-100">
                            &ldquo;{cand.notes}&rdquo;
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[9px] text-slate-400">{cand.applied_date}</span>
                          {nextStage && (
                            <button
                              onClick={() => handleMoveStage(cand.id, nextStage, cand.name)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              Advance to {nextStage} <ArrowRight size={10} />
                            </button>
                          )}
                          {stage === 'Hired' && (
                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle size={12} /> Hired
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageCandidates.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-[11px] italic">
                      No candidates in {stage}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {addCandModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Add Candidate to Pipeline</h3>
            <form onSubmit={handleAddCandidate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Job Position *</label>
                <select
                  value={candForm.job_id}
                  onChange={(e) => setCandForm({ ...candForm, job_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={candForm.name}
                  onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Taylor Swift"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={candForm.email}
                    onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={candForm.phone}
                    onChange={(e) => setCandForm({ ...candForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    placeholder="+1 555-000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stage</label>
                  <select
                    value={candForm.stage}
                    onChange={(e) => setCandForm({ ...candForm, stage: e.target.value as CandidateStage })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scorecard Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={candForm.rating}
                    onChange={(e) => setCandForm({ ...candForm, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recruiter Notes / Highlights</label>
                <textarea
                  rows={2}
                  value={candForm.notes}
                  onChange={(e) => setCandForm({ ...candForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  placeholder="Referral by Marcus; exceptional system design answers."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddCandModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                >
                  Add Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
