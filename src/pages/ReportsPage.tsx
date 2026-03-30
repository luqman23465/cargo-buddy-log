import { useEffect, useState } from "react";
import {
  getTrips,
  getTrucks,
  getDrivers,
  getClients,
  getAdvances,
  getPayables,
  calcTripRevenue,
  calcTripExpenses,
  Trip,
  Truck,
  Driver,
  Client,
  Advance,
  Payable
} from "@/lib/store";

export default function ReportsPage() {
  const [tab, setTab] = useState<'truck' | 'driver' | 'client' | 'fuel' | 'payables'>('truck');
  const [trips, setTrips] = useState<Trip[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [payables, setPayables] = useState<Payable[]>([]);

  useEffect(() => {
    setTrips(getTrips()); setTrucks(getTrucks()); setDrivers(getDrivers());
    setClients(getClients()); setAdvances(getAdvances()); setPayables(getPayables());
  }, []);

  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });
  const tabs = [
    { key: 'truck' as const, label: 'Trucks' },
    { key: 'driver' as const, label: 'Drivers' },
    { key: 'client' as const, label: 'Clients' },
    { key: 'fuel' as const, label: 'Fuel' },
    { key: 'payables' as const, label: 'Payables' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Performance analytics and summaries</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'truck' && (
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Truck</th><th>Trips</th><th>Revenue</th><th className="hidden sm:table-cell">Fuel</th><th className="hidden sm:table-cell">Expenses</th><th>Profit</th><th className="hidden md:table-cell">Mileage (KSh)</th></tr></thead>
            <tbody>
              {trucks.map(tk => {
                const tTrips = trips.filter(t => t.truckId === tk.id);
                const rev = tTrips.reduce((s, t) => s + calcTripRevenue(t), 0);
                const fuel = tTrips.reduce((s, t) => s + t.outbound.fuelCost + (t.returnLeg?.fuelCost || 0), 0);
                const exp = tTrips.reduce((s, t) => s + calcTripExpenses(t), 0);
                const prof = rev - exp;
                const miles = tTrips.reduce((s, t) => s + t.outbound.mileage + (t.returnLeg?.mileage || 0), 0);
                return (
                  <tr key={tk.id}>
                    <td className="font-mono font-medium">{tk.registration}</td>
                    <td className="font-mono">{tTrips.length}</td>
                    <td className="font-mono">KSh {fmt(rev)}</td>
                    <td className="font-mono hidden sm:table-cell">KSh {fmt(fuel)}</td>
                    <td className="font-mono hidden sm:table-cell">KSh {fmt(exp)}</td>
                    <td className={`font-mono ${prof >= 0 ? 'text-success' : 'text-destructive'}`}>KSh {fmt(prof)}</td>
                    <td className="font-mono hidden md:table-cell">KSh {fmt(miles)}</td>
                  </tr>
                );
              })}
              {trucks.length === 0 && <tr><td colSpan={7} className="text-center text-muted-foreground py-8">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'driver' && (
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Role</th><th>Salary</th><th>Trip Pay</th><th className="hidden sm:table-cell">Advances</th><th>Net</th></tr></thead>
            <tbody>
              {drivers.map(d => {
                const tripPay = trips.filter(t => t.driverId === d.id || t.tanmanId === d.id).reduce((s, t) => s + t.tripPay, 0);
                const adv = advances.filter(a => a.personId === d.id).reduce((s: number, a: Advance) => s + a.amount, 0);
                const net = d.monthlySalary + tripPay - adv;
                return (
                  <tr key={d.id}>
                    <td className="font-medium">{d.name}</td>
                    <td><span className={d.role === 'driver' ? 'badge-active' : 'badge-warning'}>{d.role}</span></td>
                    <td className="font-mono">KSh {fmt(d.monthlySalary)}</td>
                    <td className="font-mono">KSh {fmt(tripPay)}</td>
                    <td className="font-mono text-destructive hidden sm:table-cell">KSh {fmt(adv)}</td>
                    <td className="font-mono font-medium">KSh {fmt(net)}</td>
                  </tr>
                );
              })}
              {drivers.length === 0 && <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'client' && (
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Client</th><th>Contact</th><th>Balance Owed</th></tr></thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.contact || '—'}</td>
                  <td className={`font-mono ${c.balance > 0 ? 'text-warning' : 'text-success'}`}>KSh {fmt(c.balance)}</td>
                </tr>
              ))}
              {clients.length === 0 && <tr><td colSpan={3} className="text-center text-muted-foreground py-8">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'fuel' && (
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Truck</th><th>Fuel Cost</th><th>Mileage (KSh)</th><th>Cost/KSh</th></tr></thead>
            <tbody>
              {trucks.map(tk => {
                const tTrips = trips.filter(t => t.truckId === tk.id);
                const fuel = tTrips.reduce((s, t) => s + t.outbound.fuelCost + (t.returnLeg?.fuelCost || 0), 0);
                const miles = tTrips.reduce((s, t) => s + t.outbound.mileage + (t.returnLeg?.mileage || 0), 0);
                const cpk = miles > 0 ? fuel / miles : 0;
                return (
                  <tr key={tk.id}>
                    <td className="font-mono font-medium">{tk.registration}</td>
                    <td className="font-mono">KSh {fmt(fuel)}</td>
                    <td className="font-mono">KSh {fmt(miles)}</td>
                    <td className="font-mono">KSh {cpk.toFixed(2)}/KSh</td>
                  </tr>
                );
              })}
              {trucks.length === 0 && <tr><td colSpan={4} className="text-center text-muted-foreground py-8">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payables' && (
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Payee</th><th>Amount</th><th className="hidden sm:table-cell">Date Taken</th><th className="hidden sm:table-cell">Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {payables.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.payeeName}</td>
                  <td className="font-mono">KSh {fmt(p.amount)}</td>
                  <td className="font-mono text-xs hidden sm:table-cell">{p.dateTaken}</td>
                  <td className="font-mono text-xs hidden sm:table-cell">{p.dateDue}</td>
                  <td><span className={p.status === 'paid' ? 'badge-active' : 'badge-warning'}>{p.status}</span></td>
                </tr>
              ))}
              {payables.length === 0 && <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No data</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
