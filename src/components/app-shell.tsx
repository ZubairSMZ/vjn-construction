import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Package,
  Wallet,
  FileBarChart,
  Activity,
  HardHat,
  Bell,
  Search,
  Sun,
  Moon,
  Menu,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useEntries, useSites, siteName } from "@/lib/data";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/entries", label: "Daily Entries", icon: ClipboardList },
  { to: "/sites", label: "Sites", icon: Building2 },
  { to: "/materials", label: "Inventory", icon: Package },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/reports", label: "Reports", icon: FileBarChart },
  { to: "/activity", label: "Activity", icon: Activity },
] as const;

export function AppShell({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [user, setUser] = useState<{ name: string; email: string; role: string; initials: string } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { data: entries = [] } = useEntries();
  const { data: sites = [] } = useSites();
  const todayISO = new Date().toISOString().slice(0, 10);
  const todayEntries = entries.filter((e) => e.date.slice(0, 10) === todayISO);
  const issues = todayEntries.filter((e) => (e.remarks ?? "").trim().length > 0);

  useEffect(() => {
    if (!notifOpen) return;
    function onDown(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !mounted) return;
      const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", u.user.id).maybeSingle();
      const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).maybeSingle();
      const name = profile?.full_name || u.user.email?.split("@")[0] || "User";
      const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
      setUser({
        name,
        email: profile?.email || u.user.email || "",
        role: roleRow?.role === "admin" ? "Admin" : "Staff",
        initials,
      });
    })();
    return () => { mounted = false; };
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-sidebar-border">
          <div className="grid place-items-center size-9 rounded-md bg-primary text-primary-foreground">
            <HardHat className="size-5" />
          </div>
          <div>
            <div className="font-display text-lg uppercase tracking-wide leading-none">SiteTrack</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">Daily Operations</div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-sidebar-primary)_30%,transparent)]"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-primary/20 grid place-items-center text-primary font-semibold">
              {user?.initials ?? "··"}
            </div>
            <div className="text-xs min-w-0 flex-1">
              <div className="font-semibold text-sidebar-foreground truncate">{user?.name ?? "Loading…"}</div>
              <div className="text-sidebar-foreground/60 truncate">{user ? `${user.email} · ${user.role}` : ""}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="grid place-items-center size-8 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 h-16 bg-background/85 backdrop-blur border-b border-border flex items-center gap-3 px-4 lg:px-8">
          <button className="lg:hidden p-2 -ml-2" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl uppercase tracking-wide leading-none truncate">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground mt-1 truncate">{subtitle}</p>}
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-md bg-muted/60 border border-border w-72">
            <Search className="size-4 text-muted-foreground" />
            <input className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground" placeholder="Search sites, materials, users…" />
          </div>
          <button
            className="grid place-items-center size-9 rounded-md border border-border hover:bg-muted"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative grid place-items-center size-9 rounded-md border border-border hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="size-4" />
              {(todayEntries.length > 0 || issues.length > 0) && (
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary" />
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-h-[70vh] overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50">
                <div className="px-4 py-3 border-b border-border">
                  <div className="font-display uppercase tracking-wide text-sm">Today's Updates</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                  </div>
                </div>
                {todayEntries.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-muted-foreground">No entries submitted today.</div>
                ) : (
                  <>
                    {issues.length > 0 && (
                      <div className="px-4 py-2 border-b border-border">
                        <div className="text-[10px] uppercase tracking-wider text-warning font-semibold mb-2">Issues Reported</div>
                        <ul className="space-y-2">
                          {issues.map((e) => (
                            <li key={`i-${e.id}`} className="text-sm">
                              <div className="font-semibold">{siteName(sites, e.site_id)}</div>
                              <div className="text-xs text-muted-foreground">{e.remarks}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="px-4 py-2">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Work In Progress</div>
                      <ul className="space-y-3">
                        {todayEntries.map((e) => (
                          <li key={e.id} className="text-sm">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="font-semibold truncate">{siteName(sites, e.site_id)}</div>
                              <div className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                                {e.labor_total} workers · {e.percent}%
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{e.progress_note || "—"}</div>
                            <div className="text-[11px] text-muted-foreground/80 mt-0.5">Supervisor: {e.supervisor}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>
        <main className="px-4 lg:px-8 py-6 lg:py-8">
          {actions && <div className="mb-6 flex flex-wrap gap-2">{actions}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
