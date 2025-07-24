-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  action_url TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create project_history table
CREATE TABLE public.project_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  changed_by UUID,
  action TEXT NOT NULL,
  field_changed TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on project_history
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Create policies for project_history
CREATE POLICY "Users can view project history for their projects" 
ON public.project_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = project_history.project_id 
    AND (
      projects.company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ) OR 
      projects.client_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create project history" 
ON public.project_history 
FOR INSERT 
WITH CHECK (auth.uid() = changed_by);

-- Create issues table
CREATE TABLE public.issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  priority TEXT NOT NULL DEFAULT 'Medium',
  labels TEXT[] DEFAULT '{}',
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on issues
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

-- Create policies for issues
CREATE POLICY "Users can view issues on their projects" 
ON public.issues 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.id = auth.uid()
    WHERE p.id = issues.project_id 
    AND (
      pr.role = 'admin' OR
      (pr.role = 'company' AND pr.company_id = p.company_id) OR
      (pr.role = 'client' AND pr.id = p.client_id)
    )
  )
);

CREATE POLICY "Users can create issues on their projects" 
ON public.issues 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.id = auth.uid()
    WHERE p.id = issues.project_id 
    AND (
      pr.role = 'admin' OR
      (pr.role = 'company' AND pr.company_id = p.company_id) OR
      (pr.role = 'client' AND pr.id = p.client_id)
    )
  )
);

CREATE POLICY "Users can update issues on their projects" 
ON public.issues 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.id = auth.uid()
    WHERE p.id = issues.project_id 
    AND (
      pr.role = 'admin' OR
      (pr.role = 'company' AND pr.company_id = p.company_id) OR
      (pr.role = 'client' AND pr.id = p.client_id)
    )
  )
);

-- Create issue_comments table
CREATE TABLE public.issue_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on issue_comments
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for issue_comments
CREATE POLICY "Users can view comments on accessible issues" 
ON public.issue_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON i.project_id = p.id
    WHERE i.id = issue_comments.issue_id 
    AND (
      p.company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ) OR 
      p.client_id = auth.uid() OR
      i.assigned_to = auth.uid() OR
      i.created_by = auth.uid()
    )
  )
);

CREATE POLICY "Users can create comments on accessible issues" 
ON public.issue_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM issues i
    JOIN projects p ON i.project_id = p.id
    WHERE i.id = issue_comments.issue_id 
    AND (
      p.company_id IN (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      ) OR 
      p.client_id = auth.uid() OR
      i.assigned_to = auth.uid() OR
      i.created_by = auth.uid()
    )
  )
);

-- Create team_members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  projects TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Active',
  department TEXT DEFAULT 'Engineering',
  phone TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC DEFAULT 0,
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for team_members
CREATE POLICY "Admins can manage all team members" 
ON public.team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Companies can manage their team members" 
ON public.team_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'company' AND company_id = team_members.company_id
  )
);

CREATE POLICY "Clients can view team members on their projects" 
ON public.team_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM projects p
    JOIN profiles pr ON pr.id = auth.uid()
    WHERE pr.role = 'client' AND pr.id = p.client_id 
    AND team_members.id::text = ANY(p.assigned_to)
  )
);

-- Add triggers for updated_at columns
CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_issue_comments_updated_at
  BEFORE UPDATE ON public.issue_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();