import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { LeaveRequest } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employee_id');

    let sql = `
      SELECT 
        lr.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        e.avatar as employee_avatar,
        d.name as department_name,
        r.first_name || ' ' || r.last_name as reviewer_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees r ON r.id = lr.reviewer_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== 'all') {
      sql += ` AND lr.status = ?`;
      params.push(status);
    }

    if (employeeId) {
      sql += ` AND lr.employee_id = ?`;
      params.push(employeeId);
    }

    sql += ` ORDER BY lr.created_at DESC`;

    const records = db.prepare(sql).all(...params) as LeaveRequest[];
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      employee_id,
      leave_type = 'Annual',
      start_date,
      end_date,
      days_count,
      reason = '',
    } = body;

    if (!employee_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'employee_id, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    // Calculate days if not provided
    let calculatedDays = Number(days_count);
    if (!calculatedDays || calculatedDays <= 0) {
      const d1 = new Date(start_date);
      const d2 = new Date(end_date);
      const diffMs = Math.abs(d2.getTime() - d1.getTime());
      calculatedDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1);
    }

    const id = `leave-${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO leave_requests (
        id, employee_id, leave_type, start_date, end_date,
        days_count, reason, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)
    `).run(id, employee_id, leave_type, start_date, end_date, calculatedDays, reason, createdAt);

    const record = db.prepare(`
      SELECT 
        lr.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        e.avatar as employee_avatar
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      WHERE lr.id = ?
    `).get(id);

    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
