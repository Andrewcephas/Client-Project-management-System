-- Fix company_id data type mismatch between profiles and clients tables
-- Update profiles table to use proper company UUIDs and fix existing data

-- First, let's update existing company records to ensure they have proper UUIDs
-- For company users where company_id is not a valid UUID, we need to link them to their actual company records

-- Update profiles to use actual company UUIDs instead of text strings
UPDATE profiles 
SET company_id = companies.id::text
FROM companies 
WHERE profiles.role = 'company' 
  AND profiles.email = companies.email
  AND profiles.company_id != companies.id::text;

-- For existing profiles with invalid company_id format, try to find matching company by email/name
UPDATE profiles 
SET company_id = companies.id::text,
    company_name = companies.name
FROM companies 
WHERE profiles.role = 'company' 
  AND (profiles.email = companies.email OR profiles.company_name = companies.name)
  AND (profiles.company_id IS NULL OR profiles.company_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

-- Update clients table to properly link to companies using UUID
UPDATE clients 
SET company_id = companies.id,
    company_name = companies.name
FROM companies, profiles
WHERE profiles.id = clients.user_id
  AND profiles.role = 'client'
  AND profiles.company_name = companies.name
  AND clients.company_id IS NULL;

-- Fix the clients fetching by updating the RLS policy to handle text-to-uuid conversion
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