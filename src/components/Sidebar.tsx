
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@/contexts/UserContext";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { 
  Briefcase, 
  Users, 
  Archive, 
  Grid, 
  DollarSign, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  Shield,
  Building2,
  AlertCircle,
  BarChart3,
  LogOut
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

const Sidebar = ({ className }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, isAdmin, isCompany, isClient, logout } = useUser();
  const { projects } = useProjects();
  const { teamMembers } = useTeamMembers();

  // Dynamic navigation based on user role
  const getNavigation = () => {
    if (isAdmin) {
      return [
        { name: "Dashboard", href: "/admin", icon: Grid },
        { name: "Companies", href: "/admin", icon: Building2 },
        { name: "All Projects", href: "/projects", icon: Briefcase },
        { name: "All Users", href: "/users", icon: Users },
        { name: "System Issues", href: "/issues", icon: AlertCircle },
        { name: "Billing", href: "/billing", icon: DollarSign },
        { name: "Analytics", href: "/analytics", icon: BarChart3 },
      ];
    } else if (isCompany) {
      return [
        { name: "Dashboard", href: "/company", icon: Grid },
        { name: "Projects", href: "/projects", icon: Briefcase },
        { name: "Kanban", href: "/kanban", icon: Archive },
        { name: "Team", href: "/users", icon: Users },
        { name: "Issues", href: "/issues", icon: AlertCircle },
        { name: "Billing", href: "/billing", icon: DollarSign },
      ];
    } else if (isClient) {
      return [
        { name: "Dashboard", href: "/client", icon: Grid },
        { name: "My Projects", href: "/projects", icon: Briefcase },
        { name: "Issues", href: "/issues", icon: AlertCircle },
        { name: "Support", href: "/contact", icon: Bell },
      ];
    }
    return [];
  };

  const navigation = getNavigation();

  const isActive = (href: string) => {
    if (href === "/dashboard" || href === "/admin" || href === "/company" || href === "/client") {
      return location.pathname === href || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  const getRoleInfo = () => {
    if (isAdmin) return { label: "System Admin", icon: Shield, color: "text-red-600" };
    if (isCompany) return { label: "Company Manager", icon: Building2, color: "text-blue-600" };
    if (isClient) return { label: "Client User", icon: User, color: "text-green-600" };
    return { label: "User", icon: User, color: "text-gray-600" };
  };

  const roleInfo = getRoleInfo();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const getQuickStats = () => {
    if (isAdmin) {
      return {
        stat1: { label: "Total Companies", value: "4" },
        stat2: { label: "Active Users", value: "25" },
        stat3: { label: "Support Tickets", value: "12" }
      };
    } else if (isCompany) {
      return {
        stat1: { label: "Active Projects", value: projects.filter(p => p.status === 'In Progress').length.toString() },
        stat2: { label: "Team Members", value: teamMembers.filter(m => m.status === 'Active').length.toString() },
        stat3: { label: "Open Issues", value: "5" }
      };
    } else {
      return {
        stat1: { label: "My Projects", value: projects.length.toString() },
        stat2: { label: "Open Issues", value: "2" },
        stat3: { label: "Notifications", value: "3" }
      };
    }
  };

  const quickStats = getQuickStats();

  const getCompanyName = () => {
    if (!user?.companyId) return "Your Company";
    
    const companies = {
      "catech": "CATECH",
      "innovatecorp": "InnovateCorp", 
      "digitalsolutions": "DigitalSolutions",
      "techforward": "TechForward"
    };
    
    return companies[user.companyId] || user.companyId.toUpperCase();
  };

  return (
    <div className={cn(
      "flex flex-col bg-white/80 backdrop-blur-sm border-r border-emerald-200 transition-all duration-300 shadow-lg",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-200">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-amber-500 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">ProjectHub</h2>
              <p className="text-xs text-emerald-600">{getCompanyName()}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-emerald-50"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="p-4 border-b border-emerald-100">
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-emerald-50 to-amber-50 rounded-lg">
            <roleInfo.icon className={`w-4 h-4 ${roleInfo.color}`} />
            <span className="text-sm font-medium text-gray-700">{roleInfo.label}</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                isActive(item.href)
                  ? "bg-gradient-to-r from-emerald-100 to-amber-100 text-emerald-700 border border-emerald-200 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-emerald-50"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      {!collapsed && (
        <div className="p-4 border-t border-emerald-200">
          <Card className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50 border-emerald-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">{quickStats.stat1.label}</span>
                <span className="font-semibold text-gray-900">{quickStats.stat1.value}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">{quickStats.stat2.label}</span>
                <span className="font-semibold text-gray-900">{quickStats.stat2.value}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">{quickStats.stat3.label}</span>
                <Badge variant="secondary" className="text-xs h-5">
                  {quickStats.stat3.value}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Profile */}
      <div className="p-4 border-t border-emerald-200">
        {collapsed ? (
          <div className="flex flex-col gap-2">
            <Button variant="ghost" size="sm" className="w-full p-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white text-xs">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full p-2 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-amber-400 text-white text-sm">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
              <Button variant="ghost" size="sm" className="p-1 hover:bg-emerald-50">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
