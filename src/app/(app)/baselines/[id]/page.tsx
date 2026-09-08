"use client";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";
import { ChevronLeft, Check, X, ArrowUpRight } from "lucide-react";
import { Badge, Button, Panel, Sparkline, Empty } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { dashboardById, tenantById } from "@/lib/data";
import { cx, timeAgo } from "@/lib/format";

export default function BaselineDetail({ params }: PageProps<"/baselines/[id]">) {
  const { id } = use(params);
  const d = dashboardById(id);
  const { outliers, confirmOutlier, inScope } = useHunter();
  if (!d) notFound();
  const rows = outliers.filter((o) => o.dashboardId === d.id && inScope(o.tenantId));
  const max = Math.max(...d.series);
  return (
    <div>
      <Link href="/baselines" className="text-[12.5px] text-muted hover:text-text inline-flex items-center gap-1 mb-4"><ChevronLeft size={14} /> Baseline dashboards</Link>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div><h1 className="text-[24px] font-semibold tracking-[-0.02em]">{d.name}</h1><p className="text-muted text-[13.5px] mt-1">{d.description}</p></div>
        <div className="text-[12.5px] text-muted">Refreshes {d.cadence} · last {timeAgo(d.lastRefresh)}</div>
      </div>
      <Panel title="Flagged entities, last 14 refreshes" className="mb-6">
        <div className="px-5 pb-5">
          <div className="flex items-end gap-[6px] h-[140px]">
            {d.series.map((v, i) => {
              const last = i === d.series.length - 1;
              const spike = v > Math.max(...d.series.filter((_, j) => j !== i)) * 1.4;
              return (
                <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1.5 h-full">
                  <span className={cx("num text-[11px]", spike ? "text-ember" : "text-faint")}>{v}</span>
                  <div className={cx("w-full rounded-t-[4px]", spike ? "bg-ember" : last ? "bg-ice" : "bg-cobalt/50")} style={{ height: `${Math.max(3, (v / max) * 100)}%` }} />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-faint mt-2"><span>14 refreshes ago</span><span>latest</span></div>
        </div>
      </Panel>
      <Panel title="Outliers to review" meta={`${rows.filter((o) => o.confirmed === null).length} unreviewed`}>
        {rows.length === 0 ? <Empty title="No outliers in scope" hint="This dashboard has nothing flagged for the selected tenants." /> : (
          <ul className="divide-y divide-seam/70">
            {rows.map((o) => (
              <li key={o.id} className="px-5 py-4 flex items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="mono text-[13px] text-ice-2">{o.entity}</span>
                    <span className="text-[12.5px] text-muted">{tenantById(o.tenantId).name}</span>
                    {o.confirmed === true && <Badge tone="flare">Confirmed</Badge>}
                    {o.confirmed === false && <Badge tone="signal">Dismissed</Badge>}
                  </div>
                  <div className="text-[13px] text-text/85 mt-1">{o.detail}</div>
                  <div className="text-[12px] text-faint mt-1 num">{d.technique === "z_score" ? `z = ${o.score}` : d.technique === "interval_jitter" ? `periodicity ${o.score}` : d.technique === "stack_count" ? `prevalence ${o.score}` : "first seen"} · detected {timeAgo(o.detectedAt)}{o.linkedHunt && <> · <Link href={`/hunts/${o.linkedHunt}`} className="text-ice">{o.linkedHunt}</Link></>}</div>
                </div>
                {o.confirmed === null && (
                  <div className="flex gap-1.5 shrink-0">
                    <Button size="sm" variant="ghost" onClick={() => confirmOutlier(o.id, false)}><X size={13} /> Dismiss</Button>
                    <Button size="sm" variant="primary" onClick={() => confirmOutlier(o.id, true)}><Check size={13} /> Confirm and hunt</Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <div className="mt-4 text-[12px] text-faint">Tuning lives in <span className="mono">dashboards/tuning/{d.id}.yml</span> per tenant. <Link href="/hunt" className="text-ice inline-flex items-center gap-1">Start a hunt from this dashboard <ArrowUpRight size={12} /></Link></div>
      <div className="hidden"><Sparkline data={d.series} /></div>
    </div>
  );
}
