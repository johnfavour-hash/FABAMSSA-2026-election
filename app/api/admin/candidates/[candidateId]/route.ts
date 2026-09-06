import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../../lib/admin-session';

export async function DELETE(request: Request, context: { params: Promise<{ candidateId: string }> }) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const { candidateId } = await context.params;
    const supabase = getSupabaseAdmin();
    const existing = await supabase.from('candidates').select('id').eq('id', candidateId).maybeSingle();
    if (existing.error || !existing.data) return NextResponse.json({ success: false, message: 'Candidate not found.' }, { status: 404 });
    const result = await supabase.from('candidates').delete().eq('id', candidateId);
    if (result.error) return NextResponse.json({ success: false, message: 'Candidate could not be deleted.' }, { status: 503 });
    return NextResponse.json({ success: true, candidateId });
  } catch { return NextResponse.json({ success: false, message: 'Candidate deletion is unavailable.' }, { status: 503 }); }
}