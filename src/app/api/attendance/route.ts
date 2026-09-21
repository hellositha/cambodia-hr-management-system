import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { AttendanceRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employee_id');

    let sql = `
      SELECT 
        a.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        e.avatar as employee_avatar,
        d.name as department_name
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (date) {
      sql += ` AND a.date = ?`;
      params.push(date);
    }

    if (employeeId) {
      sql += ` AND a.employee_id = ?`;
      params.push(employeeId);
    }

    sql += ` ORDER BY a.date DESC, a.clock_in ASC`;

    const records = db.prepare(sql).all(...params) as AttendanceRecord[];
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const {
      employee_id,
      date = new Date().toISOString().split('T')[0],
      clock_in = '09:00:00',
      clock_out = null,
      status = 'Present',
      work_hours = 8,
      notes = '',
    } = body;

    if (!employee_id) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
    }

    const id = `att-${employee_id}-${date}`;

    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, clock_in, clock_out, status, work_hours, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(employee_id, date) DO UPDATE SET
        clock_in = excluded.clock_in,
        clock_out = excluded.clock_out,
        status = excluded.status,
        work_hours = excluded.work_hours,
        notes = excluded.notes
    `).run(id, employee_id, date, clock_in, clock_out, status, Number(work_hours), notes);

    const record = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
