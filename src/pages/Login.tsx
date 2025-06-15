
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/contexts/UserContext";
import { toast } from "sonner";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";
import { SocialAuth } from "@/components/auth/SocialAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useUser();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    
    if (success) {
      toast.success("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <AuthHeader 
          title="Welcome back" 
          subtitle="Sign in to your account to continue" 
        />

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <LoginForm onSubmit={handleLogin} loading={loading} />
            <SocialAuth />

            <div className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
                Sign up
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

export default Login;
