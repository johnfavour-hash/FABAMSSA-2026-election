import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { createAdminSession } from '../../../../lib/admin-session';

export const dynamic = 'force-dynamic';

type ElectionAdminRow = {
  admin_passcode: string;
};

type AdminProfileRow = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const passcode = String(payload.passcode ?? '').trim();
    const name = String(payload.adminName ?? '').trim();
    const email = String(payload.email ?? '').trim().toLowerCase();
    if (!passcode || !email || !email.includes('@')) {
      return NextResponse.json({ success: false, message: 'Administrator credentials are required.' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const stateResult = await supabase
      .from('election_state')
      .select('admin_passcode')
      .eq('id', 1)
      .single();
    const state = stateResult.data as ElectionAdminRow | null;
    if (stateResult.error || !state || passcode !== state.admin_passcode) {
      return NextResponse.json({ success: false, message: 'Invalid administrative credentials.' }, { status: 401 });
    }

    const existingResult = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, avatar_url')
      .eq('email', email)
      .maybeSingle();
    let profile = existingResult.data as AdminProfileRow | null;

    if (!profile) {
      const profileResult = await supabase
        .from('admin_profiles')
        .insert({
          id: `admin-${crypto.randomUUID()}`,
          email,
          full_name: name || 'Administrator',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as never)
        .select('id, email, full_name, avatar_url')
        .single();
      profile = profileResult.data as AdminProfileRow | null;
      if (profileResult.error || !profile) {
        return NextResponse.json({ success: false, message: 'Administrator profile could not be created.' }, { status: 503 });
      }
    } else if (name && name !== profile.full_name) {
      await supabase
        .from('admin_profiles')
        .update({ full_name: name, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      profile = { ...profile, full_name: name };
    }

    return NextResponse.json({
      success: true,
      message: 'Admin authorized.',
      session: createAdminSession(profile.id, profile.email),
      adminName: profile.full_name,
      adminEmail: profile.email,
      adminAvatarUrl: profile.avatar_url,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Administrator authentication is unavailable.' }, { status: 503 });
  }
}