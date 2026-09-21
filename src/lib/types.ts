export type Role = 'Admin' | 'Manager' | 'Employee';

export type EmploymentType = 'Full-Time' | 'Part-Time' | 'Contract' | 'Intern';

export type EmployeeStatus = 'Active' | 'On Leave' | 'Remote' | 'Terminated';

export interface Department {
  id: string;
  name: string;
  description: string;
  manager_id?: string;
  manager_name?: string;
  budget: number;
  color: string;
  employee_count?: number;
}

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  department_id: string;
  department_name?: string;
  employment_type: EmploymentType;
  status: EmployeeStatus;
  salary: number;
  join_date: string;
  manager_id?: string;
  manager_name?: string;
  avatar: string;
  location: string;
  bio?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Remote' | 'Absent';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  status: AttendanceStatus;
  work_hours: number;
  notes?: string;
}

export type LeaveType = 'Annual' | 'Sick' | 'Maternity/Paternity' | 'Casual' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  leave_type: LeaveType;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: LeaveStatus;
  reviewer_id?: string;
  reviewer_name?: string;
  reviewed_at?: string;
  reviewer_comments?: string;
  created_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  annual_total: number;
  annual_used: number;
  sick_total: number;
  sick_used: number;
  casual_total: number;
  casual_used: number;
}

export type PayrollStatus = 'Paid' | 'Pending' | 'Draft';

export interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  department_name?: string;
  pay_period: string;
  payment_date: string;
  base_salary: number;
  allowances: number;
  bonuses: number;
  tax_deduction: number;
  insurance_deduction: number;
  other_deductions: number;
  net_salary: number;
  status: PayrollStatus;
  payment_method: string;
  created_at: string;
}

export type JobStatus = 'Active' | 'Draft' | 'Closed';

export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  department_name?: string;
  location: string;
  type: EmploymentType;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string;
  status: JobStatus;
  posted_date: string;
  applicants_count: number;
}

export type CandidateStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired' | 'Rejected';

export interface JobCandidate {
  id: string;
  job_id: string;
  job_title?: string;
  name: string;
  email: string;
  phone: string;
  stage: CandidateStage;
  rating: number;
  applied_date: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name?: string;
  category: 'General' | 'Policy' | 'Celebration' | 'Urgent';
  pinned: number;
  created_at: string;
}

export interface PerformanceReview {
  id: string;
  employee_id: string;
  employee_name?: string;
  employee_role?: string;
  employee_avatar?: string;
  reviewer_id: string;
  reviewer_name?: string;
  review_period: string;
  rating: number;
  goals_achievement: number;
  strengths: string;
  areas_for_growth: string;
  status: 'Completed' | 'In Progress' | 'Scheduled';
  created_at: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  newHiresThisMonth: number;
  attendanceToday: {
    present: number;
    remote: number;
    absent: number;
    late: number;
    percentage: number;
  };
  pendingLeavesCount: number;
  openPositionsCount: number;
  monthlyPayrollTotal: number;
  departmentDistribution: {
    name: string;
    count: number;
    color: string;
  }[];
  recentActivities: {
    id: string;
    type: 'leave' | 'hire' | 'payroll' | 'attendance' | 'announcement';
    title: string;
    subtitle: string;
    timestamp: string;
    statusBadge?: string;
  }[];
  upcomingBirthdaysAndAnniversaries: {
    id: string;
    name: string;
    avatar: string;
    type: 'birthday' | 'anniversary';
    date: string;
    subtitle: string;
  }[];
}
