import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { HardHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string; client_name?: string; redirect_uri?: string } | null;
type OAuthDetails = {
  client?: OAuthClient;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
  scopes?: string[];
} | null;

// Minimal typed shim for the beta supabase.auth.oauth namespace.
type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: OAuthDetails; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: OAuthDetails; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: OAuthDetails; error: { message: string } | null }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthApi }).oauth;

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="min-h-screen grid place-items-center p-6 text-center">
      <div>
        <h1 className="font-display text-xl uppercase tracking-wide mb-2">Authorization error</h1>
        <p className="text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.client_name ?? details?.client?.name ?? "an application";
  const scopes =
    details?.scopes ??
    (typeof details?.scope === "string" && details.scope.length > 0 ? details.scope.split(/\s+/) : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauth.approveAuthorization(authorization_id)
      : await oauth.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="grid place-items-center size-11 rounded-md bg-primary text-primary-foreground">
            <HardHat className="size-6" />
          </div>
          <div>
            <div className="font-display text-lg uppercase tracking-wide leading-none">
              Connect {clientName}
            </div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1">
              to VJN Construction
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {clientName} will be able to call this app's tools while you are signed in — reading and
          creating sites, entries, expenses, and inventory as you. Access still respects the app's
          row-level security.
        </p>
        {scopes.length > 0 && (
          <ul className="mt-4 text-sm space-y-1 text-muted-foreground">
            {scopes.map((s: string) => (
              <li key={s}>• Requested permission: {s}</li>
            ))}
          </ul>
        )}
        {error && (
          <div className="mt-4 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2" role="alert">
            {error}
          </div>
        )}
        <div className="mt-6 flex gap-2">
          <button
            disabled={busy}
            onClick={() => decide(true)}
            className="flex-1 h-10 rounded-md bg-primary text-primary-foreground font-semibold uppercase tracking-wide text-sm inline-flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1 h-10 rounded-md border border-border font-semibold uppercase tracking-wide text-sm hover:bg-muted disabled:opacity-60"
          >
            Deny
          </button>
        </div>
      </div>
    </main>
  );
}
