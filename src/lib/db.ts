import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_JOB_POSTINGS,
  INITIAL_CANDIDATES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_PERFORMANCE_REVIEWS,
} from './seed-data';

const DB_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'hr.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
    initDatabase(dbInstance);
  }
  return dbInstance;
}

function initDatabase(db: Database.Database) {
  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS departments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      manager_id TEXT,
      budget REAL DEFAULT 0,
      color TEXT DEFAULT '#3b82f6'
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      role TEXT NOT NULL,
      department_id TEXT NOT NULL,
      employment_type TEXT NOT NULL,
      employee_type TEXT DEFAULT 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
      status TEXT NOT NULL,
      salary REAL NOT NULL,
      join_date TEXT NOT NULL,
      manager_id TEXT,
      avatar TEXT,
      location TEXT,
      bio TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      gender TEXT DEFAULT 'ប្រុស (Male)',
      dob TEXT,
      nationality TEXT DEFAULT 'កម្ពុជា (Cambodian)',
      marital_status TEXT DEFAULT 'នៅលីវ (Single)',
      national_id TEXT,
      current_address TEXT,
      province_city TEXT,
      district TEXT,
      commune_sangkat TEXT,
      village TEXT,
      contract_type TEXT DEFAULT 'UDC (មិនកំណត់ថិរវេលា)',
      contract_start TEXT,
      contract_end TEXT,
      work_location TEXT,
      salary_currency TEXT DEFAULT 'USD ($)',
      salary_frequency TEXT DEFAULT 'ប្រចាំខែ (Monthly)',
      bank_name TEXT DEFAULT 'ABA Bank',
      bank_account_name TEXT,
      bank_account_number TEXT,
      nssf_member TEXT DEFAULT 'មាន (Yes)',
      nssf_number TEXT,
      nssf_reg_date TEXT,
      emergency_contact_relationship TEXT,
      emergency_contact_address TEXT,
      doc_national_id TEXT,
      doc_passport TEXT,
      doc_contract TEXT,
      doc_others TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      clock_in TEXT,
      clock_out TEXT,
      status TEXT NOT NULL,
      work_hours REAL DEFAULT 0,
      notes TEXT,
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS duty_roster (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      shift_type TEXT NOT NULL,
      start_time TEXT,
      end_time TEXT,
      hours REAL DEFAULT 8.0,
      location TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      UNIQUE(employee_id, date)
    );

    CREATE TABLE IF NOT EXISTS overtime_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      hours REAL NOT NULL,
      ot_rate_type TEXT NOT NULL,
      multiplier REAL NOT NULL DEFAULT 1.5,
      hourly_rate REAL DEFAULT 0,
      estimated_pay REAL DEFAULT 0,
      reason TEXT NOT NULL,
      project_name TEXT,
      status TEXT NOT NULL DEFAULT 'Pending Manager',
      line_manager_id TEXT,
      line_manager_reviewed_at TEXT,
      line_manager_comments TEXT,
      admin_reviewer_id TEXT,
      admin_reviewed_at TEXT,
      admin_comments TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      leave_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      days_count REAL NOT NULL,
      reason TEXT,
      status TEXT NOT NULL DEFAULT 'Pending Manager',
      line_manager_id TEXT,
      line_manager_reviewed_at TEXT,
      line_manager_comments TEXT,
      admin_reviewer_id TEXT,
      admin_reviewed_at TEXT,
      admin_comments TEXT,
      reviewer_id TEXT,
      reviewed_at TEXT,
      reviewer_comments TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS leave_balances (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL UNIQUE,
      annual_total REAL DEFAULT 20,
      annual_used REAL DEFAULT 0,
      sick_total REAL DEFAULT 10,
      sick_used REAL DEFAULT 0,
      casual_total REAL DEFAULT 5,
      casual_used REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payrolls (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      pay_period TEXT NOT NULL,
      payment_date TEXT NOT NULL,
      base_salary REAL NOT NULL,
      allowances REAL DEFAULT 0,
      bonuses REAL DEFAULT 0,
      tax_deduction REAL DEFAULT 0,
      insurance_deduction REAL DEFAULT 0,
      other_deductions REAL DEFAULT 0,
      net_salary REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'Paid',
      payment_method TEXT DEFAULT 'Direct Deposit',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS job_postings (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      department_id TEXT NOT NULL,
      location TEXT NOT NULL,
      type TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      salary_range TEXT NOT NULL,
      description TEXT,
      requirements TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      posted_date TEXT NOT NULL,
      applicants_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS job_candidates (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      stage TEXT NOT NULL DEFAULT 'Applied',
      rating INTEGER DEFAULT 3,
      applied_date TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author_id TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      pinned INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS performance_reviews (
      id TEXT PRIMARY KEY,
      employee_id TEXT NOT NULL,
      reviewer_id TEXT NOT NULL,
      review_period TEXT NOT NULL,
      rating REAL NOT NULL,
      goals_achievement REAL NOT NULL,
      strengths TEXT,
      areas_for_growth TEXT,
      status TEXT NOT NULL DEFAULT 'Completed',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      role TEXT NOT NULL DEFAULT 'Employee',
      status TEXT NOT NULL DEFAULT 'Active',
      employee_id TEXT,
      department_name TEXT,
      avatar TEXT,
      two_factor_enabled INTEGER DEFAULT 0,
      permissions TEXT,
      password TEXT DEFAULT 'hestra123',
      last_login TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS system_meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Ensure password and username columns exist if table was created previously
  try {
    const cols = db.prepare("PRAGMA table_info(users)").all() as any[];
    if (!cols.some((c) => c.name === 'password')) {
      db.prepare("ALTER TABLE users ADD COLUMN password TEXT DEFAULT 'hestra123'").run();
    }
    if (!cols.some((c) => c.name === 'username')) {
      db.prepare("ALTER TABLE users ADD COLUMN username TEXT").run();
    }
    // Automatically set employee first name as username if missing
    db.prepare(`
      UPDATE users 
      SET username = LOWER(
        COALESCE(
          (SELECT first_name FROM employees WHERE employees.id = users.employee_id AND employees.first_name IS NOT NULL AND employees.first_name != ''),
          CASE 
            WHEN INSTR(email, '.') > 0 AND INSTR(email, '.') < INSTR(email, '@') 
              THEN SUBSTR(email, INSTR(email, '.') + 1, INSTR(email, '@') - INSTR(email, '.') - 1)
            WHEN INSTR(email, '@') > 0 
              THEN SUBSTR(email, 1, INSTR(email, '@') - 1)
            ELSE email
          END
        )
      )
      WHERE username IS NULL OR username = ''
    `).run();
  } catch (e) {}

  // Migrate employees and users table if email is NOT NULL to make it optional
  try {
    const empCols = db.prepare("PRAGMA table_info(employees)").all() as any[];
    const emailCol = empCols.find((c) => c.name === 'email');
    if (emailCol && emailCol.notnull === 1) {
      db.prepare("PRAGMA foreign_keys = OFF").run();
      db.prepare(`
        CREATE TABLE employees_migrated (
          id TEXT PRIMARY KEY,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          role TEXT NOT NULL,
          department_id TEXT NOT NULL,
          employment_type TEXT NOT NULL,
          employee_type TEXT DEFAULT 'បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)',
          status TEXT NOT NULL,
          salary REAL NOT NULL,
          join_date TEXT NOT NULL,
          manager_id TEXT,
          avatar TEXT,
          location TEXT,
          bio TEXT,
          emergency_contact_name TEXT,
          emergency_contact_phone TEXT,
          gender TEXT DEFAULT 'ប្រុស (Male)',
          dob TEXT,
          nationality TEXT DEFAULT 'កម្ពុជា (Cambodian)',
          marital_status TEXT DEFAULT 'នៅលីវ (Single)',
          national_id TEXT,
          current_address TEXT,
          province_city TEXT DEFAULT 'រាជធានីភ្នំពេញ (Phnom Penh)',
          district TEXT,
          commune_sangkat TEXT,
          village TEXT,
          contract_type TEXT DEFAULT 'UDC (មិនកំណត់ថិរវេលា)',
          contract_start TEXT,
          contract_end TEXT,
          work_location TEXT DEFAULT 'ការិយាល័យកណ្តាល (Head Office)',
          salary_currency TEXT DEFAULT 'USD ($)',
          salary_frequency TEXT DEFAULT 'ប្រចាំខែ (Monthly)',
          bank_name TEXT DEFAULT 'ABA Bank',
          bank_account_name TEXT,
          bank_account_number TEXT,
          nssf_member TEXT DEFAULT 'មាន (Yes)',
          nssf_number TEXT,
          nssf_reg_date TEXT,
          emergency_contact_relationship TEXT,
          emergency_contact_address TEXT,
          doc_national_id TEXT,
          doc_passport TEXT,
          doc_contract TEXT,
          doc_others TEXT,
          created_at TEXT NOT NULL
        )
      `).run();
      db.prepare(`
        INSERT INTO employees_migrated SELECT 
          id, first_name, last_name, email, phone, role, department_id,
          employment_type, employee_type, status, salary, join_date, manager_id, avatar,
          location, bio, emergency_contact_name, emergency_contact_phone,
          gender, dob, nationality, marital_status, national_id,
          current_address, province_city, district, commune_sangkat, village,
          contract_type, contract_start, contract_end, work_location,
          salary_currency, salary_frequency, bank_name, bank_account_name, bank_account_number,
          nssf_member, nssf_number, nssf_reg_date,
          emergency_contact_relationship, emergency_contact_address,
          doc_national_id, doc_passport, doc_contract, doc_others,
          created_at
        FROM employees
      `).run();
      db.prepare("DROP TABLE employees").run();
      db.prepare("ALTER TABLE employees_migrated RENAME TO employees").run();
    }
  } catch (e) {}

  try {
    const userCols = db.prepare("PRAGMA table_info(users)").all() as any[];
    const uEmailCol = userCols.find((c) => c.name === 'email');
    if (uEmailCol && uEmailCol.notnull === 1) {
      db.prepare("PRAGMA foreign_keys = OFF").run();
      db.prepare(`
        CREATE TABLE users_migrated (
          id TEXT PRIMARY KEY,
          username TEXT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          role TEXT NOT NULL DEFAULT 'Employee',
          status TEXT NOT NULL DEFAULT 'Active',
          employee_id TEXT,
          department_name TEXT,
          avatar TEXT,
          two_factor_enabled INTEGER DEFAULT 0,
          permissions TEXT,
          password TEXT DEFAULT 'hestra123',
          last_login TEXT,
          created_at TEXT NOT NULL
        )
      `).run();
      db.prepare(`
        INSERT INTO users_migrated SELECT 
          id, username, name, email, role, status, employee_id, department_name, avatar,
          two_factor_enabled, permissions, password, last_login, created_at
        FROM users
      `).run();
      db.prepare("DROP TABLE users").run();
      db.prepare("ALTER TABLE users_migrated RENAME TO users").run();
    }
  } catch (e) {}

  // Migrate leave_requests to support two-stage approval workflow (Line Manager -> Administrator)
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN line_manager_id TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN line_manager_reviewed_at TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN line_manager_comments TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN admin_reviewer_id TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN admin_reviewed_at TEXT").run();
  } catch (e) {}
  try {
    db.prepare("ALTER TABLE leave_requests ADD COLUMN admin_comments TEXT").run();
  } catch (e) {}
  try {
    db.prepare("UPDATE leave_requests SET status = 'Pending Manager' WHERE status = 'Pending'").run();
  } catch (e) {}

  // Migrate employees table to support comprehensive personal, contact, contract, payroll, nssf, emergency, and documents
  try {
    const empCols = db.prepare("PRAGMA table_info(employees)").all() as any[];
    const colNames = new Set(empCols.map((c) => c.name));
    const newEmpCols: [string, string][] = [
      ['gender', 'TEXT DEFAULT "ប្រុស (Male)"'],
      ['dob', 'TEXT'],
      ['nationality', 'TEXT DEFAULT "កម្ពុជា (Cambodian)"'],
      ['marital_status', 'TEXT DEFAULT "នៅលីវ (Single)"'],
      ['national_id', 'TEXT'],
      ['current_address', 'TEXT'],
      ['province_city', 'TEXT DEFAULT "រាជធានីភ្នំពេញ (Phnom Penh)"'],
      ['district', 'TEXT'],
      ['commune_sangkat', 'TEXT'],
      ['village', 'TEXT'],
      ['employee_type', 'TEXT DEFAULT "បុគ្គលិកពេញសិទ្ធិ (Regular / Permanent)"'],
      ['contract_type', 'TEXT DEFAULT "UDC (មិនកំណត់ថិរវេលា)"'],
      ['contract_start', 'TEXT'],
      ['contract_end', 'TEXT'],
      ['work_location', 'TEXT DEFAULT "ការិយាល័យកណ្តាល (Head Office)"'],
      ['salary_currency', 'TEXT DEFAULT "USD ($)"'],
      ['salary_frequency', 'TEXT DEFAULT "ប្រចាំខែ (Monthly)"'],
      ['bank_name', 'TEXT DEFAULT "ABA Bank"'],
      ['bank_account_name', 'TEXT'],
      ['bank_account_number', 'TEXT'],
      ['nssf_member', 'TEXT DEFAULT "មាន (Yes)"'],
      ['nssf_number', 'TEXT'],
      ['nssf_reg_date', 'TEXT'],
      ['emergency_contact_relationship', 'TEXT'],
      ['emergency_contact_address', 'TEXT'],
      ['doc_national_id', 'TEXT'],
      ['doc_passport', 'TEXT'],
      ['doc_contract', 'TEXT'],
      ['doc_others', 'TEXT'],
    ];

    for (const [col, colDef] of newEmpCols) {
      if (!colNames.has(col)) {
        try {
          db.prepare(`ALTER TABLE employees ADD COLUMN ${col} ${colDef}`).run();
        } catch (err) {
          console.error(`Error adding column ${col} to employees:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error migrating employees table columns:', err);
  }

  // Initialize users if none exist
  try {
    const userRow = db.prepare("SELECT count(*) as count FROM users").get() as { count: number } | undefined;
    if (!userRow || userRow.count === 0) {
      const insertUser = db.prepare(`
        INSERT INTO users (id, username, name, email, role, status, employee_id, department_name, avatar, two_factor_enabled, permissions, last_login, created_at)
        VALUES (@id, @username, @name, @email, @role, @status, @employee_id, @department_name, @avatar, @two_factor_enabled, @permissions, @last_login, @created_at)
      `);

      const defaultUsers = [
        {
          id: 'usr-admin',
          username: 'admin',
          name: 'Administrator',
          email: 'admin@hestra.kh',
          role: 'Admin',
          status: 'Active',
          employee_id: null,
          department_name: 'ថ្នាក់ដឹកនាំជាន់ខ្ពស់ (Top Management)',
          avatar: '/avatars/khmer_female_1.jpg',
          two_factor_enabled: 0,
          permissions: 'all,manage_users,manage_payroll,approve_leaves,system_settings,export_data',
          last_login: null,
          created_at: new Date().toISOString(),
        },
      ];

      for (const u of defaultUsers) {
        insertUser.run(u);
      }
    }
  } catch (err) {
    console.error('Error initializing default users:', err);
  }

  // Ensure system is marked initialized without loading demo data
  const meta = db.prepare("SELECT value FROM system_meta WHERE key = 'initialized'").get() as { value: string } | undefined;
  if (!meta) {
    db.prepare("INSERT OR REPLACE INTO system_meta (key, value) VALUES ('initialized', 'true')").run();
  }
}

export function clearAllEmployees(db: Database.Database) {
  db.prepare("UPDATE departments SET manager_id = NULL").run();
  db.prepare("DELETE FROM attendance").run();
  db.prepare("DELETE FROM duty_roster").run();
  db.prepare("DELETE FROM overtime_requests").run();
  db.prepare("DELETE FROM leave_requests").run();
  db.prepare("DELETE FROM leave_balances").run();
  db.prepare("DELETE FROM payrolls").run();
  db.prepare("DELETE FROM performance_reviews").run();
  db.prepare("DELETE FROM employees").run();
}

export function clearAllRecruitment(db: Database.Database) {
  db.prepare("DELETE FROM job_candidates").run();
  db.prepare("DELETE FROM job_postings").run();
}

export function restoreRecruitment(db: Database.Database) {
  clearAllRecruitment(db);
  const insertJob = db.prepare(`
    INSERT INTO job_postings (
      id, title, department_id, location, type, experience_level,
      salary_range, description, requirements, status, posted_date, applicants_count
    ) VALUES (
      @id, @title, @department_id, @location, @type, @experience_level,
      @salary_range, @description, @requirements, @status, @posted_date, @applicants_count
    )
  `);
  for (const job of INITIAL_JOB_POSTINGS) {
    insertJob.run(job);
  }

  const insertCandidate = db.prepare(`
    INSERT INTO job_candidates (
      id, job_id, name, email, phone, stage, rating, applied_date, notes
    ) VALUES (
      @id, @job_id, @name, @email, @phone, @stage, @rating, @applied_date, @notes
    )
  `);
  for (const cand of INITIAL_CANDIDATES) {
    insertCandidate.run(cand);
  }
}

export function seedDatabase(db: Database.Database) {
  // Clear any existing data
  const tables = [
    'attendance',
    'duty_roster',
    'overtime_requests',
    'leave_requests',
    'leave_balances',
    'payrolls',
    'job_candidates',
    'job_postings',
    'announcements',
    'performance_reviews',
    'employees',
    'departments',
  ];

  for (const table of tables) {
    db.exec(`DELETE FROM ${table}`);
  }

  // 1. Insert departments
  const insertDept = db.prepare(`
    INSERT INTO departments (id, name, description, manager_id, budget, color)
    VALUES (@id, @name, @description, @manager_id, @budget, @color)
  `);
  for (const dept of INITIAL_DEPARTMENTS) {
    insertDept.run(dept);
  }

  // 2. Insert employees
  const insertEmp = db.prepare(`
    INSERT INTO employees (
      id, first_name, last_name, email, phone, role, department_id,
      employment_type, status, salary, join_date, manager_id, avatar,
      location, bio, emergency_contact_name, emergency_contact_phone, created_at
    ) VALUES (
      @id, @first_name, @last_name, @email, @phone, @role, @department_id,
      @employment_type, @status, @salary, @join_date, @manager_id, @avatar,
      @location, @bio, @emergency_contact_name, @emergency_contact_phone, @created_at
    )
  `);
  for (const emp of INITIAL_EMPLOYEES) {
    insertEmp.run(emp);
  }

  // 3. Insert leave balances for all employees
  const insertBalance = db.prepare(`
    INSERT INTO leave_balances (id, employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
    VALUES (?, ?, 20, ?, 10, ?, 5, ?)
  `);

  INITIAL_EMPLOYEES.forEach((emp, idx) => {
    const annualUsed = (idx * 2) % 12;
    const sickUsed = idx % 4;
    const casualUsed = idx % 3;
    insertBalance.run(`bal-${emp.id}`, emp.id, annualUsed, sickUsed, casualUsed);
  });

  // 4. Insert Attendance records for today & past 4 weekdays
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (id, employee_id, date, clock_in, clock_out, status, work_hours, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const todayStr = '2026-09-21';
  const pastDates = ['2026-09-17', '2026-09-18', '2026-09-19', '2026-09-20', '2026-09-21'];

  pastDates.forEach((date) => {
    INITIAL_EMPLOYEES.forEach((emp, i) => {
      let status = 'Present';
      let clockIn: string | null = '08:58:00';
      let clockOut: string | null = '17:30:00';
      let hours = 8.5;
      let notes: string | null = null;

      if (emp.status === 'On Leave' && date === todayStr) {
        status = 'Absent';
        clockIn = null;
        clockOut = null;
        hours = 0;
        notes = 'Approved Annual Leave';
      } else if (emp.status === 'Remote') {
        status = 'Remote';
        clockIn = '09:05:00';
        clockOut = date === todayStr ? null : '18:00:00';
        hours = date === todayStr ? 7.2 : 8.5;
        notes = 'WFH approved';
      } else if (i % 6 === 0) {
        status = 'Late';
        clockIn = '09:42:00';
        clockOut = date === todayStr ? null : '18:30:00';
        hours = date === todayStr ? 6.5 : 8.0;
        notes = 'Traffic delay';
      } else {
        if (date === todayStr) {
          clockOut = null; // Currently working!
          hours = 6.8;
        }
      }

      insertAttendance.run(
        `att-${emp.id}-${date}`,
        emp.id,
        date,
        clockIn,
        clockOut,
        status,
        hours,
        notes
      );
    });
  });

  // 5. Insert Leave Requests
  const insertLeave = db.prepare(`
    INSERT INTO leave_requests (
      id, employee_id, leave_type, start_date, end_date, days_count,
      reason, status, reviewer_id, reviewed_at, reviewer_comments, created_at
    ) VALUES (
      @id, @employee_id, @leave_type, @start_date, @end_date, @days_count,
      @reason, @status, @reviewer_id, @reviewed_at, @reviewer_comments, @created_at
    )
  `);

  const initialLeaves = [
    {
      id: 'leave-1',
      employee_id: 'emp-6',
      leave_type: 'Annual',
      start_date: '2026-09-19',
      end_date: '2026-09-25',
      days_count: 5,
      reason: 'Family trip to French Alps and resting up.',
      status: 'Approved',
      reviewer_id: 'emp-4',
      reviewed_at: '2026-09-12T10:00:00Z',
      reviewer_comments: 'Have a wonderful vacation, Chloe! Enjoy.',
      created_at: '2026-09-10T14:30:00Z',
    },
    {
      id: 'leave-2',
      employee_id: 'emp-2',
      leave_type: 'Casual',
      start_date: '2026-09-24',
      end_date: '2026-09-25',
      days_count: 2,
      reason: 'Home renovation and contractor inspection.',
      status: 'Pending',
      reviewer_id: null,
      reviewed_at: null,
      reviewer_comments: null,
      created_at: '2026-09-19T09:15:00Z',
    },
    {
      id: 'leave-3',
      employee_id: 'emp-8',
      leave_type: 'Sick',
      start_date: '2026-09-14',
      end_date: '2026-09-15',
      days_count: 2,
      reason: 'Severe migraine & doctor visit.',
      status: 'Approved',
      reviewer_id: 'emp-7',
      reviewed_at: '2026-09-14T08:30:00Z',
      reviewer_comments: 'Get well soon!',
      created_at: '2026-09-14T07:45:00Z',
    },
    {
      id: 'leave-4',
      employee_id: 'emp-11',
      leave_type: 'Annual',
      start_date: '2026-10-05',
      end_date: '2026-10-12',
      days_count: 6,
      reason: 'Attending cousin wedding in Hawaii.',
      status: 'Pending',
      reviewer_id: null,
      reviewed_at: null,
      reviewer_comments: null,
      created_at: '2026-09-20T16:20:00Z',
    },
    {
      id: 'leave-5',
      employee_id: 'emp-18',
      leave_type: 'Casual',
      start_date: '2026-09-28',
      end_date: '2026-09-29',
      days_count: 2,
      reason: 'Attending Next.js Conf keynote session.',
      status: 'Pending',
      reviewer_id: null,
      reviewed_at: null,
      reviewer_comments: null,
      created_at: '2026-09-21T08:00:00Z',
    },
  ];

  for (const req of initialLeaves) {
    insertLeave.run(req);
  }

  // 6. Insert Payroll records (August 2026 and September 2026)
  const insertPayroll = db.prepare(`
    INSERT INTO payrolls (
      id, employee_id, pay_period, payment_date, base_salary,
      allowances, bonuses, tax_deduction, insurance_deduction, other_deductions,
      net_salary, status, payment_method, created_at
    ) VALUES (
      @id, @employee_id, @pay_period, @payment_date, @base_salary,
      @allowances, @bonuses, @tax_deduction, @insurance_deduction, @other_deductions,
      @net_salary, @status, @payment_method, @created_at
    )
  `);

  const periods = [
    { period: 'August 2026', payDate: '2026-08-31', status: 'Paid' },
    { period: 'September 2026', payDate: '2026-09-30', status: 'Pending' },
  ];

  periods.forEach((p) => {
    INITIAL_EMPLOYEES.forEach((emp) => {
      const monthlyBase = Math.round(emp.salary / 12);
      const allowances = 500; // standard health/tech stipend
      const bonuses = emp.role.includes('VP') || emp.role.includes('Head') ? 1500 : 350;
      const gross = monthlyBase + allowances + bonuses;
      const tax = Math.round(gross * 0.22);
      const insurance = 320;
      const retirement = Math.round(gross * 0.05);
      const net = gross - tax - insurance - retirement;

      insertPayroll.run({
        id: `pay-${p.period.replace(' ', '-').toLowerCase()}-${emp.id}`,
        employee_id: emp.id,
        pay_period: p.period,
        payment_date: p.payDate,
        base_salary: monthlyBase,
        allowances,
        bonuses,
        tax_deduction: tax,
        insurance_deduction: insurance,
        other_deductions: retirement,
        net_salary: net,
        status: p.status,
        payment_method: 'Direct Deposit',
        created_at: `${p.payDate}T00:00:00Z`,
      });
    });
  });

  // 7. Insert Jobs & Candidates
  const insertJob = db.prepare(`
    INSERT INTO job_postings (
      id, title, department_id, location, type, experience_level,
      salary_range, description, requirements, status, posted_date, applicants_count
    ) VALUES (
      @id, @title, @department_id, @location, @type, @experience_level,
      @salary_range, @description, @requirements, @status, @posted_date, @applicants_count
    )
  `);
  for (const job of INITIAL_JOB_POSTINGS) {
    insertJob.run(job);
  }

  const insertCandidate = db.prepare(`
    INSERT INTO job_candidates (
      id, job_id, name, email, phone, stage, rating, applied_date, notes
    ) VALUES (
      @id, @job_id, @name, @email, @phone, @stage, @rating, @applied_date, @notes
    )
  `);
  for (const cand of INITIAL_CANDIDATES) {
    insertCandidate.run(cand);
  }

  // 8. Insert Announcements
  const insertAnn = db.prepare(`
    INSERT INTO announcements (
      id, title, content, author_id, category, pinned, created_at
    ) VALUES (
      @id, @title, @content, @author_id, @category, @pinned, @created_at
    )
  `);
  for (const ann of INITIAL_ANNOUNCEMENTS) {
    insertAnn.run(ann);
  }

  // 9. Insert Performance Reviews
  const insertRev = db.prepare(`
    INSERT INTO performance_reviews (
      id, employee_id, reviewer_id, review_period, rating,
      goals_achievement, strengths, areas_for_growth, status, created_at
    ) VALUES (
      @id, @employee_id, @reviewer_id, @review_period, @rating,
      @goals_achievement, @strengths, @areas_for_growth, @status, @created_at
    )
  `);
  for (const rev of INITIAL_PERFORMANCE_REVIEWS) {
    insertRev.run(rev);
  }

}

export function seedDutyRoster(_db: Database.Database) {
  // Demo auto-seeding removed for production
}

export function seedOvertimeRequests(_db: Database.Database) {
  // Demo auto-seeding removed for production
}
