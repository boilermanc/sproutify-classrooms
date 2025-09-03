// src/components/AppStoreProviderWrapper.tsx
import { AppStoreProvider } from "@/context/AppStore";
import { Outlet } from "react-router-dom";

export default function AppStoreProviderWrapper() {
  return (
    <AppStoreProvider>
      {/* TEMP: bypass AppLayout to isolate a layout problem */}
      <Outlet />
    </AppStoreProvider>
  );
}
