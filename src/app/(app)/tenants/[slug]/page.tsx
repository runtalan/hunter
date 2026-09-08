import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Crosshair } from "lucide-react";
import { Badge, Button, Code, HealthDot, KV, Maturity, Panel } from "@/components/ui";
import { Outcome } from "@/components/ui/domain";
import { hunts, lotlFindings, maturityHint, maturityLabel, mcpServers, tenants, vendorLabel, analystById, detections } from "@/lib/data";
import { fmtDate, fmtNum, timeAgo, cx } from "@/lib/format";

export default async function TenantDetail({ params }: PageProps<"/tenants/[slug]">) {
  const { slug } = await params;
  const t = tenants.find((x) => x.slug === slug);
  if (!t) notFound();
  const servers = mcpServers.filter((s) => s.tenantId === t.id);
  const th = hunts.filter((h) => h.tenantId === t.id);
  const open = lotlFindings.filter((f) => f.tenantId === t.id && f.disposition === "open").length;
  const rules = detections.filter((d) => d.tenantId === t.id).length;
  const agents = `# AGENTS.md — ${t.repo}

## Environment
${t.vendors.map((v, i) => `- ${i === 0 ? "EDR" : "SIEM"}: ${vendorLabel[v]} (mcp-server-${v}, ${t.repo} namespace)`).join("\n")}
- Maturity level: ${t.maturity} (${maturityLabel[t.maturity]})

## Known-benign patterns
${t.slug === "acme" ? "- ScreenConnect is the contracted RMM tool, see context/approved-software.yml\n- Nightly backup job drives high outbound volume to backup-vendor.example" : t.slug === "stark" ? "- Scheduled CRL refresh on jump hosts uses certutil -urlcache against internal PKI" : "- None recorded yet"}

## Escalation contacts
- Primary: ${t.leadContact}
- Customer Success: cs-team@novacoast.com`;
  return (
    <div>
      <Link href="/tenants" className="text-[12.5px] text-muted hover:text-text inline-flex items-center gap-1 mb-4"><ChevronLeft size={14} /> Tenants</Link>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">{t.status === "pilot" ? <Badge tone="ice">Pilot</Badge> : <Badge tone="signal">Active</Badge>}<span className="text-[12.5px] text-muted">{t.industry} · {fmtNum(t.endpoints)} endpoints</span></div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em]">{t.name}</h1>
        </div>
        <Link href="/hunt"><Button variant="primary"><Crosshair size={14} /> Hunt in {t.name.split(" ")[0]}</Button></Link>
      </div>

      <div className="panel p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[14.5px] font-semibold">Maturity</div>
          <Maturity level={t.maturity} />
        </div>
        <ol className="grid grid-cols-5 gap-2">
          {maturityLabel.map((l, i) => (
            <li key={l} className={cx("rounded-[10px] border px-3 py-2.5", i === t.maturity ? "border-ice/40 bg-ice/8" : i < t.maturity ? "border-seam bg-hull/50" : "border-seam/60 opacity-60")}>
              <div className="flex items-center gap-2 text-[13px] font-medium"><span className={cx("num", i <= t.maturity ? (t.maturity === 4 ? "text-signal" : "text-ice") : "text-faint")}>{i}</span>{l}</div>
              <div className="text-[11.5px] text-muted mt-1 leading-snug">{maturityHint[i]}</div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <Panel title="Hunts" meta={`${th.length} on record`}>
            {th.length === 0 ? <div className="px-5 pb-5 text-[13px] text-muted">No hunts yet. This tenant has a repository but no hunt records.</div> : (
              <table className="data"><tbody>
                {th.map((h) => (
                  <tr key={h.id}><td><Link href={`/hunts/${h.id}`} className="hover:text-ice"><span className="mono text-[12px] text-muted mr-2">{h.id}</span>{h.title}</Link></td><td><Outcome o={h.outcome} status={h.status} /></td><td className="text-muted whitespace-nowrap">{analystById(h.analystId)?.name}</td><td className="text-faint text-[12px] whitespace-nowrap">{timeAgo(h.createdAt)}</td></tr>
                ))}
              </tbody></table>
            )}
          </Panel>
          <Panel title="Context" meta={`${t.repo}/context/AGENTS.md`}><div className="px-4 pb-4"><Code>{agents}</Code></div></Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Data plane" meta={`namespace ${t.repo}`}>
            <ul className="px-5 pb-4 space-y-3">
              {servers.map((s) => (
                <li key={s.id} className="flex items-start gap-2.5 text-[13px]">
                  <HealthDot health={s.health} />
                  <div className="flex-1 -mt-1">
                    <div>{vendorLabel[s.vendor]}</div>
                    <div className="text-[12px] text-muted mono">mcp-server-{s.vendor} · contract {s.contractVersion}</div>
                  </div>
                  <span className="num text-[12px] text-faint">{s.health === "down" ? "down" : s.health === "unknown" ? "unknown" : `${s.latencyMs} ms`}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Details">
            <div className="px-5 pb-5">
              <KV rows={[
                ["Repository", <span key="r" className="mono text-[12.5px]">{t.repo}</span>],
                ["Onboarded", fmtDate(t.onboardedAt)],
                ["Lead contact", t.leadContact],
                ["Open LOTL findings", String(open)],
                ["Tenant detections", String(rules)],
                ["Hunts this month", String(t.huntsThisMonth)],
              ]} />
            </div>
          </Panel>
          <Panel title="Isolation" quiet>
            <ul className="px-5 pb-5 text-[12.5px] text-muted space-y-1.5 leading-relaxed">
              <li>NetworkPolicy: default deny, ingress from platform-control only.</li>
              <li>Vault path <span className="mono text-ice-2/80">{`secret/${t.repo}/*`}</span> readable by <span className="mono text-ice-2/80">{t.repo}-sa</span> only.</li>
              <li>Row-level security scoped to this tenant id.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
