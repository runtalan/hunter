"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Trash2, ArrowUpRight, ShieldOff, ChevronRight } from "lucide-react";
import { Badge, Button, Code, Empty, PageHeader, Panel, Segmented } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { analystById, lotlCategories, tenantById, type LotlFinding } from "@/lib/data";
import { cx, timeAgo } from "@/lib/format";

const dispTone = { open: "ember", approved: "signal", removed: "muted", escalated: "flare", accepted_risk: "ice" } as const;
const dispLabel = { open: "Open", approved: "Approved", removed: "Removed", escalated: "Escalated", accepted_risk: "Accepted risk" };

export default function LotlPage() {
  const { inScope, findings, disposition } = useHunter();
  const [f, setF] = useState<"open" | "all">("open");
  const [sel, setSel] = useState<string | null>(null);
  const rows = findings.filter((x) => inScope(x.tenantId)).filter((x) => f === "all" || x.disposition === "open");
  const active = findings.find((x) => x.id === sel) ?? rows[0];
  const openCount = findings.filter((x) => inScope(x.tenantId) && x.disposition === "open").length;
  return (
    <div>
      <PageHeader title="LOTL findings" lede="Scheduled scans match tenant telemetry against the shared living-off-the-land taxonomy and diff it against each tenant's approved-software overlay. Nothing is dispositioned without you." />
      <div className="mb-4 flex items-center justify-between"><Segmented value={f} onChange={setF} options={[{ value: "open", label: "Open", count: openCount }, { value: "all", label: "All" }]} /><span className="text-[12.5px] text-muted">Last scan completed 06:00 UTC across 6 tenants</span></div>
      <div className="grid lg:grid-cols-[1fr_420px] gap-6 items-start">
        <Panel>
          {rows.length === 0 ? <Empty title="No open findings in scope" hint="The next scheduled scan runs at 06:00 UTC. Widen the tenant scope to see more." /> : (
            <table className="data">
              <thead><tr><th>Finding</th><th>Category</th><th>Entity</th><th>Tenant</th><th>Seen</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {rows.map((x) => (
                  <tr key={x.id} onClick={() => setSel(x.id)} className={cx("clickable", active?.id === x.id && "bg-cobalt/10")}>
                    <td className="whitespace-nowrap"><span className="mono text-[12px] text-muted mr-2">{x.id}</span><span className="font-medium">{x.tool}</span></td>
                    <td className="text-muted whitespace-nowrap">{lotlCategories[x.category]}</td>
                    <td><div className="mono text-[12.5px]">{x.entity}</div><div className="mono text-[11.5px] text-faint">{x.user}</div></td>
                    <td className="text-muted whitespace-nowrap">{tenantById(x.tenantId).name}</td>
                    <td className="num text-muted whitespace-nowrap">{x.count}× · {timeAgo(x.lastSeen)}</td>
                    <td><Badge tone={dispTone[x.disposition]} dot={x.disposition === "open"}>{dispLabel[x.disposition]}</Badge></td>
                    <td className="text-faint"><ChevronRight size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>
        {active && <Detail x={active} onDispose={(d) => disposition(active.id, d)} />}
      </div>
    </div>
  );
}

function Detail({ x, onDispose }: { x: LotlFinding; onDispose: (d: LotlFinding["disposition"]) => void }) {
  const t = tenantById(x.tenantId);
  const open = x.disposition === "open";
  return (
    <Panel className="sticky top-24" title={x.tool} meta={lotlCategories[x.category]} action={<Badge tone={dispTone[x.disposition]}>{dispLabel[x.disposition]}</Badge>}>
      <div className="px-5 pb-5 space-y-4">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px]">
          <div><dt className="text-muted text-[12px]">Tenant</dt><dd>{t.name}</dd></div>
          <div><dt className="text-muted text-[12px]">Host</dt><dd className="mono text-[12.5px]">{x.entity}</dd></div>
          <div><dt className="text-muted text-[12px]">User</dt><dd className="mono text-[12.5px]">{x.user}</dd></div>
          <div><dt className="text-muted text-[12px]">Executions</dt><dd className="num">{x.count} since {timeAgo(x.firstSeen)}</dd></div>
        </dl>
        <Code label="Command line">{x.commandLine}</Code>
        <div className="text-[12.5px] text-muted leading-relaxed">
          {t.slug === "acme" && x.tool === "ScreenConnect" ? "ScreenConnect is Acme's contracted RMM per approved-software.yml." : `Not present in ${t.repo}/context/approved-software.yml.`}
        </div>
        {x.linkedHunt && <Link href={`/hunts/${x.linkedHunt}`} className="text-[12.5px] text-ice inline-flex items-center gap-1">Linked hunt {x.linkedHunt} <ArrowUpRight size={12} /></Link>}
        {open ? (
          <div className="pt-1">
            <div className="text-[12px] text-muted mb-2">Disposition</div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="signal" onClick={() => onDispose("approved")}><Check size={14} /> Approve</Button>
              <Button onClick={() => onDispose("removed")}><Trash2 size={14} /> Removed</Button>
              <Button variant="danger" onClick={() => onDispose("escalated")}><ArrowUpRight size={14} /> Escalate to hunt</Button>
              <Button onClick={() => onDispose("accepted_risk")}><ShieldOff size={14} /> Accept risk</Button>
            </div>
            <p className="text-[11.5px] text-faint mt-3 leading-relaxed">Approve writes the tool to the tenant's allowlist. Escalate opens a hunt proposal that goes through the approval queue.</p>
          </div>
        ) : (
          <div className="text-[12.5px] text-muted border-t border-seam pt-3">Dispositioned by {analystById(x.dispositionedBy)?.name} {x.dispositionedAt && timeAgo(x.dispositionedAt)}. <button onClick={() => onDispose("open")} className="text-ice">Reopen</button></div>
        )}
      </div>
    </Panel>
  );
}
