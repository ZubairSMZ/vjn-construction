import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { FileSpreadsheet, Filter } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Btn, Field, Panel, inputCls } from "@/components/ui-bits";
import {
  useEntries, useSites, useExpenses, usePurchases, useUsage,
  fmtCurrency, siteName,
} from "@/lib/data";
import { WORKER_TRADES } from "@/lib/constants";


export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({ meta: [{ title: "Reports — SiteTrack" }] }),
  component: Reports,
});

function downloadCSV(name: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return alert("No rows to export.");
  const cols = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${name}.csv`; a.click();
  URL.revokeObjectURL(url);
}

function Reports() {
  const { data: sites = [] } = useSites();
  const { data: entries = [] } = useEntries();
  const { data: expenses = [] } = useExpenses();
  const { data: purchases = [] } = usePurchases();
  const { data: usage = [] } = useUsage();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [site, setSite] = useState("");

  const inRange = (d: string) => (!from || d >= from) && (!to || d <= to);
  const inSite = (id: string) => !site || site === id;

  const fEntries = useMemo(() => entries.filter((e) => inRange(e.date) && inSite(e.site_id)), [entries, from, to, site]);
  const fExpenses = useMemo(() => expenses.filter((e) => inRange(e.date) && inSite(e.site_id)), [expenses, from, to, site]);
  const fPurchases = useMemo(() => purchases.filter((e) => inRange(e.date) && inSite(e.site_id)), [purchases, from, to, site]);
  const fUsage = useMemo(() => usage.filter((e) => inRange(e.date) && inSite(e.site_id)), [usage, from, to, site]);

  const totalLabor = fEntries.reduce((s, e) => s + e.labor_total, 0);
  const totalExp = fExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const totalPur = fPurchases.reduce((s, e) => s + Number(e.cost), 0);

  const cards: { title: string; desc: string; rows: () => Record<string, unknown>[] }[] = [
    { title: "Daily Entries", desc: `${fEntries.length} entries`, rows: () => fEntries.map((e) => ({ date: e.date, site: siteName(sites, e.site_id), supervisor: e.supervisor, skilled: e.skilled, unskilled: e.unskilled, total: e.labor_total, percent: e.percent, note: e.progress_note })) },
    { title: "Expenses", desc: `${fExpenses.length} entries · ${fmtCurrency(totalExp)}`, rows: () => fExpenses.map((e) => ({ date: e.date, site: siteName(sites, e.site_id), category: e.category, description: e.description, method: e.method, amount: e.amount })) },
    { title: "Material Purchases", desc: `${fPurchases.length} invoices · ${fmtCurrency(totalPur)}`, rows: () => fPurchases.map((p) => ({ date: p.date, site: siteName(sites, p.site_id), material: p.material, qty: p.qty, unit: p.unit, supplier: p.supplier, invoice: p.invoice, cost: p.cost })) },
    { title: "Material Usage", desc: `${fUsage.length} logs`, rows: () => fUsage.map((u) => ({ date: u.date, site: siteName(sites, u.site_id), material: u.material, qty: u.qty, unit: u.unit })) },
  ];

  return (
    <AppShell title="Reports & Exports" subtitle="Filter, preview, and export to CSV (opens in Excel/Sheets)">
      <Panel title="Filters">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="From"><input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="Site">
            <select className={inputCls} value={site} onChange={(e) => setSite(e.target.value)}>
              <option value="">All sites</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <div className="flex items-end md:col-span-2 gap-2 text-sm">
            <Badge tone="primary">Labor: {totalLabor}</Badge>
            <Badge tone="warning">Spend: {fmtCurrency(totalExp + totalPur)}</Badge>
            <Btn variant="outline" size="sm" onClick={() => { setFrom(""); setTo(""); setSite(""); }}><Filter className="size-3.5" /> Reset</Btn>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        {cards.map((c) => (
          <article key={c.title} className="bg-card rounded-lg ring-1 ring-border p-5 flex flex-col">
            <h3 className="font-display uppercase tracking-wide text-base">{c.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 flex-1">{c.desc}</p>
            <div className="mt-4">
              <Btn size="sm" variant="outline" className="w-full" onClick={() => downloadCSV(c.title.toLowerCase().replace(/\s+/g, "-"), c.rows())}>
                <FileSpreadsheet className="size-3.5" /> Download CSV
              </Btn>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">CSV files open directly in Excel, Google Sheets, or Numbers.</p>
    </AppShell>
  );
}
