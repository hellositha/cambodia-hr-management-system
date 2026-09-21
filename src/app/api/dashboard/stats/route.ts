import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DashboardStats } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const today = '2026-09-21';

    // 1. Employee headcount stats
    const totalRow = db.prepare('SELECT count(*) as count FROM employees').get() as { count: number };
    const activeRow = db.prepare("SELECT count(*) as count FROM employees WHERE status = 'Active'").get() as { count: number };
    const leaveRow = db.prepare("SELECT count(*) as count FROM employees WHERE status = 'On Leave'").get() as { count: number };

    // New hires in last 60 days
    const newHiresRow = db.prepare("SELECT count(*) as count FROM employees WHERE join_date >= '2026-01-01'").get() as { count: number };

    // 2. Attendance today
    const attendanceRecords = db.prepare(`
      SELECT status, count(*) as count 
      FROM attendance 
      WHERE date = ? 
      GROUP BY status
    `).all(today) as { status: string; count: number }[];

    let present = 0;
    let remote = 0;
    let absent = 0;
    let late = 0;

    attendanceRecords.forEach((r) => {
      if (r.status === 'Present') present = r.count;
      else if (r.status === 'Remote') remote = r.count;
      else if (r.status === 'Absent') absent = r.count;
      else if (r.status === 'Late') late = r.count;
    });

    const totalTracked = present + remote + absent + late;
    const attendancePercentage = totalTracked > 0 ? Math.round(((present + remote + late) / totalTracked) * 100) : 95;

    // 3. Pending leaves
    const pendingLeaves = db.prepare("SELECT count(*) as count FROM leave_requests WHERE status = 'Pending'").get() as { count: number };

    // 4. Open positions
    const openJobs = db.prepare("SELECT count(*) as count FROM job_postings WHERE status = 'Active'").get() as { count: number };

    // 5. Monthly payroll total (September 2026)
    const payrollSum = db.prepare("SELECT sum(net_salary) as total FROM payrolls WHERE pay_period = 'September 2026'").get() as { total: number | null };

    // 6. Department distribution
    const deptDistribution = db.prepare(`
      SELECT d.name, d.color, count(e.id) as count
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      GROUP BY d.id
      ORDER BY count DESC
    `).all() as { name: string; color: string; count: number }[];

    // 7. Recent activities
    const recentLeaves = db.prepare(`
      SELECT lr.id, lr.leave_type, lr.status, lr.created_at, e.first_name, e.last_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      ORDER BY lr.created_at DESC
      LIMIT 3
    `).all() as any[];

    const recentEmployees = db.prepare(`
      SELECT id, first_name, last_name, role, join_date
      FROM employees
      ORDER BY join_date DESC
      LIMIT 2
    `).all() as any[];

    const activities: DashboardStats['recentActivities'] = [];

    recentLeaves.forEach((l) => {
      activities.push({
        id: `act-leave-${l.id}`,
        type: 'leave',
        title: `${l.first_name} ${l.last_name} requested ${l.leave_type} Leave`,
        subtitle: `Status: ${l.status}`,
        timestamp: l.created_at,
        statusBadge: l.status,
      });
    });

    recentEmployees.forEach((emp) => {
      activities.push({
        id: `act-hire-${emp.id}`,
        type: 'hire',
        title: `Welcome ${emp.first_name} ${emp.last_name}`,
        subtitle: `Joined as ${emp.role}`,
        timestamp: emp.join_date,
        statusBadge: 'New Hire',
      });
    });

    // 8. Upcoming Anniversaries & Celebrations
    const celebrations: DashboardStats['upcomingBirthdaysAndAnniversaries'] = [
      {
        id: 'cel-1',
        name: 'Marcus Vance',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&h=256&fit=crop&crop=faces',
        type: 'anniversary',
        date: 'Oct 01',
        subtitle: '4 Years at PulseHR',
      },
      {
        id: 'cel-2',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&h=256&fit=crop&crop=faces',
        type: 'birthday',
        date: 'Oct 04',
        subtitle: 'Birthday celebration',
      },
      {
        id: 'cel-3',
        name: 'Jessica Taylor',
        avatar: 'https://images.unsplash.com/photo-1534751516642-a171edd2521e?w=256&h=256&fit=crop&crop=faces',
        type: 'anniversary',
        date: 'Oct 14',
        subtitle: '3 Years at PulseHR',
      },
    ];

    const stats: DashboardStats = {
      totalEmployees: totalRow.count,
      activeEmployees: activeRow.count,
      onLeaveEmployees: leaveRow.count,
      newHiresThisMonth: newHiresRow.count,
      attendanceToday: {
        present: present,
        remote: remote,
        absent: absent,
        late: late,
        percentage: totalTracked > 0 ? Math.round(((present + remote + late) / totalTracked) * 100) : 0,
      },
      pendingLeavesCount: pendingLeaves.count,
      openPositionsCount: openJobs.count,
      monthlyPayrollTotal: payrollSum.total || 0,
      departmentDistribution: deptDistribution,
      recentActivities: activities,
      upcomingBirthdaysAndAnniversaries: totalRow.count > 0 ? celebrations : [],
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
