import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  UserX, 
  Mail, 
  Phone,
  Briefcase,
  Calendar,
  TrendingUp,
  Building2,
  DollarSign
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useProjects } from "@/hooks/useProjects";
import { useCompanyClients } from "@/hooks/useCompanyClients";
import { TeamMemberDialog } from "@/components/TeamMemberDialog";
import { toast } from "sonner";

const Users = () => {
  const { user, isAdmin, isCompany } = useUser();
  const { teamMembers, loading: teamLoading, addTeamMember, updateTeamMember, deleteTeamMember, deactivateTeamMember } = useTeamMembers();
  const { clients, loading: clientsLoading, updateClientStatus } = useCompanyClients();
  const { projects } = useProjects();
  const [teamSearchTerm, setTeamSearchTerm] = useState("");
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );
  
  const filteredClients = clients.filter(client =>
    (client.full_name?.toLowerCase() || '').includes(clientSearchTerm.toLowerCase()) ||
    (client.email?.toLowerCase() || '').includes(clientSearchTerm.toLowerCase())
  );

  const getProjectsForMember = (memberId) => {
    return projects.filter(project => 
      project.assignedTo && project.assignedTo.includes(memberId)
    );
  };
  
  const getProjectsForClient = (clientId: string) => {
    return projects.filter(project => project.clientId === clientId);
  };

  const getAverageProgress = (memberProjects) => {
    if (memberProjects.length === 0) return 0;
    const totalProgress = memberProjects.reduce((sum, project) => sum + project.progress, 0);
    return Math.round(totalProgress / memberProjects.length);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const handleEditMember = (member) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const handleSaveMember = async (memberData) => {
    try {
      if (selectedMember) {
        await updateTeamMember(selectedMember.id, memberData);
        toast.success('Team member updated successfully');
      } else {
        await addTeamMember({
          ...memberData,
          avatar: memberData.name.split(' ').map(n => n[0]).join(''),
          projects: [],
          permissions: ['read'],
          hireDate: new Date().toISOString().split('T')[0]
        });
        toast.success('Team member added successfully');
      }
      setIsDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      toast.error('Failed to save team member');
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    
    try {
      await deleteTeamMember(memberId);
      toast.success('Team member deleted successfully');
    } catch (error) {
      toast.error('Failed to delete team member');
    }
  };

  const handleDeactivateMember = async (memberId) => {
    try {
      await deactivateTeamMember(memberId);
      toast.success('Team member deactivated successfully');
    } catch (error) {
      toast.error('Failed to deactivate team member');
    }
  };

  const handleClientStatusChange = async (client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    await updateClientStatus(client.id, newStatus);
  };

  const getStatusColor = (status) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin && !isCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Restricted</h2>
          <p className="text-gray-600">User management is only available for admin and company users.</p>
        </div>
      </div>
    );
  }

  if (teamLoading || clientsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your team members and clients</p>
            </div>
            {(isAdmin || isCompany) && (
              <Button 
                onClick={handleAddMember}
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Team Member
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="team-members" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="team-members">Team Members</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="team-members">
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search team members..."
                    value={teamSearchTerm}
                    onChange={(e) => setTeamSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member, index) => {
                // Calculate member's project assignments and progress
                const memberProjects = projects.filter(p => 
                  p.assignedTo?.includes(member.userId || member.id)
                );
                const avgProgress = memberProjects.length > 0 
                  ? Math.round(memberProjects.reduce((sum, p) => sum + p.progress, 0) / memberProjects.length)
                  : 0;

                return (
                  <Card 
                    key={member.id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/80 backdrop-blur-sm"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <CardHeader className="text-center border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white text-xl font-bold">
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-emerald-700">{member.name}</CardTitle>
                      <CardDescription className="text-gray-600">{member.email}</CardDescription>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge className={member.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {member.status}
                        </Badge>
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                          {member.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span>{member.department}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <Phone className="w-4 h-4" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Hired {member.hireDate}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{memberProjects.length} Active Projects</span>
                        </div>

                        {memberProjects.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Overall Progress</span>
                              <span className="font-medium text-emerald-600">{avgProgress}%</span>
                            </div>
                            <Progress value={avgProgress} />
                            
                            <div className="mt-3 space-y-1">
                              <p className="text-xs font-medium text-gray-700">Assigned Projects:</p>
                              {memberProjects.slice(0, 3).map((project) => (
                                <div key={project.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 truncate">{project.name}</span>
                                  <span className="text-emerald-600 font-medium">{project.progress}%</span>
                                </div>
                              ))}
                              {memberProjects.length > 3 && (
                                <p className="text-xs text-gray-500">+{memberProjects.length - 3} more projects</p>
                              )}
                            </div>
                          </div>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4" />
                            <span>KES {member.salary?.toLocaleString() || 'N/A'}</span>
                          </div>
                        )}
                      </div>

                      {(isAdmin || isCompany) && (
                        <div className="flex gap-2 mt-6 pt-4 border-t border-emerald-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMember(member)}
                            className="flex-1 border-emerald-300 hover:bg-emerald-50"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="border-emerald-300 hover:bg-emerald-50">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDeactivateMember(member.id)}>
                                <UserX className="w-4 h-4 mr-2" />
                                {member.status === 'Active' ? 'Deactivate' : 'Activate'}
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
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {filteredMembers.length === 0 && teamMembers.length > 0 && (
              <div className="text-center py-16">
                <UsersIcon className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No members found</h3>
                <p className="text-gray-600">Try adjusting your search term.</p>
              </div>
            )}

            {teamMembers.length === 0 && (
              <div className="text-center py-16">
                <UsersIcon className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No team members yet</h3>
                <p className="text-gray-600">Start building your team by adding your first member</p>
                {(isAdmin || isCompany) && (
                  <Button 
                    onClick={handleAddMember}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Team Member
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="clients">
            <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search clients..."
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client, index) => {
                const clientProjects = getProjectsForClient(client.id);
                return (
                  <Card 
                    key={client.id} 
                    className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/80 backdrop-blur-sm"
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <CardHeader className="text-center border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                      <Avatar className="w-20 h-20 mx-auto mb-4">
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-xl font-bold">
                          {client.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-xl text-emerald-700">{client.full_name}</CardTitle>
                      <CardDescription className="text-gray-600">{client.email}</CardDescription>
                      <div className="flex justify-center gap-2 mt-2">
                        <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {client.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(client.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4" />
                          <span>{clientProjects.length} Projects</span>
                        </div>

                        {clientProjects.length > 0 && (
                          <div className="space-y-2">
                             <div className="mt-3 space-y-1">
                              <p className="text-xs font-medium text-gray-700">Assigned Projects:</p>
                              {clientProjects.slice(0, 3).map((project) => (
                                <div key={project.id} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-600 truncate">{project.name}</span>
                                </div>
                              ))}
                              {clientProjects.length > 3 && (
                                <p className="text-xs text-gray-500">+{clientProjects.length - 3} more projects</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {(isAdmin || isCompany) && (
                        <div className="flex gap-2 mt-6 pt-4 border-t border-emerald-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full border-emerald-300 hover:bg-emerald-50">
                                <MoreVertical className="w-4 h-4 mr-2" />
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleClientStatusChange(client)}>
                                <UserX className="w-4 h-4 mr-2" />
                                {client.status === 'active' ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredClients.length === 0 && clients.length > 0 && (
              <div className="text-center py-16">
                <UsersIcon className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No clients found</h3>
                <p className="text-gray-600">Try adjusting your search term.</p>
              </div>
            )}
            
            {clients.length === 0 && (
              <div className="text-center py-16">
                <UsersIcon className="w-16 h-16 mx-auto mb-6 text-gray-300" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">No clients yet</h3>
                <p className="text-gray-600">Clients who register for your company will appear here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <TeamMemberDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          member={selectedMember}
          onSave={handleSaveMember}
          onDelete={deleteTeamMember}
          onDeactivate={deactivateTeamMember}
        />
      </div>
    </div>
  );
};

export default Users;
