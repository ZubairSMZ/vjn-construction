import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, timeAgo } from "@/components/ui-bits";
import { useActivity } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/activity")({
  head: () => ({ meta: [{ title: "Activity Log — SiteTrack" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const { data: activity = [] } = useActivity();
  return (
    <AppShell title="Activity Log" subtitle="Full audit trail of user actions">
      <Panel>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity yet. Actions like adding a site, submitting an entry, or logging an expense will appear here.</p>
        ) : (
          <ol className="relative border-l border-border ml-3">
            {activity.map((a) => (
              <li key={a.id} className="pl-6 pb-6 last:pb-0 relative">
                <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary ring-4 ring-card" />
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-sm">
                    <span className="font-semibold">{a.user_name}</span>{" "}
                    <span className="text-muted-foreground">{a.action.toLowerCase()}</span>{" "}
                    <span>— {a.target}</span>
                  </div>
                  <div className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {new Date(a.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    <span className="ml-2">({timeAgo(a.created_at)})</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </AppShell>
  );
}
