import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const payload = await request.json();
    const required = ['fullName', 'positionId', 'department', 'level'];
    if (!required.every((field) => payload[field])) return NextResponse.json({ success: false, message: 'Candidate name, position, department and level are required.' }, { status: 400 });
    const photoUrl = String(payload.photoUrl ?? '').trim();
    if (photoUrl && !/^data:image\/(jpeg|png|webp);base64,/.test(photoUrl)) return NextResponse.json({ success: false, message: 'Candidate photo must be a valid JPEG, PNG, or WebP image under 2 MB.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const position = await supabase.from('positions').select('id').eq('id', payload.positionId).maybeSingle();
    if (position.error || !position.data) return NextResponse.json({ success: false, message: 'The selected election position no longer exists. Refresh and choose a valid position.' }, { status: 400 });
    const candidate = {
      id: `cand-${crypto.randomUUID()}`, position_id: payload.positionId, full_name: String(payload.fullName).trim(), department: payload.department, level: payload.level,
      cgpa_range: payload.cgpaRange || 'N/A', photo_url: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      tagline: payload.tagline || '', manifesto: Array.isArray(payload.manifesto) ? payload.manifesto.join('|') : 'Campaigning for student welfare and excellence.',
      running_mate_name: null, running_mate_department: null, running_mate_level: null, votes_count: 0, approved_by_eleco: 1,
    };
    const result = await supabase.from('candidates').insert(candidate as never);
    if (result.error) return NextResponse.json({ success: false, message: 'Candidate could not be created.' }, { status: 503 });
    return NextResponse.json({ success: true, candidate: { id: candidate.id, positionId: candidate.position_id, fullName: candidate.full_name, votesCount: 0, approvedByEleco: true } });
  } catch { return NextResponse.json({ success: false, message: 'Candidate creation is unavailable.' }, { status: 503 }); }
}