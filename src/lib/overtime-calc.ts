import { OvertimeRateType } from './types';

export interface OvertimeRateConfig {
  id: OvertimeRateType;
  multiplier: number;
  label_km: string;
  label_en: string;
  short_label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  law_reference: string;
  description_km: string;
  description_en: string;
}

export const OVERTIME_RATES: Record<OvertimeRateType, OvertimeRateConfig> = {
  normal_day_150: {
    id: 'normal_day_150',
    multiplier: 1.5,
    label_km: 'ថ្ងៃធ្វើការធម្មតា (150%)',
    label_en: 'Normal Working Day (150%)',
    short_label: '150% ធម្មតា',
    badgeBg: 'bg-blue-50 dark:bg-blue-950/40',
    badgeText: 'text-blue-700 dark:text-blue-300',
    badgeBorder: 'border-blue-200 dark:border-blue-800/60',
    law_reference: 'មាត្រា ១៣៩ ច្បាប់ការងារ',
    description_km: 'ការងារលើស ៨ ម៉ោង/ថ្ងៃ នៅថ្ងៃធ្វើការធម្មតា គិតប្រាក់ឈ្នួល ១៥០% (១.៥ ដង)។',
    description_en: 'Hours worked beyond 8 hours on a regular working day paid at 150% (1.5x).',
  },
  night_200: {
    id: 'night_200',
    multiplier: 2.0,
    label_km: 'ថែមម៉ោងពេលយប់ (200%)',
    label_en: 'Night Overtime 22:00-06:00 (200%)',
    short_label: '200% ពេលយប់',
    badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
    badgeText: 'text-indigo-700 dark:text-indigo-300',
    badgeBorder: 'border-indigo-200 dark:border-indigo-800/60',
    law_reference: 'មាត្រា ១៣៩ & ១៤៤ ច្បាប់ការងារ',
    description_km: 'ការងារថែមម៉ោងចន្លោះម៉ោង ២២:០០ ដល់ ០៦:០០ ព្រឹក គិតប្រាក់ឈ្នួល ២០០% (២ ដង)។',
    description_en: 'Overtime between 22:00 and 06:00 paid at 200% (2.0x normal wage).',
  },
  weekend_200: {
    id: 'weekend_200',
    multiplier: 2.0,
    label_km: 'ថ្ងៃសម្រាកប្រចាំសប្ដាហ៍ / អាទិត្យ (200%)',
    label_en: 'Weekly Rest Day / Sunday (200%)',
    short_label: '200% ថ្ងៃសម្រាក',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    badgeBorder: 'border-amber-200 dark:border-amber-800/60',
    law_reference: 'មាត្រា ១៤៧ ច្បាប់ការងារ',
    description_km: 'ការងារនៅថ្ងៃសម្រាកប្រចាំសប្ដាហ៍ (ថ្ងៃអាទិត្យ ឬថ្ងៃកំណត់) គិតប្រាក់ឈ្នួល ២០០% (២ ដង)។',
    description_en: 'Work performed on mandatory weekly rest day paid at 200% (2.0x normal wage).',
  },
  holiday_200: {
    id: 'holiday_200',
    multiplier: 2.0,
    label_km: 'ថ្ងៃបុណ្យជាតិផ្លូវការ (200%)',
    label_en: 'Official Public Holiday (200%)',
    short_label: '200% បុណ្យជាតិ',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800/60',
    law_reference: 'មាត្រា ១៦២ ច្បាប់ការងារ & ប្រកាសក្រសួង',
    description_km: 'ការងារនៅថ្ងៃបុណ្យជាតិផ្លូវការដែលមានប្រាក់ឈ្នួល គិតបន្ថែម ២០០% (២ ដង)។',
    description_en: 'Work performed on official paid public holidays paid at 200% (2.0x normal wage).',
  },
};

export const OVERTIME_RATE_LIST = Object.values(OVERTIME_RATES);

/**
 * Standard Cambodian regular work hours divisor per month:
 * 26 days * 8 hours = 208 hours/month.
 */
export const STANDARD_MONTHLY_HOURS = 208;

/**
 * Computes base hourly rate from monthly base salary
 */
export function getBaseHourlyRate(monthlySalary: number): number {
  if (!monthlySalary || monthlySalary <= 0) return 0;
  return Number((monthlySalary / STANDARD_MONTHLY_HOURS).toFixed(4));
}

/**
 * Computes total overtime pay based on Cambodian Labor Law formula:
 * OT Pay = Hours * (Monthly Salary / 208) * Multiplier
 */
export function calculateOvertimePay(monthlySalary: number, hours: number, rateType: OvertimeRateType): {
  hourlyRate: number;
  otHourlyRate: number;
  multiplier: number;
  totalPay: number;
  khrPay: number;
} {
  const config = OVERTIME_RATES[rateType] || OVERTIME_RATES.normal_day_150;
  const baseRate = getBaseHourlyRate(monthlySalary);
  const otHourlyRate = Number((baseRate * config.multiplier).toFixed(4));
  const totalPay = Number((hours * otHourlyRate).toFixed(2));
  const khrPay = Math.round(totalPay * 4100);

  return {
    hourlyRate: baseRate,
    otHourlyRate,
    multiplier: config.multiplier,
    totalPay,
    khrPay,
  };
}
