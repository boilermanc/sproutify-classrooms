// src/App.tsx – always register Garden Network routes

import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/auth/Login";
import RegisterTeacher from "@/pages/auth/RegisterTeacher";
import AcceptInvite from "@/pages/auth/AcceptInvite";
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

// Subscription components
import SubscriptionSuccess from "@/pages/subscription/SubscriptionSuccess";
import SubscriptionManagement from "@/pages/subscription/SubscriptionManagement";

// Subscription Guard
import { SubscriptionGuard } from "@/components/SubscriptionGuard";

// Guides
import TeacherPestDiseaseGuide from "@/pages/guides/TeacherPestDiseaseGuide";
import StudentPestDiseaseGuide from "@/pages/guides/StudentPestDiseaseGuide";
import DistrictGuide from "@/pages/guides/DistrictGuide";
import SchoolGuide from "@/pages/guides/SchoolGuide";

// Catalog
import ManageClassroomCatalog from "@/pages/catalog/ManageClassroomCatalog";
import GlobalPlantCatalog from "@/pages/catalog/GlobalPlantCatalog";

// Auth
import StudentLoginPage from "@/pages/auth/StudentLoginPage";

// Admin layouts and pages
import SchoolAdminLayout from "@/components/layout/SchoolAdminLayout";
import DistrictAdminLayout from "@/components/layout/DistrictAdminLayout";
import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import SuperAdminDashboard from "@/pages/admin/SuperAdminDashboard";
import UserManagement from "@/pages/admin/UserManagement";
import DistrictManagement from "@/pages/admin/DistrictManagement";
import SchoolManagement from "@/pages/admin/SchoolManagement";
import VideoManagement from "@/pages/admin/VideoManagement";
import StyleGuide from "@/pages/admin/StyleGuide";
import { RequireRole } from "@/components/RequireRole";
import SchoolDashboard from "@/pages/school/SchoolDashboard";
import SchoolTowers from "@/pages/school/SchoolTowers";
import SchoolTeachers from "@/pages/school/SchoolTeachers";
import SchoolClassrooms from "@/pages/school/SchoolClassrooms";
import SchoolReports from "@/pages/school/SchoolReports";
import SchoolJoinCodes from "@/pages/school/SchoolJoinCodes";
import DistrictDashboard from "@/pages/district/DistrictDashboard";
import DistrictSchools from "@/pages/district/DistrictSchools";
import DistrictTeachers from "@/pages/district/DistrictTeachers";
import DistrictTowers from "@/pages/district/DistrictTowers";
import DistrictReports from "@/pages/district/DistrictReports";
import DistrictJoinCodes from "@/pages/district/DistrictJoinCodes";
import DistrictSettings from "@/pages/district/DistrictSettings";
import AdminTestPage from "@/pages/AdminTestPage";
import AuthTestPage from "@/pages/AuthTestPage";
import AdminSetup from "@/pages/AdminSetup";
import RoleBasedRedirect from "@/components/RoleBasedRedirect";

// Garden Network (lazy-loaded but ALWAYS routed)
const NetworkDashboard = React.lazy(() => import("@/pages/network/NetworkDashboard"));
const NetworkSettings  = React.lazy(() => import("@/pages/network/NetworkSettings"));
const ClassroomDiscovery = React.lazy(() => import("@/pages/network/ClassroomDiscovery"));
const MyConnections   = React.lazy(() => import("@/pages/network/MyConnections"));
const ChallengeCenter = React.lazy(() => import("@/pages/network/ChallengeCenter"));

