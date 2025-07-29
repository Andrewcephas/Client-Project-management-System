import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: 'client' | 'company';
  companyName?: string;
  companyId?: string;
}

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => void;
  loading: boolean;
}

export const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
  const [formData, setFormData] = useState<RegisterData>({
    email: "",
    password: "",
    fullName: "",
    role: "client",
    companyName: "",
    companyId: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [companies, setCompanies] = useState<Array<{id: string, name: string}>>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  // Fetch companies for client registration
  useEffect(() => {
    const fetchCompanies = async () => {
      if (formData.role === 'client') {
        setLoadingCompanies(true);
        try {
          const { data, error } = await supabase
            .from('companies')
            .select('id, name')
            .eq('status', 'active')
            .order('name');
          
          if (error) throw error;
          setCompanies(data || []);
        } catch (error) {
          console.error('Error fetching companies:', error);
          toast.error('Failed to load companies');
        } finally {
          setLoadingCompanies(false);
        }
      }
    };

    fetchCompanies();
  }, [formData.role]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.role === 'client' && !formData.companyId) {
      toast.error("Please select a company");
      return;
    }
    
    if (formData.role === 'company' && !formData.companyName) {
      toast.error("Please enter your company name");
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="role">Account Type</Label>
        <Select 
          value={formData.role} 
          onValueChange={(value: 'client' | 'company') => setFormData({...formData, role: value, companyId: '', companyName: ''})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="client">Client - I want to hire a company</SelectItem>
            <SelectItem value="company">Company - I provide services</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          placeholder="Enter your full name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Enter your password"
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {formData.role === 'client' && (
        <div className="space-y-2">
          <Label htmlFor="company">Select Your Service Provider</Label>
          {loadingCompanies ? (
            <div className="flex items-center justify-center p-3 border rounded">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading companies...
            </div>
          ) : (
            <Select 
              value={formData.companyId} 
              onValueChange={(value) => {
                const selectedCompany = companies.find(c => c.id === value);
                setFormData({
                  ...formData, 
                  companyId: value,
                  companyName: selectedCompany?.name || ''
                });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a service provider" />
              </SelectTrigger>
              <SelectContent>
                {companies.length > 0 ? (
                  companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-companies" disabled>
                    No service providers available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          {companies.length === 0 && !loadingCompanies && (
            <p className="text-sm text-gray-500 mt-1">
              No service providers found. Please contact an administrator.
            </p>
          )}
        </div>
      )}

      {formData.role === 'company' && (
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            placeholder="Enter your company name"
            required
          />
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-red-600 hover:bg-red-700"
        disabled={loading || (formData.role === 'client' && loadingCompanies)}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create Account"
        )}
      </Button>
    </form>
  );
};