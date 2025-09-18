-- Create a wrapper view that calls the get_tower_resources function
-- This sometimes helps with schema detection issues
CREATE OR REPLACE VIEW public.v_tower_resources AS
SELECT 
  t.id as tower_id,
  t.name as tower_name,
  t.created_at,
  t.ports,
  public.get_tower_resources(t.id) as resources
FROM towers t;

-- Grant select permissions
GRANT SELECT ON public.v_tower_resources TO anon, authenticated, service_role;
