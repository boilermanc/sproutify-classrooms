// src/App.tsx – always register Garden Network routes

import React, { Suspense } from "react";
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
import StudentLayout from "@/components/layout/StudentLayout";
import StudentDashboard from "@/pages/kiosk/StudentDashboard";
import StudentTowerDetail from "@/pages/kiosk/StudentTowerDetail";
import StudentVitalsForm from "@/pages/kiosk/StudentVitalsForm";
import StudentHarvestForm from "@/pages/kiosk/StudentHarvestForm";
import StudentWasteForm from "@/pages/kiosk/StudentWasteForm";
import StudentPestForm from "@/pages/kiosk/StudentPestForm";
import StudentPlantForm from "@/pages/kiosk/StudentPlantForm";
import StudentPhotoForm from "@/pages/kiosk/StudentPhotoForm";

// Guides
import TeacherPestDiseaseGuide from "@/pages/guides/TeacherPestDiseaseGuide";
import StudentPestDiseaseGuide from "@/pages/guides/StudentPestDiseaseGuide";

// Catalog
import ManageClassroomCatalog from "@/pages/catalog/ManageClassroomCatalog";
import GlobalPlantCatalog from "@/pages/catalog/GlobalPlantCatalog";

// Auth
import StudentLoginPage from "@/pages/auth/StudentLoginPage";

// Garden Network (lazy-loaded but ALWAYS routed)
const NetworkDashboard = React.lazy(() => import("@/pages/network/NetworkDashboard"));
const NetworkSettings  = React.lazy(() => import("@/pages/network/NetworkSettings"));
const ClassroomDiscovery = React.lazy(() => import("@/pages/network/ClassroomDiscovery"));
const MyConnections   = React.lazy(() => import("@/pages/network/MyConnections"));
const ChallengeCenter = React.lazy(() => import("@/pages/network/ChallengeCenter"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* Auth */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterTeacher />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="student-login" element={<StudentLoginPage />} />
          </Route>

          {/* Student (protected) */}
          <Route path="/student" element={<StudentLayout><Outlet /></StudentLayout>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="tower/:id" element={<StudentTowerDetail />} />
            <Route path="vitals" element={<StudentVitalsForm />} />
            <Route path="harvest" element={<StudentHarvestForm />} />
            <Route path="waste" element={<StudentWasteForm />} />
            <Route path="pests" element={<StudentPestForm />} />
            <Route path="add-plant" element={<StudentPlantForm />} />
            <Route path="photos" element={<StudentPhotoForm />} />
            <Route path="pest-disease-guide" element={<StudentPestDiseaseGuide />} />
          </Route>

          {/* Teacher app (protected) */}
          <Route path="/app" element={<AppStoreProviderWrapper />}>
            <Route index element={<DashboardHome />} />

            <Route path="towers">
              <Route index element={<TowersList />} />
              <Route path="new" element={<NewTower />} />
              <Route path=":id" element={<TowerDetail />} />
            </Route>

            <Route path="catalog">
              <Route index element={<PlantCatalog />} />
              <Route path="manage" element={<ManageClassroomCatalog />} />
              <Route path="global" element={<GlobalPlantCatalog />} />
            </Route>

            {/* Garden Network — routes are always present */}
            <Route path="network">
              <Route
                index
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NetworkDashboard />
                  </Suspense>
                }
              />
              <Route
                path="settings"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <NetworkSettings />
                  </Suspense>
                }
              />
              <Route
                path="discover"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ClassroomDiscovery />
                  </Suspense>
                }
              />
              <Route
                path="connections"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <MyConnections />
                  </Suspense>
                }
              />
              <Route
                path="challenges"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <ChallengeCenter />
                  </Suspense>
                }
              />
            </Route>

            <Route path="pest-disease-guide" element={<TeacherPestDiseaseGuide />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="kiosk" element={<Kiosk />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AccountSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
