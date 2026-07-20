import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Site = {
  id: string;
  name: string;
  location: string;
  status: "active" | "on_hold" | "complete";
  progress: number;
  created_by: string | null;
  created_at: string;
};
export type DailyEntry = {
  id: string;
  date: string;
  site_id: string;
  supervisor: string;
  skilled: number;
  unskilled: number;
  labor_total: number;
  percent: number;
  progress_note: string;
  remarks: string | null;
  created_by: string | null;
  created_at: string;
};
export type MaterialUsage = {
  id: string; date: string; site_id: string; material: string; qty: number; unit: string; created_by: string | null; created_at: string;
};
export type MaterialPurchase = {
  id: string; date: string; site_id: string; material: string; qty: number; unit: string; supplier: string; cost: number; invoice: string; created_by: string | null; created_at: string;
};
export type Expense = {
  id: string; date: string; site_id: string; category: string; description: string; amount: number; method: string; created_by: string | null; created_at: string;
};
export type Activity = {
  id: string; user_id: string | null; user_name: string; action: string; target: string; created_at: string;
};

export const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return null;
      const { data: p } = await supabase.from("profiles").select("full_name,email").eq("id", u.user.id).maybeSingle();
      return { id: u.user.id, name: p?.full_name || u.user.email?.split("@")[0] || "User", email: p?.email || u.user.email || "" };
    },
  });
}

function useRealtime(table: string, key: string) {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel(`rt-${table}`)
      .on("postgres_changes", { event: "*", schema: "public", table }, () => {
        qc.invalidateQueries({ queryKey: [key] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc, table, key]);
}

export function useSites() {
  useRealtime("sites", "sites");
  return useQuery({
    queryKey: ["sites"],
    queryFn: async (): Promise<Site[]> => {
      const { data, error } = await supabase.from("sites").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Site[];
    },
  });
}

export function useEntries() {
  useRealtime("daily_entries", "entries");
  return useQuery({
    queryKey: ["entries"],
    queryFn: async (): Promise<DailyEntry[]> => {
      const { data, error } = await supabase.from("daily_entries").select("*").order("date", { ascending: false }).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DailyEntry[];
    },
  });
}

export function useUsage() {
  useRealtime("material_usage", "usage");
  return useQuery({
    queryKey: ["usage"],
    queryFn: async (): Promise<MaterialUsage[]> => {
      const { data, error } = await supabase.from("material_usage").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialUsage[];
    },
  });
}

export function usePurchases() {
  useRealtime("material_purchases", "purchases");
  return useQuery({
    queryKey: ["purchases"],
    queryFn: async (): Promise<MaterialPurchase[]> => {
      const { data, error } = await supabase.from("material_purchases").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MaterialPurchase[];
    },
  });
}

export function useExpenses() {
  useRealtime("expenses", "expenses");
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async (): Promise<Expense[]> => {
      const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Expense[];
    },
  });
}

export function useActivity() {
  useRealtime("activity_log", "activity");
  return useQuery({
    queryKey: ["activity"],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200);
      if (error) throw error;
      return (data ?? []) as Activity[];
    },
  });
}

async function logActivity(action: string, target: string) {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return;
  const { data: p } = await supabase.from("profiles").select("full_name,email").eq("id", u.user.id).maybeSingle();
  const name = p?.full_name || u.user.email?.split("@")[0] || "User";
  await supabase.from("activity_log").insert({ user_id: u.user.id, user_name: name, action, target });
}

export function useCreateSite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; location: string; status: Site["status"]; progress: number }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { data, error } = await supabase.from("sites").insert({ ...input, created_by: u.user.id }).select().single();
      if (error) throw error;
      await logActivity("Created site", input.name);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sites"] }),
  });
}

