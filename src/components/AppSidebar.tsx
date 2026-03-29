import { NavLink, useLocation } from "react-router-dom";
import {
  Truck, Users, Building2, Route, LayoutDashboard,
  BarChart3, Wrench, CreditCard, LogOut, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/trucks", icon: Truck, label: "Trucks" },
  { to: "/drivers", icon: Users, label: "Drivers & Tanmen" },
  { to: "/clients", icon: Building2, label: "Clients" },
  { to: "/trips", icon: Route, label: "Trips" },
  { to: "/expenses", icon: CreditCard, label: "Expenses" },
  { to: "/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/reports", icon: BarChart3, label: "Reports" },
];

export default function AppSidebar({ onLogout }: { onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground text-sm">FleetOps</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-sidebar-foreground">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-200 w-56",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center gap-2 px-4 h-14 border-b border-sidebar-border">
          <Truck className="w-6 h-6 text-primary shrink-0" />
          <span className="font-semibold text-foreground tracking-tight">FleetOps</span>
        </div>

        <nav className="flex-1 py-3 space-y-0.5 px-2 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));
            return (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-primary")} />
                <span>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-5 h-12 border-t border-sidebar-border text-sidebar-foreground hover:text-destructive transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </aside>
    </>
  );
}
