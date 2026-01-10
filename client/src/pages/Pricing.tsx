import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import {
  CheckCircle2,
  Rocket,
  ArrowRight,
  LayoutDashboard,
  Zap,
  Crown,
  Building2,
} from "lucide-react";
import { useState } from "react";

const defaultPlans = [
  {
    tier: "free",
    nameEn: "Free Trial",
    priceInr: 0,
    priceUsd: 0,
    appLimit: 1,
    features: ["1 App", "Basic Templates", "Community Support", "Landing Page"],
    isPopular: false,
    icon: Zap,
  },
  {
    tier: "single",
    nameEn: "Single App",
    priceInr: 3999,
    priceUsd: 49,
    appLimit: 1,
    features: [
      "1 Premium App",
      "All Templates",
      "Priority Support",
      "Custom Branding",
      "APK & IPA Generation",
      "Analytics Dashboard",
    ],
    isPopular: false,
    icon: Rocket,
  },
  {
    tier: "multiple",
    nameEn: "15 Apps Pack",
    priceInr: 24999,
    priceUsd: 79,
    appLimit: 15,
    features: [
      "15 Premium Apps",
      "All Templates",
      "Priority Support",
      "Custom Branding",
      "APK & IPA Generation",
      "Analytics Dashboard",
      "Team Collaboration",
      "API Access",
    ],
    isPopular: true,
    icon: Crown,
  },
  {
    tier: "unlimited",
    nameEn: "Unlimited",
    priceInr: 34999,
    priceUsd: 199,
    appLimit: 9999,
    features: [
      "Unlimited Apps",
      "All Templates",
      "24/7 Priority Support",
      "Custom Branding",
      "APK & IPA Generation",
      "Advanced Analytics",
      "Team Collaboration",
      "Full API Access",
      "White Label Option",
      "Dedicated Account Manager",
    ],
    isPopular: false,
    icon: Building2,
  },
];

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const [, navigate] = useLocation();
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const { data: plans } = trpc.subscriptions.getPricing.useQuery();
  const displayPlans = plans && plans.length > 0 ? plans : defaultPlans;

  const createSubscriptionMutation = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      toast.success("Subscription activated!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSubscribe = (tier: string) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    if (tier === "free") {
      navigate("/dashboard");
      return;
    }
    // In real implementation, this would redirect to payment gateway
    createSubscriptionMutation.mutate({ tier: tier as any, currency });
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
              <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-foreground font-medium">
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
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include our core features with no hidden fees.
          </p>

          {/* Currency Toggle */}
          <div className="inline-flex items-center gap-2 p-1 rounded-xl glass-card">
            <Button
              variant={currency === "INR" ? "default" : "ghost"}
              className={currency === "INR" ? "btn-premium" : ""}
              onClick={() => setCurrency("INR")}
            >
              🇮🇳 INR
            </Button>
            <Button
              variant={currency === "USD" ? "default" : "ghost"}
              className={currency === "USD" ? "btn-premium" : ""}
              onClick={() => setCurrency("USD")}
            >
              🇺🇸 USD
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {displayPlans.map((plan, i) => {
              const PlanIcon = (plan as any).icon || Rocket;
              const isCurrentPlan = user?.subscriptionTier === plan.tier;
              
              return (
                <Card
                  key={plan.tier}
                  className={`relative overflow-hidden card-hover ${
                    plan.isPopular ? "gradient-border" : "glass-card border-0"
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute top-0 left-0 right-0 py-2 text-center text-sm font-semibold text-white gradient-bg">
                      Most Popular
                    </div>
                  )}
                  
                  <CardContent className={`p-6 ${plan.isPopular ? "pt-12" : ""}`}>
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                      <PlanIcon className="w-6 h-6 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">{plan.nameEn}</h3>
                    
                    <div className="mb-4">
                      <span className="text-4xl font-bold gradient-text">
                        {currency === "INR" ? `₹${plan.priceInr.toLocaleString()}` : `$${plan.priceUsd}`}
                      </span>
                      {plan.priceInr > 0 && (
                        <span className="text-muted-foreground">/month</span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-6">
                      {plan.appLimit === 9999 ? "Unlimited" : plan.appLimit} {plan.appLimit === 1 ? "App" : "Apps"}
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                      {(plan.features as string[]).map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button
                      className={`w-full ${plan.isPopular ? "btn-premium" : "glass-button"}`}
                      onClick={() => handleSubscribe(plan.tier)}
                      disabled={isCurrentPlan || createSubscriptionMutation.isPending}
                    >
                      {isCurrentPlan ? "Current Plan" : plan.priceInr === 0 ? "Get Started" : "Subscribe"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-display mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference. When downgrading, the change takes effect at the end of your billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, UPI, and net banking for Indian customers. International customers can pay via credit card or PayPal.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! Our Free Trial plan lets you create 1 app with basic templates to test the platform before committing to a paid plan.",
              },
              {
                q: "What happens when I reach my app limit?",
                a: "You'll need to upgrade to a higher plan to create more apps. Your existing apps will continue to work normally.",
              },
              {
                q: "Do you offer refunds?",
                a: "We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
              },
            ].map((faq, i) => (
              <Card key={i} className="glass-card border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl gradient-bg p-12 text-center">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10">
              <h2 className="text-display text-white mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of creators building amazing apps with ClickNGoAI.
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
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ClickNGoAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
