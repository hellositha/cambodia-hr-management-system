import { ShiftType, ShiftDefinition } from './types';

export const SHIFTS: Record<ShiftType, ShiftDefinition> = {
  office: {
    id: 'office',
    name_en: 'Office / Normal Day',
    name_km: 'វេនធម្មតា (Office Day)',
    short_code: 'DAY',
    start_time: '08:30',
    end_time: '17:30',
    default_hours: 8.0,
    color: '#2563eb',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800/60',
  },
  morning: {
    id: 'morning',
    name_en: 'Morning Shift',
    name_km: 'វេនព្រឹក (Morning)',
    short_code: 'MOR',
    start_time: '07:00',
    end_time: '15:30',
    default_hours: 8.0,
    color: '#d97706',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/60',
  },
  evening: {
    id: 'evening',
    name_en: 'Afternoon / Evening',
    name_km: 'វេនរសៀល (Evening)',
    short_code: 'EVE',
    start_time: '14:00',
    end_time: '22:30',
    default_hours: 8.0,
    color: '#7c3aed',
    badgeBg: 'bg-purple-50 dark:bg-purple-950/40',
    badgeText: 'text-purple-700 dark:text-purple-300',
    badgeBorder: 'border-purple-200 dark:border-purple-800/60',
  },
  night: {
    id: 'night',
    name_en: 'Night Shift',
    name_km: 'វេនយប់ (Night)',
    short_code: 'NGT',
    start_time: '22:00',
    end_time: '06:30',
    default_hours: 8.0,
    color: '#4f46e5',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800/60',
  },
  weekend_duty: {
    id: 'weekend_duty',
    name_en: 'Weekend Duty',
    name_km: 'វេនប្រចាំការចុងសប្ដាហ៍',
    short_code: 'DUTY',
    start_time: '08:30',
    end_time: '17:30',
    default_hours: 8.0,
    color: '#059669',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800/60',
  },
  on_call: {
    id: 'on_call',
    name_en: 'On-Call / Standby',
    name_km: 'ប្រចាំការត្រៀម (On-Call)',
    short_code: 'CALL',
    start_time: '08:00',
    end_time: '20:00',
    default_hours: 4.0,
    color: '#e11d48',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800/60',
  },
  off: {
    id: 'off',
    name_en: 'Rest Day (OFF)',
    name_km: 'ថ្ងៃសម្រាក (OFF)',
    short_code: 'OFF',
    start_time: '',
    end_time: '',
    default_hours: 0,
    color: '#64748b',
    badgeBg: 'bg-slate-100 dark:bg-slate-800/60',
    badgeText: 'text-slate-600 dark:text-slate-400',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
  },
  custom: {
    id: 'custom',
    name_en: 'Custom Shift',
    name_km: 'វេនកំណត់ផ្ទាល់',
    short_code: 'CUS',
    start_time: '09:00',
    end_time: '18:00',
    default_hours: 8.0,
    color: '#0891b2',
    badgeBg: 'bg-cyan-50 dark:bg-cyan-950/40',
    badgeText: 'text-cyan-700 dark:text-cyan-300',
    badgeBorder: 'border-cyan-200 dark:border-cyan-800/60',
  },
};

export const SHIFT_LIST: ShiftDefinition[] = Object.values(SHIFTS);

/**
 * Returns Monday date of given date's week (ISO week: Monday to Sunday)
 */
export function getMondayOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Formats a Date to YYYY-MM-DD
 */
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface DayColumn {
  dateStr: string;
  dayOfWeek: number; // 1 = Mon, 7 = Sun
  nameEn: string;
  nameKm: string;
  shortEn: string;
  shortKm: string;
  isToday: boolean;
  isWeekend: boolean;
}

const KH_DAYS = ['ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍', 'អាទិត្យ'];
const EN_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const KH_DAYS_SHORT = ['ច', 'អ', 'ព', 'ព្រ', 'សុ', 'ស', 'អា'];
const EN_DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function getWeekDays(monday: Date, todayStr: string): DayColumn[] {
  const days: DayColumn[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    const dateStr = formatDateISO(current);
    days.push({
      dateStr,
      dayOfWeek: i + 1,
      nameEn: EN_DAYS[i],
      nameKm: KH_DAYS[i],
      shortEn: EN_DAYS_SHORT[i],
      shortKm: KH_DAYS_SHORT[i],
      isToday: dateStr === todayStr,
      isWeekend: i >= 5, // Sat or Sun
    });
  }
  return days;
}
