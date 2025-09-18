-- Migration: Create pending_invites table for teacher invitations
-- This table stores pending invitations for teachers and school admins

create table if not exists public.pending_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  role text not null check (role in ('teacher','school_admin')),
  school_id uuid references public.schools(id) on delete set null,
  district_id uuid references public.districts(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Add RLS policies
alter table public.pending_invites enable row level security;

-- School admins can view invites for their school
drop policy if exists "School admins can view invites for their school" on public.pending_invites;
create policy "School admins can view invites for their school" on public.pending_invites
  for select using (
    school_id in (
      select school_id from public.profiles 
      where id = auth.uid() 
      and school_id is not null
    )
  );

-- School admins can create invites for their school
drop policy if exists "School admins can create invites for their school" on public.pending_invites;
create policy "School admins can create invites for their school" on public.pending_invites
  for insert with check (
    school_id in (
      select school_id from public.profiles 
      where id = auth.uid() 
      and school_id is not null
    )
  );

-- District admins can view invites for their district
drop policy if exists "District admins can view invites for their district" on public.pending_invites;
create policy "District admins can view invites for their district" on public.pending_invites
  for select using (
    district_id in (
      select district_id from public.profiles 
      where id = auth.uid() 
      and district_id is not null
    )
  );

-- District admins can create invites for their district
drop policy if exists "District admins can create invites for their district" on public.pending_invites;
create policy "District admins can create invites for their district" on public.pending_invites
  for insert with check (
    district_id in (
      select district_id from public.profiles 
      where id = auth.uid() 
      and district_id is not null
    )
  );

-- Add indexes for performance
create index if not exists idx_pending_invites_email on public.pending_invites(email);
create index if not exists idx_pending_invites_school_id on public.pending_invites(school_id);
create index if not exists idx_pending_invites_district_id on public.pending_invites(district_id);
create index if not exists idx_pending_invites_role on public.pending_invites(role);
