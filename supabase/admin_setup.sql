-- ==============================================================================
-- FineTrack: Create Admin User and Initial Sample Data
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create the Admin User in auth.users (if not already created via UI)
-- Email: fine@gmail.com
-- Password: fine@sof.admn
-- Note: It is generally best to create the user directly in Supabase Dashboard > Authentication > Users > "Add user".
-- But you can also run the following SQL block if pgcrypto is available:

DO $$
DECLARE
    admin_uid UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'fine@gmail.com') THEN
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            recovery_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'fine@gmail.com',
            crypt('fine@sof.admn', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"], "role": "admin"}',
            '{"role": "admin", "full_name": "FineTrack Admin"}',
            now(),
            now(),
            '',
            '',
            '',
            ''
        ) RETURNING id INTO admin_uid;

        -- Create auth identity
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            provider_id,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            admin_uid,
            format('{"sub":"%s","email":"%s"}', admin_uid::text, 'fine@gmail.com')::jsonb,
            'email',
            'fine@gmail.com',
            now(),
            now(),
            now()
        );
    END IF;
END $$;

-- 2. Optional Sample People & Late Entries for immediate testing
INSERT INTO public.people (id, full_name, is_active) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Rahul Sharma', true),
    ('22222222-2222-2222-2222-222222222222', 'Akhil Verma', true),
    ('33333333-3333-3333-3333-333333333333', 'Arjun Patel', true),
    ('44444444-4444-4444-4444-444444444444', 'Pooja Nair', true),
    ('55555555-5555-5555-5555-555555555555', 'Devendra Reddy', true)
ON CONFLICT (id) DO NOTHING;

-- Late Entries for Rahul, Akhil, Arjun
INSERT INTO public.late_entries (person_id, late_date, late_hours, late_minutes, fine_amount, remarks) VALUES
    ('11111111-1111-1111-1111-111111111111', '2026-11-05', 0, 25, 100, 'Traffic congestion at main junction'),
    ('22222222-2222-2222-2222-222222222222', '2026-11-05', 0, 15, 100, 'Late transit arrival'),
    ('33333333-3333-3333-3333-333333333333', '2026-11-05', 0, 45, 100, 'Car breakdown'),
    ('11111111-1111-1111-1111-111111111111', '2026-11-04', 0, 30, 100, 'Rain delay'),
    ('33333333-3333-3333-3333-333333333333', '2026-11-03', 1, 10, 100, 'Personal emergency')
ON CONFLICT (person_id, late_date) DO NOTHING;
