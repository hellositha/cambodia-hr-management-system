'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, TRANSLATIONS, formatLocalizedText } from '@/lib/translations';
import { Theme } from '@/lib/types';

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
    id: 'usr-881815',
    name: 'admin HR',
    role: 'Admin',
    title: 'System Administrator',
    email: 'admin@hestra.kh',
    avatar: '/avatars/khmer_female_1.jpg',
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
  loginAs: (user: { id: string; name: string; email: string; role: 'Admin' | 'Manager' | 'Employee'; avatar?: string; title?: string }) => void;
  logout: () => void;
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
  mobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  t: (key: keyof typeof TRANSLATIONS['km']) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentPersona, setCurrentPersona] = useState<Persona>(PERSONAS[0]);
  const [isClockedIn, setIsClockedIn] = useState<boolean>(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [language, setLanguageState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('nordic');

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = `${Date.now()}-${Math.random()}`;
      const finalMsg = formatLocalizedText(message, language) || message;
      setToasts((prev) => [...prev, { id, message: finalMsg, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [language]
  );

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('hestra_lang') || localStorage.getItem('pulsehr_lang')) as Language | null;
      if (saved === 'en' || saved === 'km') {
        setLanguageState(saved);
      }
      const savedTheme = (localStorage.getItem('hestra_theme') || localStorage.getItem('pulsehr_theme')) as Theme | null;
      if (savedTheme === 'nordic' || savedTheme === 'midnight' || savedTheme === 'indigo') {
        setThemeState(savedTheme);
      }
    } catch {
      // localStorage may fail in SSR or restricted environments
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.classList.remove('theme-nordic', 'theme-midnight', 'theme-indigo', 'dark');
      if (theme === 'midnight') {
        document.documentElement.classList.add('theme-midnight', 'dark');
      } else if (theme === 'indigo') {
        document.documentElement.classList.add('theme-indigo', 'dark');
      } else {
        document.documentElement.classList.add('theme-nordic');
      }
    }
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem('hestra_theme', newTheme);
      } catch {}
      const themeName =
        newTheme === 'nordic'
          ? (language === 'km' ? 'ពន្លឺធម្មជាតិ (Nordic Light)' : 'Nordic Minimal (Light)')
          : newTheme === 'midnight'
          ? (language === 'km' ? 'ងងឹត (Midnight Dark)' : 'Midnight Obsidian (Dark)')
          : (language === 'km' ? 'ខៀវចាស់ (Indigo)' : 'Indigo Electric');

      showToast(
        language === 'km'
          ? `រចនាប័ទ្មប្រព័ន្ធត្រូវបានប្តូរទៅជា ${themeName}`
          : `System theme switched to ${themeName}`,
        'info'
      );
    },
    [language, showToast]
  );

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
    if (language === 'en') {
      return TRANSLATIONS['en'][key] || (key as string);
    }
    return TRANSLATIONS['km'][key] || (key as string);
  }, [language]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const checkClockStatus = useCallback(async (personaId: string) => {
    if (!personaId) {
      setIsClockedIn(false);
      setClockInTime(null);
      return;
    }
    try {
      const res = await fetch(`/api/attendance/clock?employee_id=${encodeURIComponent(personaId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.isClockedIn && data.record && data.record.clock_in) {
          setIsClockedIn(true);
          const timeParts = data.record.clock_in.split(':');
          let displayTime = data.record.clock_in;
          if (timeParts.length >= 2) {
            const h = parseInt(timeParts[0], 10);
            const m = timeParts[1];
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            displayTime = `${String(h12).padStart(2, '0')}:${m} ${ampm}`;
          }
          setClockInTime(displayTime);
        } else {
          setIsClockedIn(false);
          setClockInTime(null);
        }
      } else {
        setIsClockedIn(false);
        setClockInTime(null);
      }
    } catch {
      setIsClockedIn(false);
      setClockInTime(null);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('hestra_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.name && parsed.role) {
          setCurrentPersona(parsed);
          document.cookie = `hestra_auth=${encodeURIComponent(parsed.id)}; path=/; max-age=604800; SameSite=Lax`;
          document.cookie = `hestra_role=${encodeURIComponent(parsed.role)}; path=/; max-age=604800; SameSite=Lax`;
          checkClockStatus(parsed.id);
          return;
        }
      }
    } catch {}
    // If no saved user, check default persona
    checkClockStatus(PERSONAS[0].id);
  }, [checkClockStatus]);

  const switchPersona = (personaId: string) => {
    const found = PERSONAS.find((p) => p.id === personaId);
    if (found) {
      setIsClockedIn(false);
      setClockInTime(null);
      setCurrentPersona(found);
      try {
        localStorage.setItem('hestra_current_user', JSON.stringify(found));
        document.cookie = `hestra_auth=${encodeURIComponent(found.id)}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `hestra_role=${encodeURIComponent(found.role)}; path=/; max-age=604800; SameSite=Lax`;
      } catch {}
      checkClockStatus(found.id);
      showToast(`Switched view to ${found.name} (${found.role})`, 'info');
    }
  };

  const loginAs = (userData: { id: string; name: string; email: string; role: 'Admin' | 'Manager' | 'Employee'; avatar?: string; title?: string }) => {
    const newPersona: Persona = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      title: userData.title || (userData.role === 'Admin' ? 'Head of Human Resources' : userData.role === 'Manager' ? 'Department Manager' : 'Staff Member'),
      avatar: userData.avatar || '/avatars/khmer_female_1.jpg',
    };
    // Ensure state starts strictly manual upon login
    setIsClockedIn(false);
    setClockInTime(null);
    setCurrentPersona(newPersona);
    try {
      localStorage.setItem('hestra_current_user', JSON.stringify(newPersona));
      document.cookie = `hestra_auth=${encodeURIComponent(userData.id)}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `hestra_role=${encodeURIComponent(userData.role)}; path=/; max-age=604800; SameSite=Lax`;
    } catch {}
    checkClockStatus(newPersona.id);
  };

  const logout = () => {
    try {
      localStorage.removeItem('hestra_current_user');
      document.cookie = 'hestra_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
      document.cookie = 'hestra_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch {}
    setIsClockedIn(false);
    setClockInTime(null);
    setCurrentPersona(PERSONAS[0]);
    showToast(language === 'km' ? 'បានចាកចេញពីប្រព័ន្ធដោយជោគជ័យ' : 'Logged out successfully', 'info');
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
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setClockInTime(nowStr);
          showToast(
            language === 'km'
              ? `បានកត់ត្រាវត្តមានចូលដោយជោគជ័យនៅម៉ោង ${nowStr} ✓`
              : `Clocked in successfully at ${nowStr} ✓`,
            'success'
          );
        } else {
          setClockInTime(null);
          showToast(
            data.message || (language === 'km' ? 'បានកត់ត្រាចេញដោយជោគជ័យ ✓' : 'Clocked out successfully ✓'),
            'info'
          );
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
  const toggleMobileMenu = () => setMobileMenuOpen((v) => !v);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <AppContext.Provider
      value={{
        currentPersona,
        switchPersona,
        loginAs,
        logout,
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
        mobileMenuOpen,
        toggleMobileMenu,
        closeMobileMenu,
        language,
        setLanguage,
        toggleLanguage,
        theme,
        setTheme,
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
