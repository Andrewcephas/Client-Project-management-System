-- Fix the remaining data issues and clean up orphaned records

-- First, let's find the correct company for the CATECH profile
UPDATE profiles 
SET company_id = companies.id::text,
    company_name = companies.name
FROM companies 
WHERE profiles.email = 'ngumbaucephas2@gmail.com'
  AND companies.email = 'admin@catech.com'
  AND profiles.role = 'company';

-- Create any missing client records for users who should be clients
INSERT INTO clients (user_id, email, full_name, company_id, company_name)
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.company_id::uuid as company_id,
  p.company_name
FROM profiles p
WHERE p.role = 'client'
  AND p.company_id IS NOT NULL
  AND p.company_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND NOT EXISTS (
    SELECT 1 FROM clients c WHERE c.user_id = p.id
  );

-- Delete orphaned auth users that don't have profiles
DELETE FROM auth.users 
WHERE id NOT IN (SELECT id FROM profiles);

-- Delete any profiles that don't have corresponding auth users
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM auth.users);