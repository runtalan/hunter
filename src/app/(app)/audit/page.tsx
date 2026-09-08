"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button, PageHeader, Panel } from "@/components/ui";
import { componentLabel } from "@/components/ui/domain";
import { useHunter } from "@/lib/store";
import { analystById, auditLog, tenantById } from "@/lib/data";
import { fmtDateTime, cx } from "@/lib/format";

const actionTone = (a: string) => a.includes("credential") ? "text-ember" : a.includes("down") || a.includes("denied") ? "text-flare" : a.includes("committed") || a.includes("released") || a.includes("executed") ? "text-signal" : "text-text";

export default function AuditPage() {
  const { inScope } = useHunter();
  const [q, setQ] = useState("");
  const rows = [...auditLog].sort((a, b) => b.at.localeCompare(a.at)).filter((e) => inScope(e.tenantId)).filter((e) => !q || JSON.stringify(e).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Audit log" lede="Append-only. Every tool call, credential issuance, approval decision, and git write, independent of what the assistant chose to summarize." actions={<Button><Download size={14} /> Export range</Button>} />
      <div className="mb-4 flex items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} className="input w-[360px] h-9" placeholder="Filter by action, component, tool, or hash" />
        <span className="text-[12.5px] text-muted">{rows.length} events · retained 1 year · partitioned monthly</span>
      </div>
      <Panel>
        <table className="data">
          <thead><tr><th>Time</th><th>Tenant</th><th>Analyst</th><th>Component</th><th>Action</th><th>Tool</th><th>Request hash</th><th>Approval</th></tr></thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td className="mono text-[12px] text-muted whitespace-nowrap">{fmtDateTime(e.at)}</td>
                <td className="text-muted whitespace-nowrap">{tenantById(e.tenantId).name}</td>
                <td className="text-muted whitespace-nowrap">{analystById(e.analystId)?.name ?? <span className="text-faint">system</span>}</td>
                <td className="text-muted">{componentLabel[e.component] ?? e.component}</td>
                <td className={cx("mono text-[12.5px]", actionTone(e.action))}>{e.action}</td>
                <td className="mono text-[12px] text-ice-2/80">{e.tool ?? ""}</td>
                <td className="mono text-[12px] text-faint">{e.requestHash}</td>
                <td className="mono text-[12px] text-faint">{e.approvalId ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
