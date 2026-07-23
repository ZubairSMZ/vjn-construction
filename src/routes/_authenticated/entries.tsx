import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Btn, Field, Panel, inputCls } from "@/components/ui-bits";
import {
  useEntries, useSites, useUsage, usePurchases, useExpenses,
  useCreateEntry, siteName, fmtCurrency, timeAgo, useMe,
} from "@/lib/data";
import { WORKER_TRADES, MATERIAL_OPTIONS, defaultUnitFor, type WorkersMap, sumWorkers } from "@/lib/constants";


export const Route = createFileRoute("/_authenticated/entries")({
  head: () => ({ meta: [{ title: "Daily Entries — SiteTrack" }] }),
  component: Entries,
});

function Entries() {
  const [open, setOpen] = useState(false);
  const { data: entries = [] } = useEntries();
  const { data: sites = [] } = useSites();
  const { data: usage = [] } = useUsage();
  const { data: purchases = [] } = usePurchases();
  const { data: expenses = [] } = useExpenses();

  return (
    <AppShell
      title="Daily Site Entries"
      subtitle="Labor · materials · purchases · expenses · progress"
      actions={
        <Btn onClick={() => setOpen(true)} disabled={sites.length === 0}>
          <Plus className="size-4" /> New Entry
        </Btn>
      }
    >
      {open && <EntryForm onClose={() => setOpen(false)} />}

      {sites.length === 0 && (
        <Panel className="mb-4">
          <p className="text-sm text-muted-foreground">
            No sites yet — <Link to="/sites" className="text-primary underline">add a site</Link> before creating entries.
          </p>
        </Panel>
      )}

      <Panel title="Submitted Entries">
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-medium">Date</th>
                  <th className="text-left py-2 font-medium">Site</th>
                  <th className="text-left py-2 font-medium">Supervisor</th>
                  <th className="text-right py-2 font-medium">Workers</th>
                  <th className="text-left py-2 font-medium">Trades Present</th>
                  <th className="text-right py-2 font-medium">Progress</th>
                  <th className="text-left py-2 font-medium pl-4">Note</th>
                  <th className="text-left py-2 font-medium">Submitted</th>

                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-b border-border/60 hover:bg-muted/40">
                    <td className="py-3 tabular-nums">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                    <td className="py-3 font-medium">{siteName(sites, e.site_id)}</td>
                    <td className="py-3 text-muted-foreground">{e.supervisor || "—"}</td>
                    <td className="py-3 text-right tabular-nums">
                      <span className="font-semibold">{e.labor_total}</span>
                      <span className="text-muted-foreground"> ({e.skilled}/{e.unskilled})</span>
                    </td>
                    <td className="py-3 text-right"><Badge tone="primary">{e.percent}%</Badge></td>
                    <td className="py-3 pl-4 max-w-sm truncate">{e.progress_note}</td>
                    <td className="py-3 text-muted-foreground text-xs">{timeAgo(e.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Recent Material Usage">
          {usage.length === 0 ? <p className="text-sm text-muted-foreground">No usage logged.</p> : (
            <ul className="text-sm divide-y divide-border/60">
              {usage.slice(0, 8).map((u) => (
                <li key={u.id} className="py-2.5 flex justify-between gap-3">
                  <div>
                    <div className="font-medium">{u.material}</div>
                    <div className="text-xs text-muted-foreground">{siteName(sites, u.site_id)}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums font-semibold">{u.qty} {u.unit}</div>
                    <div className="text-xs text-muted-foreground">{new Date(u.date).toLocaleDateString("en-IN")}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent Purchases">
          {purchases.length === 0 ? <p className="text-sm text-muted-foreground">No purchases logged.</p> : (
            <ul className="text-sm divide-y divide-border/60">
              {purchases.slice(0, 8).map((p) => (
                <li key={p.id} className="py-2.5">
                  <div className="flex justify-between gap-3">
                    <div className="font-medium">{p.material}</div>
                    <div className="tabular-nums font-semibold">{fmtCurrency(Number(p.cost))}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between mt-0.5">
                    <span>{p.supplier || "—"} · {p.qty} {p.unit}</span>
                    <span className="font-mono">{p.invoice}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent Expenses">
          {expenses.length === 0 ? <p className="text-sm text-muted-foreground">No expenses logged.</p> : (
            <ul className="text-sm divide-y divide-border/60">
              {expenses.slice(0, 8).map((x) => (
                <li key={x.id} className="py-2.5">
                  <div className="flex justify-between gap-3">
                    <div>
                      <div className="font-medium">{x.category}</div>
                      <div className="text-xs text-muted-foreground">{x.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="tabular-nums font-semibold">{fmtCurrency(Number(x.amount))}</div>
                      <div className="text-xs text-muted-foreground">{x.method}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}

function EntryForm({ onClose }: { onClose: () => void }) {
  const { data: sites = [] } = useSites();
  const { data: me } = useMe();
  const create = useCreateEntry();
  const [siteId, setSiteId] = useState(sites[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [supervisor, setSupervisor] = useState(me?.name ?? "");
  const [skilled, setSkilled] = useState(0);
  const [unskilled, setUnskilled] = useState(0);
  const [percent, setPercent] = useState(0);
  const [progressNote, setProgressNote] = useState("");
  const [remarks, setRemarks] = useState("");

  const [mUse, setMUse] = useState({ material: "", qty: 0, unit: "Bag" });
  const [mBuy, setMBuy] = useState({ material: "", qty: 0, unit: "Bag", supplier: "", cost: 0, invoice: "" });
  const [exp, setExp] = useState({ category: "Labor Wages", amount: 0, method: "UPI", description: "" });
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg ring-1 ring-border w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display uppercase tracking-wide text-lg">New Daily Entry</h2>
            <p className="text-xs text-muted-foreground">Syncs to your team in real time.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close"><X className="size-5" /></button>
        </div>

        <form
          className="p-6 space-y-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr(null);
            if (!siteId) return setErr("Please select a site");
            try {
              await create.mutateAsync({
                date, site_id: siteId, supervisor, skilled, unskilled, percent,
                progress_note: progressNote, remarks,
                usage: mUse.material.trim() && mUse.qty > 0 ? mUse : null,
                purchase: mBuy.material.trim() && mBuy.qty > 0 ? mBuy : null,
                expense: exp.amount > 0 ? exp : null,
                site_name: sites.find((s) => s.id === siteId)?.name,
              });
              onClose();
            } catch (ex: any) { setErr(ex.message ?? "Failed"); }
          }}
        >
          <Section title="Labor Details">
            <Field label="Date"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>
            <Field label="Site">
              <select className={inputCls} value={siteId} onChange={(e) => setSiteId(e.target.value)}>
                <option value="">Select site…</option>
                {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="Supervisor"><input className={inputCls} value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="e.g. Anil K." /></Field>
            <Field label="Skilled Workers"><input type="number" min={0} className={inputCls} value={skilled} onChange={(e) => setSkilled(Number(e.target.value))} /></Field>
            <Field label="Unskilled Workers"><input type="number" min={0} className={inputCls} value={unskilled} onChange={(e) => setUnskilled(Number(e.target.value))} /></Field>
            <Field label="Total Present"><input type="number" className={inputCls} value={skilled + unskilled} readOnly /></Field>
            <div className="md:col-span-3"><Field label="Remarks"><textarea className={inputCls + " h-20 py-2"} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional…" /></Field></div>
          </Section>

          <Section title="Materials Used (optional)">
            <Field label="Material"><input className={inputCls} value={mUse.material} onChange={(e) => setMUse({ ...mUse, material: e.target.value })} placeholder="e.g. OPC Cement" /></Field>
            <Field label="Quantity"><input type="number" className={inputCls} value={mUse.qty} onChange={(e) => setMUse({ ...mUse, qty: Number(e.target.value) })} /></Field>
            <Field label="Unit">
              <select className={inputCls} value={mUse.unit} onChange={(e) => setMUse({ ...mUse, unit: e.target.value })}>
                <option>Bag</option><option>Ton</option><option>Kg</option><option>Piece</option><option>Litre</option>
              </select>
            </Field>
          </Section>

          <Section title="Materials Purchased (optional)">
            <Field label="Material"><input className={inputCls} value={mBuy.material} onChange={(e) => setMBuy({ ...mBuy, material: e.target.value })} /></Field>
            <Field label="Quantity"><input type="number" className={inputCls} value={mBuy.qty} onChange={(e) => setMBuy({ ...mBuy, qty: Number(e.target.value) })} /></Field>
            <Field label="Unit">
              <select className={inputCls} value={mBuy.unit} onChange={(e) => setMBuy({ ...mBuy, unit: e.target.value })}>
                <option>Bag</option><option>Ton</option><option>Kg</option><option>Piece</option>
              </select>
            </Field>
            <Field label="Supplier"><input className={inputCls} value={mBuy.supplier} onChange={(e) => setMBuy({ ...mBuy, supplier: e.target.value })} /></Field>
            <Field label="Purchase Cost (₹)"><input type="number" className={inputCls} value={mBuy.cost} onChange={(e) => setMBuy({ ...mBuy, cost: Number(e.target.value) })} /></Field>
            <Field label="Invoice Number"><input className={inputCls} value={mBuy.invoice} onChange={(e) => setMBuy({ ...mBuy, invoice: e.target.value })} placeholder="INV-…" /></Field>
          </Section>

          <Section title="Expense (optional)">
            <Field label="Category">
              <select className={inputCls} value={exp.category} onChange={(e) => setExp({ ...exp, category: e.target.value })}>
                <option>Labor Wages</option><option>Equipment Rental</option><option>Fuel</option><option>Transport</option><option>Misc</option>
              </select>
            </Field>
            <Field label="Amount (₹)"><input type="number" className={inputCls} value={exp.amount} onChange={(e) => setExp({ ...exp, amount: Number(e.target.value) })} /></Field>
            <Field label="Payment Method">
              <select className={inputCls} value={exp.method} onChange={(e) => setExp({ ...exp, method: e.target.value })}>
                <option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
              </select>
            </Field>
            <div className="md:col-span-3"><Field label="Description"><input className={inputCls} value={exp.description} onChange={(e) => setExp({ ...exp, description: e.target.value })} /></Field></div>
          </Section>

          <Section title="Site Progress">
            <Field label="% Progress"><input type="number" min={0} max={100} className={inputCls} value={percent} onChange={(e) => setPercent(Number(e.target.value))} /></Field>
            <div className="md:col-span-2"><Field label="Work Completed Today"><input className={inputCls} value={progressNote} onChange={(e) => setProgressNote(e.target.value)} placeholder="e.g. Slab pour level 9" /></Field></div>
          </Section>

          {err && <div className="text-sm text-destructive">{err}</div>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={onClose}>Cancel</Btn>
            <Btn type="submit" disabled={create.isPending}><Save className="size-4" /> {create.isPending ? "Saving…" : "Submit Entry"}</Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display uppercase tracking-wide text-xs text-primary mb-3 flex items-center gap-2">
        <span className="h-px flex-1 bg-border" />
        {title}
        <span className="h-px flex-[8] bg-border" />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{children}</div>
    </div>
  );
}
