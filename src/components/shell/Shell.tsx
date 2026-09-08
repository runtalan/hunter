"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Crosshair, LayoutGrid, History, ShieldCheck, Radar, Activity, CheckSquare, FileText, Building2, ScrollText, Server, ChevronDown, Search, Bell, Check, X } from "lucide-react";
import { Wordmark } from "./Logo";
import { useHunter, allTenants } from "@/lib/store";
import { currentAnalyst, roleLabel } from "@/lib/data";
import { cx } from "@/lib/format";
import { Maturity } from "@/components/ui";

const nav = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/hunt", label: "Hunt", icon: Crosshair },
  { href: "/hunts", label: "Hunt records", icon: History },
  { href: "/detections", label: "Detections", icon: ShieldCheck },
  { href: "/lotl", label: "LOTL findings", icon: Radar },
  { href: "/baselines", label: "Baselines", icon: Activity },
  { href: "/approvals", label: "Approvals", icon: CheckSquare },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/tenants", label: "Tenants", icon: Building2 },
  { href: "/servers", label: "MCP servers", icon: Server },
  { href: "/audit", label: "Audit log", icon: ScrollText },
];

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { approvals, toasts } = useHunter();
  const pending = approvals.filter((a) => !a.decision).length;
  return (
    <div className="flex min-h-screen">
      <aside className="w-[228px] shrink-0 border-r border-seam/80 bg-trench/40 backdrop-blur flex flex-col sticky top-0 h-screen">
        <div className="px-5 h-16 flex items-center border-b border-seam/60">
          <Link href="/" aria-label="Hunter home"><Wordmark size={26} /></Link>
        </div>
        <nav className="px-3 py-3 flex-1 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? path === "/" : path.startsWith(href);
            return (
              <Link key={href} href={href} className={cx("flex items-center gap-2.5 h-9 px-2.5 rounded-[9px] text-[13.5px] transition-colors", active ? "bg-cobalt/15 text-ice-2" : "text-muted hover:text-text hover:bg-hull/70")}>
                <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className={active ? "text-ice" : ""} />
                <span className="flex-1">{label}</span>
                {href === "/approvals" && pending > 0 && <span className="num text-[11px] font-semibold text-ember bg-ember/12 rounded-full px-1.5 py-px">{pending}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-seam/60 text-[11.5px] text-faint leading-relaxed">
          Built by Novacoast<br />Prototype 0.1 · seeded data
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 px-8 py-7 max-w-[1440px] w-full">{children}</main>
      </div>
      <div className="fixed bottom-5 right-5 z-50 space-y-2 w-[360px]">
        {toasts.map((t) => (
          <div key={t.id} className={cx("rise panel px-4 py-3 text-[13px] flex items-start gap-2.5 shadow-2xl", t.kind === "warn" && "border-flare/30", t.kind === "info" && "border-ice/30")}>
            {t.kind === "warn" ? <X size={15} className="text-flare mt-0.5" /> : <Check size={15} className={cx("mt-0.5", t.kind === "info" ? "text-ice" : "text-signal")} />}
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Topbar() {
  const { scope, toggleTenant, setScope } = useHunter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const label = scope.length === 0 ? "All tenants" : scope.length === 1 ? allTenants.find((t) => t.id === scope[0])!.name : `${scope.length} tenants`;
  return (
    <header className="h-16 border-b border-seam/60 bg-abyss/60 backdrop-blur sticky top-0 z-40 flex items-center gap-3 px-8">
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((o) => !o)} className="h-9 pl-3 pr-2.5 rounded-[10px] border border-seam bg-trench hover:bg-hull inline-flex items-center gap-2 text-[13px]">
          <span className="text-muted">Scope</span>
          <span className="font-medium">{label}</span>
          <ChevronDown size={14} className="text-muted" />
        </button>
        {open && (
          <div className="rise absolute left-0 top-11 w-[340px] panel p-2 shadow-2xl">
            <div className="px-2.5 pt-1.5 pb-2 text-[12px] text-muted">Tenant scope is explicit. The assistant never infers it from a prompt.</div>
            <button onClick={() => setScope([])} className={cx("w-full text-left flex items-center justify-between h-9 px-2.5 rounded-[8px] text-[13px] hover:bg-hull", scope.length === 0 && "text-ice-2")}>
              All tenants {scope.length === 0 && <Check size={14} />}
            </button>
            <div className="my-1 border-t border-seam" />
            {allTenants.map((t) => {
              const on = scope.includes(t.id);
              return (
                <button key={t.id} onClick={() => toggleTenant(t.id)} className={cx("w-full text-left flex items-center gap-2.5 h-9 px-2.5 rounded-[8px] text-[13px] hover:bg-hull", on && "text-ice-2")}>
                  <span className={cx("h-4 w-4 rounded-[5px] border flex items-center justify-center", on ? "bg-cobalt border-cobalt" : "border-seam-2")}>{on && <Check size={11} className="text-white" />}</span>
                  <span className="flex-1">{t.name}</span>
                  <Maturity level={t.maturity} compact />
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="relative flex-1 max-w-[460px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input className="input w-full pl-9 h-9" placeholder="Search hunts, rules, hosts, findings" />
        <span className="kbd absolute right-2.5 top-1/2 -translate-y-1/2">⌘K</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="h-9 w-9 rounded-[10px] hover:bg-hull inline-flex items-center justify-center text-muted" aria-label="Notifications"><Bell size={16} /></button>
        <div className="flex items-center gap-2.5 pl-3 border-l border-seam">
          <div className="text-right leading-tight">
            <div className="text-[13px] font-medium">{currentAnalyst.name}</div>
            <div className="text-[11.5px] text-muted">{roleLabel[currentAnalyst.role]}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cobalt to-ice/60 flex items-center justify-center text-[12px] font-semibold">{currentAnalyst.initials}</div>
        </div>
      </div>
    </header>
  );
}
