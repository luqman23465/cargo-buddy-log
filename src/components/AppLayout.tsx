import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function AppLayout({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar onLogout={onLogout} />
      <main className="md:ml-56 p-4 md:p-6 min-h-screen pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
