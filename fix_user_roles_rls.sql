-- Direct SQL command to fix the user_roles RLS issue
-- Run this directly on your remote Supabase database

-- Enable Row Level Security on user_roles table
ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;
