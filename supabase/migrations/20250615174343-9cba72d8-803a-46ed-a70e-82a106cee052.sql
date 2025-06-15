
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  company_id_text text;
  company_name_text text;
BEGIN
  company_id_text := NEW.raw_user_meta_data->>'company_id';

  -- Do not attempt to map company_id to company_name for clients; always use the provided value
  IF (NEW.raw_user_meta_data->>'role' = 'client') THEN
    -- Optionally, join company_name from companies table if you want
    SELECT name INTO company_name_text
    FROM public.companies
    WHERE id = company_id_text;

    -- fallback to "Unknown" if not found
    IF company_name_text IS NULL THEN
      company_name_text := 'Unknown';
    END IF;
  ELSE
    -- For companies, company_name is passed in meta_data, or is the full_name
    company_name_text := COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.raw_user_meta_data->>'full_name');
  END IF;

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
