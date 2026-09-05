import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { createVoterSession } from '../../../../lib/voter-session';

export const dynamic = 'force-dynamic';

const voterFields = [
  'id',
  'matric_number',
  'full_name',
  'department',
  'level',
  'email',
  'phone',
  'is_eligible',
  'is_accredited',
  'has_voted',
  'accreditation_time',
  'voted_time',
  'ballot_receipt_hash',
  'avatar_url',
  'verification_status',
].join(',');

type VoterLoginRow = {
  id: string;
  matric_number: string;
  full_name: string;
  department: string;
  level: string;
  email: string;
  phone: string;
  is_eligible: boolean;
  is_accredited: boolean;
  has_voted: boolean;
  accreditation_time: string | null;
  voted_time: string | null;
  ballot_receipt_hash: string | null;
  avatar_url: string | null;
  verification_status: string | null;
  voter_pin: string | null;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const identifier = String(payload.identifier ?? '').trim().toUpperCase();
    const credential = String(payload.credential ?? '').trim();
    if (!identifier || !credential) {
      return NextResponse.json({ success: false, message: 'Voter credentials are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const firstLookup = await supabase
      .from('voters')
      .select(`${voterFields}, voter_pin`)
      .eq('matric_number', identifier)
      .maybeSingle();
    const emailLookup = firstLookup.data ? null : await supabase
      .from('voters')
      .select(`${voterFields}, voter_pin`)
      .eq('email', identifier.toLowerCase())
      .maybeSingle();
    const voter = (firstLookup.data || emailLookup?.data) as VoterLoginRow | null;
    const lookupError = firstLookup.error || emailLookup?.error;

    if (lookupError || !voter) {
      return NextResponse.json({ success: false, message: 'Student record not found.' }, { status: 404 });
    }
    if (!voter.is_eligible) {
      return NextResponse.json({ success: false, message: 'Student record flagged as ineligible.' }, { status: 403 });
    }
    if (voter.has_voted) {
      return NextResponse.json({ success: false, message: 'This voter has already cast a ballot and cannot vote again.' }, { status: 403 });
    }
    if (!voter.is_accredited || !voter.voter_pin) {
      return NextResponse.json({ success: false, message: 'Voter accreditation is required before login.' }, { status: 403 });
    }
    if (credential !== voter.voter_pin) {
      return NextResponse.json({ success: false, message: 'Invalid voter PIN.' }, { status: 401 });
    }

    const { voter_pin: _voterPin, ...safeVoter } = voter;
    return NextResponse.json({
      success: true,
      session: createVoterSession(voter.id),
      voter: safeVoter,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Voter authentication is unavailable.' }, { status: 503 });
  }
}