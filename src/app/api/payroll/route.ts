import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { PayrollRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period');
    const employeeId = searchParams.get('employee_id');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        p.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        e.avatar as employee_avatar,
        d.name as department_name
      FROM payrolls p
      JOIN employees e ON e.id = p.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (period && period !== 'all') {
      sql += ` AND p.pay_period = ?`;
      params.push(period);
    }

    if (employeeId) {
      sql += ` AND p.employee_id = ?`;
      params.push(employeeId);
    }

    if (status && status !== 'all') {
      sql += ` AND p.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY p.payment_date DESC, p.net_salary DESC`;

    const records = db.prepare(sql).all(...params) as PayrollRecord[];
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error fetching payroll records:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action, period, payment_date } = body;

    // Batch generate payroll for all active employees
    if (action === 'run_batch') {
      const payPeriod = period || 'October 2026';
      const payDate = payment_date || '2026-10-31';

      const activeEmployees = db.prepare("SELECT * FROM employees WHERE status != 'Terminated'").all() as any[];

      const insertStmt = db.prepare(`
        INSERT INTO payrolls (
          id, employee_id, pay_period, payment_date, base_salary,
          allowances, bonuses, tax_deduction, insurance_deduction, other_deductions,
          net_salary, status, payment_method, created_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, 'Paid', 'Direct Deposit', ?
        )
        ON CONFLICT(id) DO UPDATE SET
          status = 'Paid',
          payment_date = excluded.payment_date
      `);

      const now = new Date().toISOString();
      let createdCount = 0;

      for (const emp of activeEmployees) {
        const id = `pay-${payPeriod.replace(' ', '-').toLowerCase()}-${emp.id}`;
        const monthlyBase = Math.round(emp.salary / 12);
        const allowances = 500;
        const bonuses = emp.role.includes('VP') || emp.role.includes('Head') ? 1500 : 350;
        const gross = monthlyBase + allowances + bonuses;
        const tax = Math.round(gross * 0.22);
        const insurance = 320;
        const retirement = Math.round(gross * 0.05);
        const net = gross - tax - insurance - retirement;

        insertStmt.run(
          id,
          emp.id,
          payPeriod,
          payDate,
          monthlyBase,
          allowances,
          bonuses,
          tax,
          insurance,
          retirement,
          net,
          now
        );
        createdCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Successfully processed payroll for ${createdCount} employees for ${payPeriod}`,
        count: createdCount,
      });
    }

    // Single payroll record create
    const {
      employee_id,
      pay_period,
      payment_date: singleDate,
      base_salary,
      allowances = 0,
      bonuses = 0,
      tax_deduction = 0,
      insurance_deduction = 0,
      other_deductions = 0,
      status = 'Pending',
      payment_method = 'Direct Deposit',
    } = body;

    const netSalary =
      Number(base_salary) +
      Number(allowances) +
      Number(bonuses) -
      Number(tax_deduction) -
      Number(insurance_deduction) -
      Number(other_deductions);

    const id = `pay-${Date.now()}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO payrolls (
        id, employee_id, pay_period, payment_date, base_salary,
        allowances, bonuses, tax_deduction, insurance_deduction, other_deductions,
        net_salary, status, payment_method, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      employee_id,
      pay_period,
      singleDate,
      Number(base_salary),
      Number(allowances),
      Number(bonuses),
      Number(tax_deduction),
      Number(insurance_deduction),
      Number(other_deductions),
      netSalary,
      status,
      payment_method,
      now
    );

    const record = db.prepare('SELECT * FROM payrolls WHERE id = ?').get(id);
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    console.error('Error processing payroll:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
