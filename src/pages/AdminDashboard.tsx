
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, CreditCard, AlertTriangle, TrendingUp, Plus, Search, Filter } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useCompanies } from "@/hooks/useCompanies";
import CompanyManagement from "@/components/CompanyManagement";
import AdminUserManagement from "@/components/AdminUserManagement";
import AdminPricingManagement from "@/components/AdminPricingManagement";

const AdminDashboard = () => {
  const { user } = useUser();
  const { companies, getActiveCompanies } = useCompanies();

  const stats = [
    { 
      title: "Total Companies", 
      value: companies.length.toString(), 
      icon: Building2, 
      change: "+12 this month", 
      color: "bg-emerald-50 text-emerald-600" 
    },
    { 
      title: "Active Companies", 
      value: getActiveCompanies().length.toString(), 
      icon: Building2, 
      change: "+5 this week", 
      color: "bg-blue-50 text-blue-600" 
    },
    { 
      title: "Expired Subscriptions", 
      value: companies.filter(c => c.subscription_status === 'expired').length.toString(), 
      icon: AlertTriangle, 
      change: "Need attention", 
      color: "bg-red-50 text-red-600" 
    },
    { 
      title: "Trial Companies", 
      value: companies.filter(c => c.subscription_status === 'trial').length.toString(), 
      icon: CreditCard, 
      change: "Potential conversions", 
      color: "bg-amber-50 text-amber-600" 
    }
  ];

  const recentCompanies = companies.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="animate-fade-in">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-amber-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-2">System overview and company management</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/70 backdrop-blur-sm" style={{animationDelay: `${index * 100}ms`}}>
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

        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="companies">
            <CompanyManagement />
          </TabsContent>

          <TabsContent value="users">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="pricing">
            <AdminPricingManagement />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Companies */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                  <CardTitle className="text-xl text-emerald-700">Recent Companies</CardTitle>
                  <CardDescription>Latest company registrations</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentCompanies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{company.name}</p>
                          <p className="text-sm text-gray-600">{company.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={company.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {company.subscription_status}
                          </Badge>
                          <Badge variant="outline">
                            {company.subscription_plan}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* System Health */}
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                  <CardTitle className="text-xl text-emerald-700">System Health</CardTitle>
                  <CardDescription>Platform status and metrics</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database Status</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Response Time</span>
                      <span className="text-sm font-medium">125ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Active Sessions</span>
                      <span className="text-sm font-medium">47</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Storage Usage</span>
                      <span className="text-sm font-medium">2.3GB / 100GB</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-amber-50">
                <CardTitle className="text-xl text-emerald-700">Analytics & Reports</CardTitle>
                <CardDescription>Detailed insights and performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-emerald-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                    <h3 className="font-semibold text-gray-900">Revenue Growth</h3>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">+24%</p>
                    <p className="text-sm text-gray-600">vs last month</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">User Retention</h3>
                    <p className="text-2xl font-bold text-blue-600 mt-1">89%</p>
                    <p className="text-sm text-gray-600">monthly retention</p>
                  </div>
                  <div className="text-center p-6 bg-amber-50 rounded-lg">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-amber-600" />
                    <h3 className="font-semibold text-gray-900">Conversion Rate</h3>
                    <p className="text-2xl font-bold text-amber-600 mt-1">12.5%</p>
                    <p className="text-sm text-gray-600">trial to paid</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
