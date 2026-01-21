import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { useFamily } from "@/hooks/useFamily";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FamilySetup from "./pages/FamilySetup";
import Financas from "./pages/Financas";
import FinancasPessoais from "./pages/FinancasPessoais";
import Despensa from "./pages/Despensa";
import Tarefas from "./pages/Tarefas";
import Alimentacao from "./pages/Alimentacao";
import Saude from "./pages/Saude";
import Membros from "./pages/Membros";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";
import ListaCompras from "./pages/ListaCompras";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasFamily, pendingRequest, loading: familyLoading } = useFamily();

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (hasFamily === false || pendingRequest) {
    return <Navigate to="/family-setup" replace />;
  }

  return <>{children}</>;
}

function FamilySetupRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { hasFamily, pendingRequest, loading: familyLoading } = useFamily();

  if (authLoading || familyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (hasFamily === true && !pendingRequest) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

const App = () => {
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'dark';
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route
              path="/auth"
              element={
                <AuthRoute>
                  <Auth />
                </AuthRoute>
              }
            />
            <Route
              path="/family-setup"
              element={
                <FamilySetupRoute>
                  <FamilySetup />
                </FamilySetupRoute>
              }
            />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/financas" element={<Financas />} />
                      <Route path="/financas-pessoais" element={<FinancasPessoais />} />
                      <Route path="/despensa" element={<Despensa />} />
                      <Route path="/lista-compras" element={<ListaCompras />} />
                      <Route path="/tarefas" element={<Tarefas />} />
                      <Route path="/alimentacao" element={<Alimentacao />} />
                      <Route path="/saude" element={<Saude />} />
                      <Route path="/membros" element={<Membros />} />
                      <Route path="/configuracoes" element={<Configuracoes />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
