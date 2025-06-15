
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { RegisterForm, RegisterData } from "@/components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const { register, loading } = useUser();

  const handleRegister = async (data: RegisterData) => {
    const success = await register(data.email, data.password, {
      fullName: data.fullName,
      role: data.role,
      companyName: data.companyName,
      companyId: data.companyId,
    });
    
    if (success) {
      toast.success("Registration successful! You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <AuthHeader 
          title="Create your account" 
          subtitle="Join us and start managing your projects" 
        />

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <RegisterForm onSubmit={handleRegister} loading={loading} />

            <div className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
