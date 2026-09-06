import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const stateResult = await supabase.from('election_state').select('status').eq('id', 1).single();
    const state = stateResult.data as { status: string } | null;
    const positions = await supabase.from('positions').select('id');
    const reviews = await supabase.from('position_reviews').select('position_id').not('reviewed_at', 'is', null);
    if (stateResult.error || !state) return NextResponse.json({ success: false, message: 'Election state could not be loaded.' }, { status: 503 });
    if (!['CLOSED', 'CERTIFIED'].includes(state.status)) return NextResponse.json({ success: false, message: 'The election must be closed before certification.' }, { status: 409 });
    const reviewed = new Set((reviews.data || []).map((row) => (row as { position_id: string }).position_id));
    if ((positions.data || []).some((row) => !reviewed.has((row as { id: string }).id))) return NextResponse.json({ success: false, message: 'Review every position before certification.' }, { status: 409 });
    const now = new Date().toISOString();
    const result = await supabase.from('election_state').update({ status: 'CERTIFIED', results_status: 'CERTIFIED', certified_at: now, certified_by: 'ELECO Administrator', updated_at: now } as never).eq('id', 1);
    if (result.error) return NextResponse.json({ success: false, message: 'Results could not be certified.' }, { status: 503 });
    return NextResponse.json({ success: true, status: 'CERTIFIED' });
  } catch { return NextResponse.json({ success: false, message: 'Results certification is unavailable.' }, { status: 503 }); }
}