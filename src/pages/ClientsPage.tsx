import { useEffect, useState } from "react";
import { getClients, saveClient, updateClient, deleteClient, getClientPayments, saveClientPayment, Client, ClientPayment } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, X, CreditCard } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState({ name: '', contact: '', email: '', balance: 0 });
  const [payForm, setPayForm] = useState({ clientId: '', date: '', amount: 0, reference: '' });
  const [search, setSearch] = useState('');

  const reload = () => { setClients(getClients()); setPayments(getClientPayments()); };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) updateClient(editing.id, form);
    else saveClient(form);
    setForm({ name: '', contact: '', email: '', balance: 0 });
    setEditing(null); setShowForm(false); reload();
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveClientPayment(payForm);
    setPayForm({ clientId: '', date: '', amount: 0, reference: '' });
    setShowPayment(false); reload();
  };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-header">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">{clients.length} clients</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPayment(true)}>
            <CreditCard className="w-4 h-4" /> Payment
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setForm({ name: '', contact: '', email: '', balance: 0 }); setShowForm(true); }}>
            <Plus className="w-4 h-4" /> Add Client
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">{editing ? 'Edit' : 'New'} Client</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Contact" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
            <Input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Button type="submit">{editing ? 'Update' : 'Save'}</Button>
          </form>
        </div>
      )}

      {showPayment && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">Record Client Payment</h2>
            <button onClick={() => setShowPayment(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handlePaySubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={payForm.clientId} onChange={e => setPayForm({ ...payForm, clientId: e.target.value })} required>
              <option value="">Select client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Input type="date" value={payForm.date} onChange={e => setPayForm({ ...payForm, date: e.target.value })} required />
            <Input type="number" placeholder="Amount" value={payForm.amount || ''} onChange={e => setPayForm({ ...payForm, amount: Number(e.target.value) })} required />
            <Input placeholder="Reference" value={payForm.reference} onChange={e => setPayForm({ ...payForm, reference: e.target.value })} />
            <Button type="submit">Save Payment</Button>
          </form>
        </div>
      )}

      <Input placeholder="Search clients..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-xs" />

      <div className="stat-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Contact</th><th className="hidden sm:table-cell">Email</th><th className="text-right">Balance Owed</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-muted-foreground py-8">No clients found</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id}>
                <td className="font-medium">{c.name}</td>
                <td>{c.contact || '—'}</td>
                <td className="hidden sm:table-cell">{c.email || '—'}</td>
                <td className={`text-right font-mono ${c.balance > 0 ? 'text-warning' : 'text-success'}`}>KSh {fmt(c.balance)}</td>
                <td className="text-right">
                  <button onClick={() => { setEditing(c); setForm({ name: c.name, contact: c.contact || '', email: c.email || '', balance: c.balance }); setShowForm(true); }} className="text-muted-foreground hover:text-foreground p-1"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { if (confirm('Delete?')) { deleteClient(c.id); reload(); } }} className="text-muted-foreground hover:text-destructive p-1 ml-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
