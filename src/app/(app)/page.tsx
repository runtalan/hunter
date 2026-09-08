"use client";
import Link from "next/link";
import { ArrowUpRight, Crosshair } from "lucide-react";
import { Badge, Button, HealthDot, Maturity, Panel, Sparkline, Stat } from "@/components/ui";
import { useHunter, allTenants } from "@/lib/store";
import { analystById, dashboards, hunts, mcpServers, tenantById, vendorLabel, maturityLabel } from "@/lib/data";
import { timeAgo } from "@/lib/format";
import { actionLabel, GateBar, Outcome } from "@/components/ui/domain";

export default function Overview() {
  const { inScope, approvals, findings, outliers } = useHunter();
  const tenants = allTenants.filter((t) => inScope(t.id));
  const pending = approvals.filter((a) => !a.decision && inScope(a.tenantId));
  const openFindings = findings.filter((f) => f.disposition === "open" && inScope(f.tenantId));
  const openOutliers = outliers.filter((o) => o.confirmed === null && inScope(o.tenantId));
  const recentHunts = hunts.filter((h) => inScope(h.tenantId)).slice(0, 5);
  const servers = mcpServers.filter((s) => inScope(s.tenantId));
  const unhealthy = servers.filter((s) => s.health !== "healthy");
  const huntsMonth = tenants.reduce((n, t) => n + t.huntsThisMonth, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
        <div>
          <p className="text-muted text-[13px]">Monday, September 8</p>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] mt-1">Good afternoon, Paul</h1>
        </div>
        <Link href="/hunt"><Button variant="primary"><Crosshair size={15} /> Start a hunt</Button></Link>
      </div>

      <div className="panel grid grid-cols-2 lg:grid-cols-4 divide-x divide-seam mb-6">
        <Stat label="Awaiting your approval" value={pending.length} tone={pending.length ? "ember" : undefined} delta={pending.length ? "Analysts are blocked until these are decided" : "Queue is clear"} href="/approvals" />
        <Stat label="Open LOTL findings" value={openFindings.length} delta={`${findings.filter((f) => f.disposition === "escalated" && inScope(f.tenantId)).length} escalated to hunts`} href="/lotl" />
        <Stat label="Unreviewed outliers" value={openOutliers.length} delta="Across 8 baseline dashboards" href="/baselines" />
        <Stat label="Hunts this month" value={huntsMonth} delta={`${hunts.filter((h) => h.outcome === "true_positive" && inScope(h.tenantId)).length} true positives in the last 14 days`} href="/hunts" />
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="space-y-6">
          <Panel title="Needs a decision" meta={`${pending.length} pending`} action={<Link href="/approvals" className="text-[12.5px] text-ice inline-flex items-center gap-1">Open queue <ArrowUpRight size={13} /></Link>}>
            {pending.length === 0 ? <div className="px-5 pb-5 text-muted text-[13px]">Nothing is waiting on you.</div> : (
              <ul className="divide-y divide-seam/70">
                {pending.slice(0, 4).map((a) => (
                  <li key={a.id} className="px-5 py-3 flex items-center gap-4">
                    <GateBar type={a.actionType} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] truncate">{a.summary}</div>
                      <div className="text-[12px] text-muted mt-0.5">{tenantById(a.tenantId).name} · requested by {a.requestedBy} · {timeAgo(a.requestedAt)}</div>
                    </div>
                    <Badge tone={a.actionType === "detection_deploy" || a.actionType === "case_create" ? "flare" : a.actionType === "report_release" ? "cobalt" : "ember"}>{actionLabel[a.actionType]}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Recent hunts" action={<Link href="/hunts" className="text-[12.5px] text-ice inline-flex items-center gap-1">All records <ArrowUpRight size={13} /></Link>}>
            <table className="data">
              <thead><tr><th>Hunt</th><th>Tenant</th><th>Origin</th><th>Outcome</th><th>Analyst</th><th></th></tr></thead>
              <tbody>
                {recentHunts.map((h) => (
                  <tr key={h.id}>
                    <td><Link href={`/hunts/${h.id}`} className="hover:text-ice"><span className="mono text-[12px] text-muted mr-2">{h.id}</span>{h.title}</Link></td>
                    <td className="text-muted">{tenantById(h.tenantId).name}</td>
                    <td><Badge>{h.origin === "lotl" ? "LOTL" : h.origin === "dashboard" ? "Baseline" : "Hypothesis"}</Badge></td>
                    <td><Outcome o={h.outcome} status={h.status} /></td>
                    <td className="text-muted">{analystById(h.analystId)?.name}</td>
                    <td className="text-faint text-[12px] text-right">{timeAgo(h.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <Panel title="Baseline dashboards" meta="14-day trend of flagged entities" action={<Link href="/baselines" className="text-[12.5px] text-ice inline-flex items-center gap-1">Open <ArrowUpRight size={13} /></Link>}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-px bg-seam/60 border-t border-seam/60">
              {dashboards.map((d) => {
                const spike = d.series[d.series.length - 1] > Math.max(...d.series.slice(0, -1)) * 1.4;
                return (
                  <Link key={d.id} href={`/baselines/${d.id}`} className="bg-trench/80 hover:bg-hull/70 transition-colors px-4 py-3.5 block">
                    <div className="text-[12.5px] leading-snug h-8">{d.name}</div>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <div className={"num text-[20px] font-semibold tracking-tight " + (spike ? "text-ember" : "")}>{d.series[d.series.length - 1]}</div>
                        <div className="text-[11px] text-faint">{d.cadence}</div>
                      </div>
                      <Sparkline data={d.series} w={96} h={28} tone={spike ? "ember" : "ice"} highlightLast />
                    </div>
                  </Link>
                );
              })}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Tenants in scope" meta={`${tenants.length} of ${allTenants.length}`}>
            <ul className="divide-y divide-seam/70">
              {tenants.map((t) => (
                <li key={t.id}>
                  <Link href={`/tenants/${t.slug}`} className="px-5 py-3 flex items-center gap-3 hover:bg-hull/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{t.name}</div>
                      <div className="text-[12px] text-muted mt-0.5">{maturityLabel[t.maturity]} · {t.vendors.map((v) => vendorLabel[v].split(" ")[0]).join(", ")}</div>
                    </div>
                    <div className="text-right">
                      <Maturity level={t.maturity} />
                      <div className="num text-[11.5px] text-faint mt-1">{t.openFindings} open</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Data plane health" meta={unhealthy.length ? `${unhealthy.length} need attention` : "All servers healthy"} action={<Link href="/servers" className="text-[12.5px] text-ice inline-flex items-center gap-1">Registry <ArrowUpRight size={13} /></Link>}>
            <ul className="px-5 pb-4 space-y-2">
              {servers.map((s) => (
                <li key={s.id} className="flex items-center gap-2.5 text-[13px]">
                  <HealthDot health={s.health} />
                  <span className="flex-1 truncate">{tenantById(s.tenantId).name} <span className="text-muted">· {vendorLabel[s.vendor]}</span></span>
                  <span className="num text-[12px] text-faint">{s.health === "healthy" || s.health === "degraded" ? `${s.latencyMs} ms` : s.health}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Isolation posture" quiet>
            <ul className="px-5 pb-4 text-[13px] space-y-2">
              {[
                ["Cross-namespace policy violations", "0 in 30 days", "signal"],
                ["Credentials outstanding", "2 active, 5 min TTL", "ice"],
                ["Audit write failures", "0", "signal"],
                ["Contract conformance", "9 of 10 passing", "ember"],
              ].map(([k, v, tone]) => (
                <li key={k} className="flex justify-between gap-3"><span className="text-muted">{k}</span><span className={tone === "signal" ? "text-signal" : tone === "ember" ? "text-ember" : ""}>{v}</span></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}

