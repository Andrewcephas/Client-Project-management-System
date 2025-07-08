-- Insert a sample project for testing client visibility
-- First, let's check if we have any clients and companies
INSERT INTO projects (
  name,
  description,
  status,
  progress,
  priority,
  client,
  client_id,
  company_id,
  budget,
  spent,
  phase,
  next_milestone,
  created_by
)
SELECT 
  'Sample Client Project',
  'This is a test project to verify client visibility',
  'In Progress',
  45,
  'High',
  c.full_name,
  c.user_id,
  c.company_id::text,
  150000,
  75000,
  'Development',
  'Feature completion',
  (SELECT id FROM profiles WHERE role = 'company' AND company_id = c.company_id::text LIMIT 1)
FROM clients c
WHERE c.company_id IS NOT NULL
LIMIT 1;