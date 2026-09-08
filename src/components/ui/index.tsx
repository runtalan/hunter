"use client";
import Link from "next/link";
import { cx } from "@/lib/format";
import type { ReactNode, ButtonHTMLAttributes } from "react";

/* ---------- Badge ---------- */
export type Tone = "ice" | "signal" | "flare" | "ember" | "muted" | "cobalt";
const toneCls: Record<Tone, string> = {
  ice: "text-ice bg-ice/10 border-ice/20",
  signal: "text-signal bg-signal/10 border-signal/20",
  flare: "text-flare bg-flare/10 border-flare/25",
  ember: "text-ember bg-ember/10 border-ember/25",
  muted: "text-muted bg-hull border-seam",
  cobalt: "text-ice-2 bg-cobalt/25 border-cobalt/40",
};
export function Badge({ tone = "muted", children, dot, className }: { tone?: Tone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11.5px] font-medium leading-4 whitespace-nowrap", toneCls[tone], className)}>
      {dot && <span className={cx("h-1.5 w-1.5 rounded-full", tone === "muted" ? "bg-faint" : "bg-current")} />}
      {children}
    </span>
  );
}

/* ---------- Button ---------- */
type Variant = "primary" | "ghost" | "outline" | "danger" | "signal";
const vcls: Record<Variant, string> = {
  primary: "bg-cobalt text-white hover:bg-cobalt-2 shadow-[0_0_0_1px_rgba(47,107,255,0.4),0_8px_24px_-12px_rgba(47,107,255,0.8)]",
  ghost: "text-muted hover:text-text hover:bg-hull",
  outline: "border border-seam-2 text-text hover:bg-hull",
  danger: "border border-flare/30 text-flare hover:bg-flare/10",
  signal: "bg-signal/15 border border-signal/30 text-signal hover:bg-signal/25",
};
export function Button({ variant = "outline", size = "md", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-7 px-2.5 text-[12.5px] rounded-lg" : size === "lg" ? "h-11 px-5 text-[14px] rounded-xl" : "h-9 px-3.5 text-[13px] rounded-[10px]";
  return <button className={cx("inline-flex items-center justify-center gap-1.5 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none", sz, vcls[variant], className)} {...rest} />;
}

/* ---------- Page header ---------- */
export function PageHeader({ title, lede, actions }: { title: string; lede?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] leading-tight">{title}</h1>
        {lede && <p className="text-muted text-[14px] mt-1.5 max-w-[62ch]">{lede}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Panel ---------- */
export function Panel({ title, meta, children, className, quiet, action }: { title?: ReactNode; meta?: ReactNode; children: ReactNode; className?: string; quiet?: boolean; action?: ReactNode }) {
  return (
    <section className={cx(quiet ? "panel-quiet" : "panel", "overflow-hidden", className)}>
      {(title || meta || action) && (
        <header className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
          <div className="flex items-baseline gap-3 min-w-0">
            {title && <h2 className="text-[14.5px] font-semibold tracking-[-0.01em] truncate">{title}</h2>}
            {meta && <span className="text-[12px] text-muted truncate">{meta}</span>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

/* ---------- Stat ---------- */
export function Stat({ label, value, delta, tone, href }: { label: string; value: ReactNode; delta?: string; tone?: Tone; href?: string }) {
  const inner = (
    <div className="px-5 py-4">
      <div className="text-[12.5px] text-muted">{label}</div>
      <div className={cx("num text-[28px] font-semibold tracking-[-0.03em] leading-none mt-2", tone === "ember" && "text-ember", tone === "flare" && "text-flare", tone === "signal" && "text-signal")}>{value}</div>
      {delta && <div className="text-[12px] text-faint mt-2">{delta}</div>}
    </div>
  );
  return href ? <Link href={href} className="block rounded-[14px] hover:bg-hull/60 transition-colors">{inner}</Link> : inner;
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, w = 120, h = 32, tone = "ice", highlightLast }: { data: number[]; w?: number; h?: number; tone?: "ice" | "signal" | "flare" | "ember"; highlightLast?: boolean }) {
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v, i) => [i * (w / (data.length - 1)), h - 3 - ((v - min) / (max - min || 1)) * (h - 6)] as const);
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const color = { ice: "var(--ice)", signal: "var(--signal)", flare: "var(--flare)", ember: "var(--ember)" }[tone];
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden className="overflow-visible">
      <defs><linearGradient id={`g-${tone}`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={color} stopOpacity="0.28" /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#g-${tone})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      {highlightLast && <circle cx={last[0]} cy={last[1]} r="3" fill={color} />}
    </svg>
  );
}

/* ---------- Maturity meter ---------- */
export function Maturity({ level, compact }: { level: number; compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" title={`Maturity level ${level}`}>
      <span className="flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className={cx("h-2.5 w-[5px] rounded-[2px]", i <= level ? (level === 4 ? "bg-signal" : "bg-ice") : "bg-seam-2")} />
        ))}
      </span>
      {!compact && <span className="num text-[12px] text-muted">L{level}</span>}
    </span>
  );
}

/* ---------- Health ---------- */
export function HealthDot({ health }: { health: "healthy" | "degraded" | "down" | "unknown" }) {
  const c = { healthy: "bg-signal", degraded: "bg-ember", down: "bg-flare", unknown: "bg-faint" }[health];
  return <span className={cx("inline-block h-2 w-2 rounded-full", c, health === "healthy" && "live-dot")} />;
}

/* ---------- Empty ---------- */
export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="text-[15px] font-medium">{title}</div>
      {hint && <div className="text-muted text-[13px] mt-1.5 max-w-[46ch] mx-auto">{hint}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Key/value ---------- */
export function KV({ rows }: { rows: Array<[string, ReactNode]> }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-[13px]">
      {rows.map(([k, v]) => (<div key={k} className="contents"><dt className="text-muted">{k}</dt><dd className="min-w-0 break-words">{v}</dd></div>))}
    </dl>
  );
}

/* ---------- Code ---------- */
export function Code({ children, label }: { children: string; label?: string }) {
  return (
    <div className="rounded-[10px] border border-seam bg-abyss/70 overflow-hidden">
      {label && <div className="px-3 py-1.5 text-[11.5px] text-muted border-b border-seam">{label}</div>}
      <pre className="mono text-[12.5px] leading-relaxed text-ice-2/90 p-3 overflow-x-auto whitespace-pre">{children}</pre>
    </div>
  );
}

/* ---------- Segmented ---------- */
export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: Array<{ value: T; label: string; count?: number }> }) {
  return (
    <div className="inline-flex rounded-[10px] border border-seam bg-trench p-0.5">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cx("h-7 px-3 rounded-[8px] text-[12.5px] font-medium transition-colors inline-flex items-center gap-1.5", value === o.value ? "bg-hull-2 text-text" : "text-muted hover:text-text")}>
          {o.label}{o.count !== undefined && <span className={cx("num text-[11px]", value === o.value ? "text-ice" : "text-faint")}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
