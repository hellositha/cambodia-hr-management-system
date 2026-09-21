'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, TRANSLATIONS } from '@/lib/translations';

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
    name: 'សារ៉ាត់ (Sarath)',
    role: 'Admin',
    title: 'ប្រធាននាយកដ្ឋានធនធានមនុស្ស (Head of HR)',
    email: 'sarath@hestra.kh',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
  },
  {
    id: 'emp-1',
    name: 'វ៉ាន់ សុភ័ក្ត្រ (Van Sopheak)',
    role: 'Manager',
    title: 'នាយកផ្នែកបច្ចេកវិទ្យា (VP of Engineering)',
    email: 'van.sopheak@hestra.kh',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
  },
  {
    id: 'emp-18',
    name: 'ចាន់ ធីតា (Chan Thida)',
    role: 'Employee',
    title: 'វិស្វករកម្មវិធីជាន់ខ្ពស់ (Senior Software Engineer)',
    email: 'chan.thida@hestra.kh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
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
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof TRANSLATIONS['km']) => string;
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
  const [language, setLanguageState] = useState<Language>('km');

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

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('hestra_lang') || localStorage.getItem('pulsehr_lang')) as Language | null;
      if (saved === 'en' || saved === 'km') {
        setLanguageState(saved);
      }
    } catch {
      // localStorage may fail in SSR or restricted environments
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
      if (language === 'km') {
        document.documentElement.classList.add('lang-km');
      } else {
        document.documentElement.classList.remove('lang-km');
      }
    }
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem('hestra_lang', newLang);
    } catch {}
    showToast(
      newLang === 'km'
        ? 'ភាសាត្រូវបានប្តូរទៅជា ភាសាខ្មែរ 🇰🇭'
        : 'Language switched to English 🇬🇧',
      'info'
    );
  }, [showToast]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'km' ? 'en' : 'km');
  }, [language, setLanguage]);

  const t = useCallback((key: keyof typeof TRANSLATIONS['km']) => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) return dict[key];
    return TRANSLATIONS['km'][key] || key;
  }, [language]);

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
        language,
        setLanguage,
        toggleLanguage,
        t,
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
