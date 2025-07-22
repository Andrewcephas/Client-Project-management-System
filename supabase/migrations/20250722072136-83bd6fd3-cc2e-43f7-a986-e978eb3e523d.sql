-- Fix company creation issue by adding proper RLS policy
-- Allow users to create companies during registration
CREATE POLICY "Users can create companies during registration" ON public.companies
FOR INSERT 
WITH CHECK (
  -- Allow creation if the user is creating a company with their own data
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = companies.email
  )
);

-- Update the handle_new_user function to create company records for company users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  company_id_text text;
  company_name_text text;
  company_uuid uuid;
BEGIN
  company_id_text := NEW.raw_user_meta_data->>'company_id';

  -- For company users, create a company record first
  IF (NEW.raw_user_meta_data->>'role' = 'company') THEN
    company_name_text := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name');
    
    -- Create the company record
    INSERT INTO public.companies (name, email, status, subscription_plan, subscription_status)
    VALUES (
      company_name_text,
      NEW.email,
      'active',
      'trial',
      'trial'
    )
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      updated_at = now()
    RETURNING id INTO company_uuid;
    
    -- Set the company_id for the profile
    company_id_text := company_uuid::text;
    
  -- For clients, get company info and create client record
  ELSIF (NEW.raw_user_meta_data->>'role' = 'client') THEN
    -- Try to convert company_id to UUID if it's a valid UUID format
    BEGIN
      company_uuid := company_id_text::uuid;
      
      -- Get company name from companies table
      SELECT name INTO company_name_text
      FROM public.companies
      WHERE id = company_uuid;
      
      -- Create client record
      INSERT INTO public.clients (user_id, email, full_name, company_id, company_name)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        company_uuid,
        company_name_text
      )
      ON CONFLICT (user_id, company_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        company_name = EXCLUDED.company_name,
        updated_at = now();
        
    EXCEPTION WHEN invalid_text_representation THEN
      -- If company_id is not a valid UUID, set company_name to Unknown
      company_name_text := 'Unknown Company';
    END;
    
    -- Fallback if company not found
    IF company_name_text IS NULL THEN
      company_name_text := 'Unknown Company';
    END IF;
  ELSE
    -- For companies, company_name is passed in meta_data
    company_name_text := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name');
  END IF;

  -- Insert/update profile
  INSERT INTO public.profiles (id, email, full_name, role, company_id, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    company_id_text,
    company_name_text
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    company_id = EXCLUDED.company_id,
    company_name = EXCLUDED.company_name,
    updated_at = now();
    
  RETURN NEW;
END;
$function$;