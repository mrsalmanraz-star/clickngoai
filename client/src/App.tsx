import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import { lazy, Suspense } from "react";

// Lazy load pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CreateProject = lazy(() => import("./pages/CreateProject"));
const ProjectDetails = lazy(() => import("./pages/ProjectDetails"));
const Templates = lazy(() => import("./pages/Templates"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AppLanding = lazy(() => import("./pages/AppLanding"));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center mesh-gradient">
      <div className="text-center">
        <div className="spinner mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        {/* Public Routes */}
        <Route path="/" component={Home} />
        <Route path="/templates" component={Templates} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/landing/app/:slug" component={AppLanding} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/create" component={CreateProject} />
        <Route path="/project/:id" component={ProjectDetails} />
        
        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/:section" component={AdminDashboard} />
        
        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
