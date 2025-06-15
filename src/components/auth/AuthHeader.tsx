
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <>
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-black rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-black bg-clip-text text-transparent">
            ProjectHub
          </span>
        </Link>
      </div>

      <div className="text-center bg-gradient-to-r from-red-50 to-gray-50 rounded-t-lg p-6">
        <h1 className="text-2xl font-bold text-black">{title}</h1>
        <p className="text-gray-700 mt-2">{subtitle}</p>
      </div>
    </>
  );
};
