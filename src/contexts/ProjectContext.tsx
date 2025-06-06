
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  projectId: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments?: IssueComment[];
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName?: string;
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  changedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface ProjectContextType {
  projects: Project[];
  issues: Issue[];
  teamMembers: TeamMember[];
  notifications: Notification[];
  projectHistory: ProjectHistory[];
  loading: boolean;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addIssue: (issue: Omit<Issue, 'id'>) => Promise<void>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  addIssueComment: (issueId: string, content: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  deactivateTeamMember: (memberId: string) => Promise<void>;
  assignProjectToTeam: (projectId: string, memberIds: string[]) => Promise<void>;
  getProjectsByRole: () => Project[];
  getIssuesByRole: () => Issue[];
  getTeamMembersByRole: () => TeamMember[];
  fetchProjects: () => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const { user, isAdmin, isCompany, isClient, session } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    if (!user || !session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProjects: Project[] = data.map(project => ({
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

  const fetchTeamMembers = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMembers: TeamMember[] = data.map(member => ({
        id: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        avatar: member.avatar || member.name.split(' ').map(n => n[0]).join(''),
        projects: member.projects || [],
        status: member.status as TeamMember['status'],
        department: member.department || 'Engineering',
        phone: member.phone || '',
        hireDate: member.hire_date || new Date().toISOString().split('T')[0],
        salary: Number(member.salary) || 0,
        permissions: member.permissions || [],
        userId: member.user_id || undefined
      }));

      setTeamMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    }
  };

  const fetchIssues = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIssues: Issue[] = data.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description || '',
        status: issue.status as Issue['status'],
        priority: issue.priority as Issue['priority'],
        projectId: issue.project_id || '',
        assignedTo: issue.assigned_to || undefined,
        createdBy: issue.created_by || '',
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels || []
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    }
  };

  const fetchNotifications = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotifications: Notification[] = data.map(notification => ({
        id: notification.id,
        userId: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type as Notification['type'],
        read: notification.read || false,
        actionUrl: notification.action_url || undefined,
        createdAt: notification.created_at
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchProjectHistory = async () => {
    if (!user || !session) return;

    try {
      const { data, error } = await supabase
        .from('project_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory: ProjectHistory[] = data.map(history => ({
        id: history.id,
        projectId: history.project_id || '',
        action: history.action,
        fieldChanged: history.field_changed || undefined,
        oldValue: history.old_value || undefined,
        newValue: history.new_value || undefined,
        changedBy: history.changed_by || '',
        createdAt: history.created_at
      }));

      setProjectHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching project history:', error);
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchProjects();
      fetchTeamMembers();
      fetchIssues();
      fetchNotifications();
      fetchProjectHistory();
    }
  }, [user, session]);

  const sendNotification = async (userId: string, title: string, message: string, type: string = 'info') => {
    try {
      const { error } = await supabase.rpc('send_notification', {
        p_user_id: userId,
        p_title: title,
        p_message: message,
        p_type: type
      });

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const addProject = async (project: Omit<Project, 'id'>) => {
    if (!user || !session) return;

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
      
      // Send notification to team members
      if (project.assignedTo && project.assignedTo.length > 0) {
        for (const memberId of project.assignedTo) {
          await sendNotification(memberId, 'New Project Assignment', `You have been assigned to project: ${project.name}`, 'info');
        }
      }
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to create project');
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
          budget: updates.budget,
          spent: updates.spent,
          phase: updates.phase,
          next_milestone: updates.nextMilestone,
          assigned_to: updates.assignedTo,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      await fetchProjectHistory();
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      await fetchProjects();
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const addIssue = async (issue: Omit<Issue, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('issues')
        .insert({
          title: issue.title,
          description: issue.description,
          status: issue.status,
          priority: issue.priority,
          project_id: issue.projectId,
          assigned_to: issue.assignedTo || null,
          created_by: user.id,
          labels: issue.labels || []
        });

      if (error) throw error;

      await fetchIssues();
      toast.success('Issue created successfully');

      // Send notification to assigned user
      if (issue.assignedTo) {
        await sendNotification(issue.assignedTo, 'New Issue Assignment', `You have been assigned issue: ${issue.title}`, 'warning');
      }
    } catch (error) {
      console.error('Error adding issue:', error);
      toast.error('Failed to create issue');
    }
  };

  const updateIssue = async (issueId: string, updates: Partial<Issue>) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({
          title: updates.title,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assigned_to: updates.assignedTo,
          labels: updates.labels,
          updated_at: new Date().toISOString()
        })
        .eq('id', issueId);

      if (error) throw error;

      await fetchIssues();
      toast.success('Issue updated successfully');
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue');
    }
  };

  const addIssueComment = async (issueId: string, content: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('issue_comments')
        .insert({
          issue_id: issueId,
          user_id: user.id,
          content: content
        });

      if (error) throw error;

      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const addTeamMember = async (member: Omit<TeamMember, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          name: member.name,
          email: member.email,
          role: member.role,
          avatar: member.avatar,
          projects: member.projects || [],
          status: member.status,
          department: member.department,
          phone: member.phone,
          hire_date: member.hireDate,
          salary: member.salary,
          permissions: member.permissions,
          company_id: user.companyId || ''
        });

      if (error) throw error;

      await fetchTeamMembers();
      toast.success('Team member added successfully');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member');
    }
  };

  const updateTeamMember = async (memberId: string, updates: Partial<TeamMember>) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({
          name: updates.name,
          email: updates.email,
          role: updates.role,
          avatar: updates.avatar,
          projects: updates.projects,
          status: updates.status,
          department: updates.department,
          phone: updates.phone,
          salary: updates.salary,
          permissions: updates.permissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId);

      if (error) throw error;

      await fetchTeamMembers();
      toast.success('Team member updated successfully');
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member');
    }
  };

  const deactivateTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .update({ status: 'Inactive' })
        .eq('id', memberId);

      if (error) throw error;

      await fetchTeamMembers();
      toast.success('Team member deactivated successfully');
    } catch (error) {
      console.error('Error deactivating team member:', error);
      toast.error('Failed to deactivate team member');
    }
  };

  const assignProjectToTeam = async (projectId: string, memberIds: string[]) => {
    try {
      await updateProject(projectId, { assignedTo: memberIds });
      
      for (const memberId of memberIds) {
        const member = teamMembers.find(m => m.id === memberId);
        if (member) {
          const updatedProjects = [...new Set([...member.projects, projectId])];
          await updateTeamMember(memberId, { projects: updatedProjects });
        }
      }
    } catch (error) {
      console.error('Error assigning project to team:', error);
      toast.error('Failed to assign project to team');
    }
  };

  const getProjectsByRole = (): Project[] => {
    if (isAdmin) {
      return projects;
    } else if (isCompany) {
      return projects.filter(project => project.companyId === user?.companyId);
    } else if (isClient) {
      return projects.filter(project => project.clientId === user?.id);
    }
    return [];
  };

  const getIssuesByRole = (): Issue[] => {
    const userProjects = getProjectsByRole();
    const projectIds = userProjects.map(p => p.id);
    
    if (isAdmin) {
      return issues;
    } else if (isCompany) {
      return issues.filter(issue => projectIds.includes(issue.projectId));
    } else if (isClient) {
      return issues.filter(issue => 
        projectIds.includes(issue.projectId) || issue.createdBy === user?.id
      );
    }
    return [];
  };

  const getTeamMembersByRole = (): TeamMember[] => {
    if (isAdmin) {
      return teamMembers;
    } else if (isCompany) {
      return teamMembers;
    } else if (isClient) {
      const userProjects = getProjectsByRole();
      const assignedMemberIds = userProjects.flatMap(p => p.assignedTo);
      return teamMembers.filter(member => assignedMemberIds.includes(member.id));
    }
    return [];
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        issues,
        teamMembers,
        notifications,
        projectHistory,
        loading,
        updateProject,
        addProject,
        deleteProject,
        addIssue,
        updateIssue,
        addIssueComment,
        addTeamMember,
        updateTeamMember,
        deactivateTeamMember,
        assignProjectToTeam,
        getProjectsByRole,
        getIssuesByRole,
        getTeamMembersByRole,
        fetchProjects,
        sendNotification,
        markNotificationAsRead,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
