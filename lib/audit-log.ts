import { getSupabaseAdmin } from './supabase/admin';

export async function writeAuditLog(action: string, actor: string, category: string, details = '') {
  const result = await getSupabaseAdmin().from('audit_logs').insert({
    id: `log-${crypto.randomUUID()}`,
    timestamp: new Date().toISOString(),
    action,
    actor,
    encrypted_hash: `0x${crypto.randomUUID().replace(/-/g, '').slice(0, 28).toUpperCase()}`,
    category,
    details,
  } as never);
  if (result.error) throw result.error;
}