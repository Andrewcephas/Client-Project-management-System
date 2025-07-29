
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
import { useProject } from "@/contexts/ProjectContext";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Filter, Grid, List, Calendar, Users, DollarSign, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Projects = () => {
  const { user, isAdmin, isCompany, isClient } = useUser();
  const { projects, addProject, loading } = useProject();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    client: "",
    clientId: "",
    dueDate: "",
    priority: "Medium" as "Low" | "Medium" | "High",
    budget: 0
  });

  // Fetch clients for company users
  useEffect(() => {
    if (isCompany && user?.companyId) {
      fetchClients();
    }
  }, [isCompany, user?.companyId]);

  const fetchClients = async () => {
    if (!user?.companyId) {
      console.log('No company ID found for user:', user);
      return;
    }

    try {
      console.log('Fetching clients for company:', user.companyId);
      
      // Convert company_id from text to UUID for proper querying
      let companyUuid;
      try {
        companyUuid = user.companyId;
        // If companyId is not a valid UUID format, try to find it by matching company name/email
        if (!user.companyId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
          // Find the actual company UUID by matching the company name
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .ilike('name', `%${user.companyName}%`)
            .single();
          
          if (companyData) {
            companyUuid = companyData.id;
          }
        }
      } catch (error) {
        console.error('Error processing company ID:', error);
      }

      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, email, company_id, company_name, user_id')
        .eq('company_id', companyUuid);

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      console.log('Fetched clients:', data);
      setClients(data || []);
      
      if (!data || data.length === 0) {
        toast.info('No clients found for your company. Clients need to register and select your company.');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to fetch clients');
    }
  };

  const handleAddProject = async () => {
    if (newProject.name && newProject.description && isCompany && user?.companyId) {
      // Find the selected client's full name for display
      const selectedClient = clients.find(c => c.user_id === newProject.clientId);
      const clientName = selectedClient ? selectedClient.full_name || selectedClient.email : newProject.client;

      await addProject({
        name: newProject.name,
        description: newProject.description,
        status: "Planning",
        progress: 0,
        team: [],
        dueDate: newProject.dueDate,
        priority: newProject.priority,
        client: clientName,
        budget: newProject.budget,
        spent: 0,
        phase: "Planning",
        nextMilestone: "",
        lastUpdate: new Date().toISOString().split('T')[0],
        createdBy: user.id,
        assignedTo: [],
        companyId: user.companyId,
        clientId: newProject.clientId || undefined
      });
      
      setNewProject({
        name: "",
        description: "",
        client: "",
        clientId: "",
        dueDate: "",
        priority: "Medium",
        budget: 0
      });
      setIsAddProjectOpen(false);
    }
  };

  // Filter projects based on user role
  const filteredProjects = projects.filter(project => {
    // For clients, only show their assigned projects
    if (isClient && user) {
      const isAssignedToClient = project.clientId === user.id;
      if (!isAssignedToClient) return false;
    }

    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status.toLowerCase() === statusFilter;
    const matchesPriority = priorityFilter === "all" || project.priority.toLowerCase() === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-emerald-100 text-emerald-800";
      case "Planning": return "bg-amber-100 text-amber-800";
      case "Completed": return "bg-green-100 text-green-800";
      case "On Hold": return "bg-red-100 text-red-800";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
          <p className="text-gray-600">Loading projects...</p>
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
              {isAdmin ? "All Projects" : isClient ? "My Projects" : "Company Projects"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isAdmin ? "System-wide project overview" : isClient ? "Track your project progress" : "Manage your client projects"}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/70 backdrop-blur-sm border border-emerald-200 rounded-lg overflow-hidden shadow-sm">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {(isAdmin || isCompany) && (
              <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="text-emerald-700">Create New Project</DialogTitle>
                    <DialogDescription>
                      Add a new project to your portfolio
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        value={newProject.name}
                        onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                        placeholder="Brief project description..."
                      />
                    </div>
                    {isCompany && (
                      <div className="grid gap-2">
                        <Label htmlFor="client">Select Client</Label>
                        <Select 
                          value={newProject.clientId} 
                          onValueChange={(value) => {
                            const selectedClient = clients.find(c => c.user_id === value);
                            setNewProject({
                              ...newProject, 
                              clientId: value,
                              client: selectedClient ? (selectedClient.full_name || selectedClient.email) : ''
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a client" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg z-50">
                            {clients.length > 0 ? (
                              clients.map((client) => (
                                <SelectItem key={client.id} value={client.user_id}>
                                  {client.full_name || client.email} ({client.email})
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-clients" disabled>
                                No clients available - clients need to register first
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        {clients.length === 0 && (
                          <p className="text-sm text-gray-500 mt-1">
                            No clients found. Clients need to register and select your company first.
                          </p>
                        )}
                      </div>
                    )}
                    {!isCompany && (
                      <div className="grid gap-2">
                        <Label htmlFor="client">Client</Label>
                        <Input
                          id="client"
                          value={newProject.client}
                          onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                          placeholder="Client Name"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={newProject.dueDate}
                          onChange={(e) => setNewProject({...newProject, dueDate: e.target.value})}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select value={newProject.priority} onValueChange={(value: "Low" | "Medium" | "High") => setNewProject({...newProject, priority: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white border shadow-lg z-50">
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="budget">Budget (KES)</Label>
                      <Input
                        id="budget"
                        type="number"
                        value={newProject.budget}
                        onChange={(e) => setNewProject({...newProject, budget: parseInt(e.target.value) || 0})}
                        placeholder="500000"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddProjectOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddProject} 
                      className="bg-emerald-600 hover:bg-emerald-700"
                      disabled={!newProject.name || !newProject.description || (isCompany && !newProject.clientId)}
                    >
                      Create Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search projects..."
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
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on hold">On Hold</SelectItem>
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

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/70 backdrop-blur-sm cursor-pointer" style={{animationDelay: `${index * 100}ms`}}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2">
                      {project.name}
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="p-1 hover:bg-emerald-50">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                    <Badge className={getPriorityColor(project.priority)}>
                      {project.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-emerald-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.team?.length || 0} members
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{project.client}</span>
                      <div className="flex items-center gap-1 text-emerald-600 font-medium">
                        <DollarSign className="w-4 h-4" />
                        KES {project.budget?.toLocaleString() || 0}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // List view
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="divide-y divide-emerald-100">
                {filteredProjects.map((project, index) => (
                  <div key={project.id} className="p-6 hover:bg-emerald-50/50 transition-all duration-200 cursor-pointer animate-fade-in" style={{animationDelay: `${index * 50}ms`}}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                            {project.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg hover:text-emerald-600 transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-gray-600 line-clamp-1">{project.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <Badge className={getPriorityColor(project.priority)}>
                              {project.priority}
                            </Badge>
                          </div>
                          <span>{project.team?.length || 0} members</span>
                          <span>{project.client}</span>
                          <span>Due {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
                        </div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="text-sm text-gray-600 mb-2">{project.progress}% Complete</div>
                        <div className="w-32 bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-emerald-600 font-medium">
                          KES {project.budget?.toLocaleString() || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProjects.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "Try adjusting your search terms or filters" : "Get started by creating your first project"}
              </p>
              {(isAdmin || isCompany) && !searchTerm && (
                <Button 
                  onClick={() => setIsAddProjectOpen(true)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Projects;
