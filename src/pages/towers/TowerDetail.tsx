-- Create the 'towers' table
CREATE TABLE public.towers (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL,
  name TEXT NOT NULL,
  ports INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT towers_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;

-- Index for faster lookup by teacher_id
CREATE INDEX IF NOT EXISTS idx_towers_teacher_id
ON public.towers USING btree (teacher_id)
TABLESPACE pg_default;

-- Trigger function to auto-update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update 'updated_at' on row updates
CREATE TRIGGER update_towers_updated_at
BEFORE UPDATE ON public.towers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
