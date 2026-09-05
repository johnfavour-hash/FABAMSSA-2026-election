create or replace function public.submit_ballot(voter_id text, votes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  voter_record voters%rowtype;
  election_record election_state%rowtype;
  vote_entry record;
  candidate_record candidates%rowtype;
  receipt text;
begin
  select * into voter_record
  from voters
  where id = submit_ballot.voter_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'message', 'Voter not found.');
  end if;

  if voter_record.has_voted <> 0 then
    return jsonb_build_object('success', false, 'message', 'Voter has already cast a ballot.');
  end if;

  select * into election_record
  from election_state
  where id = 1
  for update;

  if election_record.status <> 'LIVE' then
    return jsonb_build_object('success', false, 'message', 'Voting is not currently open.');
  end if;

  if election_record.end_time is not null and now() >= election_record.end_time::timestamptz then
    update election_state
    set status = 'CLOSED', updated_at = now()::text
    where id = 1;
    return jsonb_build_object('success', false, 'message', 'The voting window has closed.');
  end if;

  if jsonb_typeof(votes) <> 'object' then
    return jsonb_build_object('success', false, 'message', 'Ballot selections are invalid.');
  end if;

  for vote_entry in select key as position_id, value #>> '{}' as candidate_id from jsonb_each(votes)
  loop
    select * into candidate_record
    from candidates
    where id = vote_entry.candidate_id
      and position_id = vote_entry.position_id
      and approved_by_eleco <> 0;

    if not found then
      return jsonb_build_object('success', false, 'message', 'Ballot contains an invalid selection.');
    end if;

    if not exists (
      select 1 from positions
      where id = vote_entry.position_id and max_selections = 1
    ) then
      return jsonb_build_object('success', false, 'message', 'Ballot contains an invalid selection.');
    end if;
  end loop;

  receipt := '0x' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 28));

  for vote_entry in select value #>> '{}' as candidate_id from jsonb_each(votes)
  loop
    update candidates
    set votes_count = votes_count + 1
    where id = vote_entry.candidate_id;
  end loop;

  update voters
  set has_voted = 1,
      voted_time = now()::text,
      ballot_receipt_hash = receipt
  where id = voter_record.id;

  update department_stats
  set voted = voted + 1
  where department = voter_record.department;

  insert into audit_logs (id, timestamp, action, actor, encrypted_hash, category, details)
  values (
    'log-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text,
    now()::text,
    'Confidential Ballot Cast & Verified',
    'Voter Session',
    receipt,
    'VOTE',
    'One-student-one-ballot submission confirmed.'
  );

  return jsonb_build_object('success', true, 'receiptHash', receipt, 'message', 'Vote cast successfully.');
end;
$$;

revoke all on function public.submit_ballot(text, jsonb) from public;