export function useCreateEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      date: string; site_id: string; supervisor: string; skilled: number; unskilled: number;
      percent: number; progress_note: string; remarks?: string;
      usage?: { material: string; qty: number; unit: string } | null;
      purchase?: { material: string; qty: number; unit: string; supplier: string; cost: number; invoice: string } | null;
      expense?: { category: string; amount: number; method: string; description: string } | null;
      site_name?: string;
    }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const labor_total = (input.skilled || 0) + (input.unskilled || 0);
      const base = { created_by: u.user.id, site_id: input.site_id, date: input.date };

      const { error: e1 } = await supabase.from("daily_entries").insert({
        ...base,
        supervisor: input.supervisor,
        skilled: input.skilled,
        unskilled: input.unskilled,
        labor_total,
        percent: input.percent,
        progress_note: input.progress_note,
        remarks: input.remarks ?? "",
      });
      if (e1) throw e1;

      if (input.usage && input.usage.material.trim()) {
        const { error } = await supabase.from("material_usage").insert({ ...base, ...input.usage });
        if (error) throw error;
      }
      if (input.purchase && input.purchase.material.trim()) {
        const { error } = await supabase.from("material_purchases").insert({ ...base, ...input.purchase });
        if (error) throw error;
      }
      if (input.expense && input.expense.amount > 0) {
        const { error } = await supabase.from("expenses").insert({ ...base, ...input.expense });
        if (error) throw error;
      }
      if (input.percent > 0) {
        await supabase.from("sites").update({ progress: input.percent }).eq("id", input.site_id);
      }
      await logActivity("Submitted daily entry", input.site_name ?? "site");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entries"] });
      qc.invalidateQueries({ queryKey: ["usage"] });
      qc.invalidateQueries({ queryKey: ["purchases"] });
      qc.invalidateQueries({ queryKey: ["expenses"] });
      qc.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; site_id: string; category: string; description: string; amount: number; method: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("expenses").insert({ ...input, created_by: u.user.id });
      if (error) throw error;
      await logActivity("Logged expense", `${input.category} · ₹${input.amount}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}

export function useCreatePurchase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; site_id: string; material: string; qty: number; unit: string; supplier: string; cost: number; invoice: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("material_purchases").insert({ ...input, created_by: u.user.id });
      if (error) throw error;
      await logActivity("Recorded purchase", `${input.material} · ₹${input.cost}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["purchases"] }),
  });
}

export function useCreateUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { date: string; site_id: string; material: string; qty: number; unit: string }) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");
      const { error } = await supabase.from("material_usage").insert({ ...input, created_by: u.user.id });
      if (error) throw error;
      await logActivity("Logged material usage", `${input.material} ${input.qty}${input.unit}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["usage"] }),
  });
}

export const siteName = (sites: Site[], id: string) => sites.find((s) => s.id === id)?.name ?? "—";

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

// Compute simple 7-day trends from real data
export function computeTrends(entries: DailyEntry[], expenses: Expense[], purchases: MaterialPurchase[]) {
  const days: { key: string; day: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: d.toISOString().slice(0, 10), day: d.toLocaleDateString("en-IN", { weekday: "short" }) });
  }
  const laborByDay = new Map<string, number>();
  entries.forEach((e) => laborByDay.set(e.date, (laborByDay.get(e.date) ?? 0) + e.labor_total));
  const spendByDay = new Map<string, number>();
  expenses.forEach((e) => spendByDay.set(e.date, (spendByDay.get(e.date) ?? 0) + Number(e.amount)));
  purchases.forEach((p) => spendByDay.set(p.date, (spendByDay.get(p.date) ?? 0) + Number(p.cost)));
  return {
    trendLabor: days.map((d) => ({ day: d.day, workers: laborByDay.get(d.key) ?? 0 })),
    trendExpense: days.map((d) => ({ day: d.day, amount: spendByDay.get(d.key) ?? 0 })),
  };
}

export function computeInventory(purchases: MaterialPurchase[], usage: MaterialUsage[]) {
  const map = new Map<string, { material: string; unit: string; purchased: number; consumed: number }>();
  purchases.forEach((p) => {
    const k = `${p.material}::${p.unit}`;
    const cur = map.get(k) ?? { material: p.material, unit: p.unit, purchased: 0, consumed: 0 };
    cur.purchased += Number(p.qty);
    map.set(k, cur);
  });
  usage.forEach((u) => {
    const k = `${u.material}::${u.unit}`;
    const cur = map.get(k) ?? { material: u.material, unit: u.unit, purchased: 0, consumed: 0 };
    cur.consumed += Number(u.qty);
    map.set(k, cur);
  });
  return Array.from(map.values()).map((r) => ({ ...r, opening: 0, balance: r.purchased - r.consumed }));
}
