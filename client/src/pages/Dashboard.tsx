import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { 
  Plus, 
  Smartphone, 
  Globe, 
  Download, 
  Eye, 
  MoreVertical,
  Rocket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const statusConfig = {
  pending: { icon: Clock, color: "bg-yellow-500", label: "Pending" },
  building: { icon: Loader2, color: "bg-blue-500", label: "Building" },
  completed: { icon: CheckCircle2, color: "bg-green-500", label: "Completed" },
  failed: { icon: AlertCircle, color: "bg-red-500", label: "Failed" },
};

const appTypeIcons = {
  android: Smartphone,
  ios: Smartphone,
  pwa: Globe,
  hybrid: Smartphone,
  web: Globe,
  desktop: Globe,
};

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: projects, isLoading, refetch } = trpc.projects.list.useQuery();
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const simulateBuildMutation = trpc.builds.simulateBuild.useMutation({
    onSuccess: () => {
      toast.success("Build completed!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSimulateBuild = (projectId: number) => {
    simulateBuildMutation.mutate({ projectId });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your generated applications
            </p>
          </div>
          <Link href="/create">
            <Button className="btn-premium">
              <Plus className="w-4 h-4 mr-2" />
              Create New App
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Apps</p>
                  <p className="text-3xl font-bold">{projects?.length || 0}</p>
                </div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">App Limit</p>
                  <p className="text-3xl font-bold">
                    {user?.appLimit === 9999 ? "∞" : user?.appLimit || 1}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold">
                    {projects?.filter(p => p.status === "completed").length || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Downloads</p>
                  <p className="text-3xl font-bold">
                    {projects?.reduce((acc, p) => acc + (p.downloadCount || 0), 0) || 0}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Download className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="spinner" />
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const StatusIcon = statusConfig[project.status as keyof typeof statusConfig]?.icon || Clock;
              const AppIcon = appTypeIcons[project.appType as keyof typeof appTypeIcons] || Smartphone;
              const statusInfo = statusConfig[project.status as keyof typeof statusConfig];

              return (
                <Card key={project.id} className="glass-card border-0 card-hover overflow-hidden">
                  <div 
                    className="h-2 w-full"
                    style={{ 
                      background: `linear-gradient(90deg, ${project.primaryColor || '#6366f1'}, ${project.secondaryColor || '#8b5cf6'})` 
                    }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${project.primaryColor}20` }}
                        >
                          <AppIcon className="w-6 h-6" style={{ color: project.primaryColor || '#6366f1' }} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">{project.appType}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/project/${project.id}`)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {project.status === "completed" && (
                            <DropdownMenuItem onClick={() => window.open(`/landing/app/${project.slug}`, '_blank')}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View Landing Page
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {project.description || "No description provided"}
                    </p>
                    
                    {/* Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge 
                        variant="secondary" 
                        className={`${statusInfo?.color} text-white`}
                      >
                        <StatusIcon className={`w-3 h-3 mr-1 ${project.status === 'building' ? 'animate-spin' : ''}`} />
                        {statusInfo?.label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress Bar for Building */}
                    {project.status === "building" && (
                      <div className="mb-4">
                        <div className="progress-bar">
                          <div 
                            className="progress-bar-fill" 
                            style={{ width: `${project.buildProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Building... {project.buildProgress}%
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {project.status === "pending" && (
                        <Button 
                          size="sm" 
                          className="flex-1 btn-premium"
                          onClick={() => handleSimulateBuild(project.id)}
                          disabled={simulateBuildMutation.isPending}
                        >
                          {simulateBuildMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Rocket className="w-4 h-4 mr-1" />
                          )}
                          Start Build
                        </Button>
                      )}
                      {project.status === "completed" && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 glass-button"
                            onClick={() => navigate(`/project/${project.id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 btn-premium"
                            onClick={() => window.open(`/landing/app/${project.slug}`, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Stats */}
                    {project.status === "completed" && (
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {project.landingPageViews || 0}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Download className="w-4 h-4" />
                          {project.downloadCount || 0}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="glass-card border-0">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mb-6">
                <Rocket className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Projects Yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first app and bring your ideas to life with AI-powered generation.
              </p>
              <Link href="/create">
                <Button className="btn-premium">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First App
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
