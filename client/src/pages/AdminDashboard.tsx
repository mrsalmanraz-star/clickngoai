import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useRoute, useLocation, Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";
import {
  Users,
  Smartphone,
  Activity,
  Clock,
  Search,
  MoreVertical,
  Shield,
  Crown,
  Ban,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BarChart3,
  Settings,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "projects", label: "Projects", icon: Smartphone },
  { id: "builds", label: "Build Queue", icon: Activity },
  { id: "logs", label: "Activity Logs", icon: FileText },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/admin/:section");
  const activeTab = params?.section || "overview";
  const [searchQuery, setSearchQuery] = useState("");

  // Check admin access
  if (user && user.role !== "admin" && user.role !== "superadmin") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <Ban className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
          <Link href="/dashboard">
            <Button className="btn-premium">Go to Dashboard</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = trpc.admin.getUsers.useQuery({});
  const { data: projects, isLoading: projectsLoading } = trpc.admin.getProjects.useQuery({});
  const { data: buildQueue, isLoading: buildsLoading } = trpc.admin.getBuildQueue.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.admin.getLogs.useQuery({});

  const updateUserMutation = trpc.admin.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      refetchUsers();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const processNextBuildMutation = trpc.builds.processNext.useMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Build processed");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const filteredUsers = users?.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage users, projects, and system settings
            </p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            <Shield className="w-3 h-3 mr-1" />
            {user?.role === "superadmin" ? "Super Admin" : "Admin"}
          </Badge>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Link key={tab.id} href={`/admin/${tab.id}`}>
              <Button
                variant={activeTab === tab.id ? "default" : "outline"}
                className={activeTab === tab.id ? "btn-premium" : "glass-button"}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-3xl font-bold">{stats?.users || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-3xl font-bold">{stats?.projects || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Builds</p>
                      <p className="text-3xl font-bold">{stats?.builds || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Activity className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Builds</p>
                      <p className="text-3xl font-bold">{stats?.pendingBuilds || 0}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="spinner" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {users?.slice(0, 5).map((u) => (
                        <div key={u.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
                              {u.name?.[0] || u.email?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-medium">{u.name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{u.subscriptionTier}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="glass-card border-0">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {projectsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="spinner" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {projects?.slice(0, 5).map((p) => (
                        <div key={p.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${p.primaryColor}20` }}
                            >
                              <Smartphone className="w-5 h-5" style={{ color: p.primaryColor || '#6366f1' }} />
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-sm text-muted-foreground capitalize">{p.appType}</p>
                            </div>
                          </div>
                          <Badge 
                            className={
                              p.status === "completed" ? "bg-green-500" :
                              p.status === "building" ? "bg-blue-500" :
                              p.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                            }
                          >
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Apps</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-semibold">
                              {u.name?.[0] || u.email?.[0] || "U"}
                            </div>
                            <div>
                              <p className="font-medium">{u.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === "superadmin" ? "default" : "secondary"}>
                            {u.role === "superadmin" && <Crown className="w-3 h-3 mr-1" />}
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{u.subscriptionTier}</TableCell>
                        <TableCell>{u.appsCreated}/{u.appLimit === 9999 ? "∞" : u.appLimit}</TableCell>
                        <TableCell>
                          {u.isActive ? (
                            <Badge className="bg-green-500">Active</Badge>
                          ) : (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {user?.role === "superadmin" && u.role !== "superadmin" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => updateUserMutation.mutate({ 
                                    id: u.id, 
                                    role: u.role === "admin" ? "user" : "admin" 
                                  })}
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => updateUserMutation.mutate({ 
                                    id: u.id, 
                                    isActive: !u.isActive 
                                  })}
                                >
                                  {u.isActive ? (
                                    <>
                                      <Ban className="w-4 h-4 mr-2" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-2" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>All Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {projectsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects?.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${p.primaryColor}20` }}
                            >
                              <Smartphone className="w-4 h-4" style={{ color: p.primaryColor || '#6366f1' }} />
                            </div>
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{p.appType}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              p.status === "completed" ? "bg-green-500" :
                              p.status === "building" ? "bg-blue-500" :
                              p.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{p.landingPageViews}</TableCell>
                        <TableCell>{p.downloadCount}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Build Queue Tab */}
        {activeTab === "builds" && (
          <Card className="glass-card border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Build Queue</CardTitle>
                <Button 
                  className="btn-premium"
                  onClick={() => processNextBuildMutation.mutate()}
                  disabled={processNextBuildMutation.isPending}
                >
                  {processNextBuildMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Process Next Build
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {buildsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : buildQueue && buildQueue.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Project ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {buildQueue.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>#{b.id}</TableCell>
                        <TableCell>#{b.projectId}</TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              b.status === "completed" ? "bg-green-500" :
                              b.status === "processing" ? "bg-blue-500" :
                              b.status === "failed" ? "bg-red-500" : "bg-yellow-500"
                            }
                          >
                            {b.status === "processing" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-20">
                            <div className="progress-bar">
                              <div 
                                className="progress-bar-fill" 
                                style={{ width: `${b.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">{b.progress}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{b.currentStep || "-"}</TableCell>
                        <TableCell>{b.priority}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(b.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No builds in queue
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Logs Tab */}
        {activeTab === "logs" && (
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="spinner" />
                </div>
              ) : logs && logs.length > 0 ? (
                <div className="space-y-3">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{log.action.replace(/_/g, " ")}</p>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.entityType && `${log.entityType} #${log.entityId}`}
                          {log.userId && ` by User #${log.userId}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No activity logs
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
