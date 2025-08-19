// src/App.tsx

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
import AppStoreProviderWrapper from "@/components/AppStoreProviderWrapper";
import PlantCatalog from "@/pages/catalog/PlantCatalog";
import Classrooms from "@/pages/classrooms/Classrooms";
import Kiosk from "@/pages/kiosk/Kiosk";
import HelpCenter from "@/pages/help/HelpCenter";
import Profile from "@/pages/profile/Profile";
import TermsOfService from "@/pages/legal/TermsOfService";
import PrivacyPolicy from "@/pages/legal/PrivacyPolicy";
import CookiePolicy from "@/pages/legal/CookiePolicy";
import Accessibility from "@/pages/legal/Accessibility";
import StudentLoginPage from "@/pages/auth/StudentLoginPage";
import StudentLayout from "@/components/layout/StudentLayout";
import StudentDashboard from "@/pages/kiosk/StudentDashboard";
import StudentTowerDetail from "@/pages/kiosk/StudentTowerDetail";
import StudentVitalsForm from "@/pages/kiosk/StudentVitalsForm";
import StudentHarvestForm from "@/pages/kiosk/StudentHarvestForm";
import StudentWasteForm from "@/pages/kiosk/StudentWasteForm";
import StudentPestForm from "@/pages/kiosk/StudentPestForm";
import StudentPlantForm from "@/pages/kiosk/StudentPlantForm";

// 1. Import the new Photo form component
import StudentPhotoForm from "@/pages/kiosk/StudentPhotoForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC & AUTH ROUTES --- */}
          <Route path="/" element={<Index />} />
          <Route path="/student-login" element={<StudentLoginPage />} />
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterTeacher />} />
          </Route>
          
          {/* --- STUDENT PORTAL ROUTES (PROTECTED) --- */}
          <Route path="/student" element={<StudentLayout><Outlet /></StudentLayout>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="tower/:id" element={<StudentTowerDetail />} />
            <Route path="vitals" element={<StudentVitalsForm />} />
            <Route path="harvest" element={<StudentHarvestForm />} />
            <Route path="waste" element={<StudentWasteForm />} />
            <Route path="pests" element={<StudentPestForm />} />
            <Route path="add-plant" element={<StudentPlantForm />} />
            {/* 2. Add the new route for the photo form */}
            <Route path="photos" element={<StudentPhotoForm />} />
          </Route>

          {/* --- TEACHER APP ROUTES (PROTECTED) --- */}
          <Route path="/app" element={<AppStoreProviderWrapper />}>
            {/* ... all teacher routes ... */}
          </Route>

          {/* --- LEGAL & CATCH-ALL ROUTES --- */}
          {/* ... legal and not found routes ... */}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
