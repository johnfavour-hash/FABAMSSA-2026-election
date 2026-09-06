import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../../lib/admin-session';
import { writeAuditLog } from '../../../../../lib/audit-log';

export async function DELETE(request: Request, context: { params: Promise<{ voterId: string }> }) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const { voterId } = await context.params;
    const supabase = getSupabaseAdmin();
    const voterResult = await supabase.from('voters').select('department, is_eligible, is_accredited, has_voted').eq('id', voterId).maybeSingle();
    const voter = voterResult.data as { department: string; is_eligible: number; is_accredited: number; has_voted: number } | null;
    if (voterResult.error || !voter) return NextResponse.json({ success: false, message: 'Voter not found.' }, { status: 404 });
    const deleted = await supabase.from('voters').delete().eq('id', voterId);
    if (deleted.error) return NextResponse.json({ success: false, message: 'Voter could not be deleted.' }, { status: 503 });
    const stats = await supabase.from('department_stats').select('eligible, accredited, voted').eq('department', voter.department).maybeSingle();
    const current = stats.data as { eligible: number; accredited: number; voted: number } | null;
    if (current) await supabase.from('department_stats').update({ eligible: Math.max(0, current.eligible - Number(voter.is_eligible)), accredited: Math.max(0, current.accredited - Number(voter.is_accredited)), voted: Math.max(0, current.voted - Number(voter.has_voted)) } as never).eq('department', voter.department);
    await writeAuditLog('Voter deleted', 'ELECO Administrator', 'ADMIN', `Voter removed: ${voterId}.`);
    return NextResponse.json({ success: true, voterId });
  } catch { return NextResponse.json({ success: false, message: 'Voter deletion is unavailable.' }, { status: 503 }); }
}