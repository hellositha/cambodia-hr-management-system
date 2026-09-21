import { NextResponse } from 'next/server';
import { getDb, seedDatabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const db = getDb();
    seedDatabase(db);
    return NextResponse.json({
      success: true,
      message: 'Database successfully re-seeded with pristine demo data!',
    });
  } catch (error: any) {
    console.error('Error re-seeding database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
