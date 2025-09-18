-- Migration: Create schools table
-- This table stores school information and must be created before pending_invites table

create table if not exists public.schools (
  id uuid not null default gen_random_uuid(),
  name text not null,
  district text,
  timezone text,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  constraint schools_pkey primary key (id)
);

-- Enable RLS on schools table
alter table public.schools enable row level security;

-- Grant permissions
grant all on table public.schools to anon;
grant all on table public.schools to authenticated;
grant all on table public.schools to service_role;

-- Create basic RLS policies for schools table
-- Allow authenticated users to view schools
create policy "Authenticated users can view schools"
on public.schools
for select
to authenticated
using (true);

-- Allow authenticated users to create schools
create policy "Authenticated users can create schools"
on public.schools
for insert
to authenticated
with check (true);

-- Add indexes for performance
create index if not exists idx_schools_name on public.schools(name);
create index if not exists idx_schools_district on public.schools(district);

