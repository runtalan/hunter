"use client";
import { useState } from "react";
import { Check, X, ChevronDown } from "lucide-react";
import { Badge, Button, Code, Empty, PageHeader, Panel, Segmented } from "@/components/ui";
import { actionLabel, componentLabel, GateBar } from "@/components/ui/domain";
import { useHunter } from "@/lib/store";
import { analystById, tenantById, type Approval } from "@/lib/data";
import { cx, timeAgo } from "@/lib/format";

const tierLabel = { sync: "Explicit, synchronous", batchable: "Batchable within a hunt", standing: "Standing session grant" };

export default function ApprovalsPage() {
  const { approvals, decide, inScope } = useHunter();
  const [f, setF] = useState<"pending" | "decided">("pending");
  const rows = approvals.filter((a) => inScope(a.tenantId)).filter((a) => (f === "pending" ? !a.decision : !!a.decision));
  const pendingCount = approvals.filter((a) => inScope(a.tenantId) && !a.decision).length;
  return (
    <div>
      <PageHeader title="Approvals" lede="One queue for every gated action: telemetry queries, detection deploys, report releases, and hunt promotions. The MCP gateway refuses anything without a matching approval." />
      <div className="mb-4"><Segmented value={f} onChange={setF} options={[{ value: "pending", label: "Pending", count: pendingCount }, { value: "decided", label: "Decided" }]} /></div>
      {rows.length === 0 ? <Panel><Empty title={f === "pending" ? "Queue is clear" : "No decisions yet"} hint={f === "pending" ? "Nothing in the selected scope is waiting on a person." : undefined} /></Panel> : (
        <div className="space-y-3">{rows.map((a) => <Card key={a.id} a={a} decide={decide} />)}</div>
      )}
    </div>
  );
}

function Card({ a, decide }: { a: Approval; decide: (id: string, d: "approved" | "denied") => void }) {
  const [open, setOpen] = useState(false);
  const t = tenantById(a.tenantId);
  const risky = a.actionType === "detection_deploy" || a.actionType === "case_create";
  return (
    <div className={cx("panel flex", a.decision && "opacity-80")}>
      <div className="pl-4 py-4 flex"><GateBar type={a.actionType} /></div>
      <div className="flex-1 min-w-0 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge tone={risky ? "flare" : a.actionType === "report_release" ? "cobalt" : "ember"}>{actionLabel[a.actionType]}</Badge>
              <span className="text-[12.5px] text-muted">{t.name} · {componentLabel[a.component]} · {timeAgo(a.requestedAt)}</span>
              {a.maturityRequired === 4 && <Badge tone="signal">Level 4 agent proposal</Badge>}
            </div>
            <div className="text-[14px] font-medium leading-snug">{a.summary}</div>
            <div className="text-[12.5px] text-muted mt-1">Requested by {a.requestedBy} · {tierLabel[a.tier]}{a.backtest !== undefined && <> · backtest <span className={cx("num", a.backtest > 20 ? "text-ember" : "text-signal")}>{a.backtest} findings / 30d</span></>}</div>
            {t.slug === "acme" && a.actionType === "detection_deploy" && <div className="text-[12.5px] text-ember mt-1">Requires co-sign from Acme's named IT contact (tenant-acme-deploy-cosign.rego).</div>}
          </div>
          {a.decision ? (
            <div className="text-right shrink-0">
              <Badge tone={a.decision === "approved" ? "signal" : "flare"}>{a.decision === "approved" ? "Approved" : "Denied"}</Badge>
              <div className="text-[11.5px] text-faint mt-1">{analystById(a.decidedBy)?.name} · {a.decidedAt && timeAgo(a.decidedAt)}</div>
            </div>
          ) : (
            <div className="flex gap-1.5 shrink-0">
              <Button size="sm" variant="ghost" onClick={() => decide(a.id, "denied")}><X size={13} /> Deny</Button>
              <Button size="sm" variant={risky ? "danger" : "primary"} onClick={() => decide(a.id, "approved")}><Check size={13} /> Approve</Button>
            </div>
          )}
        </div>
        <button onClick={() => setOpen((o) => !o)} className="mt-2.5 text-[12px] text-muted hover:text-text inline-flex items-center gap-1"><ChevronDown size={13} className={cx("transition-transform", open && "rotate-180")} /> Action payload</button>
        {open && <div className="mt-2"><Code label={a.id}>{JSON.stringify(a.payload, null, 2)}</Code></div>}
      </div>
    </div>
  );
}
