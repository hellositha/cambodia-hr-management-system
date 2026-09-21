'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface Persona {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Employee';
  title: string;
  avatar: string;
  email: string;
}

export const PERSONAS: Persona[] = [
  {
    id: 'emp-13',
    name: 'Elena Rostova',
    role: 'Admin',
    title: 'Chief People Officer',
    email: 'elena.rostova@pulsehr.io',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&h=256&fit=crop&crop=faces',
  },
  {
    id: 'emp-1',
    name: 'Marcus Vance',
    role: 'Manager',
    title: 'VP of Engineering',
    email: 'marcus.vance@pulsehr.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
  },
  {
    id: 'emp-18',
    name: 'Alex Rivera',
    role: 'Employee',
    title: 'Frontend Software Engineer',
    email: 'alex.rivera@pulsehr.io',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&h=256&fit=crop&crop=faces',
  },
];

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentPersona: Persona;
  switchPersona: (personaId: string) => void;
  isClockedIn: boolean;
  clockInTime: string | null;
  toggleClock: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  activeModal: string | null;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(true);
  const [clockInTime, setClockInTime] = useState<string | null>('09:00 AM');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const switchPersona = (personaId: string) => {
    const found = PERSONAS.find((p) => p.id === personaId);
    if (found) {
      setCurrentPersona(found);
      showToast(`Switched view to ${found.name} (${found.role})`, 'info');
    }
  };

  const toggleClock = async () => {
    try {
      const res = await fetch('/api/attendance/clock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: currentPersona.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsClockedIn(data.isClockedIn);
        if (data.isClockedIn) {
          setClockInTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          showToast(`Clocked in successfully at ${new Date().toLocaleTimeString()}`, 'success');
        } else {
          setClockInTime(null);
          showToast(data.message || 'Clocked out successfully', 'info');
        }
        triggerRefresh();
      } else {
        showToast(data.error || 'Failed to update clock status', 'error');
      }
    } catch {
      // Fallback optimistic update
      setIsClockedIn(!isClockedIn);
      showToast(isClockedIn ? 'Clocked out for the day' : 'Clocked in successfully', 'success');
    }
  };

  const openModal = (modalName: string) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);
  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  return (
    <AppContext.Provider
      value={{
        currentPersona,
        switchPersona,
        isClockedIn,
        clockInTime,
        toggleClock,
        toasts,
        showToast,
        removeToast,
        activeModal,
        openModal,
        closeModal,
        refreshKey,
        triggerRefresh,
        sidebarCollapsed,
        toggleSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
