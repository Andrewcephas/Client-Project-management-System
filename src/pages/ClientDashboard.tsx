
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, AlertCircle, CheckCircle, MessageSquare, Download, Play, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  budget: number;
  spent: number;
  phase?: string;
  nextMilestone?: string;
  lastUpdate: string;
  dueDate?: string;
  client: string;
  companyId: string;
}

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentUpdates] = useState([
    {
      id: 1,
      project: "Recent Project Update",
      message: "Latest progress on your projects",
      author: "Project Manager",
      date: new Date().toISOString().split('T')[0],
      type: "progress"
    }
  ]);

  const fetchMyProjects = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching projects for client:', user.id);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      console.log('Fetched client projects:', data);

      const formattedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        progress: project.progress,
        budget: Number(project.budget) || 0,
        spent: Number(project.spent) || 0,
        phase: project.phase || 'Planning',
        nextMilestone: project.next_milestone || 'To be determined',
        lastUpdate: new Date(project.updated_at).toISOString().split('T')[0],
        dueDate: project.due_date,
        client: 'Client', // Default client name
        companyId: project.company_id
      }));

      setProjects(formattedProjects);
      
      if (formattedProjects.length === 0) {
        toast.info('No projects assigned to you yet. Please contact your service provider.');
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyProjects();
    }
  }, [user]);

  const stats = [
    { title: "Active Projects", value: projects.filter(p => p.status === 'In Progress').length.toString(), icon: Clock, change: "On schedule", color: "bg-emerald-50 text-emerald-600" },
    { title: "Total Investment", value: `KES ${projects.reduce((sum, p) => sum + p.budget, 0).toLocaleString()}`, icon: CheckCircle, change: "Within budget", color: "bg-blue-50 text-blue-600" },
    { title: "Avg. Progress", value: `${Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(projects.length, 1))}%`, icon: AlertCircle, change: "Ahead of timeline", color: "bg-amber-50 text-amber-600" },
    { title: "Completed Projects", value: projects.filter(p => p.status === 'Completed').length.toString(), icon: MessageSquare, change: "This quarter", color: "bg-green-50 text-green-600" }
  ];

  const handleProjectClick = (projectId: string) => {
    navigate(`/client/projects/${projectId}`);
  };

  const handleTestProject = (projectId: string) => {
    alert(`Opening test environment for project ${projectId}`);
  };

  const handleRaiseIssue = () => {
    navigate("/issues");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Testing": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "Planning": return "bg-purple-100 text-purple-800";
      case "On Hold": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case "progress": return "bg-blue-100 text-blue-800";
      case "milestone": return "bg-green-100 text-green-800";
      case "approval": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
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
                Project Dashboard
              </h1>
              <p className="text-gray-600 mt-2">Track your project progress and updates</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleRaiseIssue}
                className="border-emerald-300 hover:bg-emerald-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Raise Issue
              </Button>
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => navigate("/contact")}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Support
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
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <CardTitle className="text-2xl text-emerald-700">My Projects</CardTitle>
                <CardDescription>Current projects and their progress</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-emerald-100">
                  {projects.length > 0 ? projects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="p-6 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer animate-fade-in"
                      onClick={() => handleProjectClick(project.id)}
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900 text-lg hover:text-emerald-600 transition-colors">
                              {project.name}
                            </h3>
                            <Badge className={`${getStatusColor(project.status)}`}>
                              {project.status}
                            </Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{project.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div>
                              <span className="font-medium">Current Phase:</span> {project.phase}
                            </div>
                            <div>
                              <span className="font-medium">Next Milestone:</span> {project.nextMilestone}
                            </div>
                            <div>
                              <span className="font-medium">Due Date:</span> {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                            </div>
                            <div>
                              <span className="font-medium">Last Update:</span> {project.lastUpdate}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Budget:</span> KES {project.budget.toLocaleString()} 
                              <span className="mx-2">•</span>
                              <span className="font-medium">Spent:</span> KES {project.spent.toLocaleString()}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTestProject(project.id);
                                }}
                                className="border-emerald-300 hover:bg-emerald-50"
                              >
                                <Play className="w-4 h-4 mr-1" />
                                Test
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert("Downloading project report...");
                                }}
                                className="border-emerald-300 hover:bg-emerald-50"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-12 text-center text-gray-500">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">No projects assigned yet</h3>
                      <p className="text-sm">You don't have any projects assigned to you. Please contact your service provider to get started!</p>
                      <Button 
                        className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => navigate("/contact")}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Updates */}
          <div>
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <CardTitle className="text-xl text-emerald-700">Recent Updates</CardTitle>
                <CardDescription>Latest project notifications</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <div key={update.id} className="p-4 rounded-lg border border-emerald-100 hover:bg-emerald-50/50 transition-all duration-200 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white text-xs font-semibold">
                            {update.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm text-gray-900">{update.project}</p>
                            <Badge className={`text-xs ${getUpdateTypeColor(update.type)}`}>
                              {update.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{update.message}</p>
                          <div className="text-xs text-gray-500">
                            {update.author} • {update.date}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 border-emerald-300 hover:bg-emerald-50">
                  View All Updates
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Progress": return "bg-emerald-100 text-emerald-800";
    case "Planning": return "bg-amber-100 text-amber-800";
    case "Completed": return "bg-green-100 text-green-800";
    case "On Hold": return "bg-red-100 text-red-800";
    case "Testing": return "bg-blue-100 text-blue-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getUpdateTypeColor = (type: string) => {
  switch (type) {
    case "progress": return "bg-blue-100 text-blue-800";
    case "milestone": return "bg-green-100 text-green-800";
    case "approval": return "bg-amber-100 text-amber-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default ClientDashboard;
