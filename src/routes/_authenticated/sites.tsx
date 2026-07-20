import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Badge, Panel, ProgressBar } from "../components/ui-bits";
import { dailyEntries, expenses, materialPurchases, sites } from "../lib/mock-data";

export const Route = createFileRoute("/sites")({
  head: () => ({ meta: [{ title: "Sites — SiteTrack" }] }),
  component: SitesPage,
});

function SitesPage() {
  return (
    <AppShell title="Construction Sites" subtitle="Multi-site project portfolio">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sites.map((s) => {
          const spend =
            expenses.filter((e) => e.siteId === s.id).reduce((a, e) => a + e.amount, 0) +
            materialPurchases.filter((p) => p.siteId === s.id).reduce((a, p) => a + p.cost, 0);
          const labor = dailyEntries.filter((e) => e.siteId === s.id).reduce((a, e) => a + e.laborTotal, 0);
          return (
            <article key={s.id} className="bg-card rounded-lg ring-1 ring-border overflow-hidden">
              <div className="h-28 hatch bg-sidebar relative">
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                <Badge tone={s.status === "active" ? "success" : s.status === "on_hold" ? "warning" : "muted"}>
                  <span className="px-1">{s.status.replace("_", " ")}</span>
                </Badge>
              </div>
              <div className="p-5 -mt-8 relative">
                <h3 className="font-display text-xl">{s.name}</h3>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <MapPin className="size-3" /> {s.location}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground uppercase tracking-wider">Progress</span>
                    <span className="font-semibold tabular-nums">{s.progress}%</span>
                  </div>
                  <ProgressBar value={s.progress} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Labor-days</div>
                    <div className="font-display text-xl tabular-nums">{labor}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Spend</div>
                    <div className="font-display text-xl tabular-nums">
                      ₹{Math.round(spend / 1000)}k
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Panel title="Add Site" className="mt-6">
        <p className="text-sm text-muted-foreground">
          Site creation, staff assignment, and project settings unlock once Lovable Cloud is enabled.
        </p>
      </Panel>
    </AppShell>
  );
}
