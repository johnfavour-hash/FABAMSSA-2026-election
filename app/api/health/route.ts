import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await getSupabaseAdmin()
      .from('election_state')
      .select('id')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, message: 'Database health check failed.' }, { status: 503 });
    }

    return NextResponse.json({ ok: true, storage: 'supabase' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, message: 'Supabase server environment is not configured.' }, { status: 503 });
  }
}