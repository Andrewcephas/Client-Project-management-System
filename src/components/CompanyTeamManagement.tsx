import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Search } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamMemberDialog } from "@/components/TeamMemberDialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const CompanyTeamManagement = () => {
  const { user, isCompany } = useUser();
  const { teamMembers, loading, addTeamMember, updateTeamMember, deleteTeamMember } = useTeamMembers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  if (!isCompany) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Access denied. This feature is only available for company users.</p>
      </div>
    );
  }

  const handleAddMember = async (memberData: any) => {
    try {
      await addTeamMember({
        ...memberData,
        company_id: user?.companyId,
        avatar: memberData.name.split(' ').map((n: string) => n[0]).join('').toUpperCase(),
        projects: [],
        permissions: ['read', 'write'],
        hire_date: new Date().toISOString().split('T')[0]
      });
      toast.success("Team member added successfully");
    } catch (error) {
      toast.error("Failed to add team member");
    }
  };

  const handleUpdateMember = async (memberData: any) => {
    if (!selectedMember) return;
    
    try {
      await updateTeamMember(selectedMember.id, memberData);
      toast.success("Team member updated successfully");
    } catch (error) {
      toast.error("Failed to update team member");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    try {
      await deleteTeamMember(memberId);
      toast.success("Team member deleted successfully");
    } catch (error) {
      toast.error("Failed to delete team member");
    }
  };

  const handleDeactivateMember = async (memberId: string) => {
    try {
      await updateTeamMember(memberId, { status: 'Inactive' });
      toast.success("Team member deactivated successfully");
    } catch (error) {
      toast.error("Failed to deactivate team member");
    }
  };

  const openAddDialog = () => {
    setSelectedMember(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (member: any) => {
    setSelectedMember(member);
    setIsDialogOpen(true);
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Project Manager': return 'bg-purple-100 text-purple-800';
      case 'Developer': return 'bg-blue-100 text-blue-800';
      case 'Designer': return 'bg-pink-100 text-pink-800';
      case 'QA Engineer': return 'bg-yellow-100 text-yellow-800';
      case 'DevOps Engineer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-emerald-100 text-emerald-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading team members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700">Team Management</h2>
          <p className="text-gray-600">Manage your company team members</p>
        </div>
        <Button onClick={openAddDialog} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Team Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{teamMembers.length}</p>
              </div>
              <Users className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {teamMembers.filter(m => m.status === 'Active').length}
                </p>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-3xl font-bold text-red-600">
                  {teamMembers.filter(m => m.status === 'Inactive').length}
                </p>
              </div>
              <UserX className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-3xl font-bold text-blue-600">
                  {new Set(teamMembers.map(m => m.department)).size}
                </p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member, index) => (
          <Card key={member.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white font-semibold">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getRoleColor(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p><strong>Department:</strong> {member.department}</p>
                  <p><strong>Phone:</strong> {member.phone || 'N/A'}</p>
                  <p><strong>Hire Date:</strong> {new Date(member.hireDate).toLocaleDateString()}</p>
                  <p><strong>Salary:</strong> KES {member.salary.toLocaleString()}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">Projects ({member.projects?.length || 0})</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {member.projects?.slice(0, 3).map((project, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {project}
                      </Badge>
                    ))}
                    {(member.projects?.length || 0) > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{(member.projects?.length || 0) - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {teamMembers.length === 0 ? "No team members yet" : "No members found"}
          </h3>
          <p className="text-gray-600 mb-6">
            {teamMembers.length === 0 
              ? "Start building your team by adding your first member"
              : "Try adjusting your search terms"
            }
          </p>
          {teamMembers.length === 0 && (
            <Button onClick={openAddDialog} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add First Team Member
            </Button>
          )}
        </div>
      )}

      {/* Team Member Dialog */}
      <TeamMemberDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        member={selectedMember}
        onSave={selectedMember ? handleUpdateMember : handleAddMember}
        onDelete={handleDeleteMember}
        onDeactivate={handleDeactivateMember}
      />
    </div>
  );
};

export default CompanyTeamManagement;