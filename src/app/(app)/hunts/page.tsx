"use client";
import Link from "next/link";
import { useState } from "react";
import { Crosshair } from "lucide-react";
import { Badge, Button, PageHeader, Panel, Segmented } from "@/components/ui";
import { Origin, Outcome } from "@/components/ui/domain";
import { useHunter } from "@/lib/store";
import { analystById, hunts, tenantById } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export default function HuntsPage() {
  const { inScope } = useHunter();
  const [f, setF] = useState<"all" | "open" | "tp" | "promoted">("all");
  const rows = hunts.filter((h) => inScope(h.tenantId)).filter((h) => f === "all" || (f === "open" && h.status === "open") || (f === "tp" && h.outcome === "true_positive") || (f === "promoted" && h.promotedTo));
  return (
    <div>
      <PageHeader title="Hunt records" lede="Every hunt is a LOCK-formatted markdown file committed to the tenant's repository. This list is an index over git." actions={<Link href="/hunt"><Button variant="primary"><Crosshair size={15} /> Start a hunt</Button></Link>} />
      <div className="mb-4"><Segmented value={f} onChange={setF} options={[{ value: "all", label: "All", count: hunts.filter((h) => inScope(h.tenantId)).length }, { value: "open", label: "Open" }, { value: "tp", label: "True positives" }, { value: "promoted", label: "Promoted to detection" }]} /></div>
      <Panel>
        <table className="data">
          <thead><tr><th>Hunt</th><th>Tenant</th><th>Origin</th><th>Technique</th><th>Queries</th><th>Hosts</th><th>Outcome</th><th>Analyst</th><th>Created</th></tr></thead>
          <tbody>
            {rows.map((h) => (
              <tr key={h.id}>
                <td><Link href={`/hunts/${h.id}`} className="hover:text-ice"><span className="mono text-[12px] text-muted mr-2">{h.id}</span>{h.title}</Link></td>
                <td className="text-muted whitespace-nowrap">{tenantById(h.tenantId).name}</td>
                <td><Origin origin={h.origin} /></td>
                <td className="mono text-[12px] text-muted">{h.technique}</td>
                <td className="num">{h.queries}</td>
                <td className="num">{h.hostsTouched}</td>
                <td><div className="flex gap-1.5"><Outcome o={h.outcome} status={h.status} />{h.promotedTo && <Badge tone="cobalt">Sigma</Badge>}</div></td>
                <td className="text-muted whitespace-nowrap">{analystById(h.analystId)?.name}</td>
                <td className="text-faint text-[12px] whitespace-nowrap">{timeAgo(h.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
