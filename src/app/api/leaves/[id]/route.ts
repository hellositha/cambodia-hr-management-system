import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDb();
    const body = await request.json();
    const { status, reviewer_id = 'emp-13', reviewer_comments = '' } = body;

    if (!status || !['Approved', 'Rejected', 'Pending'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required' }, { status: 400 });
    }

    const leave = db.prepare('SELECT * FROM leave_requests WHERE id = ?').get(id) as any;
    if (!leave) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const reviewedAt = new Date().toISOString();

    db.prepare(`
      UPDATE leave_requests SET
        status = ?,
        reviewer_id = ?,
        reviewed_at = ?,
        reviewer_comments = ?
      WHERE id = ?
    `).run(status, reviewer_id, reviewedAt, reviewer_comments, id);

    // If approved and was not previously approved, update leave_balances
    if (status === 'Approved' && leave.status !== 'Approved') {
      const field =
        leave.leave_type === 'Sick'
          ? 'sick_used'
          : leave.leave_type === 'Casual'
          ? 'casual_used'
          : 'annual_used';

      db.prepare(`
        UPDATE leave_balances 
        SET ${field} = ${field} + ?
        WHERE employee_id = ?
      `).run(leave.days_count, leave.employee_id);
    }

    const updated = db.prepare(`
      SELECT 
        lr.*,
        e.first_name || ' ' || e.last_name as employee_name,
        e.role as employee_role,
        r.first_name || ' ' || r.last_name as reviewer_name
      FROM leave_requests lr
      JOIN employees e ON e.id = lr.employee_id
      LEFT JOIN employees r ON r.id = lr.reviewer_id
      WHERE lr.id = ?
    `).get(id);

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error reviewing leave request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
