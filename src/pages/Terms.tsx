import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-black rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-2xl font-bold">ProjectHub</span>
              </Link>
              <span className="text-muted-foreground">Terms of Service</span>
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/">
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="prose prose-gray max-w-none dark:prose-invert">
          <h2>Acceptance of Terms</h2>
          <p>
            By accessing and using ProjectHub, you accept and agree to be bound by the terms
            and provision of this agreement.
          </p>

          <h2>Use License</h2>
          <p>
            Permission is granted to temporarily use ProjectHub for personal and commercial use.
            This is the grant of a license, not a transfer of title.
          </p>

          <h2>Disclaimer</h2>
          <p>
            The materials on ProjectHub are provided on an 'as is' basis. ProjectHub makes no
            warranties, expressed or implied, and hereby disclaims and negates all other warranties.
          </p>

          <h2>Limitations</h2>
          <p>
            In no event shall ProjectHub or its suppliers be liable for any damages arising out of
            the use or inability to use the materials on ProjectHub.
          </p>

          <h2>Account Termination</h2>
          <p>
            We reserve the right to terminate accounts that violate these terms or engage in
            prohibited activities.
          </p>

          <h2>Contact Information</h2>
          <p>
            If you have questions about these Terms of Service, please contact us at:
          </p>
          <ul>
            <li>Email: ngumbaucephas2@gmail.com</li>
            <li>Phone: 0793614592</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Terms;