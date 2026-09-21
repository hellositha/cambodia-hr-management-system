import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employee_id');

    if (!employeeId) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const record = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employeeId, today) as any;

    const isClockedIn = !!record && !record.clock_out;
    const isClockedOut = !!record && !!record.clock_out;

    return NextResponse.json({
      today,
      record: record || null,
      isClockedIn,
      isClockedOut,
      hasRecord: !!record,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { employee_id } = body;

    if (!employee_id) {
      return NextResponse.json({ error: 'employee_id is required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toTimeString().split(' ')[0]; // HH:MM:SS

    const existing = db.prepare('SELECT * FROM attendance WHERE employee_id = ? AND date = ?').get(employee_id, today) as any;

    if (!existing) {
      // CLOCK IN
      const id = `att-${employee_id}-${today}`;
      const hour = now.getHours();
      const status = hour >= 10 ? 'Late' : 'Present';

      db.prepare(`
        INSERT INTO attendance (id, employee_id, date, clock_in, clock_out, status, work_hours, notes)
        VALUES (?, ?, ?, ?, NULL, ?, 0, 'Clocked in via HESTRA HRM Web')
      `).run(id, employee_id, today, timeString, status);

      const created = db.prepare('SELECT * FROM attendance WHERE id = ?').get(id);
      return NextResponse.json({
        action: 'clock_in',
        message: `Clocked in successfully at ${timeString}`,
        record: created,
        isClockedIn: true,
      });
    } else if (!existing.clock_out) {
      // CLOCK OUT
      let workHours = 8.0;
      if (existing.clock_in) {
        const [inH, inM] = existing.clock_in.split(':').map(Number);
        const [outH, outM] = timeString.split(':').map(Number);
        const diffHours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
        workHours = Math.max(0.5, Math.round(diffHours * 10) / 10);
      }

      db.prepare(`
        UPDATE attendance 
        SET clock_out = ?, work_hours = ?, notes = notes || ' | Shift ended'
        WHERE id = ?
      `).run(timeString, workHours, existing.id);

      const updated = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
      return NextResponse.json({
        action: 'clock_out',
        message: `Clocked out at ${timeString}. Total duration: ${workHours} hrs`,
        record: updated,
        isClockedIn: false,
      });
    } else {
      return NextResponse.json({
        action: 'already_completed',
        message: 'Shift already completed today.',
        record: existing,
        isClockedIn: false,
      });
    }
  } catch (error: any) {
    console.error('Error handling clock in/out:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
