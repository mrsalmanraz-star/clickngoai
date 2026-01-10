import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Download,
  Globe,
  Layers,
  LayoutDashboard,
  Rocket,
  Smartphone,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { Link } from "wouter";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Home() {
  const { user, isAuthenticated } = useAuth();

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
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#templates" className="text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl float-delayed" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered App Generation Platform</span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-hero mb-6">
              Build Apps in{" "}
              <span className="gradient-text">Minutes</span>,{" "}
              <br />
              Not Months
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform your ideas into fully functional Android, iOS, and Web applications with our
              AI-powered platform. No coding required.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button size="lg" className="btn-premium text-lg px-8 py-6">
                    <Rocket className="w-5 h-5 mr-2" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="btn-premium text-lg px-8 py-6">
                    <Rocket className="w-5 h-5 mr-2" />
                    Start Building Free
                  </Button>
                </a>
              )}
              <Link href="/templates">
                <Button size="lg" variant="outline" className="glass-button text-lg px-8 py-6">
                  <Layers className="w-5 h-5 mr-2" />
                  Browse Templates
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              {[
                { value: "10K+", label: "Apps Created" },
                { value: "50+", label: "Templates" },
                { value: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Build & Launch</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to create, customize, and deploy
              professional applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Multi-Platform Support",
                description: "Build Android APK, iOS IPA, PWA, and hybrid apps from a single codebase.",
              },
              {
                icon: Zap,
                title: "AI-Powered Generation",
                description: "Describe your app in plain language and watch it come to life instantly.",
              },
              {
                icon: Code2,
                title: "No Coding Required",
                description: "Our AI handles all the technical complexity so you can focus on your vision.",
              },
              {
                icon: Globe,
                title: "Premium Landing Pages",
                description: "Each app gets a beautiful landing page with download links and analytics.",
              },
              {
                icon: Download,
                title: "Instant Downloads",
                description: "Get your APK, IPA, or source code immediately after generation.",
              },
              {
                icon: Layers,
                title: "Template Marketplace",
                description: "Choose from 50+ professionally designed templates across categories.",
              },
            ].map((feature, i) => (
              <Card key={i} className="glass-card card-hover border-0 stagger-item">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Create your app in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Describe Your App",
                description: "Tell us what you want to build using natural language or choose a template.",
              },
              {
                step: "02",
                title: "AI Generates Code",
                description: "Our AI creates a fully functional app with modern UI and features.",
              },
              {
                step: "03",
                title: "Download & Deploy",
                description: "Get your APK, IPA, or web app ready for distribution.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center stagger-item">
                <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6 pulse-glow">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">
              Simple, <span className="gradient-text">Transparent Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. All plans include our core features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Single App",
                priceInr: "₹3,999",
                priceUsd: "$49",
                apps: "1 App",
                features: ["All Templates", "APK & IPA Generation", "Landing Page", "Priority Support"],
                popular: false,
              },
              {
                name: "15 Apps Pack",
                priceInr: "₹24,999",
                priceUsd: "$79",
                apps: "15 Apps",
                features: [
                  "All Templates",
                  "APK & IPA Generation",
                  "Landing Pages",
                  "Priority Support",
                  "Analytics Dashboard",
                  "Custom Branding",
                ],
                popular: true,
              },
              {
                name: "Unlimited",
                priceInr: "₹34,999",
                priceUsd: "$199",
                apps: "Unlimited Apps",
                features: [
                  "All Templates",
                  "APK & IPA Generation",
                  "Landing Pages",
                  "24/7 Support",
                  "Analytics Dashboard",
                  "Custom Branding",
                  "API Access",
                  "White Label",
                ],
                popular: false,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`relative overflow-hidden card-hover ${
                  plan.popular ? "gradient-border" : "glass-card border-0"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold gradient-text">{plan.priceInr}</span>
                    <span className="text-muted-foreground"> / {plan.priceUsd}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.apps}</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                    <Button className={`w-full ${plan.popular ? "btn-premium" : "glass-button"}`}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">
              Loved by <span className="gradient-text">Thousands</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying about ClickNGoAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Rahul Sharma",
                role: "Startup Founder",
                content:
                  "ClickNGoAI helped us launch our MVP in just 2 days. The quality of the generated app was incredible!",
              },
              {
                name: "Priya Patel",
                role: "Product Manager",
                content:
                  "The template marketplace saved us months of development time. Highly recommended for rapid prototyping.",
              },
              {
                name: "Amit Kumar",
                role: "Freelance Developer",
                content:
                  "I use ClickNGoAI for all my client projects now. It's a game-changer for app development.",
              },
            ].map((testimonial, i) => (
              <Card key={i} className="glass-card border-0 card-hover stagger-item">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-display text-white mb-4">Ready to Build Your App?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of creators who are building amazing apps with ClickNGoAI.
              </p>
              <a href={isAuthenticated ? "/dashboard" : getLoginUrl()}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Building Now
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">ClickNGoAI</span>
              </div>
              <p className="text-muted-foreground">
                Build amazing apps in minutes with AI-powered generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#templates" className="hover:text-foreground transition-colors">Templates</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ClickNGoAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
