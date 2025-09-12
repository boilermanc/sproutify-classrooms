-- Add is_selected_for_network column to classrooms table
ALTER TABLE public.classrooms 
ADD COLUMN IF NOT EXISTS is_selected_for_network boolean NOT NULL DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_classrooms_is_selected_for_network 
ON public.classrooms(is_selected_for_network);

-- Create index for teacher_id and is_selected_for_network combination
CREATE INDEX IF NOT EXISTS idx_classrooms_teacher_selected 
ON public.classrooms(teacher_id, is_selected_for_network);
