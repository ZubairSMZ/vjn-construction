import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AppShell } from "@/components/app-shell";
import { Badge, Btn, Field, Panel, StatCard, inputCls } from "@/components/ui-bits";
import { useExpenses, usePurchases, useSites, useCreateExpense, fmtCurrency, siteName } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/expenses")({
  head: () => ({ meta: [{ title: "Expenses — SiteTrack" }] }),
  component: ExpensesPage,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function ExpensesPage() {
  const [open, setOpen] = useState(false);
  const { data: expenses = [] } = useExpenses();
  const { data: purchases = [] } = usePurchases();
  const { data: sites = [] } = useSites();

  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const purchaseTotal = purchases.reduce((s, p) => s + Number(p.cost), 0);
  const byCat = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <AppShell
      title="Expenses"
      subtitle="Track operational spend and category-wise distribution"
      actions={<Btn onClick={() => setOpen(true)} disabled={sites.length === 0}><Plus className="size-4" /> Add Expense</Btn>}
    >
      {open && <ExpenseModal onClose={() => setOpen(false)} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard tone="primary" label="Operational Expenses" value={fmtCurrency(total)} />
        <StatCard label="Material Purchases" value={fmtCurrency(purchaseTotal)} />
        <StatCard tone="warning" label="Combined Spend" value={fmtCurrency(total + purchaseTotal)} hint="Lifetime, all sites" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="By Category" className="lg:col-span-1">
          {byCat.length === 0 ? <p className="text-sm text-muted-foreground">No expenses yet.</p> : (
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={byCat} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {byCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-card)" strokeWidth={2} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel title="Expense Log" className="lg:col-span-2">
          {expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses logged.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">Date</th>
                    <th className="text-left py-2 font-medium">Site</th>
                    <th className="text-left py-2 font-medium">Category</th>
                    <th className="text-left py-2 font-medium">Description</th>
                    <th className="text-left py-2 font-medium">Method</th>
                    <th className="text-right py-2 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-border/60">
                      <td className="py-3 tabular-nums">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                      <td className="py-3 font-medium">{siteName(sites, e.site_id)}</td>
                      <td className="py-3"><Badge tone="primary">{e.category}</Badge></td>
                      <td className="py-3 text-muted-foreground max-w-xs truncate">{e.description}</td>
                      <td className="py-3 text-muted-foreground">{e.method}</td>
                      <td className="py-3 text-right tabular-nums font-semibold">{fmtCurrency(Number(e.amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function ExpenseModal({ onClose }: { onClose: () => void }) {
  const { data: sites = [] } = useSites();
  const create = useCreateExpense();
  const [f, setF] = useState({
    date: new Date().toISOString().slice(0, 10),
    site_id: sites[0]?.id ?? "",
    category: "Misc",
    description: "",
    amount: 0,
    method: "UPI",
  });
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <form
        className="bg-card rounded-lg ring-1 ring-border w-full max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          if (!f.site_id) return setErr("Select a site");
          if (f.amount <= 0) return setErr("Amount must be greater than 0");
          try { await create.mutateAsync(f); onClose(); }
          catch (ex: any) { setErr(ex.message ?? "Failed"); }
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display uppercase tracking-wide text-lg">New Expense</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Date"><input type="date" className={inputCls} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Site">
            <select className={inputCls} value={f.site_id} onChange={(e) => setF({ ...f, site_id: e.target.value })}>
              <option value="">Select…</option>
              {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Category">
            <select className={inputCls} value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>
              <option>Labor Wages</option><option>Equipment Rental</option><option>Fuel</option><option>Transport</option><option>Misc</option>
            </select>
          </Field>
          <Field label="Amount (₹)"><input type="number" className={inputCls} value={f.amount} onChange={(e) => setF({ ...f, amount: Number(e.target.value) })} /></Field>
          <Field label="Payment Method">
            <select className={inputCls} value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })}>
              <option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
            </select>
          </Field>
          <div className="md:col-span-2"><Field label="Description"><input className={inputCls} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field></div>
          {err && <div className="md:col-span-2 text-sm text-destructive">{err}</div>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Btn type="button" variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" disabled={create.isPending}><Save className="size-4" /> Save</Btn>
        </div>
      </form>
    </div>
  );
}
