import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const positionId = String((await request.json()).positionId ?? '');
    if (!positionId) return NextResponse.json({ success: false, message: 'Position ID required.' }, { status: 400 });
    const now = new Date().toISOString();
    const result = await getSupabaseAdmin().from('position_reviews').upsert({ position_id: positionId, reviewed_at: now, reviewed_by: 'ELECO Administrator' } as never);
    if (result.error) return NextResponse.json({ success: false, message: 'Position review could not be saved.' }, { status: 503 });
    await writeAuditLog('Position results reviewed', 'ELECO Administrator', 'ADMIN', `Position ${positionId} marked as reviewed.`);
    return NextResponse.json({ success: true, positionId });
  } catch { return NextResponse.json({ success: false, message: 'Position review is unavailable.' }, { status: 503 }); }
}