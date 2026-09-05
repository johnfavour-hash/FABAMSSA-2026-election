import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../lib/supabase/admin';

export const dynamic = 'force-dynamic';

const publicVoterFields = [
  'id',
  'matric_number',
  'full_name',
  'department',
  'level',
  'is_eligible',
  'is_accredited',
  'has_voted',
  'verification_status',
  'registered_at',
].join(',');

type ElectionStateRow = {
  status: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  results_status: string;
  published_at: string | null;
  published_by: string | null;
  certified_at: string | null;
  certified_by: string | null;
  updated_at: string;
};

type DepartmentStatRow = {
  department: string;
  eligible: number;
  accredited: number;
  voted: number;
};

type PublicVoterRow = {
  department: string;
  is_eligible: boolean | number;
  is_accredited: boolean | number;
  has_voted: boolean | number;
};

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const [stateResult, candidatesResult, positionsResult, votersResult, statsResult, membersResult] = await Promise.all([
      supabase
        .from('election_state')
        .select('status, start_time, end_time, duration_minutes, results_status, published_at, published_by, certified_at, certified_by, updated_at')
        .eq('id', 1)
        .single(),
      supabase.from('candidates').select('*').order('id'),
      supabase.from('positions').select('id, title, description, order_index, max_selections').order('order_index'),
      supabase.from('voters').select(publicVoterFields).order('full_name'),
      supabase.from('department_stats').select('*').order('department'),
      supabase.from('commission_members').select('id, initials, name, role').order('order_index').order('name'),
    ]);

    const failedResult = [stateResult, candidatesResult, positionsResult, votersResult, statsResult, membersResult]
      .find((result) => result.error);
    if (failedResult?.error) {
      return NextResponse.json({ error: 'Election data could not be loaded.' }, { status: 503 });
    }

    const state = stateResult.data as ElectionStateRow | null;
    if (!state) {
      return NextResponse.json({ error: 'Election state not found.' }, { status: 404 });
    }

    let status = state.status;
    if (status === 'LIVE' && state.end_time && new Date(state.end_time).getTime() <= Date.now()) {
      status = 'CLOSED';
    }

    const storedDepartmentStats = Object.fromEntries(
      ((statsResult.data ?? []) as DepartmentStatRow[]).map((row) => [row.department, {
        eligible: row.eligible,
        accredited: row.accredited,
        voted: row.voted,
      }]),
    );
    const departmentStats = Object.fromEntries(
      Object.entries((votersResult.data ?? []).reduce<Record<string, { eligible: number; accredited: number; voted: number }>>((stats, voter) => {
        const row = voter as PublicVoterRow;
        const department = row.department;
        stats[department] ||= { eligible: 0, accredited: 0, voted: 0 };
        if (Boolean(row.is_eligible)) stats[department].eligible += 1;
        if (Boolean(row.is_accredited)) stats[department].accredited += 1;
        if (Boolean(row.has_voted)) stats[department].voted += 1;
        return stats;
      }, {})).map(([department, counts]) => [department, {
        eligible: counts.eligible,
        accredited: counts.accredited,
        voted: counts.voted,
      }]),
    );

    return NextResponse.json({
      ...state,
      status,
      candidates: candidatesResult.data ?? [],
      positions: positionsResult.data ?? [],
      voters: votersResult.data ?? [],
      audit_logs: [],
      department_stats: Object.keys(departmentStats).length ? departmentStats : storedDepartmentStats,
      commission_members: membersResult.data ?? [],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'Election data could not be loaded.' }, { status: 503 });
  }
}