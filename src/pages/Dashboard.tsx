import { useEffect, useState } from "react";
import { getTrips, getClients, getPayables, getTrucks, calcTripRevenue, calcTripProfit, Trip, Client, Payable } from "@/lib/store";
import { Truck, Users, DollarSign, Route, TrendingUp, AlertCircle } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-sm">{label}</span>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className={`text-xl md:text-2xl font-semibold font-mono ${color || ''}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);
  const [truckCount, setTruckCount] = useState(0);

  useEffect(() => {
    setTrips(getTrips());
    setClients(getClients());
    setPayables(getPayables());
    setTruckCount(getTrucks().filter(t => t.status === 'active').length);
  }, []);

  const now = new Date();
  const thisMonth = trips.filter(t => {
    const d = new Date(t.outboundDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const monthlyRevenue = thisMonth.reduce((s, t) => s + calcTripRevenue(t), 0);
  const monthlyProfit = thisMonth.reduce((s, t) => s + calcTripProfit(t), 0);
  const totalOwed = clients.reduce((s, c) => s + Math.max(0, c.balance), 0);
  const totalPayables = payables.filter(p => p.status === 'unpaid').reduce((s, p) => s + p.amount, 0);

  const recentTrips = [...trips].sort((a, b) => new Date(b.outboundDate).getTime() - new Date(a.outboundDate).getTime()).slice(0, 5);

  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Fleet operations overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard icon={DollarSign} label="Monthly Revenue" value={`KSh ${fmt(monthlyRevenue)}`} sub={`${thisMonth.length} trips this month`} />
        <StatCard icon={TrendingUp} label="Monthly Profit" value={`KSh ${fmt(monthlyProfit)}`} color={monthlyProfit >= 0 ? "text-success" : "text-destructive"} />
        <StatCard icon={Users} label="Client Balances" value={`KSh ${fmt(totalOwed)}`} sub="Outstanding receivables" />
        <StatCard icon={AlertCircle} label="Payables Due" value={`KSh ${fmt(totalPayables)}`} sub="Unpaid liabilities" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="stat-card">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Recent Trips</h2>
          {recentTrips.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No trips recorded yet. Add your first trip to get started.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Destination</th>
                    <th className="text-right">Revenue</th>
                    <th className="text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map(t => (
                    <tr key={t.id}>
                      <td className="font-mono text-xs">{t.outboundDate}</td>
                      <td>{t.outbound.destination}</td>
                      <td className="text-right font-mono">KSh {fmt(calcTripRevenue(t))}</td>
                      <td className={`text-right font-mono ${calcTripProfit(t) >= 0 ? 'text-success' : 'text-destructive'}`}>
                        KSh {fmt(calcTripProfit(t))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="stat-card">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="text-sm">Active Trucks</span>
              </div>
              <span className="font-mono font-medium">{truckCount}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-primary" />
                <span className="text-sm">Total Trips</span>
              </div>
              <span className="font-mono font-medium">{trips.length}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm">Active Clients</span>
              </div>
              <span className="font-mono font-medium">{clients.length}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <span className="text-sm">Unpaid Payables</span>
              </div>
              <span className="font-mono font-medium">{payables.filter(p => p.status === 'unpaid').length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
