import { createFileRoute } from "@tanstack/react-router";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { AppShell } from "../components/app-shell";
import { Badge, Panel, StatCard } from "../components/ui-bits";
import { expenses, fmtCurrency, materialPurchases, siteName } from "../lib/mock-data";

export const Route = createFileRoute("/expenses")({
  head: () => ({ meta: [{ title: "Expenses — SiteTrack" }] }),
  component: Expenses,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

function Expenses() {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const purchaseTotal = materialPurchases.reduce((s, p) => s + p.cost, 0);

  const byCat = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  return (
    <AppShell title="Expenses" subtitle="Track operational spend and category-wise distribution">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard tone="primary" label="Operational Expenses" value={fmtCurrency(total)} />
        <StatCard tone="default" label="Material Purchases" value={fmtCurrency(purchaseTotal)} />
        <StatCard tone="warning" label="Combined Spend" value={fmtCurrency(total + purchaseTotal)} hint="Lifetime, all sites" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="By Category" className="lg:col-span-1">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={byCat} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {byCat.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-card)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => fmtCurrency(v)} contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Expense Log" className="lg:col-span-2">
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
                    <td className="py-3 font-medium">{siteName(e.siteId)}</td>
                    <td className="py-3"><Badge tone="primary">{e.category}</Badge></td>
                    <td className="py-3 text-muted-foreground max-w-xs truncate">{e.description}</td>
                    <td className="py-3 text-muted-foreground">{e.method}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{fmtCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
