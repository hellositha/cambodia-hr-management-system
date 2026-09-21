'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from './Toast';
import GlobalModals from './GlobalModals';
import { useApp } from '@/context/AppContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useApp();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar />
      <Header />
      <main
        className={`flex-1 transition-all duration-300 p-6 lg:p-8 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <ToastContainer />
      <GlobalModals />
    </div>
  );
}
