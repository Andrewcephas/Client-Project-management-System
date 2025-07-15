-- Update clients table to sync with profiles table for better data integrity
-- This ensures clients are properly linked to their profiles and companies

-- Update existing clients to match profiles data
UPDATE clients 
SET 
  user_id = profiles.id,
  full_name = profiles.full_name,
  email = profiles.email,
  company_id = profiles.company_id::uuid,
  company_name = profiles.company_name,
  status = profiles.status,
  updated_at = now()
FROM profiles 
WHERE profiles.role = 'client' 
  AND profiles.email = clients.email
  AND profiles.company_id IS NOT NULL;

-- Insert any missing client records from profiles
INSERT INTO clients (user_id, email, full_name, company_id, company_name, status)
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.company_id::uuid,
  p.company_name,
  p.status
FROM profiles p
LEFT JOIN clients c ON c.user_id = p.id
WHERE p.role = 'client' 
  AND p.company_id IS NOT NULL
  AND c.id IS NULL;

-- Update RLS policies for better company-client visibility
DROP POLICY IF EXISTS "Companies can view their clients" ON clients;

CREATE POLICY "Companies can view their clients" ON clients
FOR SELECT USING (
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'company' 
    AND profiles.company_id::uuid = clients.company_id
  )) OR 
  (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )) OR
  (auth.uid() = clients.user_id)
);

-- Update projects table to better handle client relationships
-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_company_id ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);