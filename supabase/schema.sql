-- ==============================================================================
-- FineTrack: Supabase Database Schema & RLS Setup
-- ==============================================================================

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.late_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
    late_date DATE NOT NULL,
    late_hours INTEGER NOT NULL DEFAULT 0 CHECK (late_hours >= 0),
    late_minutes INTEGER NOT NULL DEFAULT 0 CHECK (late_minutes >= 0 AND late_minutes < 60),
    fine_amount INTEGER NOT NULL DEFAULT 100 CHECK (fine_amount >= 0),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    paid_at TIMESTAMPTZ,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_person_late_date UNIQUE (person_id, late_date)
);

-- 2. Indexes for fast filtering and joins
CREATE INDEX IF NOT EXISTS idx_late_entries_date ON public.late_entries(late_date DESC);
CREATE INDEX IF NOT EXISTS idx_late_entries_person_id ON public.late_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_people_active ON public.people(is_active);

-- 3. Automatic updated_at and progressive fine calculation
-- Fine Rules:
-- 1st day in month: ₹100
-- 2nd day in month: ₹200
-- 3rd day in month: ₹300
-- 4th day in month: ₹400
-- 5th+ day in month: ₹500 (capped)
CREATE OR REPLACE FUNCTION public.calculate_progressive_fine(p_person_id UUID, p_late_date DATE)
RETURNS INTEGER AS $$
DECLARE
    v_month_start DATE := date_trunc('month', p_late_date)::DATE;
    v_month_end DATE := (date_trunc('month', p_late_date) + interval '1 month - 1 day')::DATE;
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM public.late_entries
    WHERE person_id = p_person_id
      AND late_date >= v_month_start
      AND late_date < p_late_date;
      
    RETURN LEAST((v_count + 1) * 100, 500);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_late_entries_updated_at ON public.late_entries;
CREATE TRIGGER set_late_entries_updated_at
BEFORE UPDATE ON public.late_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 4. Dynamic Views for Summary & Aggregates
-- View: People fine summary
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

-- View: Daily late summary
CREATE OR REPLACE VIEW public.daily_late_summary AS
SELECT 
    le.late_date,
    COUNT(DISTINCT le.person_id)::INTEGER AS total_people_late,
    SUM(le.fine_amount)::INTEGER AS total_fine,
    SUM(le.late_hours * 60 + le.late_minutes)::INTEGER AS total_late_minutes
FROM public.late_entries le
GROUP BY le.late_date
ORDER BY le.late_date DESC;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.late_entries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the caller is an authenticated administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Authenticated user with email fine@gmail.com or role = 'admin' in raw_user_meta_data
    RETURN (
        auth.role() = 'authenticated' AND (
            LOWER(auth.jwt() ->> 'email') = 'fine@gmail.com' OR
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RLS Policies for `people`
-- Anyone (public / anon) can view active people
CREATE POLICY "Public read access for active people"
ON public.people
FOR SELECT
TO public
USING (true);

-- Admin has full insert, update, delete permissions
CREATE POLICY "Admin can insert people"
ON public.people
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update people"
ON public.people
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete people"
ON public.people
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 7. RLS Policies for `late_entries`
-- Anyone (public / anon) can view all late entries
CREATE POLICY "Public read access for late entries"
ON public.late_entries
FOR SELECT
TO public
USING (true);

-- Admin has full insert, update, delete permissions
CREATE POLICY "Admin can insert late entries"
ON public.late_entries
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update late entries"
ON public.late_entries
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete late entries"
ON public.late_entries
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 8. Enable Supabase Realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.people;
ALTER PUBLICATION supabase_realtime ADD TABLE public.late_entries;
