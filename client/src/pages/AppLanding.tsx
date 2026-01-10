import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute } from "wouter";
import {
  Download,
  Smartphone,
  Globe,
  Star,
  CheckCircle2,
  Share2,
  QrCode,
  ExternalLink,
  Rocket,
  Shield,
  Zap,
  Users,
} from "lucide-react";
import { toast } from "sonner";

export default function AppLanding() {
  const [match, params] = useRoute("/landing/app/:slug");
  const slug = params?.slug || "";

  const { data: project, isLoading, error } = trpc.projects.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const trackDownloadMutation = trpc.projects.trackDownload.useMutation();

  // Note: Page views are automatically tracked in getBySlug query

  const handleDownload = (type: string) => {
    if (project?.id) {
      trackDownloadMutation.mutate({ id: project.id });
    }
    toast.success(`Downloading ${type}...`);
    // In real implementation, this would trigger actual download
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: project?.name,
        text: project?.description || "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-muted-foreground">Loading app...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-gradient">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-6">
            <Smartphone className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">App Not Found</h1>
          <p className="text-muted-foreground">The app you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const primaryColor = project.primaryColor || "#6366f1";
  const secondaryColor = project.secondaryColor || "#8b5cf6";

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <section 
        className="relative overflow-hidden pt-20 pb-32"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* App Info */}
            <div className="flex-1 text-center lg:text-left text-white">
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                Featured App
              </Badge>
              
              <h1 className="text-hero mb-6">{project.name}</h1>
              
              <p className="text-xl text-white/80 mb-8 max-w-xl">
                {project.description || "Experience the next generation of mobile applications."}
              </p>

              {/* Stats */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 mb-8">
                <div className="text-center">
                  <p className="text-3xl font-bold">{project.downloadCount || 0}+</p>
                  <p className="text-sm text-white/70">Downloads</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">4.8</p>
                  <p className="text-sm text-white/70">Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">v{project.version}</p>
                  <p className="text-sm text-white/70">Version</p>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-white/90 text-lg px-8 py-6"
                  onClick={() => handleDownload("APK")}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Download APK
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-6"
                  onClick={() => handleDownload("IPA")}
                >
                  <Smartphone className="w-5 h-5 mr-2" />
                  Download iOS
                </Button>
              </div>
            </div>

            {/* App Preview */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* Phone Frame */}
                <div className="w-72 h-[580px] bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl" />
                    
                    {/* App Screen Preview */}
                    <div 
                      className="w-full h-full flex flex-col items-center justify-center p-8"
                      style={{ 
                        background: `linear-gradient(180deg, ${primaryColor}10 0%, ${secondaryColor}10 100%)` 
                      }}
                    >
                      <div 
                        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Smartphone className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-500 text-center">
                        {project.appType?.toUpperCase()} App
                      </p>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center float">
                  <Download className="w-8 h-8" style={{ color: primaryColor }} />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center float-delayed">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" 
              className="fill-background"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-display mb-4">
              Why Choose <span style={{ color: primaryColor }}>{project.name}</span>?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with cutting-edge technology to deliver the best user experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", description: "Optimized performance for smooth experience" },
              { icon: Shield, title: "Secure", description: "Your data is protected with encryption" },
              { icon: Globe, title: "Cross-Platform", description: "Works on Android, iOS, and Web" },
              { icon: Users, title: "User Friendly", description: "Intuitive design for everyone" },
            ].map((feature, i) => (
              <Card key={i} className="glass-card border-0 card-hover">
                <CardContent className="p-6 text-center">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: `${primaryColor}20` }}
                  >
                    <feature.icon className="w-7 h-7" style={{ color: primaryColor }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="glass-card border-0 overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2">
                  {/* Android */}
                  <div className="p-8 border-b md:border-b-0 md:border-r border-border">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center">
                        <Smartphone className="w-7 h-7 text-green-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Android</h3>
                        <p className="text-sm text-muted-foreground">APK Download</p>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Android 6.0 and above
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ~15 MB download size
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Instant installation
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => handleDownload("APK")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download APK
                    </Button>
                  </div>

                  {/* iOS */}
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                        <Smartphone className="w-7 h-7 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">iOS</h3>
                        <p className="text-sm text-muted-foreground">IPA Download</p>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        iOS 13.0 and above
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        ~20 MB download size
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        AltStore compatible
                      </li>
                    </ul>
                    <Button 
                      className="w-full"
                      style={{ backgroundColor: primaryColor }}
                      onClick={() => handleDownload("IPA")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download IPA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Web App Option */}
            <Card className="glass-card border-0 mt-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                      <Globe className="w-7 h-7 text-purple-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Web App</h3>
                      <p className="text-sm text-muted-foreground">Launch directly in your browser</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    className="glass-button"
                    onClick={() => toast.info("Web app launching...")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Launch Web App
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Share Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-display mb-4">Share This App</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Help others discover this amazing app
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="btn-premium"
              onClick={handleShare}
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share App
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="glass-button"
              onClick={() => toast.info("QR Code feature coming soon!")}
            >
              <QrCode className="w-5 h-5 mr-2" />
              QR Code
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer 
        className="py-12 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` 
        }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-6 h-6" />
            <span className="text-lg font-semibold">Powered by ClickNGoAI</span>
          </div>
          <p className="text-white/70">
            Build your own app at{" "}
            <a href="/" className="underline hover:text-white">clickngoai.com</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
