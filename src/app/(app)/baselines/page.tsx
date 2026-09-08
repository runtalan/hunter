"use client";
import Link from "next/link";
import { PageHeader, Sparkline, Badge } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { dashboards } from "@/lib/data";
import { cx, timeAgo } from "@/lib/format";

const techLabel = { stack_count: "Stack count, least frequent", z_score: "Z-score vs 30-day baseline", interval_jitter: "Interval and jitter", first_seen: "First seen" };

export default function BaselinesPage() {
  const { outliers, inScope } = useHunter();
  return (
    <div>
      <PageHeader title="Baseline dashboards" lede="Eight statistical views over tenant telemetry. Rolling state lives in each tenant's git repo; this rendering is rebuilt from it. Confirming an outlier opens a hunt with the entity pre-loaded." />
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {dashboards.map((d) => {
          const open = outliers.filter((o) => o.dashboardId === d.id && o.confirmed === null && inScope(o.tenantId)).length;
          const last = d.series[d.series.length - 1];
          const spike = last > Math.max(...d.series.slice(0, -1)) * 1.4;
          return (
            <Link key={d.id} href={`/baselines/${d.id}`} className="panel hover:border-seam-2 transition-colors p-5 block">
              <div className="flex items-start justify-between gap-3">
                <div className="text-[14.5px] font-semibold tracking-[-0.01em] leading-snug">{d.name}</div>
                {open > 0 && <Badge tone="ember">{open} to review</Badge>}
              </div>
              <div className="text-[12.5px] text-muted mt-1 leading-relaxed min-h-[38px]">{d.description}</div>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <div className={cx("num text-[30px] font-semibold tracking-[-0.03em] leading-none", spike && "text-ember")}>{last}</div>
                  <div className="text-[11.5px] text-faint mt-1">flagged in the latest {d.cadence} refresh</div>
                </div>
                <Sparkline data={d.series} w={130} h={40} tone={spike ? "ember" : "ice"} highlightLast />
              </div>
              <div className="mt-4 pt-3 border-t border-seam flex items-center justify-between text-[11.5px] text-faint">
                <span>{techLabel[d.technique]}</span><span>refreshed {timeAgo(d.lastRefresh)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
