import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Save, X } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Badge, Btn, Field, Panel, inputCls, timeAgo } from "../components/ui-bits";
import { dailyEntries, fmtCurrency, materialPurchases, materialUsage, expenses, siteName, sites } from "../lib/mock-data";

export const Route = createFileRoute("/_authenticated/entries")({
  head: () => ({ meta: [{ title: "Daily Entries — SiteTrack" }] }),
  component: Entries,
});

function Entries() {
  const [open, setOpen] = useState(false);
  return (
    <AppShell
      title="Daily Site Entries"
      subtitle="Labor · materials · purchases · expenses · progress"
      actions={
        <Btn onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New Entry
        </Btn>
      }
    >
      {open && <EntryForm onClose={() => setOpen(false)} />}

      <Panel title="Submitted Entries">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Site</th>
                <th className="text-left py-2 font-medium">Supervisor</th>
                <th className="text-right py-2 font-medium">Labor (S/U)</th>
                <th className="text-right py-2 font-medium">Progress</th>
                <th className="text-left py-2 font-medium pl-4">Note</th>
                <th className="text-left py-2 font-medium">Submitted by</th>
              </tr>
            </thead>
            <tbody>
              {dailyEntries.map((e) => (
                <tr key={e.id} className="border-b border-border/60 hover:bg-muted/40">
                  <td className="py-3 tabular-nums">{new Date(e.date).toLocaleDateString("en-IN")}</td>
                  <td className="py-3 font-medium">{siteName(e.siteId)}</td>
                  <td className="py-3 text-muted-foreground">{e.supervisor}</td>
                  <td className="py-3 text-right tabular-nums">
                    <span className="font-semibold">{e.laborTotal}</span>
                    <span className="text-muted-foreground"> ({e.skilled}/{e.unskilled})</span>
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    <Badge tone="primary">{e.percent}%</Badge>
                  </td>
                  <td className="py-3 pl-4 max-w-sm truncate">{e.progressNote}</td>
                  <td className="py-3 text-muted-foreground">
                    {e.user} · <span className="text-xs">{timeAgo(e.date)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Panel title="Recent Material Usage">
          <ul className="text-sm divide-y divide-border/60">
            {materialUsage.map((u) => (
              <li key={u.id} className="py-2.5 flex justify-between gap-3">
                <div>
                  <div className="font-medium">{u.material}</div>
                  <div className="text-xs text-muted-foreground">{siteName(u.siteId)} · {u.user}</div>
                </div>
                <div className="text-right">
                  <div className="tabular-nums font-semibold">{u.qty} {u.unit}</div>
                  <div className="text-xs text-muted-foreground">{new Date(u.date).toLocaleDateString("en-IN")}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Purchases">
          <ul className="text-sm divide-y divide-border/60">
            {materialPurchases.map((p) => (
              <li key={p.id} className="py-2.5">
                <div className="flex justify-between gap-3">
                  <div className="font-medium">{p.material}</div>
                  <div className="tabular-nums font-semibold">{fmtCurrency(p.cost)}</div>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between mt-0.5">
                  <span>{p.supplier} · {p.qty} {p.unit}</span>
                  <span className="font-mono">{p.invoice}</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Recent Expenses">
          <ul className="text-sm divide-y divide-border/60">
            {expenses.map((x) => (
              <li key={x.id} className="py-2.5">
                <div className="flex justify-between gap-3">
                  <div>
                    <div className="font-medium">{x.category}</div>
                    <div className="text-xs text-muted-foreground">{x.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="tabular-nums font-semibold">{fmtCurrency(x.amount)}</div>
                    <div className="text-xs text-muted-foreground">{x.method}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </AppShell>
  );
}

function EntryForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 overflow-y-auto">
      <div className="bg-card rounded-lg ring-1 ring-border w-full max-w-3xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display uppercase tracking-wide text-lg">New Daily Entry</h2>
            <p className="text-xs text-muted-foreground">All fields sync to your team in real time once Cloud is enabled.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>

        <form
          className="p-6 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            onClose();
          }}
        >
          <Section title="Labor Details">
            <Field label="Date">
              <input type="date" className={inputCls} defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label="Site">
              <select className={inputCls}>
                {sites.map((s) => (
                  <option key={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Supervisor">
              <input className={inputCls} placeholder="e.g. Anil K." />
            </Field>
            <Field label="Skilled Workers">
              <input type="number" className={inputCls} placeholder="0" />
            </Field>
            <Field label="Unskilled Workers">
              <input type="number" className={inputCls} placeholder="0" />
            </Field>
            <Field label="Total Present">
              <input type="number" className={inputCls} placeholder="0" />
            </Field>
            <div className="md:col-span-3">
              <Field label="Remarks">
                <textarea className={inputCls + " h-20 py-2"} placeholder="Optional remarks…" />
              </Field>
            </div>
          </Section>

          <Section title="Materials Used">
            <Field label="Material"><input className={inputCls} placeholder="e.g. OPC Cement" /></Field>
            <Field label="Quantity"><input type="number" className={inputCls} placeholder="0" /></Field>
            <Field label="Unit">
              <select className={inputCls}>
                <option>Bag</option><option>Ton</option><option>Kg</option><option>Piece</option><option>Litre</option>
              </select>
            </Field>
          </Section>

          <Section title="Materials Purchased">
            <Field label="Material"><input className={inputCls} /></Field>
            <Field label="Quantity"><input type="number" className={inputCls} /></Field>
            <Field label="Unit">
              <select className={inputCls}>
                <option>Bag</option><option>Ton</option><option>Kg</option><option>Piece</option>
              </select>
            </Field>
            <Field label="Supplier"><input className={inputCls} /></Field>
            <Field label="Purchase Cost (₹)"><input type="number" className={inputCls} /></Field>
            <Field label="Invoice Number"><input className={inputCls} placeholder="INV-…" /></Field>
          </Section>

          <Section title="Expense">
            <Field label="Category">
              <select className={inputCls}>
                <option>Labor Wages</option><option>Equipment Rental</option><option>Fuel</option><option>Transport</option><option>Misc</option>
              </select>
            </Field>
            <Field label="Amount (₹)"><input type="number" className={inputCls} /></Field>
            <Field label="Payment Method">
              <select className={inputCls}>
                <option>UPI</option><option>Cash</option><option>Bank Transfer</option><option>Cheque</option>
              </select>
            </Field>
            <div className="md:col-span-3">
              <Field label="Description"><input className={inputCls} /></Field>
            </div>
          </Section>

          <Section title="Site Progress">
            <Field label="% Progress"><input type="number" min={0} max={100} className={inputCls} /></Field>
            <Field label="Work Completed Today">
              <input className={inputCls} placeholder="e.g. Slab pour level 9" />
            </Field>
            <Field label="Issues / Delays">
              <input className={inputCls} placeholder="None" />
            </Field>
            <div className="md:col-span-3">
              <Field label="Planned for Tomorrow">
                <textarea className={inputCls + " h-20 py-2"} />
              </Field>
            </div>
          </Section>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Btn variant="outline" type="button" onClick={onClose}>Cancel</Btn>
            <Btn type="submit"><Save className="size-4" /> Submit Entry</Btn>
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
