
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  Briefcase, 
  BarChart3, 
  Shield, 
  Clock,
  ArrowRight,
  Star,
  Building2,
  Zap,
  Globe
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Landing = () => {
  const features = [
    {
      icon: Briefcase,
      title: "Project Management",
      description: "Comprehensive project tracking with timelines, milestones, and progress monitoring."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless team management with role-based access and real-time communication."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights and customizable reports to track performance and productivity."
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption and compliance standards."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Accurate time tracking with automated timesheets and billing integration."
    },
    {
      icon: Globe,
      title: "Global Access",
      description: "Access your projects from anywhere with our cloud-based platform."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Project Manager at TechCorp",
      content: "ProjectHub has transformed how we manage projects. The intuitive interface and powerful features make it indispensable.",
      rating: 5
    },
    {
      name: "Michael Chen",
      role: "CEO at StartupXYZ",
      content: "Since switching to ProjectHub, our team productivity has increased by 40%. Highly recommended!",
      rating: 5
    },
    {
      name: "Emily Davis",
      role: "Operations Director",
      content: "The reporting features are exceptional. We can now track progress in real-time and make data-driven decisions.",
      rating: 5
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 projects",
        "5 team members",
        "Basic reporting",
        "Email support"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Unlimited projects",
        "25 team members",
        "Advanced analytics",
        "Priority support",
        "Custom integrations"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations",
      features: [
        "Everything in Professional",
        "Unlimited team members",
        "Advanced security",
        "Dedicated account manager",
        "SLA guarantee"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-red-200 dark:border-red-800 bg-white/80 dark:bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-black rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-black dark:text-white">ProjectHub</span>
            </div>
            
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">Testimonials</a>
              <Link to="/about" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">About</Link>
              <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors">Contact</Link>
            </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-black font-medium"
                >
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-700">
              🚀 Trusted by 10,000+ teams worldwide
            </Badge>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-black via-red-600 to-black dark:from-white dark:via-red-400 dark:to-white bg-clip-text text-transparent">
              Manage Projects Like a Pro
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Streamline your workflow, boost team productivity, and deliver projects on time with our comprehensive project management platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 px-8 py-3 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                  Start Free Trial
                  <Zap className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-400 dark:hover:text-black px-8 py-3 text-lg font-medium">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">Powerful Features</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to manage projects efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-800">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl text-black dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Choose the plan that fits your team's needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative ${plan.popular ? 'ring-2 ring-red-500 scale-105' : ''} bg-white dark:bg-gray-800`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-red-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl text-black dark:text-white">{plan.name}</CardTitle>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-red-600 dark:text-red-400">{plan.price}</span>
                    {plan.period && <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>}
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to="/register">
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      } font-medium`}
                    >
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-black dark:text-white">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Join thousands of satisfied customers who trust ProjectHub
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-black dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-black dark:from-red-500 dark:to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Transform Your Projects?</h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of teams who have already improved their productivity with ProjectHub
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 text-lg font-medium shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-red-600 px-8 py-3 text-lg font-medium">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black dark:bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">ProjectHub</span>
              </div>
              <p className="text-gray-400">
                Empowering teams to deliver exceptional projects.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-red-400 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-red-400 transition-colors">Pricing</a></li>
                <li><Link to="/about" className="hover:text-red-400 transition-colors">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/contact" className="hover:text-red-400 transition-colors">Contact</Link></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Help Center</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-red-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-red-400 transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ProjectHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
