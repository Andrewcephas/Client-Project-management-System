import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Briefcase, Users, Clock, CheckCircle, Plus, Settings, User, Bell, Edit, MoreVertical, Trash2, UserX, AlertTriangle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamMemberDialog } from "@/components/TeamMemberDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { projects, loading: projectsLoading } = useProjects();
  const { 
    teamMembers, 
    loading: membersLoading, 
    addTeamMember, 
    updateTeamMember, 
    deleteTeamMember, 
    deactivateTeamMember 
  } = useTeamMembers();
  
  const [notifications, setNotifications] = useState([]);
  const [clients, setClients] = useState([]);
  const [issues, setIssues] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchClients = async () => {
    if (!user?.companyId) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at, status')
        .eq('role', 'client')
        .eq('company_id', user.companyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchIssues = async () => {
    if (!user?.companyId) return;

    try {
      const { data, error } = await supabase
        .from('issues')
        .select(`
          *,
          projects!inner(id, name, company_id)
        `)
        .eq('projects.company_id', user.companyId)
        .eq('status', 'Open')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };

  const fetchCompanyName = async () => {
    if (!user?.companyId) return;

    try {
      // Get company name from the registered companies
      const companies = {
        "catech": "CATECH",
        "innovatecorp": "InnovateCorp",
        "digitalsolutions": "DigitalSolutions",
        "techforward": "TechForward"
      };
      
      setCompanyName(companies[user.companyId] || user.companyId.toUpperCase());
    } catch (error) {
      console.error('Error fetching company name:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchCompanyName();
      fetchClients();
      fetchIssues();
    }
  }, [user]);

  const stats = [
    { 
      title: "Active Projects", 
      value: projects.filter(p => p.status === 'In Progress').length.toString(), 
      icon: Briefcase, 
      change: `+${projects.filter(p => new Date(p.lastUpdate) > new Date(Date.now() - 30*24*60*60*1000)).length} this month`, 
      color: "bg-emerald-50 text-emerald-600" 
    },
    { 
      title: "Team Members", 
      value: teamMembers.filter(m => m.status === 'Active').length.toString(), 
      icon: Users, 
      change: `+${teamMembers.filter(m => new Date(m.hireDate) > new Date(Date.now() - 7*24*60*60*1000)).length} this week`, 
      color: "bg-blue-50 text-blue-600" 
    },
    { 
      title: "Active Clients", 
      value: clients.filter(c => c.status === 'active').length.toString(), 
      icon: User, 
      change: `+${clients.filter(c => new Date(c.created_at) > new Date(Date.now() - 30*24*60*60*1000)).length} this month`, 
      color: "bg-purple-50 text-purple-600" 
    },
    { 
      title: "Open Issues", 
      value: issues.length.toString(), 
      icon: AlertTriangle, 
      change: "Needs attention", 
      color: "bg-red-50 text-red-600" 
    }
  ];

  const handleNewProject = () => {
    navigate("/projects");
  };

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsTeamDialogOpen(true);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsTeamDialogOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    try {
      if (selectedMember) {
        await updateTeamMember(selectedMember.id, memberData);
      } else {
        await addTeamMember({
          ...memberData,
          avatar: memberData.name.split(' ').map(n => n[0]).join(''),
          projects: [],
          permissions: ['read'],
          hireDate: new Date().toISOString().split('T')[0]
        });
      }
      setIsTeamDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to save team member');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteTeamMember(memberId);
      toast.success('Team member deleted successfully');
    } catch (error) {
      toast.error('Failed to delete team member');
    }
  };

  const handleDeactivateMember = async (memberId: string) => {
    try {
      await deactivateTeamMember(memberId);
      toast.success('Team member deactivated successfully');
    } catch (error) {
      toast.error('Failed to deactivate team member');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Planning": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Testing": return "bg-purple-100 text-purple-800";
      case "On Hold": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (projectsLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-emerald-600 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                Company Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Welcome back to {companyName || "Your Company"}</p>
              {notifications.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Bell className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-600">
                    You have {notifications.length} unread notifications
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-emerald-300 hover:bg-emerald-50"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link to="/settings">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-emerald-300 hover:bg-emerald-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5" 
                onClick={handleNewProject}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/70 backdrop-blur-sm cursor-pointer" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Overview */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl text-emerald-700">Active Projects</CardTitle>
                    <CardDescription>Track progress across your client projects</CardDescription>
                  </div>
                  <Link to="/projects">
                    <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                      View All Projects
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-emerald-100">
                  {projects.slice(0, 5).map((project, index) => (
                    <div 
                      key={project.id} 
                      className="p-6 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer animate-fade-in"
                      onClick={() => handleProjectClick(project.id)}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white font-semibold">
                                {project.client.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900 hover:text-emerald-600 transition-colors">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-600">{project.client}</p>
                            </div>
                            <div className="flex gap-2">
                              <Badge className={getPriorityColor(project.priority)}>
                                {project.priority}
                              </Badge>
                              <Badge className={getStatusColor(project.status)}>
                                {project.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {project.assignedTo?.length || 0} members
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Due {project.dueDate || 'Not set'}
                            </div>
                            <span className="font-medium text-emerald-600">
                              KES {project.budget.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-6">
                          <div className="text-sm text-gray-600 mb-2">{project.progress}% Complete</div>
                          <div className="w-32">
                            <Progress value={project.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                      <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
                      <p className="text-sm">Create your first project to get started</p>
                      <Button 
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700" 
                        onClick={handleNewProject}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Project
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Issues */}
            {issues.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-emerald-700">Recent Issues</CardTitle>
                      <CardDescription>Issues that need attention</CardDescription>
                    </div>
                    <Link to="/issues">
                      <Button variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                        View All Issues
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {issues.map((issue, index) => (
                      <div key={issue.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-all duration-200">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{issue.title}</p>
                          <p className="text-sm text-gray-600">{issue.projects?.name}</p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {issue.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Team Overview */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-emerald-700">Team Members</CardTitle>
                    <CardDescription>Your project team</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMember}
                    className="border-emerald-300 hover:bg-emerald-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {teamMembers.filter(m => m.status === 'Active').slice(0, 5).map((member, index) => {
                    // Calculate member's project progress
                    const memberProjects = projects.filter(p => 
                      p.assignedTo?.includes(member.userId || member.id)
                    );
                    const avgProgress = memberProjects.length > 0 
                      ? Math.round(memberProjects.reduce((sum, p) => sum + p.progress, 0) / memberProjects.length)
                      : 0;

                    return (
                      <div key={member.id} className="p-3 rounded-lg hover:bg-emerald-50 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                        <div className="flex items-center gap-3 mb-2">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white font-semibold">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">{member.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                              {memberProjects.length} projects
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-1 h-auto">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMember(member)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeactivateMember(member.id)}>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {memberProjects.length > 0 && (
                          <div className="ml-13">
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                              <span>Assigned Projects:</span>
                              <span>{avgProgress}% avg progress</span>
                            </div>
                            <div className="space-y-1">
                              {memberProjects.slice(0, 2).map((project) => (
                                <div key={project.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 truncate">{project.name}</span>
                                  <span className="text-emerald-600 font-medium">{project.progress}%</span>
                                </div>
                              ))}
                              {memberProjects.length > 2 && (
                                <p className="text-xs text-gray-500">+{memberProjects.length - 2} more</p>
                              )}
                            </div>
                            <Progress value={avgProgress} className="h-2 mt-1" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {teamMembers.filter(m => m.status === 'Active').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm mb-3">No team members yet</p>
                      <Button onClick={handleAddMember} variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Team Member
                      </Button>
                    </div>
                  )}
                </div>
                <Link to="/users">
                  <Button variant="outline" className="w-full mt-4 border-emerald-300 hover:bg-emerald-50">
                    View All Team Members
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Clients Overview */}
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl text-emerald-700">Recent Clients</CardTitle>
                    <CardDescription>Clients who signed up</CardDescription>
                  </div>
                  <Link to="/users">
                    <Button variant="outline" size="sm" className="border-emerald-300 hover:bg-emerald-50">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {clients.slice(0, 5).map((client, index) => (
                    <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-emerald-50 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white font-semibold">
                          {client.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{client.full_name}</p>
                        <p className="text-sm text-gray-500">{client.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className={client.status === 'active' ? 'border-green-300 text-green-700' : 'border-gray-300 text-gray-700'}>
                          {client.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(client.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {clients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No clients have signed up yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <TeamMemberDialog
        open={isTeamDialogOpen}
        onOpenChange={setIsTeamDialogOpen}
        member={selectedMember}
        onSave={handleSaveMember}
        onDelete={deleteTeamMember}
        onDeactivate={deactivateTeamMember}
      />
    </div>
  );
};

export default CompanyDashboard;
