import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export const dynamic = 'force-dynamic';

function generatePin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

type VoterAccreditationRow = {
  id: string;
  department: string;
  is_accredited: boolean | number;
  voter_pin: string | null;
  accreditation_time: string | null;
};

type DepartmentStatsRow = {
  eligible: number;
  accredited: number;
};

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) {
      return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    }

    const payload = await request.json();
    const matricNumber = String(payload.matricNumber ?? '').trim().toUpperCase();
    if (!matricNumber) {
      return NextResponse.json({ success: false, message: 'Matriculation number is required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const voterResult = await supabase
      .from('voters')
      .select('id, department, is_accredited, voter_pin, accreditation_time')
      .eq('matric_number', matricNumber)
      .maybeSingle();
    const voter = voterResult.data as VoterAccreditationRow | null;
    if (voterResult.error || !voter) {
      return NextResponse.json({ success: false, message: 'Voter not found.' }, { status: 404 });
    }
    if (voter.is_accredited) {
      return NextResponse.json({
        success: true,
        message: 'Voter already accredited.',
        pin: voter.voter_pin,
        accreditationTime: voter.accreditation_time,
      });
    }

    const pin = generatePin();
    const accreditationTime = new Date().toISOString();
    const updateResult = await supabase
      .from('voters')
      .update({
        is_eligible: 1,
        is_accredited: 1,
        voter_pin: pin,
        accreditation_time: accreditationTime,
        verification_status: 'approved',
      } as never)
      .eq('id', voter.id);
    if (updateResult.error) {
      return NextResponse.json({ success: false, message: 'Voter accreditation could not be saved.' }, { status: 503 });
    }

    const statsResult = await supabase.from('department_stats').select('eligible, accredited').eq('department', voter.department).maybeSingle();
    const stats = statsResult.data as DepartmentStatsRow | null;
    if (stats) {
      await supabase.from('department_stats').update({
        eligible: stats.eligible + 1,
        accredited: stats.accredited + 1,
      } as never).eq('department', voter.department);
    }
    await writeAuditLog('Student Voter Accredited', 'ELECO Registry', 'ACCREDITATION', `Biometric PIN generated for Matric: ${matricNumber}`);

    return NextResponse.json({ success: true, message: 'Accreditation verified successfully.', pin, accreditationTime }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Voter accreditation is unavailable.' }, { status: 503 });
  }
}