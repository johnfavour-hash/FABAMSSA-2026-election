import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

type VoterIdRow = { id: string };

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) {
      return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    }

    const payload = await request.json();
    const matricNumber = String(payload.matricNumber ?? '').trim().toUpperCase();
    const reason = String(payload.reason ?? 'Accreditation credentials non-compliant with BMS student registry.').trim();
    if (!matricNumber) {
      return NextResponse.json({ success: false, message: 'Matriculation number is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const voterResult = await supabase.from('voters').select('id').eq('matric_number', matricNumber).maybeSingle();
    const voter = voterResult.data as VoterIdRow | null;
    if (voterResult.error || !voter) {
      return NextResponse.json({ success: false, message: 'Voter not found.' }, { status: 404 });
    }

    const updateResult = await supabase
      .from('voters')
      .update({ is_eligible: 0, is_accredited: 0, verification_status: 'rejected', rejection_reason: reason } as never)
      .eq('id', voter.id);
    if (updateResult.error) {
      return NextResponse.json({ success: false, message: 'Voter rejection could not be saved.' }, { status: 503 });
    }

    return NextResponse.json({ success: true, message: 'Voter submission marked as rejected.', reason }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Voter rejection is unavailable.' }, { status: 503 });
  }
}