// Simple localStorage-based store for demo data

export interface Truck {
  id: string;
  registration: string;
  make?: string;
  model?: string;
  mileage: number;
  status: 'active' | 'inactive';
}

export interface Driver {
  id: string;
  name: string;
  role: 'driver' | 'tanman';
  monthlySalary: number;
}

export interface Advance {
  id: string;
  personId: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Client {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  balance: number;
}

export interface TripLeg {
  destination: string;
  clientId: string;
  loadAmount: number;
  tonnes: number;
  containerNumber?: string;
  mileage: number;
  fuelCost: number;
  fuelLocation?: string;
  fuelPricePerLitre?: number;
  litresPurchased?: number;
  spareParts?: string;
  sparePartsCost?: number;
}

export interface Trip {
  id: string;
  truckId: string;
  driverId: string;
  tanmanId: string;
  outboundDate: string;
  returnDate?: string;
  outbound: TripLeg;
  returnLeg?: TripLeg;
  tripPay: number;
}

export interface Payable {
  id: string;
  payeeName: string;
  amount: number;
  dateTaken: string;
  dateDue: string;
  status: 'paid' | 'unpaid';
}

export interface ClientPayment {
  id: string;
  clientId: string;
  date: string;
  amount: number;
  reference?: string;
}

export interface MaintenanceEntry {
  id: string;
  truckId: string;
  date: string;
  serviceType: string;
  mileage: number;
  cost?: number;
  notes?: string;
}

function getStore<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setStore<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const uid = () => Math.random().toString(36).slice(2, 10);

// Trucks
export const getTrucks = () => getStore<Truck>('trucks');
export const saveTruck = (t: Omit<Truck, 'id'>) => {
  const trucks = getTrucks();
  const truck = { ...t, id: uid() };
  trucks.push(truck);
  setStore('trucks', trucks);
  return truck;
};
export const updateTruck = (id: string, data: Partial<Truck>) => {
  const trucks = getTrucks().map(t => t.id === id ? { ...t, ...data } : t);
  setStore('trucks', trucks);
};
export const deleteTruck = (id: string) => {
  setStore('trucks', getTrucks().filter(t => t.id !== id));
};

// Drivers & Tanmen
export const getDrivers = () => getStore<Driver>('drivers');
export const saveDriver = (d: Omit<Driver, 'id'>) => {
  const drivers = getDrivers();
  const driver = { ...d, id: uid() };
  drivers.push(driver);
  setStore('drivers', drivers);
  return driver;
};
export const updateDriver = (id: string, data: Partial<Driver>) => {
  const drivers = getDrivers().map(d => d.id === id ? { ...d, ...data } : d);
  setStore('drivers', drivers);
};
export const deleteDriver = (id: string) => {
  setStore('drivers', getDrivers().filter(d => d.id !== id));
};

// Advances
export const getAdvances = () => getStore<Advance>('advances');
export const saveAdvance = (a: Omit<Advance, 'id'>) => {
  const advances = getAdvances();
  const advance = { ...a, id: uid() };
  advances.push(advance);
  setStore('advances', advances);
  return advance;
};

// Clients
export const getClients = () => getStore<Client>('clients');
export const saveClient = (c: Omit<Client, 'id'>) => {
  const clients = getClients();
  const client = { ...c, id: uid() };
  clients.push(client);
  setStore('clients', clients);
  return client;
};
export const updateClient = (id: string, data: Partial<Client>) => {
  const clients = getClients().map(c => c.id === id ? { ...c, ...data } : c);
  setStore('clients', clients);
};
export const deleteClient = (id: string) => {
  setStore('clients', getClients().filter(c => c.id !== id));
};

// Client Payments
export const getClientPayments = () => getStore<ClientPayment>('clientPayments');
export const saveClientPayment = (p: Omit<ClientPayment, 'id'>) => {
  const payments = getClientPayments();
  const payment = { ...p, id: uid() };
  payments.push(payment);
  setStore('clientPayments', payments);
  // Update client balance
  const clients = getClients();
  const client = clients.find(c => c.id === p.clientId);
  if (client) {
    updateClient(p.clientId, { balance: client.balance - p.amount });
  }
  return payment;
};

// Trips
export const getTrips = () => getStore<Trip>('trips');
export const saveTrip = (t: Omit<Trip, 'id'>) => {
  const trips = getTrips();
  const trip = { ...t, id: uid() };
  trips.push(trip);
  setStore('trips', trips);
  // Update client balances
  if (t.outbound.clientId && t.outbound.loadAmount) {
    const client = getClients().find(c => c.id === t.outbound.clientId);
    if (client) updateClient(t.outbound.clientId, { balance: client.balance + t.outbound.loadAmount });
  }
  if (t.returnLeg?.clientId && t.returnLeg.loadAmount) {
    const client = getClients().find(c => c.id === t.returnLeg!.clientId);
    if (client) updateClient(t.returnLeg.clientId, { balance: client.balance + t.returnLeg.loadAmount });
  }
  // Update truck mileage
  const totalMileage = t.outbound.mileage + (t.returnLeg?.mileage || 0);
  const truck = getTrucks().find(tr => tr.id === t.truckId);
  if (truck) updateTruck(t.truckId, { mileage: truck.mileage + totalMileage });
  return trip;
};
export const updateTrip = (id: string, data: Partial<Trip>) => {
  const trips = getTrips().map(t => t.id === id ? { ...t, ...data } : t);
  setStore('trips', trips);
};

// Payables
export const getPayables = () => getStore<Payable>('payables');
export const savePayable = (p: Omit<Payable, 'id'>) => {
  const payables = getPayables();
  const payable = { ...p, id: uid() };
  payables.push(payable);
  setStore('payables', payables);
  return payable;
};
export const updatePayable = (id: string, data: Partial<Payable>) => {
  const payables = getPayables().map(p => p.id === id ? { ...p, ...data } : p);
  setStore('payables', payables);
};

// Maintenance
export const getMaintenanceEntries = () => getStore<MaintenanceEntry>('maintenance');
export const saveMaintenanceEntry = (m: Omit<MaintenanceEntry, 'id'>) => {
  const entries = getMaintenanceEntries();
  const entry = { ...m, id: uid() };
  entries.push(entry);
  setStore('maintenance', entries);
  return entry;
};

// Trip calculations
export const calcTripRevenue = (t: Trip) =>
  t.outbound.loadAmount + (t.returnLeg?.loadAmount || 0);

export const calcTripExpenses = (t: Trip) =>
  t.outbound.fuelCost + (t.returnLeg?.fuelCost || 0) +
  (t.outbound.sparePartsCost || 0) + (t.returnLeg?.sparePartsCost || 0) +
  t.tripPay;

export const calcTripProfit = (t: Trip) =>
  calcTripRevenue(t) - calcTripExpenses(t);
