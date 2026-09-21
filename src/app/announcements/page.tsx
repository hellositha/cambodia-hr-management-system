'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Announcement } from '@/lib/types';
import {
  Megaphone,
  Pin,
  Calendar,
  User,
  Plus,
  Tag,
  AlertTriangle,
  Sparkles,
  Heart,
  ShieldCheck,
  Search,
} from 'lucide-react';

export default function AnnouncementsPage() {
  const { openModal, refreshKey } = useApp();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAnnouncements(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [refreshKey]);

  const filtered = announcements.filter((a) => {
    if (categoryFilter === 'all') return true;
    return a.category === categoryFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Megaphone className="text-pink-600" size={26} />
            Company Bulletin & Announcements
          </h1>
          <p className="text-xs text-slate-500">
            Official company news, policy releases, wellness initiatives, and celebrations
          </p>
        </div>
        <button
          onClick={() => openModal('post-announcement')}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus size={16} /> New Announcement
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'General', 'Policy', 'Celebration', 'Urgent'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              categoryFilter === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'all' ? 'All Updates' : cat}
          </button>
        ))}
      </div>

      {/* Announcement List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-xs">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
          No announcements found in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ann) => (
            <div
              key={ann.id}
              className={`p-6 rounded-2xl border transition-all ${
                ann.pinned
                  ? 'bg-white border-indigo-200 shadow-sm ring-1 ring-indigo-100'
                  : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      ann.category === 'Urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : ann.category === 'Celebration'
                        ? 'bg-pink-100 text-pink-800'
                        : ann.category === 'Policy'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ann.category}
                  </span>

                  {ann.pinned === 1 && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                      <Pin size={10} className="fill-indigo-600" /> Pinned
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  {new Date(ann.created_at).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h2 className="text-base font-extrabold text-slate-900 mt-3">{ann.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-line">
                {ann.content}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <User size={13} className="text-slate-400" />
                  <span>Posted by: <strong className="text-slate-700">{ann.author_name}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">Public to all departments</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
