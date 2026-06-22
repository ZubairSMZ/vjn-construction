import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const toneRing: Record<string, string> = {
    default: "ring-border",
    primary: "ring-primary/40",
    success: "ring-success/40",
    warning: "ring-warning/40",
    danger: "ring-destructive/40",
  };
  const toneIcon: Record<string, string> = {
    default: "bg-muted text-foreground/70",
    primary: "bg-primary/15 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
  };
  return (
    <div className={`bg-card rounded-lg p-5 ring-1 ${toneRing[tone]} relative overflow-hidden`}>
      <div className="absolute -right-6 -top-6 size-24 rounded-full hatch opacity-40" />
      <div className="flex items-start justify-between gap-4 relative">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="font-display text-3xl mt-2 tabular-nums">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>}
        </div>
        {icon && <div className={`size-10 rounded-md grid place-items-center ${toneIcon[tone]}`}>{icon}</div>}
      </div>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`bg-card rounded-lg ring-1 ring-border ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-4 px-5 py-4 border-b border-border">
          {title && <h2 className="font-display uppercase tracking-wide text-sm">{title}</h2>}
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "primary" | "success" | "warning" | "danger" | "muted" }) {
  const tones: Record<string, string> = {
    default: "bg-muted text-foreground/80 ring-border",
    primary: "bg-primary/15 text-primary ring-primary/30",
    success: "bg-success/15 text-success ring-success/30",
    warning: "bg-warning/15 text-warning-foreground ring-warning/40",
    danger: "bg-destructive/15 text-destructive ring-destructive/30",
    muted: "bg-muted/60 text-muted-foreground ring-border",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium uppercase tracking-wider ring-1 ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  ...rest
}: { variant?: "primary" | "ghost" | "outline" | "danger"; size?: "sm" | "md" } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
    ghost: "hover:bg-muted text-foreground",
    outline: "border border-border hover:bg-muted text-foreground",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
  };
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium uppercase tracking-wider transition-colors disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${rest.className ?? ""}`}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}

export const inputCls =
  "w-full h-10 px-3 rounded-md bg-background border border-border text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition";

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
