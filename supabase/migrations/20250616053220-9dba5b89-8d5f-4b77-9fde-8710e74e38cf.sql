
-- Create a dedicated clients table to store client information by company
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name text,
  phone text,
  avatar_url text,
  status text DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

-- Enable RLS for clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Companies can view their clients" 
  ON public.clients 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'company' 
      AND profiles.company_id::uuid = clients.company_id
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Clients can view their own record" 
  ON public.clients 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Companies and admins can update clients" 
  ON public.clients 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('company', 'admin')
    )
  );

-- Update the handle_new_user function to also create client records
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

  -- For clients, get company info and create client record
  IF (NEW.raw_user_meta_data->>'role' = 'client') THEN
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
