
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/contexts/UserContext";

interface RegisterFormProps {
  onSubmit: (data: RegisterData) => Promise<void>;
  loading: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  companyName?: string;
}

export const RegisterForm = ({ onSubmit, loading }: RegisterFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "" as UserRole,
    companyName: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email?.trim() || !formData.password?.trim() || !formData.fullName?.trim() || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.email.includes('@') || formData.email.length < 5) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.role === 'company' && !formData.companyName?.trim()) {
      toast.error("Company name is required for company accounts");
      return;
    }

    await onSubmit({
      email: formData.email.trim(),
      password: formData.password,
      fullName: formData.fullName.trim(),
      role: formData.role,
      companyName: formData.companyName?.trim()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-gray-800">Full Name *</Label>
        <Input
          id="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          required
          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-800">Email address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
          className="border-gray-300 focus:border-red-500 focus:ring-red-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role" className="text-gray-800">Role *</Label>
        <Select onValueChange={(value: UserRole) => setFormData({...formData, role: value})}>
          <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="company">Company</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.role === 'company' && (
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-gray-800">Company Name *</Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Your Company Name"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            required
            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-800">Password *</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-800">Confirm Password *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              className="border-gray-300 focus:border-red-500 focus:ring-red-500 pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
};
