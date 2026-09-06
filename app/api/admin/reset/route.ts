import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    for (const table of ['candidates', 'voters', 'positions', 'audit_logs']) {
      const result = await supabase.from(table).delete().neq('id', '');
      if (result.error) return NextResponse.json({ success: false, message: 'Election reset could not be completed.' }, { status: 503 });
    }
    await supabase.from('department_stats').upsert([
      { department: 'Anatomy', eligible: 0, accredited: 0, voted: 0 },
      { department: 'Psychology', eligible: 0, accredited: 0, voted: 0 },
    ] as never);
    const now = new Date().toISOString();
    const state = await supabase.from('election_state').update({ status: 'STANDBY', start_time: null, end_time: null, results_status: 'DRAFT', published_at: null, published_by: null, certified_at: null, certified_by: null, updated_at: now } as never).eq('id', 1);
    if (state.error) return NextResponse.json({ success: false, message: 'Election state could not be reset.' }, { status: 503 });
    await writeAuditLog('Election reset to clean state', 'System Admin', 'SYSTEM', 'All records removed; election is ready for fresh configuration.');
    return NextResponse.json({ success: true, message: 'Election reset successfully to a clean state.' });
  } catch { return NextResponse.json({ success: false, message: 'Election reset is unavailable.' }, { status: 503 }); }
}