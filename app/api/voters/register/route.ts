import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

const allowedDepartments = new Set(['Anatomy', 'Psychology']);
const allowedLevels = new Set(['100L', '200L', '300L']);

type ExistingVoterRow = { id: string };
type DepartmentStatsRow = { eligible: number; accredited: number; voted: number };

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const requiredFields = ['matricNumber', 'fullName', 'department', 'level', 'email', 'phone'];
    if (!requiredFields.every((field) => payload[field])) {
      return NextResponse.json({ success: false, message: 'Missing voter registration data.' }, { status: 400 });
    }
    if (!allowedDepartments.has(payload.department) || !allowedLevels.has(payload.level)) {
      return NextResponse.json({ success: false, message: 'Only Anatomy and Psychology students from 100L to 300L may register.' }, { status: 400 });
    }

    const idCardUrl = String(payload.idCardUrl ?? '').trim();
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(idCardUrl)) {
      return NextResponse.json({ success: false, message: 'A clear image of your UNIPORT Student ID or recent Course Form is required.' }, { status: 400 });
    }
    if (idCardUrl.length > 7_000_000) {
      return NextResponse.json({ success: false, message: 'The uploaded document must be 5 MB or smaller.' }, { status: 413 });
    }

    const matricNumber = String(payload.matricNumber).trim().toUpperCase();
    const supabase = getSupabaseAdmin();
    const existingResult = await supabase.from('voters').select('id').eq('matric_number', matricNumber).maybeSingle();
    const existing = existingResult.data as ExistingVoterRow | null;
    if (existingResult.error) {
      return NextResponse.json({ success: false, message: 'Voter registration is unavailable.' }, { status: 503 });
    }
    if (existing) {
      return NextResponse.json({ success: false, message: 'Voter already exists.' }, { status: 409 });
    }

    const now = new Date().toISOString();
    const insertResult = await supabase.from('voters').insert({
      id: `voter-${crypto.randomUUID()}`,
      matric_number: matricNumber,
      full_name: String(payload.fullName).trim(),
      department: payload.department,
      level: payload.level,
      email: String(payload.email).trim().toLowerCase(),
      phone: String(payload.phone).trim(),
      is_eligible: 0,
      is_accredited: 0,
      has_voted: 0,
      voter_pin: null,
      accreditation_time: null,
      voted_time: null,
      ballot_receipt_hash: null,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      verification_status: 'pending',
      registered_at: now,
      rejection_reason: null,
      id_card_url: idCardUrl,
      registration_id: null,
      review_notes: null,
    } as never);
    if (insertResult.error) {
      const duplicate = insertResult.error.code === '23505';
      return NextResponse.json({
        success: false,
        message: duplicate ? 'Voter already exists.' : 'Voter registration could not be saved.',
      }, { status: duplicate ? 409 : 503 });
    }

    const statsResult = await supabase.from('department_stats').select('eligible, accredited, voted').eq('department', payload.department).maybeSingle();
    const stats = statsResult.data as DepartmentStatsRow | null;
    if (stats) {
      await supabase.from('department_stats').update({
        eligible: stats.eligible + 1,
        accredited: stats.accredited,
        voted: stats.voted,
      } as never).eq('department', payload.department);
    }

    return NextResponse.json({ success: true, message: 'Voter registration submitted successfully. Awaiting admin approval.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Voter registration is unavailable.' }, { status: 503 });
  }
}