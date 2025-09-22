-- Comprehensive fix for classroom PIN duplicates
-- This script addresses both existing duplicates and prevents future ones

-- Step 1: First, let's see what duplicates exist
SELECT 
    kiosk_pin,
    COUNT(*) as duplicate_count,
    STRING_AGG(name, ', ') as classroom_names,
    STRING_AGG(id::text, ', ') as classroom_ids,
    STRING_AGG(teacher_id::text, ', ') as teacher_ids
FROM public.classrooms 
GROUP BY kiosk_pin 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show all classrooms for reference
SELECT 
    id,
    name,
    kiosk_pin,
    teacher_id,
    created_at
FROM public.classrooms 
ORDER BY kiosk_pin, created_at;

-- Step 3: Fix existing duplicates by assigning unique PINs
-- This keeps the oldest classroom with each PIN and gives new PINs to newer ones
BEGIN;
LOCK TABLE public.classrooms IN SHARE ROW EXCLUSIVE MODE;

WITH duplicate_pins AS (
    SELECT kiosk_pin
    FROM public.classrooms 
    GROUP BY kiosk_pin 
    HAVING COUNT(*) > 1
),
classrooms_to_fix AS (
    SELECT 
        c.id,
        c.name,
        c.kiosk_pin,
        c.teacher_id,
        ROW_NUMBER() OVER (PARTITION BY c.kiosk_pin ORDER BY c.created_at) as rn
    FROM public.classrooms c
    INNER JOIN duplicate_pins dp ON c.kiosk_pin = dp.kiosk_pin
),
-- Generate all possible 4-digit PINs (0000-9999)
all_pins AS (
    SELECT LPAD(generate_series(0, 9999)::text, 4, '0') as pin_value
),
-- Filter out PINs that are already in use
available_pins AS (
    SELECT ap.pin_value, ROW_NUMBER() OVER (ORDER BY ap.pin_value) as pin_rank
    FROM all_pins ap
    WHERE ap.pin_value NOT IN (SELECT kiosk_pin FROM public.classrooms)
),
-- Assign available PINs to classrooms that need new ones
new_pins AS (
    SELECT 
        ctf.id,
        ctf.name,
        ctf.kiosk_pin,
        ctf.teacher_id,
        ap.pin_value as new_pin
    FROM classrooms_to_fix ctf
    JOIN available_pins ap ON ap.pin_rank = ctf.rn - 1
    WHERE ctf.rn > 1  -- Keep the first classroom with each PIN, update the rest
)
UPDATE public.classrooms 
SET kiosk_pin = np.new_pin
FROM new_pins np
WHERE classrooms.id = np.id;

COMMIT;

-- Step 4: Add unique constraint to prevent future duplicates
-- First, check if constraint already exists
DO $$
BEGIN
    -- Add unique constraint on kiosk_pin if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'classrooms_kiosk_pin_unique'
    ) THEN
        ALTER TABLE public.classrooms 
        ADD CONSTRAINT classrooms_kiosk_pin_unique 
        UNIQUE (kiosk_pin) DEFERRABLE INITIALLY DEFERRED;
        
        RAISE NOTICE 'Added unique constraint on kiosk_pin';
    ELSE
        RAISE NOTICE 'Unique constraint on kiosk_pin already exists';
    END IF;
END $$;

-- Step 5: Add a check constraint to ensure PIN format (4 digits)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'classrooms_kiosk_pin_format_check'
    ) THEN
        ALTER TABLE public.classrooms 
        ADD CONSTRAINT classrooms_kiosk_pin_format_check 
        CHECK (kiosk_pin ~ '^[0-9]{4}$');
        
        RAISE NOTICE 'Added format check constraint on kiosk_pin';
    ELSE
        RAISE NOTICE 'Format check constraint on kiosk_pin already exists';
    END IF;
END $$;

-- Step 6: Verify no duplicates remain
SELECT 
    kiosk_pin,
    COUNT(*) as count
FROM public.classrooms 
GROUP BY kiosk_pin 
HAVING COUNT(*) > 1;

-- Step 7: Show final classroom list
SELECT 
    id,
    name,
    kiosk_pin,
    teacher_id,
    created_at
FROM public.classrooms 
ORDER BY kiosk_pin, created_at;
