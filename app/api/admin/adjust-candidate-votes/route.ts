import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const payload = await request.json();
    const candidateId = String(payload.candidateId ?? '');
    const delta = Number(payload.delta);
    if (!candidateId || !Number.isFinite(delta)) return NextResponse.json({ success: false, message: 'Candidate and vote adjustment are required.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const existing = await supabase.from('candidates').select('votes_count').eq('id', candidateId).maybeSingle();
    const row = existing.data as { votes_count: number } | null;
    if (existing.error || !row) return NextResponse.json({ success: false, message: 'Candidate not found.' }, { status: 404 });
    const votesCount = Math.max(0, Math.trunc(row.votes_count + delta));
    const result = await supabase.from('candidates').update({ votes_count: votesCount } as never).eq('id', candidateId);
    if (result.error) return NextResponse.json({ success: false, message: 'Vote count could not be adjusted.' }, { status: 503 });
    await writeAuditLog('Candidate vote count adjusted', 'ELECO Administrator', 'ADMIN', `Candidate ${candidateId} changed by ${delta}. New total: ${votesCount}.`);
    return NextResponse.json({ success: true, candidateId, votesCount });
  } catch { return NextResponse.json({ success: false, message: 'Vote adjustment is unavailable.' }, { status: 503 }); }
}