import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const stateResult = await supabase.from('election_state').select('status, results_status').eq('id', 1).single();
    const state = stateResult.data as { status: string; results_status: string } | null;
    const positions = await supabase.from('positions').select('id');
    const candidates = await supabase.from('candidates').select('position_id');
    if (stateResult.error || !state) return NextResponse.json({ success: false, message: 'Election state could not be loaded.' }, { status: 503 });
    if (state.status === 'LIVE') return NextResponse.json({ success: false, message: 'Results cannot be published while voting is live.' }, { status: 409 });
    if (state.results_status !== 'DRAFT') return NextResponse.json({ success: false, message: 'Results have already been published.' }, { status: 409 });
    const positionIds = new Set((positions.data || []).map((row) => (row as { id: string }).id));
    const candidatePositionIds = new Set((candidates.data || []).map((row) => (row as { position_id: string }).position_id));
    if (!positionIds.size || [...positionIds].some((id) => !candidatePositionIds.has(id))) return NextResponse.json({ success: false, message: 'Every position must have results before publishing.' }, { status: 409 });
    const now = new Date().toISOString();
    const result = await supabase.from('election_state').update({ results_status: 'PUBLISHED', published_at: now, published_by: 'ELECO Administrator', updated_at: now } as never).eq('id', 1);
    if (result.error) return NextResponse.json({ success: false, message: 'Results could not be published.' }, { status: 503 });
    await writeAuditLog('Results published', 'ELECO Administrator', 'ADMIN', 'Aggregated results are now visible to students.');
    return NextResponse.json({ success: true, resultsStatus: 'PUBLISHED', publishedAt: now });
  } catch { return NextResponse.json({ success: false, message: 'Results publishing is unavailable.' }, { status: 503 }); }
}