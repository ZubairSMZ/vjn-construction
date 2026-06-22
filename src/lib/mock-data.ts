// Mock data for the UI shell. Will be replaced by Supabase queries when Cloud is enabled.

export type Site = { id: string; name: string; location: string; status: "active" | "on_hold" | "complete"; progress: number };
export type DailyEntry = {
  id: string;
  date: string;
  siteId: string;
  user: string;
  laborTotal: number;
  skilled: number;
  unskilled: number;
  supervisor: string;
  progressNote: string;
  percent: number;
  remarks?: string;
};
export type MaterialUsage = { id: string; date: string; siteId: string; material: string; qty: number; unit: string; user: string };
export type MaterialPurchase = { id: string; date: string; siteId: string; material: string; qty: number; unit: string; supplier: string; cost: number; invoice: string; user: string };
export type Expense = { id: string; date: string; siteId: string; category: string; description: string; amount: number; method: string; user: string };
export type Activity = { id: string; user: string; action: string; target: string; timestamp: string };
export type Inventory = { material: string; unit: string; opening: number; purchased: number; consumed: number };

export const sites: Site[] = [
  { id: "s1", name: "Skyline Tower A", location: "Sector 14, Pune", status: "active", progress: 62 },
  { id: "s2", name: "Harbor Bridge Retrofit", location: "Mumbai Port", status: "active", progress: 38 },
  { id: "s3", name: "Greenfield Warehouse", location: "Bhiwandi", status: "active", progress: 84 },
  { id: "s4", name: "Riverside Villas", location: "Lonavala", status: "on_hold", progress: 21 },
];

const today = new Date();
const iso = (d: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() - d).toISOString();

export const dailyEntries: DailyEntry[] = [
  { id: "d1", date: iso(0), siteId: "s1", user: "Rakesh M.", laborTotal: 84, skilled: 32, unskilled: 52, supervisor: "Anil K.", progressNote: "Slab pouring on level 9 complete.", percent: 62, remarks: "Concrete delivery delayed 40m." },
  { id: "d2", date: iso(0), siteId: "s2", user: "Priya S.", laborTotal: 46, skilled: 18, unskilled: 28, supervisor: "Vivek R.", progressNote: "Pier cap reinforcement tied.", percent: 38 },
  { id: "d3", date: iso(1), siteId: "s3", user: "Imran A.", laborTotal: 22, skilled: 9, unskilled: 13, supervisor: "Meera D.", progressNote: "Roof sheeting east bay.", percent: 84 },
  { id: "d4", date: iso(1), siteId: "s1", user: "Rakesh M.", laborTotal: 78, skilled: 30, unskilled: 48, supervisor: "Anil K.", progressNote: "Column shuttering level 10.", percent: 60 },
  { id: "d5", date: iso(2), siteId: "s2", user: "Priya S.", laborTotal: 41, skilled: 16, unskilled: 25, supervisor: "Vivek R.", progressNote: "Excavation pier 4.", percent: 36 },
];

export const materialUsage: MaterialUsage[] = [
  { id: "u1", date: iso(0), siteId: "s1", material: "OPC Cement", qty: 120, unit: "Bag", user: "Rakesh M." },
  { id: "u2", date: iso(0), siteId: "s1", material: "TMT Steel 12mm", qty: 1.8, unit: "Ton", user: "Rakesh M." },
  { id: "u3", date: iso(0), siteId: "s2", material: "Aggregate 20mm", qty: 14, unit: "Ton", user: "Priya S." },
  { id: "u4", date: iso(1), siteId: "s3", material: "GI Sheet", qty: 38, unit: "Piece", user: "Imran A." },
  { id: "u5", date: iso(1), siteId: "s1", material: "OPC Cement", qty: 95, unit: "Bag", user: "Rakesh M." },
];

