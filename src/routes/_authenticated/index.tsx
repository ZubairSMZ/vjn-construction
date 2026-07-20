import { createFileRoute, Link } from "@tanstack/react-router";
import {
  HardHat,
  Package,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { Badge, Btn, Panel, ProgressBar, StatCard, timeAgo } from "@/components/ui-bits";
import {
  activity,
  dailyEntries,
  expenses,
  fmtCurrency,
  inventory,
  materialPurchases,
  materialUsage,
  siteName,
  sites,
  trendExpense,
  trendLabor,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [{ title: "Dashboard — SiteTrack" }, { name: "description", content: "Today's labor, materials, expenses and site progress at a glance." }],
  }),
  component: Dashboard,
});

function Dashboard() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const today = (d: string) => d.slice(0, 10) === todayISO;
  const todayLabor = dailyEntries.filter((e) => today(e.date)).reduce((s, e) => s + e.laborTotal, 0);
  const todayUsage = materialUsage.filter((e) => today(e.date)).length;
  const todayPurchases = materialPurchases.filter((e) => today(e.date)).reduce((s, e) => s + e.cost, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0) + materialPurchases.reduce((s, e) => s + e.cost, 0);

  return (
    <AppShell
      title="Operations Dashboard"
      subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      actions={
        <>
          <Link to="/entries">
            <Btn>
              <Plus className="size-4" /> New Daily Entry
            </Btn>
          </Link>
          <Link to="/reports">
            <Btn variant="outline">
              <ArrowUpRight className="size-4" /> Export Reports
            </Btn>
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard tone="primary" label="Labor Today" value={todayLabor} hint="Across active sites" icon={<HardHat className="size-5" />} />
        <StatCard tone="default" label="Material Entries" value={todayUsage} hint="Usage logs today" icon={<Package className="size-5" />} />
        <StatCard tone="success" label="Purchased Today" value={fmtCurrency(todayPurchases)} hint={`${materialPurchases.filter((p) => today(p.date)).length} invoices`} icon={<TrendingUp className="size-5" />} />
        <StatCard tone="warning" label="Total Project Spend" value={fmtCurrency(totalExpense)} hint="All sites, lifetime" icon={<Wallet className="size-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Labor Trend · 7 days" className="lg:col-span-2">
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={trendLabor} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="laborG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="workers" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#laborG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Expenses · 7 days">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={trendExpense} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => fmtCurrency(v)}
                />
                <Bar dataKey="amount" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Site Progress" className="lg:col-span-2">
          <div className="space-y-4">
            {sites.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 sm:col-span-5">
                  <div className="font-semibold text-sm">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.location}</div>
                </div>
                <div className="col-span-9 sm:col-span-5">
                  <ProgressBar value={s.progress} />
                </div>
                <div className="col-span-2 sm:col-span-1 text-right tabular-nums text-sm font-semibold">{s.progress}%</div>
                <div className="col-span-1 sm:col-span-1 text-right">
                  <Badge tone={s.status === "active" ? "success" : s.status === "on_hold" ? "warning" : "muted"}>
                    {s.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Recent Activity">
          <ul className="space-y-3">
            {activity.slice(0, 6).map((a) => (
              <li key={a.id} className="flex gap-3">
                <div className="mt-1 size-2 rounded-full bg-primary shrink-0" />
                <div className="text-sm">
                  <div>
                    <span className="font-semibold">{a.user}</span> {a.action.toLowerCase()}{" "}
                    <span className="text-muted-foreground">— {a.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{timeAgo(a.timestamp)}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Daily Reports Today" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Site</th>
                  <th className="text-left py-2 font-medium">Supervisor</th>
                  <th className="text-right py-2 font-medium">Labor</th>
                  <th className="text-left py-2 font-medium pl-4">Note</th>
                  <th className="text-left py-2 font-medium">By</th>
                </tr>
              </thead>
              <tbody>
                {dailyEntries
                  .filter((e) => today(e.date))
                  .map((e) => (
                    <tr key={e.id} className="border-b border-border/60">
                      <td className="py-3 font-medium">{siteName(e.siteId)}</td>
                      <td className="py-3 text-muted-foreground">{e.supervisor}</td>
                      <td className="py-3 text-right tabular-nums">
                        <span className="font-semibold">{e.laborTotal}</span>
                        <span className="text-muted-foreground"> ({e.skilled}/{e.unskilled})</span>
                      </td>
                      <td className="py-3 pl-4 max-w-sm truncate">{e.progressNote}</td>
                      <td className="py-3 text-muted-foreground">{e.user}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Low Stock Alerts">
          <ul className="space-y-3">
            {inventory
              .map((i) => ({ ...i, balance: i.opening + i.purchased - i.consumed }))
              .filter((i) => i.balance < 30)
              .map((i) => (
                <li key={i.material} className="flex items-start gap-3 p-3 rounded-md bg-warning/10 ring-1 ring-warning/30">
                  <AlertTriangle className="size-4 text-warning mt-0.5" />
                  <div className="text-sm flex-1">
                    <div className="font-semibold">{i.material}</div>
                    <div className="text-xs text-muted-foreground">
                      Balance: <span className="tabular-nums">{i.balance.toFixed(1)} {i.unit}</span>
                    </div>
                  </div>
                </li>
              ))}
            <li className="text-xs text-muted-foreground">Threshold: 30 units · configurable per material.</li>
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
