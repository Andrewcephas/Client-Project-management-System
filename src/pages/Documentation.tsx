import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, ArrowLeft, Book, Code, Users, Settings } from "lucide-react";

const Documentation = () => {
  const sections = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "Getting Started",
      description: "Learn the basics of ProjectHub and set up your first project",
      topics: [
        "Creating your account",
        "Setting up your first project", 
        "Inviting team members",
        "Basic project management"
      ]
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Team Management",
      description: "Manage your team, roles, and permissions effectively",
      topics: [
        "Adding team members",
        "Setting roles and permissions",
        "Managing departments",
        "Team collaboration features"
      ]
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "API Documentation",
      description: "Integrate ProjectHub with your existing tools and workflows",
      topics: [
        "REST API endpoints",
        "Authentication methods",
        "Webhooks and callbacks",
        "Rate limiting"
      ]
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Advanced Features",
      description: "Unlock the full potential of ProjectHub with advanced configurations",
      topics: [
        "Custom workflows",
        "Advanced reporting",
        "Integration settings",
        "Security configurations"
      ]
    }
  ];

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
              <span className="text-muted-foreground">Documentation</span>
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

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to know about using ProjectHub effectively. Get started quickly with our comprehensive guides and references.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {section.icon}
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </div>
                <p className="text-muted-foreground">{section.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.topics.map((topic, topicIndex) => (
                    <li key={topicIndex} className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
                      • {topic}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button>Contact Support</Button>
            </Link>
            <Button variant="outline">
              Email: ngumbaucephas2@gmail.com
            </Button>
            <Button variant="outline">
              Phone: 0793614592
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;