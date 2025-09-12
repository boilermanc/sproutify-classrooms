-- Fix duplicate classroom PINs issue
-- This script helps identify and resolve duplicate classroom PINs

-- Step 1: Find classrooms with duplicate PINs
SELECT 
    kiosk_pin,
    COUNT(*) as duplicate_count,
    STRING_AGG(name, ', ') as classroom_names,
    STRING_AGG(id::text, ', ') as classroom_ids
FROM public.classrooms 
GROUP BY kiosk_pin 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- Step 2: Show all classrooms with their PINs for reference
SELECT 
    id,
    name,
    kiosk_pin,
    teacher_id,
    created_at
FROM public.classrooms 
ORDER BY kiosk_pin, created_at;

-- Step 3: Generate unique PINs for classrooms with duplicates
-- (Run this after reviewing the duplicates above)
BEGIN;
LOCK TABLE public.classrooms IN SHARE ROW EXCLUSIVE MODE;

-- Create a sequence for generating unique PINs if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename = 'classroom_pin_sequence') THEN
        CREATE SEQUENCE classroom_pin_sequence START WITH GREATEST(1001, (SELECT COALESCE(MAX(kiosk_pin::int) + 1, 1001) FROM public.classrooms WHERE kiosk_pin ~ '^[0-9]{4}$'));
    END IF;
END $$;

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
        ROW_NUMBER() OVER (PARTITION BY c.kiosk_pin ORDER BY c.created_at) as rn
    FROM public.classrooms c
    INNER JOIN duplicate_pins dp ON c.kiosk_pin = dp.kiosk_pin
),
new_pins AS (
    SELECT 
        id,
        name,
        kiosk_pin,
        LPAD(nextval('classroom_pin_sequence')::text, 4, '0') as new_pin
    FROM classrooms_to_fix
    WHERE rn > 1  -- Keep the first classroom with each PIN, update the rest
)
UPDATE public.classrooms 
SET kiosk_pin = np.new_pin
FROM new_pins np
WHERE classrooms.id = np.id;

COMMIT;

-- Step 4: Verify no more duplicates exist
SELECT 
    kiosk_pin,
    COUNT(*) as count
FROM public.classrooms 
GROUP BY kiosk_pin 
HAVING COUNT(*) > 1;
