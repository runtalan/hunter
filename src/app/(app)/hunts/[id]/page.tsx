import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, GitCommitHorizontal, ShieldCheck } from "lucide-react";
import { Badge, Button, KV, Panel } from "@/components/ui";
import { Origin, Outcome } from "@/components/ui/domain";
import { analystById, approvals, detectionById, huntById, tenantById } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";

export default async function HuntDetail({ params }: PageProps<"/hunts/[id]">) {
  const { id } = await params;
  const h = huntById(id);
  if (!h) notFound();
  const t = tenantById(h.tenantId);
  const det = h.promotedTo ? detectionById(h.promotedTo) : undefined;
  const related = approvals.filter((a) => a.tenantId === h.tenantId && a.decision);
  return (
    <div>
      <Link href="/hunts" className="text-[12.5px] text-muted hover:text-text inline-flex items-center gap-1 mb-4"><ChevronLeft size={14} /> Hunt records</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2"><span className="mono text-[13px] text-muted">{h.id}</span><Origin origin={h.origin} /><Outcome o={h.outcome} status={h.status} /></div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] max-w-[40ch] leading-tight">{h.title}</h1>
        </div>
        <div className="flex gap-2">
          {!h.promotedTo && <Link href="/detections"><Button variant="primary"><ShieldCheck size={14} /> Promote to detection</Button></Link>}
          <Button>Open in git</Button>
        </div>
      </div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <Panel title="Hypothesis"><p className="px-5 pb-5 text-[14px] leading-relaxed max-w-[75ch]">{h.hypothesis}</p></Panel>
          <Panel title="LOCK record">
            <ol className="divide-y divide-seam/70">
              {(["learn", "observe", "check", "keep"] as const).map((p) => (
                <li key={p} className="grid grid-cols-[96px_1fr] gap-4 px-5 py-4">
                  <div className="text-[13px] font-medium capitalize text-ice">{p}</div>
                  <p className="text-[13.5px] leading-relaxed text-text/90 max-w-[70ch]">{h.lock[p]}</p>
                </li>
              ))}
            </ol>
          </Panel>
          <Panel title="Approved actions in this hunt" meta="from the approval service">
            <ul className="divide-y divide-seam/70">
              {related.map((a) => (
                <li key={a.id} className="px-5 py-3 flex items-center gap-3 text-[13px]">
                  <Badge tone={a.decision === "approved" ? "signal" : "flare"}>{a.decision}</Badge>
                  <span className="flex-1 truncate">{a.summary}</span>
                  <span className="mono text-[11.5px] text-faint">{a.id}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Details">
            <div className="px-5 pb-5">
              <KV rows={[
                ["Tenant", <Link key="t" href={`/tenants/${t.slug}`} className="text-ice">{t.name}</Link>],
                ["Analyst", analystById(h.analystId)?.name],
                ["Technique", <span key="tq" className="mono text-[12.5px]">{h.technique}</span>],
                ["Queries", String(h.queries)],
                ["Hosts touched", String(h.hostsTouched)],
                ["Opened", fmtDateTime(h.createdAt)],
                ["Closed", h.closedAt ? fmtDateTime(h.closedAt) : "Still open"],
              ]} />
            </div>
          </Panel>
          <Panel title="In git" quiet>
            <div className="px-5 pb-5 text-[12.5px] space-y-2">
              <div className="mono break-all text-ice-2/90">{h.gitPath}</div>
              <div className="flex items-center gap-1.5 text-muted"><GitCommitHorizontal size={13} /> <span className="mono">{h.commit}</span> on {t.repo}</div>
            </div>
          </Panel>
          {det && (
            <Panel title="Promoted detection" quiet>
              <div className="px-5 pb-5 text-[13px]">
                <Link href={`/detections/${det.id}`} className="text-ice hover:underline">{det.title}</Link>
                <div className="text-muted text-[12.5px] mt-1">PR #{det.pr} · backtest {det.backtestCount} findings</div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
