import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { EmpresaProvider } from "./contexts/EmpresaContext";
import DashboardLayout from "./components/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import CRM from "./pages/CRM";
import Campaigns from "./pages/Campaigns";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import CampaignDetail from "./pages/CampaignDetail";

// Protected Route Component
type ProtectedRouteProps = {
  component: ComponentType;
  requiredRole?: string[];
};

function ProtectedRoute({ component: Component, requiredRole }: ProtectedRouteProps) {
  const { user } = useAuth();
  const isAuthorized = user && (requiredRole ? requiredRole.includes(user.role) : true);

  if (!isAuthorized) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function AuthenticatedRoutes() {
  return (
    <EmpresaProvider>
      <DashboardLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/reports" component={Reports} />
          <Route path="/crm" component={CRM} />
          <Route path="/campaigns" component={Campaigns} />
          <Route path="/campaigns/:id" component={CampaignDetail} />
          <Route path="/clients" component={Clients} />
          <Route path="/clients/:id" component={ClientDetail} />
          <Route path="/users">
            {() => <ProtectedRoute component={Users} requiredRole={["admin", "gestor"]} />}
          </Route>
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </DashboardLayout>
    </EmpresaProvider>
  );
}

function AppRouter() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/login">
        <Redirect to="/" />
      </Route>
      <Route>
        <AuthenticatedRoutes />
      </Route>
    </Switch>
  );
}

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      gcTime: 1000 * 60 * 10, // 10 minutos
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <AppRouter />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
