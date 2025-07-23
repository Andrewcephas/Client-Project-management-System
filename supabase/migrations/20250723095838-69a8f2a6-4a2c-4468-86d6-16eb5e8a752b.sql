-- Fix the get_trial_days_left function to use companies table
CREATE OR REPLACE FUNCTION public.get_trial_days_left(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT GREATEST(0, EXTRACT(DAY FROM (c.trial_end_date - now())))::integer
  FROM public.profiles p
  JOIN public.companies c ON c.id = p.company_id
  WHERE p.id = user_id;
$$;