import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // 1. Employee base info
    const employee = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        d.color as department_color,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id) as any;

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // 2. Leave balance
    const leaveBalance = db.prepare('SELECT * FROM leave_balances WHERE employee_id = ?').get(id);

    // 3. Recent attendance
    const attendance = db.prepare(`
      SELECT * FROM attendance 
      WHERE employee_id = ? 
      ORDER BY date DESC 
      LIMIT 14
    `).all(id);

    // 4. Leave requests
    const leaves = db.prepare(`
      SELECT lr.*, m.first_name || ' ' || m.last_name as reviewer_name
      FROM leave_requests lr
      LEFT JOIN employees m ON m.id = lr.reviewer_id
      WHERE lr.employee_id = ?
      ORDER BY lr.created_at DESC
    `).all(id);

    // 5. Payroll history
    const payrolls = db.prepare(`
      SELECT * FROM payrolls
      WHERE employee_id = ?
      ORDER BY payment_date DESC
    `).all(id);

    // 6. Performance reviews
    const reviews = db.prepare(`
      SELECT pr.*, m.first_name || ' ' || m.last_name as reviewer_name
      FROM performance_reviews pr
      LEFT JOIN employees m ON m.id = pr.reviewer_id
      WHERE pr.employee_id = ?
      ORDER BY pr.created_at DESC
    `).all(id);

    return NextResponse.json({
      employee,
      leaveBalance,
      attendance,
      leaves,
      payrolls,
      reviews,
    });
  } catch (error: any) {
    console.error('Error fetching employee details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();

    const {
      first_name,
      last_name,
      email,
      phone,
      role,
      department_id,
      employment_type,
      status,
      salary,
      location,
      bio,
      emergency_contact_name,
      emergency_contact_phone,
    } = body;

    db.prepare(`
      UPDATE employees SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role),
        department_id = COALESCE(?, department_id),
        employment_type = COALESCE(?, employment_type),
        status = COALESCE(?, status),
        salary = COALESCE(?, salary),
        location = COALESCE(?, location),
        bio = COALESCE(?, bio),
        emergency_contact_name = COALESCE(?, emergency_contact_name),
        emergency_contact_phone = COALESCE(?, emergency_contact_phone)
      WHERE id = ?
    `).run(
      first_name,
      last_name,
      email,
      phone,
      role,
      department_id,
      employment_type,
      status,
      salary ? Number(salary) : null,
      location,
      bio,
      emergency_contact_name,
      emergency_contact_phone,
      id
    );

    const updated = db.prepare(`
      SELECT 
        e.*,
        d.name as department_name,
        m.first_name || ' ' || m.last_name as manager_name
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN employees m ON m.id = e.manager_id
      WHERE e.id = ?
    `).get(id);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();

    // Mark as terminated or delete
    db.prepare("UPDATE employees SET status = 'Terminated' WHERE id = ?").run(id);

    return NextResponse.json({ success: true, message: 'Employee status set to Terminated' });
  } catch (error: any) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
