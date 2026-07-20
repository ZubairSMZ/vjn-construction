import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Package } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Badge, Panel, StatCard } from "../components/ui-bits";
import { inventory, materialPurchases, materialUsage } from "../lib/mock-data";

export const Route = createFileRoute("/_authenticated/materials")({
  head: () => ({ meta: [{ title: "Inventory — SiteTrack" }] }),
  component: Materials,
});

function Materials() {
  const totalBalance = inventory.reduce((s, i) => s + (i.opening + i.purchased - i.consumed), 0);
  const lowCount = inventory.filter((i) => i.opening + i.purchased - i.consumed < 30).length;

  return (
    <AppShell title="Material Inventory" subtitle="Stock auto-balances as usage & purchases are logged">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard tone="primary" label="SKUs Tracked" value={inventory.length} icon={<Package className="size-5" />} />
        <StatCard label="Total Units on Hand" value={totalBalance.toFixed(1)} hint="Mixed units — see breakdown" />
        <StatCard tone="warning" label="Low Stock Items" value={lowCount} icon={<AlertTriangle className="size-5" />} />
      </div>

      <Panel title="Stock Ledger" className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Material</th>
                <th className="text-left py-2 font-medium">Unit</th>
                <th className="text-right py-2 font-medium">Opening</th>
                <th className="text-right py-2 font-medium">Purchased</th>
                <th className="text-right py-2 font-medium">Consumed</th>
                <th className="text-right py-2 font-medium">Balance</th>
                <th className="text-left py-2 font-medium pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => {
                const bal = i.opening + i.purchased - i.consumed;
                const low = bal < 30;
                return (
                  <tr key={i.material} className="border-b border-border/60">
                    <td className="py-3 font-medium">{i.material}</td>
                    <td className="py-3 text-muted-foreground">{i.unit}</td>
                    <td className="py-3 text-right tabular-nums">{i.opening}</td>
                    <td className="py-3 text-right tabular-nums text-success">+{i.purchased}</td>
                    <td className="py-3 text-right tabular-nums text-destructive">−{i.consumed}</td>
                    <td className="py-3 text-right tabular-nums font-semibold">{bal.toFixed(1)}</td>
                    <td className="py-3 pl-4">
                      <Badge tone={low ? "warning" : "success"}>{low ? "Low" : "Healthy"}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Panel title="Recent Movements — In">
          <ul className="text-sm divide-y divide-border/60">
            {materialPurchases.map((p) => (
              <li key={p.id} className="py-2.5 flex justify-between">
                <div>
                  <div className="font-medium">{p.material}</div>
                  <div className="text-xs text-muted-foreground">{p.supplier}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-success">+{p.qty} {p.unit}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("en-IN")}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Movements — Out">
          <ul className="text-sm divide-y divide-border/60">
            {materialUsage.map((u) => (
              <li key={u.id} className="py-2.5 flex justify-between">
                <div>
                  <div className="font-medium">{u.material}</div>
                  <div className="text-xs text-muted-foreground">{u.user}</div>
                </div>
                <div className="text-right tabular-nums">
                  <div className="font-semibold text-destructive">−{u.qty} {u.unit}</div>
                  <div className="text-xs text-muted-foreground">{new Date(u.date).toLocaleDateString("en-IN")}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}
