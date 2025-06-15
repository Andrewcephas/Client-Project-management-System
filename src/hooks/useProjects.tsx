
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'Testing' | 'Completed' | 'On Hold';
  progress: number;
  team: TeamMember[];
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  client: string;
  clientId?: string;
  companyId: string;
  budget: number;
  spent: number;
  phase: string;
  nextMilestone: string;
  lastUpdate: string;
  createdBy: string;
  assignedTo: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  projects: string[];
  status: 'Active' | 'Inactive';
  department: string;
  phone?: string;
  hireDate: string;
  salary: number;
  permissions: string[];
  userId?: string;
}

export interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
  company_name: string;
}

export const useProjects = ()  => {
  const { user, isAdmin, isCompany, isClient } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = async () => {
    if (!user || !isCompany || !user.companyId) {
      console.log('Cannot fetch clients: missing user, not company user, or no company ID');
      return;
    }
    
    try {
      console.log('Fetching clients for company:', user.companyId);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, company_id, company_name')
        .eq('role', 'client')
        .eq('company_id', user.companyId)
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      console.log('Fetched clients from profiles table:', data);

      const formattedClients: ClientUser[] = (data || []).map(client => ({
        id: client.id,
        full_name: client.full_name || client.email.split('@')[0],
        email: client.email,
        company_id: client.company_id,
        company_name: client.company_name || ''
      }));

      setClients(formattedClients);
      
      if (formattedClients.length === 0) {
        console.log('No clients found for company:', user.companyId);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase.from('projects').select('*');
      
      if (isClient) {
        // Clients only see projects they are assigned to
        query = query.eq('client_id', user.id);
      } else if (isCompany) {
        // Company users see projects from their company
        query = query.eq('company_id', user.companyId);
      }
      // Admin sees all projects
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status as Project['status'],
        progress: project.progress,
        team: [],
        dueDate: project.due_date || '',
        priority: project.priority as Project['priority'],
        client: project.client,
        clientId: project.client_id || undefined,
        companyId: project.company_id,
        budget: Number(project.budget) || 0,
        spent: Number(project.spent) || 0,
        phase: project.phase || '',
        nextMilestone: project.next_milestone || '',
        lastUpdate: new Date(project.updated_at).toISOString().split('T')[0],
        createdBy: project.created_by || '',
        assignedTo: project.assigned_to || []
      }));

      setProjects(formattedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          progress: updates.progress,
          due_date: updates.dueDate,
          priority: updates.priority,
          client: updates.client,
          client_id: updates.clientId,
          budget: updates.budget,
          spent: updates.spent,
          phase: updates.phase,
          next_milestone: updates.nextMilestone,
          assigned_to: updates.assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      // Update local state immediately for better UX
      setProjects(prev => prev.map(project => 
        project.id === projectId 
          ? { ...project, ...updates }
          : project
      ));

      // Also fetch fresh data to ensure consistency
      await fetchProjects();
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: project.name,
          description: project.description,
          status: project.status,
          progress: project.progress,
          due_date: project.dueDate || null,
          priority: project.priority,
          client: project.client,
          client_id: project.clientId || null,
          company_id: project.companyId,
          budget: project.budget,
          spent: project.spent || 0,
          phase: project.phase || null,
          next_milestone: project.nextMilestone || null,
          created_by: user.id,
          assigned_to: project.assignedTo || []
        })
        .select()
        .single();

      if (error) throw error;

      await fetchProjects();
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to create project');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      if (isCompany) {
        fetchClients();
      }
    }
  }, [user, isCompany]);

  return {
    projects,
    clients,
    loading,
    fetchProjects,
    fetchClients,
    updateProject,
    addProject
  };
};
