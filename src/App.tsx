import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/auth/Login";
import RegisterTeacher from "@/pages/auth/RegisterTeacher";
import DashboardHome from "@/pages/dashboard/Home";
import TowersList from "@/pages/towers/TowersList";
import NewTower from "@/pages/towers/NewTower";
import TowerDetail from "@/pages/towers/TowerDetail";
import Leaderboard from "@/pages/leaderboard/Leaderboard";
import { AppStoreProvider } from "@/context/AppStore";
import AppStoreProviderWrapper from "@/components/AppStoreProviderWrapper";
import PlantCatalog from "@/pages/catalog/PlantCatalog";
import Classrooms from "@/pages/classrooms/Classrooms";
import Kiosk from "@/pages/kiosk/Kiosk";
import HelpCenter from "@/pages/help/HelpCenter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterTeacher />} />
          </Route>

          <Route path="/app" element={<AppStoreProviderWrapper />}>
            <Route index element={<DashboardHome />} />
            <Route path="towers" >
              <Route index element={<TowersList />} />
              <Route path="new" element={<NewTower />} />
              <Route path=":id" element={<TowerDetail />} />
            </Route>
            <Route path="catalog" element={<PlantCatalog />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="kiosk" element={<Kiosk />} />
            <Route path="help" element={<HelpCenter />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
