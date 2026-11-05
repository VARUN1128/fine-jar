-- ==============================================================================
-- FineTrack: Create Admin User (Authentication Setup)
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- Create the Admin User in auth.users
-- Email: fine@gmail.com
-- Password: fine@sof.admn
-- Note: You can also create the user directly via Supabase Dashboard > Authentication > Users > "Add user"

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
