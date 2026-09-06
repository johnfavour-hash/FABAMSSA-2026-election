import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

const allowedStatuses = new Set(['STANDBY', 'ACCREDITATION_OPEN', 'LIVE', 'CLOSED', 'CERTIFIED']);

type ElectionStateRow = { duration_minutes: number };

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) {
      return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    }

    const payload = await request.json();
    const requested = String(payload.status ?? '').trim().toUpperCase();
    if (!allowedStatuses.has(requested)) {
      return NextResponse.json({ success: false, message: 'Invalid election status.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stateResult = await supabase.from('election_state').select('duration_minutes').eq('id', 1).single();
    const state = stateResult.data as ElectionStateRow | null;
    if (stateResult.error || !state) {
      return NextResponse.json({ success: false, message: 'Election state could not be loaded.' }, { status: 503 });
    }

    const now = new Date();
    const update: Record<string, string | null> = { status: requested, updated_at: now.toISOString() };
    if (requested === 'LIVE') {
      update.start_time = now.toISOString();
      update.end_time = new Date(now.getTime() + state.duration_minutes * 60_000).toISOString();
    } else if (requested === 'CLOSED') {
      update.end_time = now.toISOString();
    } else if (requested === 'STANDBY' || requested === 'ACCREDITATION_OPEN') {
      update.start_time = null;
      update.end_time = null;
    }

    const updateResult = await supabase.from('election_state').update(update as never).eq('id', 1);
    if (updateResult.error) {
      return NextResponse.json({ success: false, message: 'Election status could not be saved.' }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      status: requested,
      start_time: update.start_time ?? null,
      end_time: update.end_time ?? null,
      updated_at: now.toISOString(),
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Election status update is unavailable.' }, { status: 503 });
  }
}