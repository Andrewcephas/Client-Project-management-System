import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from './UserContext';
import { toast } from 'sonner';

// Define interfaces for our data types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
  progress: number;
  team: TeamMember[];
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  client: string;
  clientId: string;
  companyId: string;
  budget: number;
  spent: number;
  phase?: string;
  nextMilestone?: string;
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
  projectId: string;
  title: string;
  description?: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  labels: string[];
  comments: IssueComment[];
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface ProjectHistory {
  id: string;
  projectId: string;
  changedBy: string;
  action: string;
  fieldChanged?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface ClientUser {
  id: string;
  full_name: string;
  email: string;
  company_id: string;
  company_name: string;
}

// Context type definition
interface ProjectContextType {
  projects: Project[];
  issues: Issue[];
  teamMembers: TeamMember[];
  notifications: Notification[];
  projectHistory: ProjectHistory[];
  clients: ClientUser[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  fetchIssues: () => Promise<void>;
  fetchTeamMembers: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  fetchProjectHistory: () => Promise<void>;
  fetchClients: () => Promise<void>;
  sendNotification: (userId: string, title: string, message: string, type?: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Promise<void>;
  updateIssue: (issueId: string, updates: Partial<Issue>) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  addIssueComment: (comment: Omit<IssueComment, 'id' | 'createdAt' | 'author'>) => Promise<void>;
  deleteIssueComment: (commentId: string) => Promise<void>;
  addTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<void>;
  updateTeamMember: (memberId: string, updates: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (memberId: string) => Promise<void>;
  getProjectsByRole: () => Project[];
  getIssuesByRole: () => Issue[];
  getTeamMembersByRole: () => TeamMember[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
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
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch clients from Supabase
  const fetchClients = async () => {
    if (!user || !isCompany) return;

    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', user.companyId);

      if (error) throw error;

      const formattedClients: ClientUser[] = data.map(client => ({
        id: client.user_id,
        full_name: client.full_name || '',
        email: client.email,
        company_id: client.company_id,
        company_name: user.companyName || 'Unknown Company'
      }));

      setClients(formattedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    }
  };

  // Fetch projects from Supabase
  const fetchProjects = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase.from('projects').select('*');

      if (isClient) {
        query = query.eq('client_id', user.id);
      } else if (isCompany && user.companyId) {
        query = query.eq('company_id', user.companyId);
      }
      // Admin sees all projects

      const { data, error } = await query;

      if (error) throw error;

      const formattedProjects: Project[] = data.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status as Project['status'],
        progress: project.progress,
        team: [], // Will be populated when team members are fetched
        dueDate: project.due_date || '',
        priority: project.priority as Project['priority'],
        client: 'Unknown Client',
        clientId: project.client_id,
        companyId: project.company_id,
        budget: Number(project.budget) || 0,
        spent: Number(project.spent) || 0,
        phase: project.phase || '',
        nextMilestone: project.next_milestone || '',
        lastUpdate: project.updated_at,
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

  // Fetch team members from Supabase
  const fetchTeamMembers = async () => {
    if (!user) return;

    try {
      let query = supabase.from('team_members').select('*');
      
      if (isCompany && user.companyId) {
        query = query.eq('company_id', user.companyId);
      }
      // Admin sees all team members

      const { data, error } = await query;

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

  // Fetch issues from Supabase
  const fetchIssues = async () => {
    if (!user) return;

    try {
      let query = supabase.from('issues').select(`
        *,
        comments:issue_comments(
          *,
          author:profiles!user_id(full_name, email, avatar_url)
        )
      `);

      if (isClient) {
        // Clients see issues for their projects
        query = query.in('project_id', projects.filter(p => p.clientId === user.id).map(p => p.id));
      } else if (isCompany && user.companyId) {
        // Companies see issues for their projects
        query = query.in('project_id', projects.filter(p => p.companyId === user.companyId).map(p => p.id));
      }
      // Admin sees all issues

      const { data, error } = await query;

      if (error) throw error;

      const formattedIssues: Issue[] = data.map(issue => ({
        id: issue.id,
        projectId: issue.project_id,
        title: issue.title,
        description: issue.description || '',
        status: issue.status as Issue['status'],
        priority: issue.priority as Issue['priority'],
        assignedTo: issue.assigned_to,
        createdBy: issue.created_by,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        labels: issue.labels || [],
        comments: (issue.comments || []).map((comment: any) => ({
          id: comment.id,
          issueId: comment.issue_id,
          userId: comment.user_id,
          content: comment.content,
          createdAt: comment.created_at,
          author: {
            name: comment.author?.full_name || 'Unknown User',
            email: comment.author?.email || '',
            avatar: comment.author?.avatar_url
          }
        }))
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    }
  };

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!user) return;

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
        actionUrl: notification.action_url,
        read: notification.read,
        createdAt: notification.created_at
      }));

      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to fetch notifications');
    }
  };

  // Fetch project history from Supabase
  const fetchProjectHistory = async () => {
    if (!user) return;

    try {
      let query = supabase.from('project_history').select('*');

      if (isClient) {
        // Clients see history for their projects
        query = query.in('project_id', projects.filter(p => p.clientId === user.id).map(p => p.id));
      } else if (isCompany && user.companyId) {
        // Companies see history for their projects
        query = query.in('project_id', projects.filter(p => p.companyId === user.companyId).map(p => p.id));
      }
      // Admin sees all history

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHistory: ProjectHistory[] = data.map(history => ({
        id: history.id,
        projectId: history.project_id,
        changedBy: history.changed_by,
        action: history.action,
        fieldChanged: history.field_changed,
        oldValue: history.old_value,
        newValue: history.new_value,
        createdAt: history.created_at
      }));

      setProjectHistory(formattedHistory);
    } catch (error) {
      console.error('Error fetching project history:', error);
      toast.error('Failed to fetch project history');
    }
  };

  useEffect(() => {
    if (user && session) {
      fetchProjects();
      fetchTeamMembers();
      fetchIssues();
      fetchNotifications();
      fetchProjectHistory();
      if (isCompany) {
        fetchClients();
      }
    }
  }, [user, session, isCompany]);

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

  const addIssue = async (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => {
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

  const deleteIssue = async (issueId: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .delete()
        .eq('id', issueId);

      if (error) throw error;

      await fetchIssues();
      toast.success('Issue deleted successfully');
    } catch (error) {
      console.error('Error deleting issue:', error);
      toast.error('Failed to delete issue');
    }
  };

  const addIssueComment = async (comment: Omit<IssueComment, 'id' | 'createdAt' | 'author'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('issue_comments')
        .insert({
          issue_id: comment.issueId,
          user_id: user.id,
          content: comment.content
        });

      if (error) throw error;

      await fetchIssues();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const deleteIssueComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('issue_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchIssues();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
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

  const deleteTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchTeamMembers();
      toast.success('Team member deleted successfully');
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  const getProjectsByRole = () => {
    if (isAdmin) return projects;
    if (isClient) return projects.filter(p => p.clientId === user?.id);
    if (isCompany) return projects.filter(p => p.companyId === user?.companyId);
    return [];
  };

  const getIssuesByRole = () => {
    const userProjects = getProjectsByRole();
    const projectIds = userProjects.map(p => p.id);
    return issues.filter(i => projectIds.includes(i.projectId));
  };

  const getTeamMembersByRole = () => {
    if (isAdmin) return teamMembers;
    if (isCompany) return teamMembers.filter(m => m.userId === user?.companyId);
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
        clients,
        loading,
        fetchProjects,
        fetchIssues,
        fetchTeamMembers,
        fetchNotifications,
        fetchProjectHistory,
        fetchClients,
        sendNotification,
        markNotificationAsRead,
        addProject,
        updateProject,
        deleteProject,
        addIssue,
        updateIssue,
        deleteIssue,
        addIssueComment,
        deleteIssueComment,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        getProjectsByRole,
        getIssuesByRole,
        getTeamMembersByRole,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};