import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readAdminSession } from '../../../../lib/admin-session';

export async function GET(request: Request) {
  try {
    if (!readAdminSession(request.headers.get('X-Admin-Session') || '')) return NextResponse.json({ success: false, message: 'Administrator login required.' }, { status: 401 });
    const supabase = getSupabaseAdmin();
    const [stateResult, votersResult, positionsResult, reviewsResult, candidatesResult] = await Promise.all([
      supabase.from('election_state').select('status').eq('id', 1).single(),
      supabase.from('voters').select('has_voted'),
      supabase.from('positions').select('id'),
      supabase.from('position_reviews').select('position_id, reviewed_at'),
      supabase.from('candidates').select('position_id, full_name, votes_count'),
    ]);
    const state = stateResult.data as { status: string } | null;
    const positions = (positionsResult.data || []) as Array<{ id: string }>;
    const reviews = (reviewsResult.data || []) as Array<{ position_id: string; reviewed_at: string | null }>;
    const candidates = (candidatesResult.data || []) as Array<{ position_id: string; full_name: string; votes_count: number }>;
    const positionResults = positions.map((position) => ({ positionId: position.id, candidates: candidates.filter((candidate) => candidate.position_id === position.id).sort((a, b) => b.votes_count - a.votes_count), isReviewed: reviews.some((review) => review.position_id === position.id && review.reviewed_at) }));
    return NextResponse.json({ status: state?.status, ballotsCast: (votersResult.data || []).filter((voter) => Boolean((voter as { has_voted: number }).has_voted)).length, totalPositions: positions.length, reviewedPositions: reviews.filter((review) => review.reviewed_at).length, ballotsProcessed: ['CLOSED', 'CERTIFIED'].includes(state?.status || ''), resultsCalculated: positions.length > 0 && positionResults.every((position) => position.candidates.length > 0), positionResults });
  } catch { return NextResponse.json({ success: false, message: 'Certification readiness is unavailable.' }, { status: 503 }); }
}