export const materialPurchases: MaterialPurchase[] = [
  { id: "p1", date: iso(0), siteId: "s1", material: "OPC Cement", qty: 400, unit: "Bag", supplier: "Ultra Build Co.", cost: 156000, invoice: "INV-22841", user: "Anil K." },
  { id: "p2", date: iso(0), siteId: "s2", material: "Aggregate 20mm", qty: 60, unit: "Ton", supplier: "Konkan Quarries", cost: 84000, invoice: "INV-22843", user: "Vivek R." },
  { id: "p3", date: iso(2), siteId: "s1", material: "TMT Steel 12mm", qty: 8, unit: "Ton", supplier: "JSW Steel", cost: 528000, invoice: "INV-22799", user: "Anil K." },
  { id: "p4", date: iso(3), siteId: "s3", material: "GI Sheet", qty: 120, unit: "Piece", supplier: "Tata BlueScope", cost: 96000, invoice: "INV-22760", user: "Meera D." },
];

export const expenses: Expense[] = [
  { id: "e1", date: iso(0), siteId: "s1", category: "Labor Wages", description: "Daily wages 84 workers", amount: 42000, method: "UPI", user: "Anil K." },
  { id: "e2", date: iso(0), siteId: "s1", category: "Equipment Rental", description: "Concrete pump 6h", amount: 18000, method: "Bank Transfer", user: "Anil K." },
  { id: "e3", date: iso(0), siteId: "s2", category: "Fuel", description: "Diesel for excavator", amount: 7200, method: "Cash", user: "Vivek R." },
  { id: "e4", date: iso(1), siteId: "s3", category: "Transport", description: "Material haul", amount: 4500, method: "UPI", user: "Meera D." },
  { id: "e5", date: iso(2), siteId: "s1", category: "Labor Wages", description: "Daily wages 78 workers", amount: 39000, method: "UPI", user: "Anil K." },
];

export const activity: Activity[] = [
  { id: "a1", user: "Rakesh M.", action: "Submitted daily entry", target: "Skyline Tower A", timestamp: iso(0) },
  { id: "a2", user: "Anil K.", action: "Recorded purchase", target: "OPC Cement × 400 bags", timestamp: iso(0) },
  { id: "a3", user: "Priya S.", action: "Logged expense", target: "Diesel — ₹7,200", timestamp: iso(0) },
  { id: "a4", user: "Imran A.", action: "Updated site progress", target: "Greenfield Warehouse → 84%", timestamp: iso(1) },
  { id: "a5", user: "Admin", action: "Added staff member", target: "Meera D.", timestamp: iso(2) },
];

export const inventory: Inventory[] = [
  { material: "OPC Cement", unit: "Bag", opening: 200, purchased: 400, consumed: 215 },
  { material: "TMT Steel 12mm", unit: "Ton", opening: 4, purchased: 8, consumed: 1.8 },
  { material: "Aggregate 20mm", unit: "Ton", opening: 30, purchased: 60, consumed: 14 },
  { material: "GI Sheet", unit: "Piece", opening: 50, purchased: 120, consumed: 38 },
  { material: "River Sand", unit: "Ton", opening: 18, purchased: 0, consumed: 9 },
];

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const siteName = (id: string) => sites.find((s) => s.id === id)?.name ?? "—";

export const trendLabor = [
  { day: "Mon", workers: 142 },
  { day: "Tue", workers: 156 },
  { day: "Wed", workers: 138 },
  { day: "Thu", workers: 164 },
  { day: "Fri", workers: 172 },
  { day: "Sat", workers: 158 },
  { day: "Sun", workers: 130 },
];

export const trendExpense = [
  { day: "Mon", amount: 68000 },
  { day: "Tue", amount: 92000 },
  { day: "Wed", amount: 54000 },
  { day: "Thu", amount: 112000 },
  { day: "Fri", amount: 86000 },
  { day: "Sat", amount: 74000 },
  { day: "Sun", amount: 67200 },
];