// Seeding (lazy-loaded)
const SeedingPage = React.lazy(() => import("@/pages/seeding/SeedingPage"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Index />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          <Route path="/accessibility" element={<Accessibility />} />

          {/* Subscription routes (public access) */}
          <Route path="/subscription">
            <Route path="success" element={<SubscriptionSuccess />} />
            <Route path="manage" element={<SubscriptionManagement />} />
          </Route>

          {/* Auth */}
          <Route path="/auth">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<RegisterTeacher />} />
            <Route path="accept-invite" element={<AcceptInvite />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="student-login" element={<StudentLoginPage />} />
          </Route>

          {/* Admin Test Page (for development) */}
          <Route path="/admin-test" element={<AdminTestPage />} />
          <Route path="/auth-test" element={<AuthTestPage />} />
          <Route path="/admin-setup" element={<AdminSetup />} />

          {/* Admin routes (super_admin and staff only) */}
          <Route path="/admin" element={
            <RequireRole allow={["super_admin", "staff"]}>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </RequireRole>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="super" element={<SuperAdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="videos" element={<VideoManagement />} />
            <Route path="districts" element={<DistrictManagement />} />
            <Route path="schools" element={<SchoolManagement />} />
            <Route path="subscriptions" element={<div className="p-6">Subscription management coming soon.</div>} />
            <Route path="analytics" element={<div className="p-6">Analytics coming soon.</div>} />
            <Route path="system" element={<div className="p-6">System monitoring coming soon.</div>} />
            <Route path="activity" element={<div className="p-6">Activity logs coming soon.</div>} />
            <Route path="reports" element={<div className="p-6">Reports coming soon.</div>} />
            <Route path="settings" element={<div className="p-6">Admin settings coming soon.</div>} />
            <Route path="style-guide" element={<StyleGuide />} />
            <Route path="help" element={<div className="p-6">Admin help coming soon.</div>} />
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

          {/* Teacher app (protected with subscription guard) */}
          <Route path="/app" element={
            <SubscriptionGuard>
              <RoleBasedRedirect>
                <AppStoreProviderWrapper>
                  <AppLayout>
                    <Outlet />
                  </AppLayout>
                </AppStoreProviderWrapper>
              </RoleBasedRedirect>
            </SubscriptionGuard>
          }>
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
            <Route path="district-guide" element={<DistrictGuide />} />
            <Route path="school-guide" element={<SchoolGuide />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="classrooms" element={<Classrooms />} />
            <Route path="kiosk" element={<Kiosk />} />
            <Route path="help" element={<HelpCenter />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<AccountSettings />} />
            
            {/* Seeding routes */}
            <Route path="seeding" element={
              <Suspense fallback={<PageLoader />}>
                <SeedingPage />
              </Suspense>
            } />
          </Route>

          {/* School Admin routes (protected with subscription guard) */}
          <Route path="/school" element={
            <SubscriptionGuard>
              <RoleBasedRedirect>
                <SchoolAdminLayout>
                  <Outlet />
                </SchoolAdminLayout>
              </RoleBasedRedirect>
            </SubscriptionGuard>
          }>
            <Route index element={<SchoolDashboard />} />
            <Route path="dashboard" element={<SchoolDashboard />} />
            <Route path="towers" element={<SchoolTowers />} />
            <Route path="classrooms" element={<SchoolClassrooms />} />
            <Route path="teachers" element={<SchoolTeachers />} />
            <Route path="reports" element={<SchoolReports />} />
            <Route path="join-codes" element={<SchoolJoinCodes />} />
            <Route path="settings" element={<div className="p-6">School settings coming soon.</div>} />
          </Route>

          {/* District Admin routes (protected with subscription guard) */}
          <Route path="/district" element={
            <SubscriptionGuard>
              <RoleBasedRedirect>
                <DistrictAdminLayout>
                  <Outlet />
                </DistrictAdminLayout>
              </RoleBasedRedirect>
            </SubscriptionGuard>
          }>
            <Route index element={<DistrictDashboard />} />
            <Route path="dashboard" element={<DistrictDashboard />} />
            <Route path="schools" element={<DistrictSchools />} />
            <Route path="teachers" element={<DistrictTeachers />} />
            <Route path="towers" element={<DistrictTowers />} />
            <Route path="reports" element={<DistrictReports />} />
            <Route path="join-codes" element={<DistrictJoinCodes />} />
            <Route path="settings" element={<DistrictSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;