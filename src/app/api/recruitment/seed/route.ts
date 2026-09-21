import { NextResponse } from 'next/server';
import { getDb, restoreRecruitment } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    restoreRecruitment(db);
    return NextResponse.json({
      success: true,
      message: 'Recruitment sample jobs and candidates restored successfully!',
    });
  } catch (error: any) {
    console.error('Error restoring recruitment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
