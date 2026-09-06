import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export const dynamic = 'force-dynamic';

type ElectionStateRow = { status: string };

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) {
      return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    }

    const payload = await request.json();
    const duration = Number(payload.durationMinutes);
    if (![120, 150].includes(duration)) {
      return NextResponse.json({ success: false, message: 'Duration must be 120 or 150 minutes.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stateResult = await supabase.from('election_state').select('status').eq('id', 1).single();
    const state = stateResult.data as ElectionStateRow | null;
    if (stateResult.error || !state) {
      return NextResponse.json({ success: false, message: 'Election state could not be loaded.' }, { status: 503 });
    }
    if (state.status === 'LIVE') {
      return NextResponse.json({ success: false, message: 'Stop the election before changing its duration.' }, { status: 409 });
    }

    const updateResult = await supabase.from('election_state').update({ duration_minutes: duration, updated_at: new Date().toISOString() } as never).eq('id', 1);
    if (updateResult.error) {
      return NextResponse.json({ success: false, message: 'Election duration could not be saved.' }, { status: 503 });
    }
    await writeAuditLog('Election duration changed', 'ELECO Administrator', 'ADMIN', `Election duration set to ${duration} minutes.`);
    return NextResponse.json({ success: true, durationMinutes: duration }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Election duration update is unavailable.' }, { status: 503 });
  }
}