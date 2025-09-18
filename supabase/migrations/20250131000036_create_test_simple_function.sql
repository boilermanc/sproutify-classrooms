-- Create a simple test function to verify RPC calls work
CREATE OR REPLACE FUNCTION public.test_simple()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 'Hello from function'::text;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.test_simple() TO anon, authenticated, service_role;
