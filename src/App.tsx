import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import TrucksPage from "@/pages/TrucksPage";
import DriversPage from "@/pages/DriversPage";
import ClientsPage from "@/pages/ClientsPage";
import TripsPage from "@/pages/TripsPage";
import ExpensesPage from "@/pages/ExpensesPage";
import MaintenancePage from "@/pages/MaintenancePage";
import ReportsPage from "@/pages/ReportsPage";
import LoginPage from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem("fleetops_auth") === "true");

  if (!authed) {
    return (
      <TooltipProvider>
        <LoginPage onLogin={() => setAuthed(true)} />
      </TooltipProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout onLogout={() => { localStorage.removeItem("fleetops_auth"); setAuthed(false); }} />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/trucks" element={<TrucksPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/clients" element={<ClientsPage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/expenses" element={<ExpensesPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
