import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) {
      return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    
    // Order matters because of foreign key constraints
    // position_reviews and candidates both reference positions
    const tables = ['position_reviews', 'candidates', 'voters', 'positions', 'audit_logs'];
    for (const table of tables) {
      try {
        await supabase.from(table).delete().not('id', 'is', null);
      } catch (err) {
        console.warn(`Could not clear table ${table}:`, err);
      }
    }

    const departments = ['Anatomy', 'Physiology', 'Medical Biochemistry', 'Pharmacology', 'Psychology'];
    await supabase.from('department_stats').upsert(
      departments.map((department) => ({ department, eligible: 0, accredited: 0, voted: 0 })) as never
    );

    const now = new Date().toISOString();
    await supabase.from('election_state').update({
      status: 'STANDBY',
      start_time: null,
      end_time: null,
      duration_minutes: 120,
      results_status: 'DRAFT',
      published_at: null,
      published_by: null,
      certified_at: null,
      certified_by: null,
      updated_at: now
    } as never).eq('id', 1);

    await writeAuditLog('Election reset to clean state', 'System Admin', 'SYSTEM', 'All records removed; election is ready for fresh configuration.');
    return NextResponse.json({ success: true, message: 'Election reset successfully to a clean state.' });
  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json({ success: false, message: 'Election reset is unavailable.' }, { status: 503 });
  }
}