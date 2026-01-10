import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import {
  Smartphone,
  Globe,
  Download,
  Eye,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Rocket,
  Share2,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { Link } from "wouter";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending", description: "Waiting in build queue" },
  building: { icon: Loader2, color: "bg-blue-500", label: "Building", description: "Your app is being generated" },
  completed: { icon: CheckCircle2, color: "bg-green-500", label: "Completed", description: "Ready for download" },
  failed: { icon: AlertCircle, color: "bg-red-500", label: "Failed", description: "Build failed" },
};

export default function ProjectDetails() {
  const [match, params] = useRoute("/project/:id");
  const [, navigate] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : 0;

  const { data: project, isLoading, refetch } = trpc.projects.getById.useQuery(
    { id: projectId },
    { enabled: !!projectId }
  );

  const simulateBuildMutation = trpc.builds.simulateBuild.useMutation({
    onSuccess: () => {
      toast.success("Build completed!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const trackDownloadMutation = trpc.projects.trackDownload.useMutation();

  const handleDownload = (type: string) => {
    trackDownloadMutation.mutate({ id: projectId });
    toast.success(`Downloading ${type}...`);
    // In real implementation, this would trigger actual download
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/landing/app/${project?.slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="spinner" />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
          <Link href="/dashboard">
            <Button className="btn-premium">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const statusInfo = statusConfig[project.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo?.icon || Clock;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button */}
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Project Info */}
          <div className="flex-1">
            <Card className="glass-card border-0 overflow-hidden">
              <div 
                className="h-3 w-full"
                style={{ 
                  background: `linear-gradient(90deg, ${project.primaryColor || '#6366f1'}, ${project.secondaryColor || '#8b5cf6'})` 
                }}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${project.primaryColor}20` }}
                    >
                      <Smartphone className="w-8 h-8" style={{ color: project.primaryColor || '#6366f1' }} />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{project.name}</CardTitle>
                      <p className="text-muted-foreground capitalize">{project.appType} Application</p>
                    </div>
                  </div>
                  <Badge className={`${statusInfo?.color} text-white`}>
                    <StatusIcon className={`w-3 h-3 mr-1 ${project.status === 'building' ? 'animate-spin' : ''}`} />
                    {statusInfo?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-muted-foreground">
                  {project.description || "No description provided"}
                </p>

                {/* Build Progress */}
                {project.status === "building" && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Building your app...</span>
                      <span>{project.buildProgress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ width: `${project.buildProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Pending State */}
                {project.status === "pending" && (
                  <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Waiting in Queue</p>
                        <p className="text-sm text-muted-foreground">
                          Your app will be built shortly
                        </p>
                      </div>
                    </div>
                    <Button 
                      className="mt-4 btn-premium w-full"
                      onClick={() => simulateBuildMutation.mutate({ projectId: project.id })}
                      disabled={simulateBuildMutation.isPending}
                    >
                      {simulateBuildMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Rocket className="w-4 h-4 mr-2" />
                      )}
                      Start Build Now
                    </Button>
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{project.landingPageViews || 0}</p>
                    <p className="text-xs text-muted-foreground">Page Views</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <Download className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">{project.downloadCount || 0}</p>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted/50">
                    <Globe className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold">v{project.version}</p>
                    <p className="text-xs text-muted-foreground">Version</p>
                  </div>
                </div>

                {/* Actions */}
                {project.status === "completed" && (
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      className="btn-premium flex-1"
                      onClick={() => window.open(`/landing/app/${project.slug}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Landing Page
                    </Button>
                    <Button 
                      variant="outline" 
                      className="glass-button"
                      onClick={handleCopyLink}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button 
                      variant="outline" 
                      className="glass-button"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Downloads Panel */}
          {project.status === "completed" && (
            <div className="lg:w-80">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Downloads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start glass-button"
                    onClick={() => handleDownload('APK')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Android APK</p>
                      <p className="text-xs text-muted-foreground">~15 MB</p>
                    </div>
                    <Download className="w-4 h-4 ml-auto" />
                  </Button>

                  <Button 
                    className="w-full justify-start glass-button"
                    onClick={() => handleDownload('IPA')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mr-3">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">iOS IPA</p>
                      <p className="text-xs text-muted-foreground">~20 MB</p>
                    </div>
                    <Download className="w-4 h-4 ml-auto" />
                  </Button>

                  <Button 
                    className="w-full justify-start glass-button"
                    onClick={() => window.open(`/landing/app/${project.slug}`, '_blank')}
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mr-3">
                      <Globe className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Web App</p>
                      <p className="text-xs text-muted-foreground">Launch in browser</p>
                    </div>
                    <ExternalLink className="w-4 h-4 ml-auto" />
                  </Button>
                </CardContent>
              </Card>

              {/* Project Details */}
              <Card className="glass-card border-0 mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Package Name</span>
                    <span className="font-mono text-xs">{project.packageName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Build Number</span>
                    <span>{project.buildNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  {project.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed</span>
                      <span>{new Date(project.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
