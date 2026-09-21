'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import HestraLogo from '@/components/HestraLogo';
import {
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Building2,
  Sparkles,
  HelpCircle,
  Globe,
  RefreshCw,
  Phone,
  Check,
  Users,
  AlertCircle,
  QrCode,
  CalendarCheck,
  CreditCard,
  FileCheck,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, showToast, language, toggleLanguage } = useApp();

  // Selected portal mode: 'staff' (ESS) or 'management' (MSS/Admin)
  const [portalMode, setPortalMode] = useState<'staff' | 'management'>('staff');

  // Form fields (defaults to staff demo username: chan)
  const [email, setEmail] = useState('chan');
  const [password, setPassword] = useState('hestra123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // 2FA state
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [verifying2FA, setVerifying2FA] = useState(false);

  // Help & Forgot Password Modal
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  // Quick Demo Accounts with Last Name as Username
  const staffDemoAccounts = [
    {
      name: 'ចាន់ ធីតា (Chan Thida)',
      role: 'Employee',
      username: 'chan',
      lastName: 'ចាន់ (Chan)',
      title: 'វិស្វករកម្មវិធីជាន់ខ្ពស់ (Senior Software Engineer)',
      email: 'chan.thida@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
      descKm: 'ចូលមើលប័ណ្ណប្រាក់ខែ, កាតឌីជីថល QR, និងកត់ត្រាវត្តមាន',
      descEn: 'Access payslips, QR digital badge, and punch attendance',
    },
    {
      name: 'ស៊ឹម កក្កដា (Sim Kakkada)',
      role: 'Employee',
      username: 'sim',
      lastName: 'ស៊ឹម (Sim)',
      title: 'ប្រធានក្រុមទីផ្សារ (Marketing Team Lead)',
      email: 'sim.kakkada@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
      descKm: 'ស្នើសុំច្បាប់ឈប់សម្រាកប្រចាំឆ្នាំ និងពិនិត្យម៉ោងការងារ',
      descEn: 'Submit annual leave requests & check work hours',
    },
    {
      name: 'ឌី ដារ៉ា (Dy Dara)',
      role: 'Employee',
      username: 'dy',
      lastName: 'ឌី (Dy)',
      title: 'វិស្វករ UI/UX (Frontend & Design)',
      email: 'dy.dara@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&fit=crop&crop=faces',
      descKm: 'កត់ត្រាវត្តមាន ពិនិត្យកាលវិភាគការងារ និងស្នើសុំច្បាប់',
      descEn: 'Punch attendance, check work shifts & request time off',
    },
    {
      name: 'សេង វណ្ណា (Seng Vanna)',
      role: 'Employee',
      username: 'seng',
      lastName: 'សេង (Seng)',
      title: 'អ្នកស្រាវជ្រាវផលិតផល (UX Researcher)',
      email: 'seng.vanna@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=256&h=256&fit=crop&crop=faces',
      descKm: 'មើលសមតុល្យច្បាប់ប្រចាំឆ្នាំ និងទាញយកប័ណ្ណប្រាក់ខែ',
      descEn: 'Check leave balances and download monthly payslips',
    },
  ];

  const managementDemoAccounts = [
    {
      name: 'សារ៉ាត់ (Sarath)',
      role: 'Admin',
      username: 'sarath',
      lastName: 'Sarath',
      title: 'ប្រធាននាយកដ្ឋានធនធានមនុស្ស (Head of HR)',
      email: 'sarath@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces',
      descKm: 'សិទ្ធិពេញលេញលើប្រព័ន្ធ: បៀវត្សរ៍, ប.ស.ស, RBAC & របាយការណ៍',
      descEn: 'Full system admin: Payroll, NSSF, RBAC & Executive BI',
    },
    {
      name: 'វ៉ាន់ សុភ័ក្ត្រ (Van Sopheak)',
      role: 'Manager',
      username: 'van',
      lastName: 'វ៉ាន់ (Van)',
      title: 'នាយកផ្នែកបច្ចេកវិទ្យា (VP of Engineering)',
      email: 'van.sopheak@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&h=256&fit=crop&crop=faces',
      descKm: 'អនុម័តច្បាប់ឈប់កូនក្រុម, វាយតម្លៃ KPI & តាមដានវត្តមាន',
      descEn: 'Approve team leaves, KPI reviews & team roster',
    },
    {
      name: 'ហេង សុផល (Heng Sophal)',
      role: 'Manager',
      username: 'heng',
      lastName: 'ហេង (Heng)',
      title: 'ប្រធានផ្នែកប្រតិបត្តិការ (Operations Manager)',
      email: 'heng.sophal@hestra.kh',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&fit=crop&crop=faces',
      descKm: 'គ្រប់គ្រងវត្តមានក្រុមការងារប្រតិបត្តិការទូទាំងក្រុមហ៊ុន',
      descEn: 'Operations workforce attendance & schedule approvals',
    },
  ];

  // Quick fill demo user
  const handleSelectDemoUser = (userIdentifier: string) => {
    setEmail(userIdentifier);
    setPassword('hestra123');
  };

  // Submit Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast(language === 'km' ? 'សូមបញ្ចូលអ៊ីមែល ឬលេខសម្គាល់បុគ្គលិក' : 'Please enter your email or employee ID', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: password || 'hestra123',
          portalType: portalMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'បរាជ័យក្នុងការចូលប្រើប្រព័ន្ធ', 'error');
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data.requires2FA) {
        setPendingUser(data);
        setIs2FAModalOpen(true);
        setLoading(false);
        return;
      }

      // Successful login
      finalizeLogin(data.user, data.redirectUrl, data.portalWarning);
    } catch (err) {
      console.error('Login error:', err);
      showToast('កំហុសម៉ាស៊ីនមេក្នុងការចូលប្រើប្រព័ន្ធ', 'error');
      setLoading(false);
    }
  };

  // Verify 2FA OTP
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length < 6) {
      showToast(language === 'km' ? 'សូមបញ្ចូលលេខកូដ OTP ៦ ខ្ទង់' : 'Please enter the 6-digit OTP code', 'error');
      return;
    }

    setVerifying2FA(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingUser.email,
          password: password || 'hestra123',
          portalType: portalMode,
          otpCode: code,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'លេខកូដ OTP មិនត្រឹមត្រូវទេ', 'error');
        setVerifying2FA(false);
        return;
      }

      setIs2FAModalOpen(false);
      finalizeLogin(data.user, data.redirectUrl, data.portalWarning);
    } catch (err) {
      showToast('កំហុសក្នុងការផ្ទៀងផ្ទាត់ OTP', 'error');
      setVerifying2FA(false);
    }
  };

  // Finalize login helper
  const finalizeLogin = (user: any, redirectUrl: string, warning?: string | null) => {
    loginAs({
      id: user.employee_id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      title: user.department_name ? `${user.role} - ${user.department_name}` : undefined,
      avatar: user.avatar,
    });

    if (warning) {
      showToast(warning, 'info');
    } else {
      showToast(
        language === 'km'
          ? `សូមស្វាគមន៍ ${user.name}! ចូលប្រព័ន្ធជោគជ័យ ✓`
          : `Welcome ${user.name}! Logged in successfully ✓`,
        'success'
      );
    }

    // Redirect to respective destination
    setTimeout(() => {
      router.push(redirectUrl || (user.role === 'Employee' ? '/portal/staff' : '/portal/manager'));
    }, 400);
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50/30 to-blue-50/20 flex flex-col justify-between font-khmer">
      {/* Top Navigation Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <HestraLogo size="md" showText={false} />
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                HESTRA HRM
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider">
                {language === 'km' ? 'ប្រព័ន្ធគ្រប់គ្រងធនធានមនុស្សសហគ្រាស' : 'Enterprise Human Resource'}
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-indigo-300 bg-white text-xs font-semibold text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'km' ? 'ភាសាខ្មែរ 🇰🇭' : 'English 🇬🇧'}</span>
          </button>

          {/* HR Support Help Button */}
          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'km' ? 'ជំនួយបច្ចេកទេស' : 'Support'}</span>
          </button>
        </div>
      </header>

      {/* Main Login Workspace */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-gray-200/90 shadow-xl overflow-hidden">
          {/* Left Column: Brand Hero & Value Propositions (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-6 border border-white/10">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'km' ? 'កំណែទម្រង់ HRM ឆ្នាំ 2026' : 'Cambodia Standard HRMS 2026'}</span>
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold leading-snug tracking-tight">
                {language === 'km'
                  ? 'គ្រប់គ្រងធនធានមនុស្ស ប្រកបដោយប្រសិទ្ធភាព & ទំនុកចិត្ត'
                  : 'Empowering Workforce Excellence Across Cambodia'}
              </h2>

              <p className="text-indigo-200 text-xs leading-relaxed mt-3">
                {language === 'km'
                  ? 'ប្រព័ន្ធគ្រប់គ្រងវត្តមាន, ច្បាប់ឈប់សម្រាក, ប្រាក់បៀវត្សរ៍, ប.ស.ស (NSSF) និងសិទ្ធិចូលដំណើរការ RBAC ស្របតាមច្បាប់ស្តីពីការងារនៃព្រះរាជាណាចក្រកម្ពុជា។'
                  : 'Unified employee self-service and executive management platform complying with Cambodia Ministry of Labour and Vocational Training (MLVT) standards.'}
              </p>

              {/* Feature Bullets */}
              <div className="mt-8 space-y-3.5 text-xs text-indigo-100">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {language === 'km' ? 'ផតថលបុគ្គលិកស្វ័យសេវា (ESS)' : 'Employee Self-Service (ESS)'}
                    </span>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      {language === 'km' ? 'កាតឌីជីថល QR, ពិនិត្យប័ណ្ណប្រាក់ខែ និងកត់ត្រាម៉ោង' : 'Digital QR card, time punch, and payslip downloads'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {language === 'km' ? 'ផតថលគណៈគ្រប់គ្រង (MSS)' : 'Manager Approval Hub (MSS)'}
                    </span>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      {language === 'km' ? 'អនុម័តច្បាប់ឈប់កូនក្រុម និងតាមដានវត្តមានជាក់ស្តែង' : 'One-click leave approvals and team attendance radar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-violet-500/20 text-violet-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">
                      {language === 'km' ? 'សុវត្ថិភាព 2FA & ការការពារទិន្នន័យ' : 'Bank-Grade 2FA & RBAC Security'}
                    </span>
                    <p className="text-[11px] text-indigo-300 mt-0.5">
                      {language === 'km' ? 'ការពារទិន្នន័យសម្ងាត់ប្រាក់ខែ និងព័ត៌មានបុគ្គលិក' : 'Strict data privacy & 256-bit SSL encrypted sessions'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Certification Badge */}
            <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'km' ? 'ម៉ាស៊ីនមេសុវត្ថិភាពសកម្ម 100%' : 'Secure Cloud Server Active'}</span>
              </div>
              <span className="font-mono text-indigo-400">v2.6.4</span>
            </div>
          </div>

          {/* Right Column: Portal Mode Switcher & Login Form (7 Cols) */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Dual Portal Switcher Tabs */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {language === 'km' ? 'ជ្រើសរើសច្រកចូល (Select Portal Gate)' : 'Select Portal Gate'}
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    {portalMode === 'staff'
                      ? (language === 'km' ? 'សម្រាប់បុគ្គលិកទូទៅ' : 'For Staff Members')
                      : (language === 'km' ? 'សម្រាប់គណៈគ្រប់គ្រង' : 'For Management')}
                  </span>
                </div>

                <div className="grid grid-cols-2 p-1 bg-gray-100/80 rounded-2xl border border-gray-200/80 gap-1">
                  {/* Staff Portal Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortalMode('staff');
                      setEmail('chan');
                      setPassword('hestra123');
                    }}
                    className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      portalMode === 'staff'
                        ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 ${portalMode === 'staff' ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="leading-tight">{language === 'km' ? 'ផតថលបុគ្គលិក (Staff)' : 'Staff Portal (ESS)'}</div>
                      <div className="text-[10px] font-normal text-gray-400">
                        {language === 'km' ? 'ស្វ័យសេវាបុគ្គលិក' : 'Employee Self-Service'}
                      </div>
                    </div>
                  </button>

                  {/* Management Portal Tab */}
                  <button
                    type="button"
                    onClick={() => {
                      setPortalMode('management');
                      setEmail('sarath@hestra.kh');
                      setPassword('hestra123');
                    }}
                    className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      portalMode === 'management'
                        ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                    }`}
                  >
                    <ShieldCheck className={`w-4 h-4 ${portalMode === 'management' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="leading-tight">{language === 'km' ? 'គណៈគ្រប់គ្រង (Manager)' : 'Management (MSS)'}</div>
                      <div className="text-[10px] font-normal text-gray-400">
                        {language === 'km' ? 'អនុម័ត & រដ្ឋបាល HR' : 'Approval & Admin Hub'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Form Title */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                  {portalMode === 'staff'
                    ? (language === 'km' ? 'ចូលទៅកាន់ ផតថលបុគ្គលិកទូទៅ' : 'Sign In to Staff Portal (ESS)')
                    : (language === 'km' ? 'ចូលទៅកាន់ ផតថលគណៈគ្រប់គ្រង' : 'Sign In to Management Portal (MSS)')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {portalMode === 'staff'
                    ? (language === 'km'
                        ? 'ប្រើប្រាស់នាមត្រកូល (Last Name) ជាឈ្មោះសម្គាល់ ឬអ៊ីមែលការងារដើម្បីចូលដំណើរការ'
                        : 'Use your employee Last Name as your username or work email to access personal workspace')
                    : (language === 'km'
                        ? 'គណនីមានសិទ្ធិជាប្រធានផ្នែក (Manager) ឬអ្នកគ្រប់គ្រងជាន់ខ្ពស់ (Admin)'
                        : 'Authorized credentials for Team Leads, Department Heads, and HR Admins')}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email / Username Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {portalMode === 'staff'
                        ? (language === 'km' ? 'ឈ្មោះសម្គាល់ / នាមត្រកូល (Username / Last Name) *' : 'Staff Username (Last Name) *')
                        : (language === 'km' ? 'អ៊ីមែលការងារ ឬឈ្មោះសម្គាល់ *' : 'Work Email or Username *')}
                    </label>
                    {portalMode === 'staff' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {language === 'km' ? 'នាមត្រកូល = Username' : 'Last Name = Username'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        portalMode === 'staff'
                          ? (language === 'km' ? 'ឧទាហរណ៍៖ chan, sim, dy, van ឬ chan.thida@hestra.kh' : 'e.g. chan, sim, dy, van or chan.thida@hestra.kh')
                          : (language === 'km' ? 'sarath@hestra.kh ឬ van.sopheak@hestra.kh' : 'sarath@hestra.kh or van.sopheak@hestra.kh')
                      }
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-xs text-gray-900 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                  {portalMode === 'staff' && (
                    <p className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1.5 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/60 font-khmer">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        {language === 'km'
                          ? 'ប្រើប្រាស់នាមត្រកូល (Last Name) របស់បុគ្គលិកជា Username សម្រាប់ចូលប្រព័ន្ធ (ឧ. chan, sim, dy, van...)'
                          : 'Use your employee Last Name as your login username (e.g. chan, sim, dy, van...)'}
                      </span>
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-700">
                      {language === 'km' ? 'ពាក្យសម្ងាត់ (Password) *' : 'Password *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsHelpModalOpen(true)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      {language === 'km' ? 'ភ្លេចពាក្យសម្ងាត់?' : 'Forgot Password?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 focus:border-indigo-500 rounded-xl text-xs text-gray-900 transition-all focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-gray-600 absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & 2FA indicator */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    />
                    <span>{language === 'km' ? 'ចងចាំការចូលប្រើលើឧបករណ៍នេះ' : 'Remember me on this device'}</span>
                  </label>

                  {portalMode === 'management' && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" />
                      <span>2FA Protected</span>
                    </span>
                  )}
                </div>

                {/* Submit CTA Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 ${
                    portalMode === 'staff'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                      : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-indigo-600/20'
                  }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>
                        {portalMode === 'staff'
                          ? (language === 'km' ? 'ចូលទៅកាន់ផតថលបុគ្គលិក (Staff Portal)' : 'Access Staff Portal (ESS)')
                          : (language === 'km' ? 'ចូលទៅកាន់ផតថលគណៈគ្រប់គ្រង (Manager Portal)' : 'Access Management Portal (MSS)')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Demo Accounts Section */}
              <div className="mt-6 pt-5 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-bold text-gray-700">
                    {language === 'km' ? '⚡ ចុចចូលសាកល្បងរហ័ស (1-Click Demo Accounts)' : '⚡ Quick 1-Click Demo Accounts'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">Password: hestra123</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(portalMode === 'staff' ? staffDemoAccounts : managementDemoAccounts).map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemoUser(portalMode === 'staff' ? acc.username : acc.email)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer hover:scale-[1.01] ${
                        email === acc.username || email === acc.email
                          ? 'bg-emerald-50/90 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-gray-50/70 border-gray-200/80 hover:bg-white hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={acc.avatar}
                        alt={acc.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-gray-900 truncate">{acc.name.split('(')[0]}</p>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                              acc.role === 'Admin'
                                ? 'bg-purple-100 text-purple-700'
                                : acc.role === 'Manager'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {acc.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500 truncate mt-0.5">
                          <span className="font-bold text-emerald-700 font-mono">
                            Username: {acc.username}
                          </span>
                          <span className="text-gray-400 text-[9px] font-sans truncate">{acc.lastName}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="mt-8 pt-4 border-t border-gray-100 text-center">
              <p className="text-[11px] text-gray-400">
                {language === 'km'
                  ? 'រក្សាសិទ្ធិគ្រប់យ៉ាង © 2026 HESTRA HRM កម្ពុជា • រក្សាការសម្ងាត់ទិន្នន័យ 100%'
                  : 'All Rights Reserved © 2026 HESTRA HRM Cambodia • Enterprise Grade Security'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 2FA OTP VERIFICATION MODAL */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 overflow-hidden p-6 text-center font-khmer">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {language === 'km' ? 'ផ្ទៀងផ្ទាត់សុវត្ថិភាព 2FA (Two-Factor OTP)' : '2FA Security Verification'}
            </h3>

            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {language === 'km'
                ? `លេខកូដសុវត្ថិភាព ៦ ខ្ទង់ ត្រូវបានផ្ញើទៅកាន់អ៊ីមែល ${pendingUser?.email || ''}`
                : `A 6-digit one-time passcode has been generated for ${pendingUser?.email || ''}`}
            </p>

            {/* Profile Pill */}
            {pendingUser && (
              <div className="mt-4 p-2 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center gap-2">
                <img
                  src={pendingUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&h=256&fit=crop&crop=faces'}
                  alt={pendingUser.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-gray-800">{pendingUser.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {pendingUser.role}
                </span>
              </div>
            )}

            {/* 6 Digit Input Box */}
            <form onSubmit={handleVerify2FA} className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-4">
                {otpCode.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !digit && idx > 0) {
                        document.getElementById(`otp-input-${idx - 1}`)?.focus();
                      }
                    }}
                    className="w-11 h-12 text-center text-lg font-bold bg-gray-50 border border-gray-200 focus:border-indigo-500 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-gray-900 transition-all font-mono"
                  />
                ))}
              </div>

              {/* Demo Fill Helper */}
              <button
                type="button"
                onClick={() => setOtpCode(['1', '2', '3', '4', '5', '6'])}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 mb-4 inline-block cursor-pointer"
              >
                {language === 'km' ? '⚡ បំពេញលេខកូដគំរូស្វ័យប្រវត្តិ (Auto-fill 123456)' : '⚡ Auto-fill Demo Code (123456)'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIs2FAModalOpen(false)}
                  className="w-1/3 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={verifying2FA}
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {verifying2FA && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{language === 'km' ? 'ផ្ទៀងផ្ទាត់ & ចូលប្រព័ន្ធ' : 'Verify & Sign In'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HELP / FORGOT PASSWORD MODAL */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-200 p-6 text-center font-khmer">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">
              {language === 'km' ? 'ជំនួយការកំណត់ពាក្យសម្ងាត់ឡើងវិញ' : 'HR Password Reset Assistance'}
            </h3>

            <p className="text-xs text-gray-600 mt-2 leading-relaxed text-left bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
              {language === 'km' ? (
                <>
                  ដើម្បីធានាសុវត្ថិភាពទិន្នន័យបុគ្គលិក និងប្រាក់បៀវត្សរ៍ ការកំណត់ពាក្យសម្ងាត់ត្រូវឆ្លងកាត់ការផ្ទៀងផ្ទាត់ដោយផ្ទាល់ពី{' '}
                  <span className="font-bold text-indigo-700">នាយកដ្ឋានធនធានមនុស្ស (People & Culture Department)</span>។
                </>
              ) : (
                <>
                  To maintain strict workforce data integrity and payroll security, password resets are governed directly by the{' '}
                  <span className="font-bold text-indigo-700">HR Department (People & Culture)</span>.
                </>
              )}
            </p>

            <div className="mt-4 space-y-2 text-xs text-left">
              <div className="p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                <Mail className="w-4 h-4 text-indigo-600" />
                <div>
                  <div className="font-bold text-gray-900">
                    {language === 'km' ? 'អ៊ីមែលរដ្ឋបាល HR' : 'HR Administration Email'}
                  </div>
                  <div className="text-gray-500 font-mono">sarath@hestra.kh</div>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-gray-200 flex items-center gap-3">
                <Phone className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-bold text-gray-900">
                    {language === 'km' ? 'លេខទូរស័ព្ទផ្ទៃក្នុង (Internal Hotline)' : 'Internal Hotline'}
                  </div>
                  <div className="text-gray-500 font-mono">(+855) 23 888 999 • Ext: 101</div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {language === 'km' ? 'យល់ព្រម' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
