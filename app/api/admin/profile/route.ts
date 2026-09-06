import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export async function POST(request: Request) {
  try {
    const session = readAdminSession(request.headers.get('X-Admin-Session') || '');
    if (!session) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const payload = await request.json();
    const name = String(payload.adminName ?? '').trim();
    const avatarUrl = String(payload.adminAvatarUrl ?? '').trim();
    if (!name) return NextResponse.json({ success: false, message: 'Administrator name is required.' }, { status: 400 });
    if (avatarUrl && !/^data:image\/(jpeg|png|webp);base64,/.test(avatarUrl)) return NextResponse.json({ success: false, message: 'Profile picture must be a valid JPG, PNG, or WebP image under 2 MB.' }, { status: 400 });
    const result = await getSupabaseAdmin().from('admin_profiles').update({ full_name: name, avatar_url: avatarUrl || null, updated_at: new Date().toISOString() } as never).eq('id', session.adminId);
    if (result.error) return NextResponse.json({ success: false, message: 'Administrator profile could not be saved.' }, { status: 503 });
    await writeAuditLog('Administrator profile updated', name, 'ADMIN', 'Administrator updated their own profile.');
    return NextResponse.json({ success: true, adminName: name, adminAvatarUrl: avatarUrl || null });
  } catch { return NextResponse.json({ success: false, message: 'Administrator profile is unavailable.' }, { status: 503 }); }
}