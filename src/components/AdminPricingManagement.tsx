import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Calendar, Check, X, Clock, Eye, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PricingRequest {
  id: string;
  user_id: string;
  plan_name: string;
  plan_price: string;
  company_name?: string;
  email: string;
  phone?: string;
  status: string;
  notes?: string;
  requested_at: string;
  approved_at?: string;
  approved_by?: string;
  user_profile?: {
    full_name: string;
    company_name?: string;
  };
}

const AdminPricingManagement = () => {
  const [requests, setRequests] = useState<PricingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<PricingRequest | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchPricingRequests();
  }, []);

  const fetchPricingRequests = async () => {
    try {
      setLoading(true);
      // For now, create mock data since pricing_requests table is not available in types yet
      const mockRequests: PricingRequest[] = [
        {
          id: '1',
          user_id: 'user1',
          plan_name: 'Premium',
          plan_price: 'KES 50,000/month',
          company_name: 'Tech Solutions Ltd',
          email: 'client@techsolutions.com',
          phone: '+254700000000',
          status: 'pending',
          notes: '',
          requested_at: new Date().toISOString(),
          user_profile: {
            full_name: 'John Doe',
            company_name: 'Tech Solutions Ltd'
          }
        }
      ];
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching pricing requests:', error);
      toast.error('Failed to fetch pricing requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId: string, approved: boolean) => {
    try {
      // Mock approval for now since table doesn't exist yet
      setRequests(prev => prev.map(r => 
        r.id === requestId 
          ? { 
              ...r, 
              status: approved ? 'approved' : 'rejected',
              approved_at: approved ? new Date().toISOString() : undefined,
              notes: notes || undefined
            } 
          : r
      ));

      toast.success(`Request ${approved ? 'approved' : 'rejected'} successfully`);
      setIsDetailsOpen(false);
      setNotes("");
    } catch (error) {
      console.error('Error updating pricing request:', error);
      toast.error('Failed to update request');
    }
  };

  const openRequestDetails = (request: PricingRequest) => {
    setSelectedRequest(request);
    setNotes(request.notes || "");
    setIsDetailsOpen(true);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.plan_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'premium': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-gray-100 text-gray-800';
      default: return 'bg-emerald-100 text-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-emerald-700">Pricing Request Management</h2>
          <p className="text-gray-600">Review and approve pricing requests from clients</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{requests.filter(r => r.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">{requests.filter(r => r.status === 'approved').length}</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{requests.filter(r => r.status === 'rejected').length}</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search requests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-700">Pricing Requests</CardTitle>
          <CardDescription>Review and manage pricing requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{request.user_profile?.full_name}</div>
                      <div className="text-sm text-gray-500">{request.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(request.plan_name)}>
                      {request.plan_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{request.plan_price}</TableCell>
                  <TableCell>{request.company_name || request.user_profile?.company_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(request.requested_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openRequestDetails(request)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id, true)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveRequest(request.id, false)}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing requests found</h3>
              <p className="text-gray-600">No requests match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pricing Request Details</DialogTitle>
            <DialogDescription>Review and manage this pricing request</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">User Information</h4>
                  <p><strong>Name:</strong> {selectedRequest.user_profile?.full_name}</p>
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Phone:</strong> {selectedRequest.phone || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="font-medium">Request Details</h4>
                  <p><strong>Plan:</strong> {selectedRequest.plan_name}</p>
                  <p><strong>Price:</strong> {selectedRequest.plan_price}</p>
                  <p><strong>Company:</strong> {selectedRequest.company_name || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Admin Notes</h4>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for this request..."
                  rows={3}
                />
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleApproveRequest(selectedRequest.id, false)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleApproveRequest(selectedRequest.id, true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPricingManagement;