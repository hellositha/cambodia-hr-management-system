'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from './Toast';
import GlobalModals from './GlobalModals';
import ChangePasswordModal from './ChangePasswordModal';
import { useApp } from '@/context/AppContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed, language } = useApp();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50">
        {children}
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Sidebar />
      <Header />
      <main
        className={`flex-1 transition-all duration-300 p-6 lg:p-8 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
      <footer
        className={`no-print py-4 px-6 text-center text-xs text-slate-400 border-t border-slate-200/80 bg-white/50 backdrop-blur-xs transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <p className="font-medium">
          {language === 'km'
            ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង © 2026 - Sim Sitha'
            : 'Copyright 2026 - All rights reserved. Sim Sitha'}
        </p>
      </footer>
      <ToastContainer />
      <GlobalModals />
      <ChangePasswordModal />
    </div>
  );
}
