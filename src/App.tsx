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
import PerformanceMetricsPage from "./pages/PerformanceMetrics";
import DisasterRecoveryPage from "./pages/DisasterRecovery";
import ArcGISPage from "./pages/ArcGIS";
import ArcFMPage from "./pages/ArcFM";
import SCADAControlPage from "./pages/SCADAControl";
import OutageManagementPage from "./pages/OutageManagement";
import LoadTestingPage from "./pages/LoadTesting";
import DRLatencyMetricsPage from "./pages/DRLatencyMetrics";
import HybridArchitecturePage from "./pages/HybridArchitecture";
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
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/deliverables" element={<Deliverables />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/live-monitoring" element={<LiveMonitoring />} />
              <Route path="/aws-infrastructure" element={<AWSInfrastructure />} />
              <Route path="/disaster-recovery" element={<DisasterRecoveryPage />} />
              <Route path="/phase3-advanced" element={<Phase3Advanced />} />
              <Route path="/phase4-enterprise" element={<Phase4Enterprise />} />
              <Route path="/sagemaker" element={<SageMakerDashboardPage />} />
              <Route path="/performance-metrics" element={<PerformanceMetricsPage />} />
              <Route path="/arcgis" element={<ArcGISPage />} />
              <Route path="/arcfm" element={<ArcFMPage />} />
              <Route path="/scada-control" element={<SCADAControlPage />} />
              <Route path="/outage-management" element={<OutageManagementPage />} />
              <Route path="/load-testing" element={<LoadTestingPage />} />
              <Route path="/dr-latency" element={<DRLatencyMetricsPage />} />
              <Route path="/hybrid-architecture" element={<HybridArchitecturePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
