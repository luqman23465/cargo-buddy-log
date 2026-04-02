import { useEffect, useState } from "react";
import { getTrips, saveTrip, getTrucks, getDrivers, getClients, Trip, TripLeg, FuelStop, calcTripRevenue, calcTripExpenses, calcTripProfit } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, ChevronDown, ChevronUp, Fuel } from "lucide-react";

const emptyFuelStop: FuelStop = { location: '', cost: 0, pricePerLitre: 0, litres: 0 };

const emptyLeg: TripLeg = {
  destination: '', clientId: '', loadAmount: 0, tonnes: 0, containerNumber: '',
  mileage: 0, fuelCost: 0, fuelLocation: '', fuelPricePerLitre: 0, litresPurchased: 0,
  fuelStops: [],
  spareParts: '', sparePartsCost: 0,
};

function FuelStopForm({ stop, onChange, onRemove, index }: {
  stop: FuelStop; onChange: (s: FuelStop) => void; onRemove: () => void; index: number;
}) {
  const up = (k: keyof FuelStop, v: string | number) => onChange({ ...stop, [k]: v });
  return (
    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50 border border-border">
      <Fuel className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground shrink-0">Stop {index + 1}</span>
      <Input placeholder="Location" value={stop.location} onChange={e => up('location', e.target.value)} className="h-8 text-xs" />
      <Input type="number" placeholder="Cost (KSh)" value={stop.cost || ''} onChange={e => up('cost', Number(e.target.value))} className="h-8 text-xs w-28" />
      <Input type="number" placeholder="KSh/L" value={stop.pricePerLitre || ''} onChange={e => up('pricePerLitre', Number(e.target.value))} className="h-8 text-xs w-24" />
      <Input type="number" placeholder="Litres" value={stop.litres || ''} onChange={e => up('litres', Number(e.target.value))} className="h-8 text-xs w-24" />
      <button type="button" onClick={onRemove}><X className="w-3 h-3 text-muted-foreground" /></button>
    </div>
  );
}

