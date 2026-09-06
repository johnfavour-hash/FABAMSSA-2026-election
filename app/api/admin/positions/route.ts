import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';
import { writeAuditLog } from '../../../../lib/audit-log';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const payload = await request.json();
    const title = String(payload.title ?? '').trim();
    const description = String(payload.description ?? '').trim() || `${title} office.`;
    const maxSelections = Number(payload.maxSelections || 1);
    if (!title) return NextResponse.json({ success: false, message: 'Position title is required.' }, { status: 400 });
    if (!Number.isInteger(maxSelections) || maxSelections < 1) return NextResponse.json({ success: false, message: 'Position selection limit is invalid.' }, { status: 400 });
    const supabase = getSupabaseAdmin();
    const orderResult = await supabase.from('positions').select('order_index').order('order_index', { ascending: false }).limit(1).maybeSingle();
    const last = orderResult.data as { order_index: number } | null;
    const position = { id: `pos-${crypto.randomUUID()}`, title, description, order_index: (last?.order_index || 0) + 1, max_selections: maxSelections };
    const result = await supabase.from('positions').insert(position as never);
    if (result.error) return NextResponse.json({ success: false, message: 'Position could not be created.' }, { status: 503 });
    await writeAuditLog('Position created', 'ELECO Administrator', 'ADMIN', `New election office created: ${title}.`);
    return NextResponse.json({ success: true, position: { id: position.id, title, description, order: position.order_index, maxSelections } });
  } catch { return NextResponse.json({ success: false, message: 'Position creation is unavailable.' }, { status: 503 }); }
}