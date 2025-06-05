import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Filter, MessageSquare, AlertTriangle, Bug, Clock, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Issues = () => {
  const { user, isAdmin, isCompany, isClient } = useUser();
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    projectId: "",
    labels: [] as string[]
  });

  useEffect(() => {
    if (user) {
      fetchIssues();
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      let query = supabase.from('projects').select('id, name, client, client_id, company_id');
      
      // Filter projects based on user role
      if (isClient) {
        // Clients only see their assigned projects
        query = query.eq('client_id', user.id);
      } else if (isCompany) {
        // Company users see projects from their company
        query = query.eq('company_id', user.companyId);
      }
      // Admin sees all projects

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('issues')
        .select(`
          *,
          projects!inner(id, name, client, company_id, client_id)
        `);

      // Filter issues based on user role
      if (isClient) {
        // Clients see issues from their assigned projects or issues they created
        query = query.or(`projects.client_id.eq.${user.id},created_by.eq.${user.id}`);
      } else if (isCompany) {
        // Company users see issues from their company's projects
        query = query.eq('projects.company_id', user.companyId);
      }
      // Admin sees all issues

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setIssues(data || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIssue = async () => {
    if (!newIssue.title || !newIssue.description || !newIssue.projectId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('issues')
        .insert([{
          title: newIssue.title,
          description: newIssue.description,
          priority: newIssue.priority,
          project_id: newIssue.projectId,
          created_by: user.id,
          status: 'Open',
          labels: newIssue.labels
        }]);

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

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', issueId);

      if (error) throw error;
      toast.success('Issue status updated');
      fetchIssues();
    } catch (error) {
      console.error('Error updating issue:', error);
      toast.error('Failed to update issue status');
    }
  };

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
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical": return AlertTriangle;
      case "High": return AlertTriangle;
      case "Medium": return Bug;
      case "Low": return MessageSquare;
      default: return MessageSquare;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-fade-in">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
              Issues & Bug Reports
            </h1>
            <p className="text-gray-600 mt-2">
              Track and manage project issues and bug reports
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
                  <Label htmlFor="issueTitle">Issue Title</Label>
                  <Input
                    id="issueTitle"
                    value={newIssue.title}
                    onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={newIssue.projectId} onValueChange={(value) => setNewIssue({...newIssue, projectId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projects.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No projects available. Please contact your project manager.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIssue.description}
                    onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                    placeholder="Detailed description of the issue..."
                    rows={4}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newIssue.priority} onValueChange={(value: "Low" | "Medium" | "High" | "Critical") => setNewIssue({...newIssue, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                <Button onClick={handleAddIssue} className="bg-emerald-600 hover:bg-emerald-700">
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
            <SelectContent>
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
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Issues List */}
        <div className="space-y-4">
          {filteredIssues.map((issue, index) => {
            const PriorityIcon = getPriorityIcon(issue.priority);
            return (
              <Card key={issue.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/70 backdrop-blur-sm" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(issue.priority)}`}>
                          <PriorityIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {issue.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Project: {issue.projects?.name} • Created {new Date(issue.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 line-clamp-2">
                        {issue.description}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(issue.status)}>
                          {issue.status}
                        </Badge>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority}
                        </Badge>
                        {issue.labels && issue.labels.length > 0 && (
                          <div className="flex gap-2">
                            {issue.labels.map((label, idx) => (
                              <Badge key={idx} variant="outline" className="border-emerald-300 text-emerald-700">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {(isAdmin || isCompany) && (
                      <div className="flex gap-2 ml-4">
                        {issue.status === 'Open' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateIssueStatus(issue.id, 'In Progress')}
                            className="bg-yellow-600 hover:bg-yellow-700"
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Start Work
                          </Button>
                        )}
                        {issue.status === 'In Progress' && (
                          <Button 
                            size="sm" 
                            onClick={() => updateIssueStatus(issue.id, 'Resolved')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                        {issue.status === 'Resolved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateIssueStatus(issue.id, 'Closed')}
                            className="border-emerald-300 hover:bg-emerald-50"
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredIssues.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms or filters" : "No issues have been reported yet"}
              </p>
              <Button 
                onClick={() => setIsAddIssueOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report First Issue
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Issues;
