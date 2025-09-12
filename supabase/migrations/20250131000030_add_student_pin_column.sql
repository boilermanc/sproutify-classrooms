-- Add student_pin column to students table for two-factor authentication
-- This will be used alongside student name for secure kiosk login

-- Add the student_pin column
ALTER TABLE public.students 
ADD COLUMN student_pin VARCHAR(6);

-- Add a comment explaining the purpose
COMMENT ON COLUMN public.students.student_pin IS 'Student-specific PIN for two-factor authentication during kiosk login';

-- Create a unique constraint to ensure student_pin is unique within each classroom
-- This prevents duplicate PINs within the same classroom
ALTER TABLE public.students 
ADD CONSTRAINT students_unique_pin_per_classroom 
UNIQUE (classroom_id, student_pin);

-- Add a check constraint to ensure PIN is 4-6 digits
ALTER TABLE public.students 
ADD CONSTRAINT students_pin_format_check 
CHECK (student_pin IS NULL OR (student_pin ~ '^[0-9]{4,6}$'));

-- Update existing students to have NULL student_pin (they'll need to be set by teachers)
-- This is safe since the column is nullable
UPDATE public.students 
SET student_pin = NULL 
WHERE student_pin IS NULL;
