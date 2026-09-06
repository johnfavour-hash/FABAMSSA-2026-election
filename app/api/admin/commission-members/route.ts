import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const members = (await request.json()).members;
    if (!Array.isArray(members) || !members.length) return NextResponse.json({ success: false, message: 'At least one commission member is required.' }, { status: 400 });
    const normalized = members.map((member, index) => ({ id: String(member.id || `member-${crypto.randomUUID()}`), initials: String(member.initials || '').trim().slice(0, 5), name: String(member.name || '').trim(), role: String(member.role || '').trim(), order_index: index }));
    if (normalized.some((member) => !member.initials || !member.name || !member.role)) return NextResponse.json({ success: false, message: 'Each member needs initials, name, and role.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const clear = await supabase.from('commission_members').delete().neq('id', '');
    if (clear.error) return NextResponse.json({ success: false, message: 'Commission roster could not be cleared.' }, { status: 503 });
    const result = await supabase.from('commission_members').insert(normalized as never);
    if (result.error) return NextResponse.json({ success: false, message: 'Commission roster could not be saved.' }, { status: 503 });
    await writeAuditLog('Electoral Commission roster updated', 'ELECO Administrator', 'ADMIN', `${normalized.length} commission members configured.`);
    return NextResponse.json({ success: true, commissionMembers: normalized.map(({ id, initials, name, role }) => ({ id, initials, name, role })) });
  } catch { return NextResponse.json({ success: false, message: 'Commission roster is unavailable.' }, { status: 503 }); }
}