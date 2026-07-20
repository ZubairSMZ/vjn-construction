import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Plus, X, Save } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Btn, Field, Panel, ProgressBar, inputCls } from "@/components/ui-bits";
import { useSites, useEntries, useExpenses, usePurchases, useCreateSite, type Site } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/sites")({
  head: () => ({ meta: [{ title: "Sites — SiteTrack" }] }),
  component: SitesPage,
});

function SitesPage() {
  const [open, setOpen] = useState(false);
  const { data: sites = [] } = useSites();
  const { data: entries = [] } = useEntries();
  const { data: expenses = [] } = useExpenses();
  const { data: purchases = [] } = usePurchases();

  return (
    <AppShell
      title="Construction Sites"
      subtitle="Multi-site project portfolio"
      actions={<Btn onClick={() => setOpen(true)}><Plus className="size-4" /> Add Site</Btn>}
    >
      {open && <AddSiteModal onClose={() => setOpen(false)} />}

      {sites.length === 0 ? (
        <Panel><p className="text-sm text-muted-foreground">No sites yet. Click <b>Add Site</b> to create your first site.</p></Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((s) => {
            const spend =
              expenses.filter((e) => e.site_id === s.id).reduce((a, e) => a + Number(e.amount), 0) +
              purchases.filter((p) => p.site_id === s.id).reduce((a, p) => a + Number(p.cost), 0);
            const labor = entries.filter((e) => e.site_id === s.id).reduce((a, e) => a + e.labor_total, 0);
            return (
              <article key={s.id} className="bg-card rounded-lg ring-1 ring-border overflow-hidden">
                <div className="h-28 hatch bg-sidebar relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge tone={s.status === "active" ? "success" : s.status === "on_hold" ? "warning" : "muted"}>
                      {s.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 -mt-8 relative">
                  <h3 className="font-display text-xl">{s.name}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="size-3" /> {s.location || "—"}
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
                      <div className="font-display text-xl tabular-nums">₹{Math.round(spend / 1000)}k</div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}

function AddSiteModal({ onClose }: { onClose: () => void }) {
  const create = useCreateSite();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState<Site["status"]>("active");
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <form
        className="bg-card rounded-lg ring-1 ring-border w-full max-w-lg"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr(null);
          if (!name.trim()) return setErr("Site name is required");
          try {
            await create.mutateAsync({ name: name.trim(), location, status, progress });
            onClose();
          } catch (ex: any) { setErr(ex.message ?? "Failed"); }
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display uppercase tracking-wide text-lg">New Site</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-md hover:bg-muted"><X className="size-5" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><Field label="Site Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skyline Tower" /></Field></div>
          <div className="md:col-span-2"><Field label="Location"><input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, area" /></Field></div>
          <Field label="Status">
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Site["status"])}>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="complete">Complete</option>
            </select>
          </Field>
          <Field label="Initial % Progress"><input type="number" min={0} max={100} className={inputCls} value={progress} onChange={(e) => setProgress(Number(e.target.value))} /></Field>
          {err && <div className="md:col-span-2 text-sm text-destructive">{err}</div>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
          <Btn type="button" variant="outline" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" disabled={create.isPending}><Save className="size-4" /> {create.isPending ? "Saving…" : "Create Site"}</Btn>
        </div>
      </form>
    </div>
  );
}
