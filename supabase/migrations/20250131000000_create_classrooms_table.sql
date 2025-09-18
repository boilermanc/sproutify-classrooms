-- Migration: Create classrooms table
-- This table stores classroom information and must be created before other migrations that reference it

create table if not exists public.classrooms (
  id uuid not null default gen_random_uuid(),
  teacher_id uuid not null,
  name text not null,
  kiosk_pin text not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint classrooms_pkey primary key (id)
);

-- Enable RLS on classrooms table
alter table public.classrooms enable row level security;

-- Grant permissions
grant all on table public.classrooms to anon;
grant all on table public.classrooms to authenticated;
grant all on table public.classrooms to service_role;

-- Create basic RLS policies for classrooms table
-- Allow authenticated users to view classrooms
create policy "Authenticated users can view classrooms"
on public.classrooms
for select
to authenticated
using (true);

-- Allow authenticated users to create classrooms
create policy "Authenticated users can create classrooms"
on public.classrooms
for insert
to authenticated
with check (true);

-- Add indexes for performance
create index if not exists idx_classrooms_teacher_id on public.classrooms(teacher_id);
create index if not exists idx_classrooms_name on public.classrooms(name);
create index if not exists idx_classrooms_kiosk_pin on public.classrooms(kiosk_pin);

