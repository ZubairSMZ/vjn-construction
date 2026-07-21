import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HardHat, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isFirstUser, setIsFirstUser] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
    // best-effort: check if any users exist yet by counting user_roles (readable to none w/o auth; fall back silently)
    supabase
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .then(({ count }) => {
        if (typeof count === "number") setIsFirstUser(count === 0);
      });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || email.split("@")[0] },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        // Try immediate sign-in (works if email confirmation is disabled)
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) {
          setInfo("Account created. Please check your email to confirm, then sign in.");
          setMode("signin");
        } else {
          navigate({ to: "/" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="grid place-items-center size-11 rounded-md bg-primary text-primary-foreground">
            <HardHat className="size-6" />
          </div>
          <div>
            <div className="font-display text-2xl uppercase tracking-wide leading-none">SiteTrack</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Daily Operations</div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h1 className="font-display text-xl uppercase tracking-wide">
            {mode === "signin" ? "Sign in" : "Create account"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signup"
              ? isFirstUser
                ? "You're the first user — this account will be the Admin."
                : "New teammates are added as Staff."
              : "Welcome back. Sign in to continue."}
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs uppercase tracking-wide text-muted-foreground">Full name</label>
                <input
                  className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ravi Kumar"
                />
              </div>
            )}
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Email</label>
              <input
                type="email"
                required
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wide text-muted-foreground">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm text-foreground bg-primary/10 border border-primary/30 rounded-md px-3 py-2">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-primary text-primary-foreground font-semibold uppercase tracking-wide text-sm inline-flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-60"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-muted-foreground">
            {mode === "signin" ? (
              <>
                No account?{" "}
                <button className="text-primary font-semibold hover:underline" onClick={() => { setMode("signup"); setError(null); setInfo(null); }}>
                  Create one
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="text-primary font-semibold hover:underline" onClick={() => { setMode("signin"); setError(null); setInfo(null); }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          The first person to sign up becomes the Admin. Everyone after joins as Staff.
          <br />
          <Link to="/" className="underline hover:text-foreground">Back to app</Link>
        </p>
      </div>
    </div>
  );
}
