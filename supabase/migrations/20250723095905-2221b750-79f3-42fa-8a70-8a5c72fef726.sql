-- Fix handle_oauth_user function
CREATE OR REPLACE FUNCTION public.handle_oauth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
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