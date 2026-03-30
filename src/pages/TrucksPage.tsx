import { useEffect, useState } from "react";
import { getTrucks, saveTruck, updateTruck, deleteTruck, Truck } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Truck | null>(null);
  const [form, setForm] = useState<{ registration: string; make: string; model: string; mileage: number; status: 'active' | 'inactive' }>({ registration: '', make: '', model: '', mileage: 0, status: 'active' });
  const [search, setSearch] = useState('');

  const reload = () => setTrucks(getTrucks());
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateTruck(editing.id, form);
    } else {
      saveTruck(form);
    }
    setForm({ registration: '', make: '', model: '', mileage: 0, status: 'active' as 'active' | 'inactive' });
    setEditing(null);
    setShowForm(false);
    reload();
  };

  const handleEdit = (t: Truck) => {
    setEditing(t);
    setForm({ registration: t.registration, make: t.make || '', model: t.model || '', mileage: t.mileage, status: t.status });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this truck?')) { deleteTruck(id); reload(); }
  };

  const filtered = trucks.filter(t =>
    t.registration.toLowerCase().includes(search.toLowerCase()) ||
    (t.make || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Trucks</h1>
          <p className="text-muted-foreground text-sm mt-1">{trucks.length} registered vehicles</p>
        </div>
        <Button size="sm" onClick={() => { setEditing(null); setForm({ registration: '', make: '', model: '', mileage: 0, status: 'active' }); setShowForm(true); }}>
          <Plus className="w-4 h-4" /> Add Truck
        </Button>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">{editing ? 'Edit Truck' : 'New Truck'}</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Input placeholder="Registration No." value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} required />
            <Input placeholder="Make" value={form.make} onChange={e => setForm({ ...form, make: e.target.value })} />
            <Input placeholder="Model" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} />
            <Input type="number" placeholder="Mileage (KSh)" value={form.mileage || ''} onChange={e => setForm({ ...form, mileage: Number(e.target.value) })} />
            <div className="flex gap-2">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as 'active' | 'inactive' })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <Button type="submit">{editing ? 'Update' : 'Save'}</Button>
            </div>
          </form>
        </div>
      )}

      <Input placeholder="Search trucks..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th className="hidden sm:table-cell">Make / Model</th>
              <th>Mileage</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No trucks found</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id}>
                <td className="font-mono font-medium">{t.registration}</td>
                <td className="hidden sm:table-cell">{[t.make, t.model].filter(Boolean).join(' ') || '—'}</td>
                <td className="font-mono">KSh {t.mileage.toLocaleString()}</td>
                <td><span className={t.status === 'active' ? 'badge-active' : 'badge-inactive'}>{t.status}</span></td>
                <td className="text-right">
                  <button onClick={() => handleEdit(t)} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive p-1 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
