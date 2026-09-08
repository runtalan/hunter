"use client";
import { Send, FileText } from "lucide-react";
import { Badge, Button, PageHeader, Panel } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { analystById, tenantById } from "@/lib/data";
import { fmtDate, timeAgo } from "@/lib/format";

export default function ReportsPage() {
  const { reports, releaseReport, inScope } = useHunter();
  const rows = reports.filter((r) => inScope(r.tenantId));
  const drafts = rows.filter((r) => r.status === "draft");
  return (
    <div>
      <PageHeader title="Reports" lede="Generated from git history on each tenant's cadence. Customer Success reviews every draft before release. Nothing leaves the platform on its own." />
      {drafts.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {drafts.map((r) => {
            const t = tenantById(r.tenantId);
            return (
              <div key={r.id} className="panel p-5">
                <div className="flex items-center gap-2 mb-2"><Badge tone="ember" dot>Draft</Badge><span className="text-[12.5px] text-muted capitalize">{r.period} · {fmtDate(r.start)} to {fmtDate(r.end)}</span></div>
                <div className="text-[17px] font-semibold tracking-[-0.01em]">{t.name}</div>
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {[["Hunts", r.hunts], ["Detections", r.detections], ["LOTL decisions", r.lotlDispositions], ["Outliers", r.outliers]].map(([k, v]) => (
                    <div key={k as string}><div className="num text-[22px] font-semibold tracking-tight leading-none">{v}</div><div className="text-[11.5px] text-muted mt-1">{k}</div></div>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => releaseReport(r.id)}><Send size={13} /> Release to {t.leadContact}</Button>
                  <Button size="sm"><FileText size={13} /> Preview</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <Panel title="All reports">
        <table className="data">
          <thead><tr><th>Report</th><th>Tenant</th><th>Period</th><th>Hunts</th><th>Detections</th><th>Status</th><th>Released</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><span className="mono text-[12px] text-muted mr-2">{r.id}</span><span className="mono text-[12px] text-ice-2/80">{r.gitPath}</span></td>
                <td className="whitespace-nowrap">{tenantById(r.tenantId).name}</td>
                <td className="text-muted whitespace-nowrap capitalize">{r.period} · {fmtDate(r.start)} to {fmtDate(r.end)}</td>
                <td className="num">{r.hunts}</td><td className="num">{r.detections}</td>
                <td>{r.status === "released" ? <Badge tone="signal">Released</Badge> : <Badge tone="ember" dot>Draft</Badge>}</td>
                <td className="text-faint text-[12px] whitespace-nowrap">{r.releasedAt ? `${analystById(r.releasedBy)?.name} · ${timeAgo(r.releasedAt)}` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
