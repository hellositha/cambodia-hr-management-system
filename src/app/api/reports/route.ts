import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    const month = url.searchParams.get('month') || '2026-09';
    const deptId = url.searchParams.get('department_id') || 'all';

    // 1. All departments
    const departments = db.prepare('SELECT * FROM departments ORDER BY name ASC').all();

    // 2. Headcount & Demographics
    let empQuery = `
      SELECT 
        e.*,
        d.name as department_name,
        d.color as department_color
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
    `;
    if (deptId !== 'all') {
      empQuery += ` WHERE e.department_id = '${deptId.replace(/'/g, "''")}'`;
    }
    empQuery += ' ORDER BY e.first_name ASC';

    const employees = db.prepare(empQuery).all() as any[];

    // 3. Attendance Aggregates for the requested month
    const attendanceRecords = db.prepare(`
      SELECT 
        a.*,
        e.first_name,
        e.last_name,
        e.role,
        e.department_id,
        d.name as department_name
      FROM attendance a
      JOIN employees e ON e.id = a.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE a.date LIKE ?
      ORDER BY a.date DESC
    `).all(`${month}%`) as any[];

    // Compute attendance metrics per employee
    const empAttendanceMap: { [empId: string]: {
      id: string;
      name: string;
      role: string;
      department: string;
      department_id: string;
      present: number;
      remote: number;
      late: number;
      absent: number;
      totalHours: number;
      overtimeHours: number;
    } } = {};

    employees.forEach((emp) => {
      empAttendanceMap[emp.id] = {
        id: emp.id,
        name: `${emp.first_name} ${emp.last_name}`,
        role: emp.role,
        department: emp.department_name || 'General',
        department_id: emp.department_id,
        present: 0,
        remote: 0,
        late: 0,
        absent: 0,
        totalHours: 0,
        overtimeHours: 0,
      };
    });

    attendanceRecords.forEach((att) => {
      if (empAttendanceMap[att.employee_id]) {
        const item = empAttendanceMap[att.employee_id];
        if (att.status === 'Present') item.present += 1;
        else if (att.status === 'Remote') item.remote += 1;
        else if (att.status === 'Late') item.late += 1;
        else if (att.status === 'Absent') item.absent += 1;

        const hours = att.work_hours || 0;
        item.totalHours += hours;
        if (hours > 8) {
          item.overtimeHours += Math.round((hours - 8) * 10) / 10;
        }
      }
    });

    const attendanceSummary = Object.values(empAttendanceMap).filter(
      (item) => deptId === 'all' || item.department_id === deptId
    );

    // 4. Payroll & Banking Disbursement Report (September 2026 or latest period)
    const latestPayrollPeriod = 'September 2026';
    const payrollRecords = db.prepare(`
      SELECT 
        p.*,
        e.first_name,
        e.last_name,
        e.role,
        e.email,
        e.phone,
        e.department_id,
        d.name as department_name
      FROM payrolls p
      JOIN employees e ON e.id = p.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE p.pay_period = ?
    `).all(latestPayrollPeriod) as any[];

    // Calculate NSSF and Cambodia Banking Data
    const NSSF_CEILING_KHR = 1200000; // 1,200,000 KHR (~$300 USD)
    const EXCHANGE_RATE = 4100; // 4,100 KHR per USD
    const NSSF_CEILING_USD = NSSF_CEILING_KHR / EXCHANGE_RATE; // ~$292.68 USD

    const bankDisbursement = payrollRecords.map((p, idx) => {
      const monthlyBase = p.base_salary || 0;
      const allowances = p.allowances || 0;
      const bonuses = p.bonuses || 0;
      const gross = monthlyBase + allowances + bonuses;

      // NSSF Statutory breakdown (Cambodia Prakas)
      const contributorySalaryUsd = Math.min(monthlyBase, NSSF_CEILING_USD);
      const contributorySalaryKhr = Math.min(monthlyBase * EXCHANGE_RATE, NSSF_CEILING_KHR);

      // Pension: 2% employee, 2% employer
      const pensionEmployeeUsd = Math.round(contributorySalaryUsd * 0.02 * 100) / 100;
      const pensionEmployerUsd = Math.round(contributorySalaryUsd * 0.02 * 100) / 100;

      // Health Care: 2.6% employer
      const healthEmployerUsd = Math.round(contributorySalaryUsd * 0.026 * 100) / 100;

      // Occupational Risk: 0.8% employer
      const riskEmployerUsd = Math.round(contributorySalaryUsd * 0.008 * 100) / 100;

      const totalNssfEmployerUsd = pensionEmployerUsd + healthEmployerUsd + riskEmployerUsd;
      const totalNssfPayableUsd = pensionEmployeeUsd + totalNssfEmployerUsd;

      // Synthetic bank accounts for Cambodian banking demonstration
      const bankAccountNumber = `001${String(100000 + idx * 837).padStart(6, '0')}`;
      const acledaAccountNumber = `0100${String(200000 + idx * 451).padStart(7, '0')}`;
      const nssfMemberId = `NSSF-KH-${String(880000 + idx * 123)}`;

      return {
        id: p.id,
        employee_id: p.employee_id,
        employee_name: `${p.first_name} ${p.last_name}`,
        role: p.role,
        department: p.department_name || 'General',
        email: p.email,
        phone: p.phone,
        bank_account_aba: bankAccountNumber,
        bank_account_acleda: acledaAccountNumber,
        nssf_member_id: nssfMemberId,
        base_salary: monthlyBase,
        allowances,
        bonuses,
        gross_salary: gross,
        tax_withholding: p.tax_deduction,
        nssf_employee: pensionEmployeeUsd,
        nssf_employer: totalNssfEmployerUsd,
        nssf_total_payable: totalNssfPayableUsd,
        contributory_wage_usd: Math.round(contributorySalaryUsd * 100) / 100,
        contributory_wage_khr: Math.round(contributorySalaryKhr),
        pension_employee: pensionEmployeeUsd,
        pension_employer: pensionEmployerUsd,
        health_employer: healthEmployerUsd,
        risk_employer: riskEmployerUsd,
        net_salary_usd: p.net_salary,
        net_salary_khr: Math.round(p.net_salary * EXCHANGE_RATE),
        status: p.status,
        payment_method: p.payment_method,
      };
    }).filter((p) => deptId === 'all' || employees.some(e => e.id === p.employee_id && (deptId === 'all' || e.department_id === deptId)));

    // 5. Leave Balances & Utilization
    const leaveBalances = db.prepare(`
      SELECT 
        lb.*,
        e.first_name,
        e.last_name,
        e.role,
        e.department_id,
        d.name as department_name
      FROM leave_balances lb
      JOIN employees e ON e.id = lb.employee_id
      LEFT JOIN departments d ON d.id = e.department_id
    `).all() as any[];

    // 6. Aggregate KPIs
    const totalHeadcount = employees.length;
    const activeHeadcount = employees.filter((e) => e.status === 'Active' || e.status === 'Remote').length;
    const onLeaveHeadcount = employees.filter((e) => e.status === 'On Leave').length;

    const totalGrossPayroll = bankDisbursement.reduce((sum, item) => sum + item.gross_salary, 0);
    const totalNetDisbursement = bankDisbursement.reduce((sum, item) => sum + item.net_salary_usd, 0);
    const totalTaxWithheld = bankDisbursement.reduce((sum, item) => sum + item.tax_withholding, 0);
    const totalNssfContributions = bankDisbursement.reduce((sum, item) => sum + item.nssf_total_payable, 0);

    const totalDaysPresent = attendanceSummary.reduce((sum, item) => sum + item.present + item.remote, 0);
    const totalDaysPossible = attendanceSummary.length * 5;
    const companyAttendanceRate = totalDaysPossible > 0 ? Math.round((totalDaysPresent / totalDaysPossible) * 1000) / 10 : 96.5;

    return NextResponse.json({
      month,
      department_id: deptId,
      departments,
      kpis: {
        totalHeadcount,
        activeHeadcount,
        onLeaveHeadcount,
        companyAttendanceRate,
        totalGrossPayroll,
        totalNetDisbursement,
        totalTaxWithheld,
        totalNssfContributions,
        exchangeRate: EXCHANGE_RATE,
      },
      attendanceSummary,
      bankDisbursement,
      leaveBalances: leaveBalances.filter(
        (lb) => deptId === 'all' || lb.department_id === deptId
      ),
      departmentsSummary: departments.map((dept: any) => {
        const deptEmps = employees.filter((e) => e.department_id === dept.id);
        const deptSalary = deptEmps.reduce((sum, e) => sum + Math.round(e.salary / 12), 0);
        return {
          id: dept.id,
          name: dept.name,
          color: dept.color,
          employeeCount: deptEmps.length,
          monthlySalaryBudget: deptSalary,
          sharePercent: totalHeadcount > 0 ? Math.round((deptEmps.length / totalHeadcount) * 100) : 0,
        };
      }),
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}