function LegForm({ leg, onChange, label, clients }: {
  leg: TripLeg; onChange: (l: TripLeg) => void; label: string;
  clients: { id: string; name: string }[];
}) {
  const up = (k: keyof TripLeg, v: string | number) => onChange({ ...leg, [k]: v });
  const stops = leg.fuelStops || [];

  const addStop = () => onChange({ ...leg, fuelStops: [...stops, { ...emptyFuelStop }] });
  const updateStop = (i: number, s: FuelStop) => {
    const updated = [...stops];
    updated[i] = s;
    onChange({ ...leg, fuelStops: updated });
  };
  const removeStop = (i: number) => onChange({ ...leg, fuelStops: stops.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-primary">{label}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        <Input placeholder="Destination" value={leg.destination} onChange={e => up('destination', e.target.value)} />
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={leg.clientId} onChange={e => up('clientId', e.target.value)}>
          <option value="">Select client</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <Input type="number" placeholder="Load Amount (KSh)" value={leg.loadAmount || ''} onChange={e => up('loadAmount', Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input type="number" placeholder="Tonnes" value={leg.tonnes || ''} onChange={e => up('tonnes', Number(e.target.value))} />
        <Input placeholder="Container No." value={leg.containerNumber} onChange={e => up('containerNumber', e.target.value)} />
        <Input type="number" placeholder="Mileage (km)" value={leg.mileage || ''} onChange={e => up('mileage', Number(e.target.value))} />
        <Input type="number" placeholder="Initial Fuel Cost (KSh)" value={leg.fuelCost || ''} onChange={e => up('fuelCost', Number(e.target.value))} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Input placeholder="Initial Fuel Location" value={leg.fuelLocation} onChange={e => up('fuelLocation', e.target.value)} />
        <Input type="number" placeholder="Price/Litre" value={leg.fuelPricePerLitre || ''} onChange={e => up('fuelPricePerLitre', Number(e.target.value))} />
        <Input type="number" placeholder="Litres" value={leg.litresPurchased || ''} onChange={e => up('litresPurchased', Number(e.target.value))} />
        <Input type="number" placeholder="Parts Cost (KSh)" value={leg.sparePartsCost || ''} onChange={e => up('sparePartsCost', Number(e.target.value))} />
      </div>
      <Input placeholder="Spare parts / tyres changed (description)" value={leg.spareParts} onChange={e => up('spareParts', e.target.value)} />

      {/* Additional fuel stops */}
      <div className="space-y-2">
        {stops.map((s, i) => (
          <FuelStopForm key={i} stop={s} index={i} onChange={fs => updateStop(i, fs)} onRemove={() => removeStop(i)} />
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addStop} className="gap-1">
          <Fuel className="w-3 h-3" /> Add Fuel Stop
        </Button>
      </div>
    </div>
  );
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [trucks, setTrucks] = useState<{ id: string; registration: string }[]>([]);
  const [drivers, setDrivers] = useState<{ id: string; name: string; role: string }[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [form, setForm] = useState({
    truckId: '', driverId: '', tanmanId: '', outboundDate: '', returnDate: '',
    outbound: { ...emptyLeg, fuelStops: [] as FuelStop[] },
    returnLeg: { ...emptyLeg, fuelStops: [] as FuelStop[] },
    tripPay: 0,
  });

  const reload = () => {
    setTrips(getTrips());
    setTrucks(getTrucks().map(t => ({ id: t.id, registration: t.registration })));
    setDrivers(getDrivers().map(d => ({ id: d.id, name: d.name, role: d.role })));
    setClients(getClients().map(c => ({ id: c.id, name: c.name })));
  };
  useEffect(reload, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hasReturn = form.returnLeg.destination.trim() !== '';
    saveTrip({
      truckId: form.truckId, driverId: form.driverId, tanmanId: form.tanmanId,
      outboundDate: form.outboundDate, returnDate: form.returnDate || undefined,
      outbound: form.outbound,
      returnLeg: hasReturn ? form.returnLeg : undefined,
      tripPay: form.tripPay,
    });
    setForm({
      truckId: '', driverId: '', tanmanId: '', outboundDate: '', returnDate: '',
      outbound: { ...emptyLeg, fuelStops: [] },
      returnLeg: { ...emptyLeg, fuelStops: [] },
      tripPay: 0,
    });
    setShowForm(false); reload();
  };

  const fmt = (n: number) => n.toLocaleString('en', { minimumFractionDigits: 2 });
  const getTruckReg = (id: string) => trucks.find(t => t.id === id)?.registration || '—';
  const getDriverName = (id: string) => drivers.find(d => d.id === id)?.name || '—';

  const calcTotalFuel = (t: Trip) => {
    const legFuel = (leg?: TripLeg) => {
      if (!leg) return 0;
      return Number(leg.fuelCost || 0) + (leg.fuelStops || []).reduce((s, fs) => s + Number(fs.cost || 0), 0);
    };
    return legFuel(t.outbound) + legFuel(t.returnLeg);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">Trips</h1>
          <p className="text-muted-foreground text-sm mt-1">{trips.length} round trips</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> New Trip
        </Button>
      </div>

      {showForm && (
        <div className="stat-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium">New Round Trip</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.truckId} onChange={e => setForm({ ...form, truckId: e.target.value })} required>
                <option value="">Select truck</option>
                {trucks.map(t => <option key={t.id} value={t.id}>{t.registration}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.driverId} onChange={e => setForm({ ...form, driverId: e.target.value })} required>
                <option value="">Select driver</option>
                {drivers.filter(d => d.role === 'driver').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.tanmanId} onChange={e => setForm({ ...form, tanmanId: e.target.value })} required>
                <option value="">Select tanman</option>
                {drivers.filter(d => d.role === 'tanman').map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <Input type="date" value={form.outboundDate} onChange={e => setForm({ ...form, outboundDate: e.target.value })} required />
              <Input type="date" placeholder="Return date" value={form.returnDate} onChange={e => setForm({ ...form, returnDate: e.target.value })} />
            </div>

            <LegForm leg={form.outbound} onChange={outbound => setForm({ ...form, outbound: { ...outbound, fuelStops: outbound.fuelStops || [] } })} label="Outbound Leg" clients={clients} />

            <div className="border-t border-border pt-4">
              <LegForm leg={form.returnLeg} onChange={returnLeg => setForm({ ...form, returnLeg })} label="Return Leg (optional)" clients={clients} />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-border pt-4">
              <Input type="number" placeholder="Trip Pay (driver + tanman)" value={form.tripPay || ''} onChange={e => setForm({ ...form, tripPay: Number(e.target.value) })} className="max-w-xs" />
              <Button type="submit">Save Trip</Button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-2">
        {trips.length === 0 ? (
          <div className="stat-card text-center text-muted-foreground py-12">No trips recorded yet</div>
        ) : [...trips].reverse().map(t => (
          <div key={t.id} className="stat-card">
            <button className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2" onClick={() => setExpanded(expanded === t.id ? null : t.id)}>
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">{t.outboundDate}</span>
                <span className="font-medium text-sm">{t.outbound.destination}</span>
                {t.returnLeg && <span className="text-muted-foreground text-sm">→ {t.returnLeg.destination}</span>}
                <span className="badge-active font-mono text-xs">{getTruckReg(t.truckId)}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">KSh {fmt(calcTripRevenue(t))}</span>
                <span className={`font-mono text-sm ${calcTripProfit(t) >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {calcTripProfit(t) >= 0 ? '+' : ''}KSh {fmt(calcTripProfit(t))}
                </span>
                {expanded === t.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </div>
            </button>
            {expanded === t.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><span className="text-muted-foreground text-xs block">Driver</span>{getDriverName(t.driverId)}</div>
                  <div><span className="text-muted-foreground text-xs block">Tanman</span>{getDriverName(t.tanmanId)}</div>
                  <div><span className="text-muted-foreground text-xs block">Total Fuel</span><span className="font-mono">KSh {fmt(calcTotalFuel(t))}</span></div>
                  <div><span className="text-muted-foreground text-xs block">Trip Pay</span><span className="font-mono">KSh {fmt(t.tripPay)}</span></div>
                  <div><span className="text-muted-foreground text-xs block">Total Expenses</span><span className="font-mono">KSh {fmt(calcTripExpenses(t))}</span></div>
                  <div><span className="text-muted-foreground text-xs block">Total Mileage</span><span className="font-mono">{(t.outbound.mileage + (t.returnLeg?.mileage || 0)).toLocaleString()} km</span></div>
                  {t.outbound.spareParts && <div className="col-span-2"><span className="text-muted-foreground text-xs block">Outbound Parts</span>{t.outbound.spareParts}</div>}
                  {t.returnLeg?.spareParts && <div className="col-span-2"><span className="text-muted-foreground text-xs block">Return Parts</span>{t.returnLeg.spareParts}</div>}
                </div>
                {/* Show fuel stops */}
                {(t.outbound.fuelStops?.length || 0) > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium block mb-1">Outbound Fuel Stops</span>
                    <div className="space-y-1">
                      {t.outbound.fuelStops!.map((fs, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs bg-muted/50 rounded px-2 py-1">
                          <Fuel className="w-3 h-3 text-muted-foreground" />
                          <span>{fs.location || 'Unknown'}</span>
                          <span className="font-mono">KSh {fmt(fs.cost)}</span>
                          <span className="text-muted-foreground">{fs.litres}L @ KSh {fmt(fs.pricePerLitre)}/L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(t.returnLeg?.fuelStops?.length || 0) > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs font-medium block mb-1">Return Fuel Stops</span>
                    <div className="space-y-1">
                      {t.returnLeg!.fuelStops!.map((fs, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs bg-muted/50 rounded px-2 py-1">
                          <Fuel className="w-3 h-3 text-muted-foreground" />
                          <span>{fs.location || 'Unknown'}</span>
                          <span className="font-mono">KSh {fmt(fs.cost)}</span>
                          <span className="text-muted-foreground">{fs.litres}L @ KSh {fmt(fs.pricePerLitre)}/L</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
