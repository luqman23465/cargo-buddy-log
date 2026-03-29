import { useEffect, useState } from "react";
import { getMaintenanceEntries, saveMaintenanceEntry, getTrucks, MaintenanceEntry } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

export default function MaintenancePage() {
  const [entries, setEntries] = useState<MaintenanceEntry[]>([]);
  const [trucks, setTrucks] = useState<{ id: string; registration: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ truckId: '', date: '', serviceType: '', mileage: 0, cost: 0, notes: '' });
  const [filterTruck, setFilterTruck] = useState('');

  const reload = () => {
    setEntries(getMaintenanceEntries());
    setTrucks(getTrucks().map(t => ({ id: t.id, registration: t.registration })));
  };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMaintenanceEntry({ ...form, cost: form.cost || undefined });
    setForm({ truckId: '', date: '', serviceType: '', mileage: 0, cost: 0, notes: '' });
    setShowForm(false); reload();
  };

  const filtered = filterTruck ? entries.filter(e => e.truckId === filterTruck) : entries;
  const getReg = (id: string) => trucks.find(t => t.id === id)?.registration || '—';
  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Maintenance</h1>
          <p className="text-muted-foreground text-sm mt-1">Service history for all trucks</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Entry</Button>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">New Service Entry</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })} required>
              <option value="">Select truck</option>
              {trucks.map(t => <option key={t.id} value={t.id}>{t.registration}</option>)}
            </select>
            <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <Input placeholder="Service Type" value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })} required />
            <Input type="number" placeholder="Mileage at service" value={form.mileage || ''} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
            <Input type="number" placeholder="Cost (KSh)" value={form.cost || ''} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} />
            <Input placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            <Button type="submit" className="sm:col-start-2 md:col-start-3">Save</Button>
          </form>
        </div>
      )}

      <select className="flex h-10 w-48 rounded-md border border-input bg-background px-3 py-2 text-sm" value={filterTruck} onChange={e => setFilterTruck(e.target.value)}>
        <option value="">All trucks</option>
        {trucks.map(t => <option key={t.id} value={t.id}>{t.registration}</option>)}
      </select>

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead><tr><th>Truck</th><th>Date</th><th>Service</th><th className="hidden sm:table-cell">Mileage</th><th>Cost</th><th className="hidden sm:table-cell">Notes</th></tr></thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted-foreground py-8">No entries found</td></tr>
            ) : [...filtered].reverse().map(e => (
              <tr key={e.id}>
                <td className="font-mono">{getReg(e.truckId)}</td>
                <td className="font-mono text-xs">{e.date}</td>
                <td>{e.serviceType}</td>
                <td className="font-mono hidden sm:table-cell">{e.mileage.toLocaleString()} km</td>
                <td className="font-mono">{e.cost ? `KSh ${fmt(e.cost)}` : '—'}</td>
                <td className="text-muted-foreground text-xs hidden sm:table-cell">{e.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
