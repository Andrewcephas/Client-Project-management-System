-- Fix remaining functions with search path issues

-- Fix send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'info'::text, p_action_url text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, action_url)
  VALUES (p_user_id, p_title, p_message, p_type, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Fix add_project_history function
CREATE OR REPLACE FUNCTION public.add_project_history()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Track status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO public.project_history (project_id, action, field_changed, old_value, new_value, changed_by)
      VALUES (NEW.id, 'status_changed', 'status', OLD.status, NEW.status, auth.uid());
    END IF;
    
    -- Track progress changes
    IF OLD.progress IS DISTINCT FROM NEW.progress THEN
      INSERT INTO public.project_history (project_id, action, field_changed, old_value, new_value, changed_by)
      VALUES (NEW.id, 'progress_updated', 'progress', OLD.progress::text, NEW.progress::text, auth.uid());
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.project_history (project_id, action, changed_by)
    VALUES (NEW.id, 'created', auth.uid());
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Fix get_trial_days_left function
CREATE OR REPLACE FUNCTION public.get_trial_days_left(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT GREATEST(0, EXTRACT(DAY FROM (trial_end_date - now())))::integer
  FROM public.profiles 
  WHERE id = user_id;
$$;