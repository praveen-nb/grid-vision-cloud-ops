import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { AuthGuard } from "@/components/AuthGuard";
import Home from "./pages/Home";
import Architecture from "./pages/Architecture";
import Dashboard from "./pages/Dashboard";
import Documentation from "./pages/Documentation";
import Deliverables from "./pages/Deliverables";
import Compliance from "./pages/Compliance";
import LiveMonitoring from "./pages/LiveMonitoring";
import AWSInfrastructure from "./pages/AWSInfrastructure";
import Phase3Advanced from "./pages/Phase3Advanced";
import Phase4Enterprise from "./pages/Phase4Enterprise";
import SageMakerDashboardPage from "./pages/SageMakerDashboard";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-utility bg-clip-text text-transparent">
                  AWS GIS Infrastructure
                </h1>
                <Navigation />
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/architecture" element={<AuthGuard><Architecture /></AuthGuard>} />
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/documentation" element={<AuthGuard><Documentation /></AuthGuard>} />
              <Route path="/deliverables" element={<AuthGuard><Deliverables /></AuthGuard>} />
              <Route path="/compliance" element={<AuthGuard><Compliance /></AuthGuard>} />
              <Route path="/live-monitoring" element={<AuthGuard><LiveMonitoring /></AuthGuard>} />
              <Route path="/aws-infrastructure" element={<AuthGuard><AWSInfrastructure /></AuthGuard>} />
              <Route path="/phase3-advanced" element={<AuthGuard><Phase3Advanced /></AuthGuard>} />
              <Route path="/phase4-enterprise" element={<AuthGuard><Phase4Enterprise /></AuthGuard>} />
              <Route path="/sagemaker" element={<AuthGuard><SageMakerDashboardPage /></AuthGuard>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
