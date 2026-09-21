import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Employee } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';
    const employmentType = searchParams.get('type') || '';

    let sql = `
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (q) {
      sql += ` AND (e.first_name LIKE ? OR e.last_name LIKE ? OR e.email LIKE ? OR e.role LIKE ?)`;
      const pattern = `%${q}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    if (department && department !== 'all') {
      sql += ` AND e.department_id = ?`;
      params.push(department);
    }

    if (status && status !== 'all') {
      sql += ` AND e.status = ?`;
      params.push(status);
    }

    if (employmentType && employmentType !== 'all') {
      sql += ` AND e.employment_type = ?`;
      params.push(employmentType);
    }

    sql += ` ORDER BY e.first_name ASC`;

    const employees = db.prepare(sql).all(...params) as Employee[];

    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone = '',
      role,
      department_id,
      employment_type = 'Full-Time',
      status = 'Active',
      salary = 85000,
      join_date = new Date().toISOString().split('T')[0],
      manager_id = null,
      avatar,
      location = 'San Francisco, CA',
      bio = '',
      emergency_contact_name = '',
      emergency_contact_phone = '',
    } = body;

    if (!first_name || !last_name || !email || !role || !department_id) {
      return NextResponse.json(
        { error: 'first_name, last_name, email, role, and department_id are required' },
        { status: 400 }
      );
    }

    // Default avatar if none provided
    const defaultAvatar =
      avatar ||
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces`;

    const id = `emp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO employees (
        id, first_name, last_name, email, phone, role, department_id,
        employment_type, status, salary, join_date, manager_id, avatar,
        location, bio, emergency_contact_name, emergency_contact_phone, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    insertStmt.run(
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      department_id,
      employment_type,
      status,
      Number(salary),
      join_date,
      manager_id || null,
      defaultAvatar,
      location,
      bio,
      emergency_contact_name,
      emergency_contact_phone,
      createdAt
    );

    // Also initialize leave balance
    db.prepare(`
      INSERT INTO leave_balances (id, employee_id, annual_total, annual_used, sick_total, sick_used, casual_total, casual_used)
      VALUES (?, ?, 20, 0, 10, 0, 5, 0)
    `).run(`bal-${id}`, id);

    // Fetch the newly created employee with relations
    const newEmployee = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id);

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error: any) {
    console.error('Error creating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { getDb, clearAllEmployees } = await import('@/lib/db');
    const db = getDb();
    clearAllEmployees(db);
    return NextResponse.json({ success: true, message: 'All employees and related records have been removed.' });
  } catch (error: any) {
    console.error('Error clearing employees:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

