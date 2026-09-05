create table if not exists public.election_state (
  id integer primary key check (id = 1),
  status text not null,
  start_time text,
  end_time text,
  duration_minutes integer not null default 120,
  results_status text not null default 'DRAFT',
  published_at text,
  published_by text,
  certified_at text,
  certified_by text,
  admin_passcode text not null,
  admin_name text not null default 'Administrator',
  admin_avatar_url text,
  updated_at text not null
);

create table if not exists public.positions (
  id text primary key,
  title text not null,
  description text not null,
  order_index integer not null,
  max_selections integer not null
);

create table if not exists public.candidates (
  id text primary key,
  position_id text not null references public.positions(id),
  full_name text not null,
  department text not null,
  level text not null,
  cgpa_range text,
  photo_url text,
  tagline text,
  manifesto text,
  running_mate_name text,
  running_mate_department text,
  running_mate_level text,
  votes_count integer not null default 0,
  approved_by_eleco integer not null default 1
);

create table if not exists public.voters (
  id text primary key,
  matric_number text not null unique,
  full_name text not null,
  department text not null,
  level text not null,
  email text not null,
  phone text not null,
  is_eligible integer not null default 1,
  is_accredited integer not null default 0,
  has_voted integer not null default 0,
  voter_pin text,
  accreditation_time text,
  voted_time text,
  ballot_receipt_hash text,
  avatar_url text,
  verification_status text,
  registered_at text,
  rejection_reason text,
  id_card_url text,
  registration_id text,
  review_notes text
);

create table if not exists public.audit_logs (
  id text primary key,
  timestamp text not null,
  action text not null,
  actor text not null,
  encrypted_hash text not null,
  category text not null,
  details text
);

create table if not exists public.admin_profiles (
  id text primary key,
  email text not null unique,
  full_name text not null,
  avatar_url text,
  role text not null default 'Election Administrator',
  created_at text not null,
  updated_at text not null
);

create table if not exists public.commission_members (
  id text primary key,
  initials text not null,
  name text not null,
  role text not null,
  order_index integer not null default 0
);

create table if not exists public.department_stats (
  department text primary key,
  eligible integer not null,
  accredited integer not null,
  voted integer not null
);

create table if not exists public.position_reviews (
  position_id text primary key references public.positions(id),
  reviewed_at text,
  reviewed_by text
);

insert into public.election_state (id, status, duration_minutes, admin_passcode, updated_at)
values (1, 'STANDBY', 120, 'CHANGE_THIS_ADMIN_PASSCODE', now()::text)
on conflict (id) do nothing;

insert into public.department_stats (department, eligible, accredited, voted)
values ('Anatomy', 0, 0, 0), ('Psychology', 0, 0, 0)
on conflict (department) do nothing;

insert into public.commission_members (id, initials, name, role, order_index)
values
  ('ec', 'EC', 'Dr. Samuel Ojo', 'Chief Electoral Officer', 1),
  ('ro', 'RO', 'Prof. Grace Nnamdi', 'Returning Officer', 2)
on conflict (id) do nothing;