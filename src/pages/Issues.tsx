
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, MessageSquare, AlertCircle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  labels: string[];
  project_id: string;
  project_name?: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
}

const Issues = () => {
  const { user, isAdmin, isCompany, isClient } = useUser();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    projectId: "",
    labels: [] as string[]
  });

  const fetchProjects = async () => {
    if (!user) return;

    try {
      let query = supabase.from('projects').select('id, name');
      
      if (isClient) {
        // Clients only see projects they are assigned to
        query = query.eq('client_id', user.id);
      } else if (isCompany) {
        // Company users see projects from their company
        query = query.eq('company_id', user.companyId);
      }
      // Admin sees all projects
      
      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;

      console.log('Fetched projects for issues:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };

  const fetchIssues = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('issues')
        .select(`
          *,
          projects!inner(name)
        `);
      
      if (isClient) {
        // Clients see issues from their projects or issues they created
        query = query.or(`created_by.eq.${user.id},projects.client_id.eq.${user.id}`);
      } else if (isCompany) {
        // Company users see issues from their company's projects
        query = query.eq('projects.company_id', user.companyId);
      }
      // Admin sees all issues
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedIssues: Issue[] = data.map(issue => ({
        id: issue.id,
        title: issue.title,
        description: issue.description || '',
        status: issue.status,
        priority: issue.priority,
        labels: issue.labels || [],
        project_id: issue.project_id,
        project_name: issue.projects?.name,
        assigned_to: issue.assigned_to,
        created_by: issue.created_by,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      }));

      setIssues(formattedIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const addIssue = async () => {
    if (!user || !newIssue.title || !newIssue.description || !newIssue.projectId) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { error } = await supabase
        .from('issues')
        .insert({
          title: newIssue.title,
          description: newIssue.description,
          priority: newIssue.priority,
          project_id: newIssue.projectId,
          labels: newIssue.labels,
          created_by: user.id,
          status: 'Open'
        });

      if (error) throw error;

      toast.success('Issue created successfully');
      setNewIssue({
        title: "",
        description: "",
        priority: "Medium",
        projectId: "",
        labels: []
      });
      setIsAddIssueOpen(false);
      fetchIssues();
    } catch (error) {
      console.error('Error creating issue:', error);
      toast.error('Failed to create issue');
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchIssues();
    }
  }, [user]);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === "all" || issue.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-800";
      case "In Progress": return "bg-yellow-100 text-yellow-800";
      case "Resolved": return "bg-green-100 text-green-800";
      case "Closed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "bg-red-100 text-red-800";
      case "High": return "bg-orange-100 text-orange-800";
      case "Medium": return "bg-amber-100 text-amber-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Open": return AlertCircle;
      case "In Progress": return Clock;
      case "Resolved": return CheckCircle;
      case "Closed": return CheckCircle;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-emerald-600 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Issues & Support
            </h1>
            <p className="text-gray-600 mt-2">
              {isClient ? "Report issues and track their resolution" : "Manage and resolve project issues"}
            </p>
          </div>

          <Dialog open={isAddIssueOpen} onOpenChange={setIsAddIssueOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-emerald-700">Report New Issue</DialogTitle>
                <DialogDescription>
                  Describe the issue you're experiencing
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="issueTitle">Title *</Label>
                  <Input
                    id="issueTitle"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="project">Project *</Label>
                  <Select 
                    value={newIssue.projectId} 
                    onValueChange={(value) => setNewIssue({...newIssue, projectId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-projects" disabled>
                          No projects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {projects.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No projects found. You need to be assigned to projects first.
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                    placeholder="Detailed description of the issue..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newIssue.priority} 
                    onValueChange={(value: "Low" | "Medium" | "High" | "Critical") => setNewIssue({...newIssue, priority: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border shadow-lg z-50">
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsAddIssueOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={addIssue} 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={!newIssue.title || !newIssue.description || !newIssue.projectId}
                >
                  Report Issue
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 border-emerald-200 focus:border-emerald-500 bg-white/70 backdrop-blur-sm"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 border-emerald-200 focus:border-emerald-500 bg-white/70 backdrop-blur-sm">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-40 border-emerald-200 focus:border-emerald-500 bg-white/70 backdrop-blur-sm">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-lg z-50">
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issues List */}
        <div className="grid gap-6">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue, index) => {
              const StatusIcon = getStatusIcon(issue.status);
              return (
                <Card key={issue.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusIcon className="w-5 h-5 text-gray-500" />
                          <h3 className="font-semibold text-lg text-gray-900">{issue.title}</h3>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{issue.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Project: <span className="font-medium">{issue.project_name}</span></span>
                          <span>Created: {new Date(issue.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(issue.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="border-emerald-300 hover:bg-emerald-50">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? "No issues match your search criteria" : "No issues have been reported yet"}
                </p>
                {projects.length > 0 && (
                  <Button 
                    onClick={() => setIsAddIssueOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Report First Issue
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Issues;
