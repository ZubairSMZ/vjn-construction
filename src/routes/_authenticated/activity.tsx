import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, timeAgo } from "@/components/ui-bits";
import { activity } from "@/lib/mock-data";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Activity Log — SiteTrack" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  return (
    <AppShell title="Activity Log" subtitle="Full audit trail of user actions">
      <Panel>
        <ol className="relative border-l border-border ml-3">
          {activity.map((a) => (
            <li key={a.id} className="pl-6 pb-6 last:pb-0 relative">
              <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-card" />
              <div className="flex items-baseline justify-between gap-4">
                <div className="text-sm">
                  <span className="font-semibold">{a.user}</span>{" "}
                  <span className="text-muted-foreground">{a.action.toLowerCase()}</span>{" "}
                  <span>— {a.target}</span>
                </div>
                <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                  {new Date(a.timestamp).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                  <span className="ml-2">({timeAgo(a.timestamp)})</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </Panel>
    </AppShell>
  );
}
