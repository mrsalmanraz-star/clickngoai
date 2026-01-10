import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search,
  Rocket,
  ArrowRight,
  Star,
  ShoppingCart,
  Users,
  Calendar,
  Dumbbell,
  CheckSquare,
  MessageCircle,
  GraduationCap,
  Briefcase,
  Newspaper,
  Utensils,
  LayoutDashboard,
  Crown,
} from "lucide-react";

const categoryIcons: Record<string, any> = {
  food_delivery: Utensils,
  ecommerce: ShoppingCart,
  social_media: Users,
  booking: Calendar,
  fitness: Dumbbell,
  task_manager: CheckSquare,
  chat: MessageCircle,
  lms: GraduationCap,
  crm: Briefcase,
  news: Newspaper,
  other: LayoutDashboard,
};

const defaultTemplates = [
  {
    id: 1,
    name: "Food Delivery App",
    slug: "food-delivery",
    category: "food_delivery",
    description: "Complete food ordering system with restaurant listings, cart, order tracking, and payment integration.",
    features: ["Restaurant Listings", "Order Tracking", "Payment Gateway", "Reviews & Ratings", "Push Notifications"],
    primaryColor: "#ef4444",
    secondaryColor: "#f97316",
    usageCount: 1250,
    isPremium: false,
  },
  {
    id: 2,
    name: "E-Commerce Store",
    slug: "ecommerce",
    category: "ecommerce",
    description: "Full-featured online store with product catalog, shopping cart, checkout, and inventory management.",
    features: ["Product Catalog", "Shopping Cart", "Secure Checkout", "Inventory Management", "Order History"],
    primaryColor: "#8b5cf6",
    secondaryColor: "#a855f7",
    usageCount: 2100,
    isPremium: false,
  },
  {
    id: 3,
    name: "Social Network",
    slug: "social-media",
    category: "social_media",
    description: "Modern social platform with posts, stories, messaging, and user profiles.",
    features: ["User Profiles", "Posts & Stories", "Direct Messaging", "Notifications", "Follow System"],
    primaryColor: "#3b82f6",
    secondaryColor: "#6366f1",
    usageCount: 890,
    isPremium: true,
  },
  {
    id: 4,
    name: "Booking System",
    slug: "booking",
    category: "booking",
    description: "Appointment and reservation system with calendar, availability management, and reminders.",
    features: ["Calendar View", "Availability Management", "Email Reminders", "Payment Integration", "Customer Management"],
    primaryColor: "#10b981",
    secondaryColor: "#14b8a6",
    usageCount: 650,
    isPremium: false,
  },
  {
    id: 5,
    name: "Fitness Tracker",
    slug: "fitness",
    category: "fitness",
    description: "Health and fitness app with workout plans, meal tracking, and progress analytics.",
    features: ["Workout Plans", "Meal Tracking", "Progress Charts", "Goal Setting", "Social Challenges"],
    primaryColor: "#f59e0b",
    secondaryColor: "#eab308",
    usageCount: 780,
    isPremium: false,
  },
  {
    id: 6,
    name: "Task Manager",
    slug: "task-manager",
    category: "task_manager",
    description: "Productivity app with kanban boards, task lists, deadlines, and team collaboration.",
    features: ["Kanban Boards", "Task Lists", "Deadlines", "Team Collaboration", "File Attachments"],
    primaryColor: "#6366f1",
    secondaryColor: "#8b5cf6",
    usageCount: 1450,
    isPremium: false,
  },
  {
    id: 7,
    name: "Chat Application",
    slug: "chat",
    category: "chat",
    description: "Real-time messaging app with group chats, media sharing, and end-to-end encryption.",
    features: ["Real-time Messaging", "Group Chats", "Media Sharing", "Voice Messages", "Read Receipts"],
    primaryColor: "#22c55e",
    secondaryColor: "#10b981",
    usageCount: 920,
    isPremium: true,
  },
  {
    id: 8,
    name: "Learning Platform",
    slug: "lms",
    category: "lms",
    description: "Online learning system with courses, quizzes, certificates, and progress tracking.",
    features: ["Course Management", "Video Lessons", "Quizzes", "Certificates", "Progress Tracking"],
    primaryColor: "#0ea5e9",
    secondaryColor: "#06b6d4",
    usageCount: 540,
    isPremium: true,
  },
  {
    id: 9,
    name: "CRM System",
    slug: "crm",
    category: "crm",
    description: "Customer relationship management with leads, pipeline, contacts, and analytics.",
    features: ["Lead Management", "Sales Pipeline", "Contact Database", "Analytics Dashboard", "Email Integration"],
    primaryColor: "#ec4899",
    secondaryColor: "#f43f5e",
    usageCount: 380,
    isPremium: true,
  },
  {
    id: 10,
    name: "News App",
    slug: "news",
    category: "news",
    description: "News aggregator with categories, bookmarks, offline reading, and personalized feed.",
    features: ["Category Filters", "Bookmarks", "Offline Reading", "Personalized Feed", "Push Notifications"],
    primaryColor: "#64748b",
    secondaryColor: "#475569",
    usageCount: 670,
    isPremium: false,
  },
];

const categories = [
  { id: "all", name: "All Templates" },
  { id: "food_delivery", name: "Food Delivery" },
  { id: "ecommerce", name: "E-Commerce" },
  { id: "social_media", name: "Social Media" },
  { id: "booking", name: "Booking" },
  { id: "fitness", name: "Fitness" },
  { id: "task_manager", name: "Productivity" },
  { id: "chat", name: "Chat" },
  { id: "lms", name: "Education" },
  { id: "crm", name: "Business" },
  { id: "news", name: "News" },
];

export default function Templates() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: templates } = trpc.templates.list.useQuery();
  const displayTemplates = templates && templates.length > 0 ? templates : defaultTemplates;

  const filteredTemplates = displayTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (templateId: number) => {
    if (isAuthenticated) {
      navigate(`/create?template=${templateId}`);
    } else {
      window.location.href = getLoginUrl();
    }
  };

  return (
    <div className="min-h-screen mesh-gradient">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ClickNGoAI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/templates" className="text-foreground font-medium">
                Templates
              </Link>
              <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button className="btn-premium">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button className="btn-premium">
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-display mb-4">
            Template <span className="gradient-text">Marketplace</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose from our collection of professionally designed templates and launch your app in minutes.
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-12 h-12 glass-card border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={selectedCategory === category.id ? "btn-premium" : "glass-button"}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const CategoryIcon = categoryIcons[template.category] || LayoutDashboard;
              
              return (
                <Card key={template.id} className="glass-card border-0 card-hover overflow-hidden">
                  {/* Preview Header */}
                  <div 
                    className="h-40 relative"
                    style={{ 
                      background: `linear-gradient(135deg, ${template.primaryColor}, ${template.secondaryColor})` 
                    }}
                  >
                    {template.isPremium && (
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <CategoryIcon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold">{template.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        {template.usageCount}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {template.features?.slice(0, 3).map((feature, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {template.features && template.features.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <Button 
                      className="w-full btn-premium"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      Use Template
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground">No templates found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-display text-white mb-4">Can't Find What You Need?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Describe your app idea and our AI will create a custom solution just for you.
              </p>
              <Link href={isAuthenticated ? "/create" : getLoginUrl()}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                  <Rocket className="w-5 h-5 mr-2" />
                  Create Custom App
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClickNGoAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
