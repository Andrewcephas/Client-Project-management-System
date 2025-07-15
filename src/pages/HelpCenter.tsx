import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Building2, ArrowLeft, Search, HelpCircle, MessageSquare, Phone, Mail } from "lucide-react";

const HelpCenter = () => {
  const faqs = [
    {
      question: "How do I create a new project?",
      answer: "Navigate to the Projects page and click 'Add Project'. Fill in the project details including name, description, client, and team members."
    },
    {
      question: "How can I invite team members?",
      answer: "Go to the Team Management section in your dashboard. Click 'Add Team Member' and enter their email address to send an invitation."
    },
    {
      question: "What subscription plans are available?",
      answer: "We offer Starter (Free), Professional ($29/month), and Enterprise (Custom) plans. Each plan includes different features and team member limits."
    },
    {
      question: "How do I track project progress?",
      answer: "Use the project dashboard to monitor progress. You can update project status, add milestones, and track completion percentages."
    },
    {
      question: "Can I integrate with other tools?",
      answer: "Yes! ProjectHub supports integrations with popular tools. Check our documentation for available integrations and setup instructions."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page and enter your email address. You'll receive instructions to reset your password."
    }
  ];

  const contactOptions = [
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "ngumbaucephas2@gmail.com",
      action: "Send Email"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      description: "Call us directly for immediate assistance",
      contact: "0793614592",
      action: "Call Now"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Live Chat",
      description: "Chat with our support team in real-time",
      contact: "Available 9 AM - 6 PM EAT",
      action: "Start Chat"
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
              <span className="text-muted-foreground">Help Center</span>
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Find answers to common questions or get in touch with our support team.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10"
            />
          </div>
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactOptions.map((option, index) => (
            <Card key={index} className="border-border text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                  {option.icon}
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
                <p className="text-muted-foreground text-sm">{option.description}</p>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-4">{option.contact}</p>
                <Button variant="outline" className="w-full">
                  {option.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                    <CardTitle className="text-lg leading-tight">{faq.question}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-muted/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6">
            If you can't find the answer you're looking for, don't hesitate to reach out to our support team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button>Contact Support</Button>
            </Link>
            <Link to="/documentation">
              <Button variant="outline">View Documentation</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;