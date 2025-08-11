-- Extend profiles with teacher-focused fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS school_name text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS timezone text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Create towers table
CREATE TABLE IF NOT EXISTS public.towers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  name text NOT NULL,
  ports integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and policy for towers
ALTER TABLE public.towers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their towers" ON public.towers;
CREATE POLICY "Teachers manage their towers"
ON public.towers
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

-- Trigger for updated_at on towers
DROP TRIGGER IF EXISTS update_towers_updated_at ON public.towers;
CREATE TRIGGER update_towers_updated_at
BEFORE UPDATE ON public.towers
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for towers
CREATE INDEX IF NOT EXISTS idx_towers_teacher_id ON public.towers(teacher_id);

-- Tower vitals table
CREATE TABLE IF NOT EXISTS public.tower_vitals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  ph numeric,
  ec numeric,
  light_lux integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tower_vitals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their tower vitals" ON public.tower_vitals;
CREATE POLICY "Teachers manage their tower vitals"
ON public.tower_vitals
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_tower_vitals_teacher_id ON public.tower_vitals(teacher_id);
CREATE INDEX IF NOT EXISTS idx_tower_vitals_tower_id_recorded_at ON public.tower_vitals(tower_id, recorded_at DESC);

-- Plantings table (instances of plants in specific towers/ports)
CREATE TABLE IF NOT EXISTS public.plantings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  port_number integer,
  catalog_id uuid NULL REFERENCES public.plant_catalog(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  seeded_at date,
  planted_at date,
  growth_rate text,
  expected_harvest_date date,
  outcome text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plantings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their plantings" ON public.plantings;
CREATE POLICY "Teachers manage their plantings"
ON public.plantings
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

DROP TRIGGER IF EXISTS update_plantings_updated_at ON public.plantings;
CREATE TRIGGER update_plantings_updated_at
BEFORE UPDATE ON public.plantings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_plantings_teacher_id ON public.plantings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_plantings_tower_id ON public.plantings(tower_id);

-- Pest logs table
CREATE TABLE IF NOT EXISTS public.pest_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  observed_at timestamptz NOT NULL DEFAULT now(),
  pest text NOT NULL,
  action text,
  notes text,
  severity integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pest_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their pest logs" ON public.pest_logs;
CREATE POLICY "Teachers manage their pest logs"
ON public.pest_logs
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_pest_logs_teacher_id ON public.pest_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_pest_logs_tower_id ON public.pest_logs(tower_id);

-- Harvests table
CREATE TABLE IF NOT EXISTS public.harvests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  harvested_at date NOT NULL DEFAULT now(),
  weight_grams integer NOT NULL,
  destination text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.harvests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their harvests" ON public.harvests;
CREATE POLICY "Teachers manage their harvests"
ON public.harvests
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_harvests_teacher_id ON public.harvests(teacher_id);
CREATE INDEX IF NOT EXISTS idx_harvests_tower_id ON public.harvests(tower_id);

-- Waste logs table
CREATE TABLE IF NOT EXISTS public.waste_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL,
  tower_id uuid NOT NULL REFERENCES public.towers(id) ON DELETE CASCADE,
  logged_at date NOT NULL DEFAULT now(),
  grams integer NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Teachers manage their waste logs" ON public.waste_logs;
CREATE POLICY "Teachers manage their waste logs"
ON public.waste_logs
FOR ALL
USING (teacher_id = auth.uid())
WITH CHECK (teacher_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_waste_logs_teacher_id ON public.waste_logs(teacher_id);
CREATE INDEX IF NOT EXISTS idx_waste_logs_tower_id ON public.waste_logs(tower_id);
