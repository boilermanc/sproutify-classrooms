import AppLayout from "@/components/layout/AppLayout";
import { AppStoreProvider } from "@/context/AppStore";
import { Outlet } from "react-router-dom";

export default function AppStoreProviderWrapper() {
  return (
    <AppStoreProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </AppStoreProvider>
  );
}
