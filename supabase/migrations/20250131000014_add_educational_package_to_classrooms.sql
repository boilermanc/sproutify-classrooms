-- Add educational_package column to classrooms table
-- This field stores the educational package type for each classroom

-- Add the educational_package column with a default value
ALTER TABLE public.classrooms 
ADD COLUMN IF NOT EXISTS educational_package text NOT NULL DEFAULT 'base';

-- Add a check constraint to ensure valid package types
ALTER TABLE public.classrooms 
ADD CONSTRAINT classrooms_educational_package_check 
CHECK (educational_package IN ('base', 'elementary', 'middle_school', 'high_school', 'advanced_stem'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_classrooms_educational_package 
ON public.classrooms(educational_package);

-- Add comment to explain the field
COMMENT ON COLUMN public.classrooms.educational_package IS 'Educational package type that determines which features are available for this classroom';
