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
import ResetPassword from "@/pages/auth/ResetPassword";
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
import AccountSettings from "@/pages/settings/AccountSettings";
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
import StudentPhotoForm from "@/pages/kiosk/StudentPhotoForm";

// NEW: Pest & Disease Guide imports
import TeacherPestDiseaseGuide from "@/pages/guides/TeacherPestDiseaseGuide";
import StudentPestDiseaseGuide from "@/pages/guides/StudentPestDiseaseGuide";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Index />} />
          <Route path="/student-login" element={<StudentLoginPage />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* --- TEACHER AUTH ROUTES --- */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterTeacher />} />
            <Route path="reset-password" element={<ResetPassword />} />
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
            <Route path="photos" element={<StudentPhotoForm />} />
            <Route path="pest-disease-guide" element={<StudentPestDiseaseGuide />} /> {/* NEW */}
          </Route>

          {/* --- TEACHER APP ROUTES (PROTECTED) --- */}
          <Route path="/app" element={<AppStoreProviderWrapper />}>
            <Route index element={<DashboardHome />} />
            <Route path="towers" >
              <Route index element={<TowersList />} />
              <Route path="new" element={<NewTower />} />
              <Route path=":id" element={<TowerDetail />} />
            </Route>
            <Route path="catalog" element={<PlantCatalog />} />
            <Route path="pest-disease-guide" element={<TeacherPestDiseaseGuide />} /> {/* NEW */}
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="kiosk" element={<Kiosk />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          {/* --- CATCH-ALL ROUTE --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;