-- Migration: Create towers table
-- This table stores tower information and must be created before other migrations that reference it

create table if not exists public.towers (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null,
  ports integer not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint towers_pkey primary key (id)
);

-- Enable RLS on towers table
alter table public.towers enable row level security;

-- Grant permissions
grant all on table public.towers to anon;
grant all on table public.towers to authenticated;
grant all on table public.towers to service_role;

-- Create basic RLS policies for towers table
-- Allow authenticated users to view towers
create policy "Authenticated users can view towers"
on public.towers
for select
to authenticated
using (true);

-- Allow authenticated users to create towers
create policy "Authenticated users can create towers"
on public.towers
for insert
to authenticated
with check (true);

-- Add indexes for performance
create index if not exists idx_towers_teacher_id on public.towers(teacher_id);
create index if not exists idx_towers_name on public.towers(name);

