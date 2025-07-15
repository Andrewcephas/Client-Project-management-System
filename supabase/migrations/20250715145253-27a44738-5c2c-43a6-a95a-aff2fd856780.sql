-- Fix client fetching and add subscription management
-- Update clients table to ensure proper company linking
UPDATE clients 
SET company_id = (profiles.company_id)::uuid,
    company_name = profiles.company_name,
    updated_at = now()
FROM profiles 
WHERE profiles.id = clients.user_id 
  AND profiles.company_id IS NOT NULL;

-- Create pricing_requests table for subscription approvals
CREATE TABLE public.pricing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price TEXT NOT NULL,
  company_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  notes TEXT
);

-- Enable RLS on pricing_requests
ALTER TABLE public.pricing_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to create their own pricing requests
CREATE POLICY "Users can create pricing requests" ON public.pricing_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own pricing requests
CREATE POLICY "Users can view their own pricing requests" ON public.pricing_requests
FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view and manage all pricing requests
CREATE POLICY "Admins can manage all pricing requests" ON public.pricing_requests
FOR ALL USING (is_admin(auth.uid()));

-- Add subscription tracking to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days');

-- Add subscription tracking to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days');

-- Function to get days left in trial
CREATE OR REPLACE FUNCTION public.get_trial_days_left(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT GREATEST(0, EXTRACT(DAY FROM (trial_end_date - now())))::integer
  FROM public.profiles 
  WHERE id = user_id;
$$;