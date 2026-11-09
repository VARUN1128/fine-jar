-- ==============================================================================
-- FineTrack Migration: Progressive Monthly Fine & Payment Sync
-- ==============================================================================
-- Run this script in your Supabase Project > SQL Editor.
-- 
-- Rules:
-- 1. 1st late day in a calendar month: ₹100
-- 2. 2nd late day in that month: ₹200
-- 3. 3rd late day in that month: ₹300
-- 4. 4th late day in that month: ₹400
-- 5. 5th late day in that month: ₹500
-- 6. 6th or more late days in that month: ₹500 (capped at ₹500/day)
-- Counter resets each calendar month.
-- ==============================================================================

-- STEP 1: Add is_paid and paid_at columns if not already present
ALTER TABLE public.late_entries 
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.late_entries 
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- STEP 2: Update all existing late_entries to recalculate their progressive fine
-- This updates existing records so 2 days late = ₹100 + ₹200 = ₹300 total!
WITH ranked_entries AS (
    SELECT 
        id,
        LEAST(ROW_NUMBER() OVER (
            PARTITION BY person_id, date_trunc('month', late_date) 
            ORDER BY late_date ASC, created_at ASC
        ) * 100, 500) AS new_progressive_fine
    FROM public.late_entries
)
UPDATE public.late_entries le
SET fine_amount = re.new_progressive_fine
FROM ranked_entries re
WHERE le.id = re.id;

-- STEP 3: Create progressive fine calculation trigger for future entries
CREATE OR REPLACE FUNCTION public.calculate_and_set_progressive_fine()
RETURNS TRIGGER AS $$
DECLARE
    v_month_start DATE := date_trunc('month', NEW.late_date)::DATE;
    v_prior_count INTEGER;
BEGIN
    -- Count prior late days for this member in the same calendar month
    SELECT COUNT(*) INTO v_prior_count
    FROM public.late_entries
    WHERE person_id = NEW.person_id
      AND late_date >= v_month_start
      AND late_date < NEW.late_date
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);

    -- Calculate: 1st=100, 2nd=200, 3rd=300, 4th=400, 5th+=500
    NEW.fine_amount := LEAST((v_prior_count + 1) * 100, 500);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_progressive_fine ON public.late_entries;
CREATE TRIGGER trg_set_progressive_fine
BEFORE INSERT OR UPDATE OF late_date, person_id ON public.late_entries
FOR EACH ROW
EXECUTE FUNCTION public.calculate_and_set_progressive_fine();

-- STEP 4: Refresh people_fine_summary view with updated fine totals
CREATE OR REPLACE VIEW public.people_fine_summary AS
SELECT 
    p.id AS person_id,
    p.full_name,
    p.is_active,
    p.created_at,
    COUNT(le.id)::INTEGER AS total_late_days,
    COALESCE(SUM(le.fine_amount), 0)::INTEGER AS total_fine,
    COALESCE(SUM(CASE WHEN le.is_paid THEN le.fine_amount ELSE 0 END), 0)::INTEGER AS total_paid,
    COALESCE(SUM(CASE WHEN NOT le.is_paid THEN le.fine_amount ELSE 0 END), 0)::INTEGER AS total_outstanding,
    MAX(le.late_date) AS latest_late_date
FROM public.people p
LEFT JOIN public.late_entries le ON p.id = le.person_id
GROUP BY p.id, p.full_name, p.is_active, p.created_at;

-- STEP 5: Verify results
SELECT 
    p.full_name,
    s.total_late_days,
    s.total_fine,
    s.total_paid,
    s.total_outstanding
FROM public.people_fine_summary s
JOIN public.people p ON p.id = s.person_id
ORDER BY s.total_fine DESC;
