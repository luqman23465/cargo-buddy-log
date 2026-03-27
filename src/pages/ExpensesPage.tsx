import { useEffect, useState } from "react";
import { getPayables, savePayable, updatePayable, Payable } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Check } from "lucide-react";

export default function ExpensesPage() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ payeeName: '', amount: 0, dateTaken: '', dateDue: '', status: 'unpaid' as const });

  const reload = () => setPayables(getPayables());
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePayable(form);
    setForm({ payeeName: '', amount: 0, dateTaken: '', dateDue: '', status: 'unpaid' });
    setShowForm(false); reload();
  };

  const markPaid = (id: string) => { updatePayable(id, { status: 'paid' }); reload(); };
  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });

  const unpaid = payables.filter(p => p.status === 'unpaid');
  const paid = payables.filter(p => p.status === 'paid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Expenses & Payables</h1>
          <p className="text-muted-foreground text-sm mt-1">Company liabilities (We Owe Others)</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> Add Payable</Button>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">New Payable</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input placeholder="Payee Name" value={form.payeeName} onChange={e => setForm({ ...form, payeeName: e.target.value })} required />
            <Input type="number" placeholder="Amount" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} required />
            <Input type="date" value={form.dateTaken} onChange={e => setForm({ ...form, dateTaken: e.target.value })} required />
            <Input type="date" value={form.dateDue} onChange={e => setForm({ ...form, dateDue: e.target.value })} required />
            <Button type="submit">Save</Button>
          </form>
        </div>
      )}

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Unpaid ({unpaid.length})</h2>
        <div className="stat-card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Payee</th><th>Amount</th><th>Date Taken</th><th>Due Date</th><th className="text-right">Action</th></tr></thead>
            <tbody>
              {unpaid.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-muted-foreground py-6">No unpaid liabilities</td></tr>
              ) : unpaid.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.payeeName}</td>
                  <td className="font-mono text-warning">${fmt(p.amount)}</td>
                  <td className="font-mono text-xs">{p.dateTaken}</td>
                  <td className="font-mono text-xs">{p.dateDue}</td>
                  <td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => markPaid(p.id)}><Check className="w-3.5 h-3.5" /> Mark Paid</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {paid.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Paid ({paid.length})</h2>
          <div className="stat-card overflow-x-auto">
            <table className="data-table">
              <thead><tr><th>Payee</th><th>Amount</th><th>Date Taken</th><th>Due Date</th><th>Status</th></tr></thead>
              <tbody>
                {paid.map(p => (
                  <tr key={p.id} className="opacity-60">
                    <td>{p.payeeName}</td>
                    <td className="font-mono">${fmt(p.amount)}</td>
                    <td className="font-mono text-xs">{p.dateTaken}</td>
                    <td className="font-mono text-xs">{p.dateDue}</td>
                    <td><span className="badge-active">paid</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
