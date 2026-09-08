"use client";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Button, HealthDot, Maturity, PageHeader, Panel } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { maturityLabel, mcpServers, tenants, vendorLabel } from "@/lib/data";
import { fmtDate, fmtNum } from "@/lib/format";

export default function TenantsPage() {
  const { inScope } = useHunter();
  const rows = tenants.filter((t) => inScope(t.id));
  const byLevel = [0, 1, 2, 3, 4].map((l) => tenants.filter((t) => t.maturity === l).length);
  return (
    <div>
      <PageHeader title="Tenants" lede="Each tenant is a git repository, a Kubernetes namespace, a Vault policy path, and its own MCP servers. Onboarding is one Terraform apply." actions={<Button variant="primary"><Plus size={15} /> Onboard tenant</Button>} />
      <div className="panel px-5 py-4 mb-6 flex flex-wrap items-center gap-x-8 gap-y-3">
        <div className="text-[12.5px] text-muted">Maturity across all tenants</div>
        {byLevel.map((n, l) => (
          <div key={l} className="flex items-center gap-2.5">
            <Maturity level={l} compact />
            <span className="text-[13px]">{maturityLabel[l]}</span>
            <span className="num text-[13px] text-muted">{n}</span>
          </div>
        ))}
      </div>
      <Panel>
        <table className="data">
          <thead><tr><th>Tenant</th><th>Maturity</th><th>Status</th><th>Endpoints</th><th>Data plane</th><th>Hunts / month</th><th>Open findings</th><th>Onboarded</th></tr></thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.id}>
                <td><Link href={`/tenants/${t.slug}`} className="hover:text-ice font-medium">{t.name}</Link><div className="text-[12px] text-faint">{t.industry} · <span className="mono">{t.repo}</span></div></td>
                <td><Maturity level={t.maturity} /> <span className="text-[12px] text-muted ml-1">{maturityLabel[t.maturity]}</span></td>
                <td>{t.status === "pilot" ? <Badge tone="ice">Pilot</Badge> : <Badge tone="signal">Active</Badge>}</td>
                <td className="num">{fmtNum(t.endpoints)}</td>
                <td><div className="flex flex-col gap-1">{mcpServers.filter((s) => s.tenantId === t.id).map((s) => <span key={s.id} className="inline-flex items-center gap-1.5 text-[12.5px]"><HealthDot health={s.health} />{vendorLabel[s.vendor]}</span>)}</div></td>
                <td className="num">{t.huntsThisMonth}</td>
                <td className="num">{t.openFindings}</td>
                <td className="text-faint text-[12px] whitespace-nowrap">{fmtDate(t.onboardedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
