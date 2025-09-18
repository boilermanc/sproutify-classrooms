-- Migration: Create plantings table
-- This table stores planting information and must be created before other migrations that reference it

create table if not exists public.plantings (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  tower_id uuid not null,
  port_number integer,
  catalog_id uuid,
  name text not null,
  quantity integer not null default 1,
  seeded_at date,
  planted_at date,
  growth_rate text,
  expected_harvest_date date,
  outcome text,
  status text not null default 'active'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint plantings_pkey primary key (id)
);

-- Enable RLS on plantings table
alter table public.plantings enable row level security;

-- Grant permissions
grant all on table public.plantings to anon;
grant all on table public.plantings to authenticated;
grant all on table public.plantings to service_role;

-- Create basic RLS policies for plantings table
-- Allow authenticated users to view plantings
create policy "Authenticated users can view plantings"
on public.plantings
for select
to authenticated
using (true);

-- Allow authenticated users to create plantings
create policy "Authenticated users can create plantings"
on public.plantings
for insert
to authenticated
with check (true);

-- Add indexes for performance
create index if not exists idx_plantings_teacher_id on public.plantings(teacher_id);
create index if not exists idx_plantings_tower_id on public.plantings(tower_id);
create index if not exists idx_plantings_catalog_id on public.plantings(catalog_id);
create index if not exists idx_plantings_status on public.plantings(status);

