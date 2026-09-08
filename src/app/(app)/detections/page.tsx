"use client";
import Link from "next/link";
import { useState } from "react";
import { GitPullRequest, Plus } from "lucide-react";
import { Badge, Button, PageHeader, Panel, Segmented } from "@/components/ui";
import { Level } from "@/components/ui/domain";
import { useHunter } from "@/lib/store";
import { detections, tenantById } from "@/lib/data";
import { timeAgo, cx } from "@/lib/format";

const stateCls: Record<string, string> = { deployed: "bg-signal", pending: "bg-ember", failed: "bg-flare", not_deployed: "bg-seam-2" };

export default function DetectionsPage() {
  const { inScope } = useHunter();
  const [f, setF] = useState<"all" | "core" | "tenant" | "pending">("all");
  const rows = detections.filter((d) => d.scope === "core" || inScope(d.tenantId!)).filter((d) => f === "all" || (f === "pending" ? d.backends.some((b) => b.state === "pending" || b.state === "failed") : d.scope === f));
  return (
    <div>
      <PageHeader title="Detections" lede="Sigma rules compiled per backend with pySigma. Core rules are inheritable by any tenant. Tenant rules deploy to that tenant's platform only after backtest and approval." actions={<Button variant="primary"><Plus size={15} /> New Sigma rule</Button>} />
      <div className="mb-4"><Segmented value={f} onChange={setF} options={[{ value: "all", label: "All", count: rows.length }, { value: "core", label: "Core library" }, { value: "tenant", label: "Tenant rules" }, { value: "pending", label: "Needs attention" }]} /></div>
      <Panel>
        <table className="data">
          <thead><tr><th>Rule</th><th>Scope</th><th>Level</th><th>Status</th><th>Backends</th><th>Backtest</th><th>Source</th><th>Updated</th></tr></thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id}>
                <td><Link href={`/detections/${d.id}`} className="hover:text-ice">{d.title}</Link><div className="mono text-[11.5px] text-faint mt-0.5">{d.id} · {d.technique}</div></td>
                <td>{d.scope === "core" ? <Badge tone="cobalt">Core</Badge> : <span className="text-muted whitespace-nowrap">{tenantById(d.tenantId!).name}</span>}</td>
                <td><Level level={d.level} /></td>
                <td className="text-muted capitalize">{d.status}</td>
                <td>
                  <div className="flex gap-1.5">
                    {d.backends.map((b) => (
                      <span key={b.backend} className="inline-flex items-center gap-1.5 text-[12px] mono" title={`${b.backend}: ${b.state.replace("_", " ")}`}>
                        <span className={cx("h-1.5 w-1.5 rounded-full", stateCls[b.state])} />{b.backend}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="num">{d.backtestCount === null ? <span className="text-faint">—</span> : <span className={d.backtestCount > 20 ? "text-ember" : ""}>{d.backtestCount} / 30d</span>}</td>
                <td>{d.sourceHunt ? <Link href={`/hunts/${d.sourceHunt}`} className="mono text-[12px] text-ice">{d.sourceHunt}</Link> : <span className="text-faint">—</span>}{d.pr && <span className="text-[12px] text-muted ml-2 inline-flex items-center gap-1"><GitPullRequest size={12} />#{d.pr}</span>}</td>
                <td className="text-faint text-[12px] whitespace-nowrap">{timeAgo(d.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
