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

export const sites: Site[] = [];

export const dailyEntries: DailyEntry[] = [];

export const materialUsage: MaterialUsage[] = [];

export const materialPurchases: MaterialPurchase[] = [];

export const expenses: Expense[] = [];

export const activity: Activity[] = [];

export const inventory: Inventory[] = [];


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
