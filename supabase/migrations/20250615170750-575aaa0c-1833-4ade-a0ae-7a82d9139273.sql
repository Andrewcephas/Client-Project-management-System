
-- Enable Google OAuth provider and clean up pending users
-- First, let's remove any pending/unapproved user profiles
DELETE FROM public.profiles 
WHERE status = 'pending' OR status = 'inactive';

-- Update any existing profiles to ensure they're active
UPDATE public.profiles 
SET status = 'active', updated_at = now()
WHERE status IS NULL OR status != 'active';

-- Add trigger to handle OAuth users (Google/GitHub) registration
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert profile for OAuth users with active status immediately
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    status,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'client', -- Default role for OAuth users
    'active', -- OAuth users are immediately active
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', EXCLUDED.full_name),
    status = 'active',
    updated_at = now();
    
  RETURN NEW;
END;
$$;

-- Update the existing trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_oauth_user();

-- Ensure all existing auth users have profiles
INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
  'client',
  'active',
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET
  status = 'active',
  updated_at = now();
