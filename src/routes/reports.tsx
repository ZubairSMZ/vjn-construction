import { createFileRoute } from "@tanstack/react-router";
import { FileSpreadsheet, FileText, Filter } from "lucide-react";
import { AppShell } from "../components/app-shell";
import { Btn, Field, Panel, inputCls } from "../components/ui-bits";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — SiteTrack" }] }),
  component: Reports,
});

const reports = [
  { id: "daily", title: "Daily Report", desc: "Per-site activity summary for any single day." },
  { id: "weekly", title: "Weekly Report", desc: "Rolling 7-day labor, materials, and spend." },
  { id: "monthly", title: "Monthly Report", desc: "Month-end performance and variance." },
  { id: "site", title: "Site-wise Report", desc: "Full ledger for a chosen site." },
  { id: "labor", title: "Labor Report", desc: "Skilled vs. unskilled labor breakdown." },
  { id: "consumption", title: "Material Consumption", desc: "Usage trends per material." },
  { id: "purchase", title: "Material Purchase", desc: "PO ledger by supplier." },
  { id: "expense", title: "Expense Report", desc: "Category-wise expense detail." },
];

function Reports() {
  return (
    <AppShell title="Reports & Exports" subtitle="Filter, preview, and export to PDF or Excel">
      <Panel title={<span>Filters</span> as unknown as string}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="From"><input type="date" className={inputCls} /></Field>
          <Field label="To"><input type="date" className={inputCls} /></Field>
          <Field label="Site">
            <select className={inputCls}><option>All sites</option></select>
          </Field>
          <Field label="User">
            <select className={inputCls}><option>All users</option></select>
          </Field>
          <div className="flex items-end">
            <Btn className="w-full"><Filter className="size-4" /> Apply</Btn>
          </div>
        </div>
      </Panel>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
        {reports.map((r) => (
          <article key={r.id} className="bg-card rounded-lg ring-1 ring-border p-5 flex flex-col">
            <h3 className="font-display uppercase tracking-wide text-base">{r.title}</h3>
            <p className="text-sm text-muted-foreground mt-1.5 flex-1">{r.desc}</p>
            <div className="flex gap-2 mt-4">
              <Btn size="sm" variant="outline" className="flex-1"><FileText className="size-3.5" /> PDF</Btn>
              <Btn size="sm" variant="outline" className="flex-1"><FileSpreadsheet className="size-3.5" /> Excel</Btn>
            </div>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Export generation runs server-side once Lovable Cloud is enabled.
      </p>
    </AppShell>
  );
}
