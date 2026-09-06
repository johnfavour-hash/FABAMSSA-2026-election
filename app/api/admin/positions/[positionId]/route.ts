import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../../lib/admin-session';

export async function DELETE(request: Request, context: { params: Promise<{ positionId: string }> }) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const { positionId } = await context.params;
    const supabase = getSupabaseAdmin();
    const existing = await supabase.from('positions').select('id').eq('id', positionId).maybeSingle();
    if (existing.error || !existing.data) return NextResponse.json({ success: false, message: 'Position not found.' }, { status: 404 });
    const candidates = await supabase.from('candidates').select('id').eq('position_id', positionId).limit(1);
    if (candidates.data?.length) return NextResponse.json({ success: false, message: 'Remove all candidates from this position before deleting it.' }, { status: 409 });
    const result = await supabase.from('positions').delete().eq('id', positionId);
    if (result.error) return NextResponse.json({ success: false, message: 'Position could not be deleted.' }, { status: 503 });
    return NextResponse.json({ success: true, positionId });
  } catch { return NextResponse.json({ success: false, message: 'Position deletion is unavailable.' }, { status: 503 }); }
}