
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompanies, Company } from "@/hooks/useCompanies";
import { Building2, Plus, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const CompanyManagement = () => {
  const { companies, loading, addCompany, updateCompany, deactivateExpiredSubscriptions } = useCompanies();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    subscription_plan: "trial",
    subscription_status: "trial" as "active" | "trial" | "expired",
    status: "active" as "active" | "inactive"
  });

  const handleAddCompany = async () => {
    if (!newCompany.name || !newCompany.email) {
      toast.error("Name and email are required");
      return;
    }

    const subscriptionEndDate = newCompany.subscription_status === 'active' 
      ? new Date(Date.now() + (newCompany.subscription_plan === 'trial' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const result = await addCompany({
      ...newCompany,
      subscription_end_date: subscriptionEndDate
    });

    if (result.success) {
      toast.success("Company added successfully");
      setNewCompany({
        name: "",
        email: "",
        subscription_plan: "trial",
        subscription_status: "trial",
        status: "active"
      });
      setIsAddDialogOpen(false);
    } else {
      toast.error("Failed to add company");
    }
  };

  const handleStatusChange = async (company: Company, newStatus: "active" | "inactive") => {
    const result = await updateCompany(company.id, { status: newStatus });
    if (result.success) {
      toast.success(`Company ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
    } else {
      toast.error("Failed to update company status");
    }
  };

  const handleSubscriptionUpdate = async (company: Company, plan: string, status: "active" | "trial" | "expired") => {
    const subscriptionEndDate = status === 'active' 
      ? new Date(Date.now() + (plan === 'trial' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const result = await updateCompany(company.id, {
      subscription_plan: plan,
      subscription_status: status,
      subscription_end_date: subscriptionEndDate,
      status: status === 'expired' ? 'inactive' : company.status
    });

    if (result.success) {
      toast.success("Subscription updated successfully");
    } else {
      toast.error("Failed to update subscription");
    }
  };

  const handleExpiredSubscriptionsCleanup = async () => {
    await deactivateExpiredSubscriptions();
    toast.success("Expired subscriptions deactivated");
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-green-100 text-green-800';
      case 'basic': return 'bg-blue-100 text-blue-800';
      case 'trial': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isSubscriptionExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return <div className="text-center p-8">Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700">Company Management</h2>
          <p className="text-gray-600">Manage companies and their subscriptions</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleExpiredSubscriptionsCleanup}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Cleanup Expired
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>Create a new company with subscription details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name"
                    value={newCompany.name}
                    onChange={(e) => setNewCompany({...newCompany, name: e.target.value})}
                    placeholder="Company Name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCompany.email}
                    onChange={(e) => setNewCompany({...newCompany, email: e.target.value})}
                    placeholder="admin@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <Select value={newCompany.subscription_plan} onValueChange={(value) => setNewCompany({...newCompany, subscription_plan: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="subscriptionStatus">Subscription Status</Label>
                  <Select value={newCompany.subscription_status} onValueChange={(value: "active" | "trial" | "expired") => setNewCompany({...newCompany, subscription_status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCompany}>
                    Add Company
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {companies.map((company) => (
          <Card key={company.id} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-amber-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    <p className="text-gray-600">{company.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPlanColor(company.subscription_plan)}>
                        {company.subscription_plan}
                      </Badge>
                      <Badge className={getStatusColor(company.subscription_status)}>
                        {company.subscription_status}
                      </Badge>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                      {company.subscription_end_date && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Expires: {new Date(company.subscription_end_date).toLocaleDateString()}
                          </span>
                          {isSubscriptionExpired(company.subscription_end_date) && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Select 
                    value={company.subscription_plan} 
                    onValueChange={(plan) => handleSubscriptionUpdate(company, plan, company.subscription_status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={company.subscription_status} 
                    onValueChange={(status: "active" | "trial" | "expired") => handleSubscriptionUpdate(company, company.subscription_plan, status)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trial">Trial</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant={company.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => handleStatusChange(company, company.status === 'active' ? 'inactive' : 'active')}
                    className={company.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 hover:bg-green-700'}
                  >
                    {company.status === 'active' ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-16">
          <Building2 className="w-16 h-16 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No companies yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first company</p>
        </div>
      )}
    </div>
  );
};

export default CompanyManagement;
