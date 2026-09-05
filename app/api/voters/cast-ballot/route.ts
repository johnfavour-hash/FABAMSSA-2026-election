import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '../../../../lib/supabase/admin';
import { readVoterSession } from '../../../../lib/voter-session';

export const dynamic = 'force-dynamic';

type BallotResult = {
  success: boolean;
  receiptHash?: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const session = readVoterSession(request.headers.get('X-Voter-Session') || '');
    if (!session) {
      return NextResponse.json({ success: false, message: 'Voter session is missing or expired.' }, { status: 401 });
    }

    const payload = await request.json();
    if (payload.voterId !== session || !payload.votes || typeof payload.votes !== 'object' || Array.isArray(payload.votes)) {
      return NextResponse.json({ success: false, message: 'Ballot selections are invalid.' }, { status: 400 });
    }

    const rpcArguments = {
      voter_id: session,
      votes: payload.votes as Record<string, string>,
    } as never;
    const { data, error } = await getSupabaseAdmin().rpc('submit_ballot', rpcArguments);
    if (error) {
      return NextResponse.json({ success: false, message: 'Ballot submission is unavailable.' }, { status: 503 });
    }

    const result = data as BallotResult | null;
    if (!result?.success) {
      return NextResponse.json(result || { success: false, message: 'Ballot submission rejected.' }, { status: 403 });
    }

    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, message: 'Ballot submission is unavailable.' }, { status: 503 });
  }
}