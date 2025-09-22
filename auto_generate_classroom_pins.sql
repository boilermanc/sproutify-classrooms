-- Auto-generate unique classroom PINs
-- This ensures every classroom gets a unique PIN automatically

-- Step 1: Create a function to generate unique PINs
CREATE OR REPLACE FUNCTION generate_unique_classroom_pin()
RETURNS TEXT AS $$
DECLARE
    new_pin TEXT;
    pin_exists BOOLEAN;
    attempts INTEGER := 0;
    max_attempts INTEGER := 1000;
BEGIN
    LOOP
        -- Generate a random 4-digit PIN
        new_pin := LPAD((FLOOR(RANDOM() * 9000) + 1000)::INTEGER::TEXT, 4, '0');
        
        -- Check if this PIN already exists
        SELECT EXISTS(SELECT 1 FROM public.classrooms WHERE kiosk_pin = new_pin) INTO pin_exists;
        
        -- If PIN doesn't exist, we can use it
        IF NOT pin_exists THEN
            RETURN new_pin;
        END IF;
        
        -- Prevent infinite loop
        attempts := attempts + 1;
        IF attempts >= max_attempts THEN
            RAISE EXCEPTION 'Could not generate unique PIN after % attempts', max_attempts;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Add a trigger to auto-generate PINs on insert
CREATE OR REPLACE FUNCTION auto_generate_classroom_pin()
RETURNS TRIGGER AS $$
BEGIN
    -- Only generate PIN if one wasn't provided or if it's empty
    IF NEW.kiosk_pin IS NULL OR NEW.kiosk_pin = '' THEN
        NEW.kiosk_pin := generate_unique_classroom_pin();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_auto_generate_classroom_pin ON public.classrooms;
CREATE TRIGGER trigger_auto_generate_classroom_pin
    BEFORE INSERT ON public.classrooms
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_classroom_pin();

-- Step 3: Fix existing duplicates by regenerating PINs deterministically
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

-- Step 4: Add format validation (4 digits) first
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'classrooms_kiosk_pin_format_check') THEN 
        ALTER TABLE public.classrooms ADD CONSTRAINT classrooms_kiosk_pin_format_check CHECK (kiosk_pin ~ '^[0-9]{4}$'); 
    END IF; 
END $$;

-- Step 5: Add unique constraint to prevent future duplicates
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'classrooms_kiosk_pin_unique') THEN 
        ALTER TABLE public.classrooms ADD CONSTRAINT classrooms_kiosk_pin_unique UNIQUE (kiosk_pin); 
    END IF; 
END $$;

-- Step 6: Verify results
SELECT 
    id,
    name,
    kiosk_pin,
    teacher_id,
    created_at
FROM public.classrooms 
ORDER BY kiosk_pin;
