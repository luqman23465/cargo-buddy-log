import { useEffect, useState } from "react";
import { getDrivers, saveDriver, updateDriver, deleteDriver, getAdvances, saveAdvance, Driver, Advance } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, Banknote } from "lucide-react";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [advances, setAdvances] = useState<Advance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showAdvance, setShowAdvance] = useState(false);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [form, setForm] = useState({ name: '', role: 'driver' as const, monthlySalary: 0 });
  const [advForm, setAdvForm] = useState({ personId: '', date: '', amount: 0, notes: '' });
  const [filter, setFilter] = useState<'all' | 'driver' | 'tanman'>('all');

  const reload = () => { setDrivers(getDrivers()); setAdvances(getAdvances()); };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateDriver(editing.id, form);
    else saveDriver(form);
    setForm({ name: '', role: 'driver', monthlySalary: 0 });
    setEditing(null); setShowForm(false); reload();
  };

  const handleAdvSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdvance(advForm);
    setAdvForm({ personId: '', date: '', amount: 0, notes: '' });
    setShowAdvance(false); reload();
  };

  const filtered = drivers.filter(d => filter === 'all' || d.role === filter);
  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Drivers & Tanmen</h1>
          <p className="text-muted-foreground text-sm mt-1">{drivers.length} personnel</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAdvance(true)}>
            <Banknote className="w-4 h-4" /> Record Advance
          </Button>
          <Button onClick={() => { setEditing(null); setForm({ name: '', role: 'driver', monthlySalary: 0 }); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Person
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">{editing ? 'Edit' : 'New'} Driver/Tanman</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'driver' | 'tanman' })}>
              <option value="driver">Driver</option>
              <option value="tanman">Tanman (Turn Boy)</option>
            </select>
            <Input type="number" placeholder="Monthly Salary" value={form.monthlySalary || ''} onChange={e => setForm({ ...form, monthlySalary: Number(e.target.value) })} />
            <Button type="submit">{editing ? 'Update' : 'Save'}</Button>
          </form>
        </div>
      )}

      {showAdvance && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Record Advance</h2>
            <button onClick={() => setShowAdvance(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleAdvSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={advForm.personId} onChange={e => setAdvForm({ ...advForm, personId: e.target.value })} required>
              <option value="">Select person</option>
              {drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.role})</option>)}
            </select>
            <Input type="date" value={advForm.date} onChange={e => setAdvForm({ ...advForm, date: e.target.value })} required />
            <Input type="number" placeholder="Amount" value={advForm.amount || ''} onChange={e => setAdvForm({ ...advForm, amount: Number(e.target.value) })} required />
            <Input placeholder="Notes" value={advForm.notes} onChange={e => setAdvForm({ ...advForm, notes: e.target.value })} />
            <Button type="submit">Save Advance</Button>
          </form>
        </div>
      )}

      <div className="flex gap-2">
        {(['all', 'driver', 'tanman'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}>
            {f === 'all' ? 'All' : f === 'driver' ? 'Drivers' : 'Tanmen'}
          </button>
        ))}
      </div>

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Role</th><th>Monthly Salary</th><th>Advances (Total)</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No personnel found</td></tr>
            ) : filtered.map(d => {
              const totalAdv = advances.filter(a => a.personId === d.id).reduce((s, a) => s + a.amount, 0);
              return (
                <tr key={d.id}>
                  <td className="font-medium">{d.name}</td>
                  <td><span className={d.role === 'driver' ? 'badge-active' : 'badge-warning'}>{d.role}</span></td>
                  <td className="font-mono">${fmt(d.monthlySalary)}</td>
                  <td className="font-mono">${fmt(totalAdv)}</td>
                  <td className="text-right">
                    <button onClick={() => { setEditing(d); setForm({ name: d.name, role: d.role, monthlySalary: d.monthlySalary }); setShowForm(true); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { if (confirm('Delete?')) { deleteDriver(d.id); reload(); } }} className="text-muted-foreground hover:text-destructive p-1 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
