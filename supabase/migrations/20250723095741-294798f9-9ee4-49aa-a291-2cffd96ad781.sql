-- Fix security warnings by setting proper search paths for functions

-- Fix the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  company_uuid UUID;
  company_name_text TEXT;
BEGIN
  -- Handle company registration
  IF (NEW.raw_user_meta_data->>'role' = 'company') THEN
    company_name_text := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name');
    
    -- Create company record
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
    
    -- Create company profile
    INSERT INTO public.profiles (id, email, full_name, role, company_id, company_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'company',
      company_uuid,
      company_name_text
    );
    
  -- Handle client registration
  ELSIF (NEW.raw_user_meta_data->>'role' = 'client') THEN
    -- Get company info
    IF NEW.raw_user_meta_data->>'company_id' IS NOT NULL THEN
      BEGIN
        company_uuid := (NEW.raw_user_meta_data->>'company_id')::UUID;
        SELECT name INTO company_name_text FROM public.companies WHERE id = company_uuid;
      EXCEPTION WHEN OTHERS THEN
        company_name_text := 'Unknown Company';
      END;
    ELSE
      company_name_text := 'Unknown Company';
    END IF;
    
    -- Create client profile
    INSERT INTO public.profiles (id, email, full_name, role, company_id, company_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      'client',
      company_uuid,
      company_name_text
    );
    
    -- Create client record if company_id is valid
    IF company_uuid IS NOT NULL THEN
      INSERT INTO public.clients (user_id, company_id, email, full_name)
      VALUES (
        NEW.id,
        company_uuid,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
      );
    END IF;
    
  -- Handle admin registration
  ELSE
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    );
  END IF;
  
  RETURN NEW;
END;
$$;