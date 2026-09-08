"use client";
import { RefreshCw } from "lucide-react";
import { Badge, Button, HealthDot, PageHeader, Panel } from "@/components/ui";
import { useHunter } from "@/lib/store";
import { mcpServers, tenantById, vendorLabel } from "@/lib/data";
import { timeAgo } from "@/lib/format";

const tools = ["telemetry.query", "telemetry.enrich", "intel.lookup", "detection.list", "detection.deploy", "case.create"];

export default function ServersPage() {
  const { inScope, toast } = useHunter();
  const rows = mcpServers.filter((s) => inScope(s.tenantId));
  const supported = "1.0.x";
  return (
    <div>
      <PageHeader title="MCP servers" lede="One server per tenant per vendor, each in its own namespace with only that tenant's credential. Every server implements the same six-tool contract." actions={<Button onClick={() => toast("Conformance suite queued against 10 servers.", "info")}><RefreshCw size={14} /> Run conformance suite</Button>} />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
        <Panel>
          <table className="data">
            <thead><tr><th>Server</th><th>Tenant</th><th>Namespace</th><th>Contract</th><th>Health</th><th>Latency</th><th>Checked</th></tr></thead>
            <tbody>
              {rows.map((s) => {
                const outdated = !s.contractVersion.startsWith("1.0");
                return (
                  <tr key={s.id}>
                    <td><div className="font-medium">{vendorLabel[s.vendor]}</div><div className="mono text-[11.5px] text-faint">mcp-server-{s.vendor}</div></td>
                    <td className="text-muted whitespace-nowrap">{tenantById(s.tenantId).name}</td>
                    <td className="mono text-[12px] text-muted">{s.namespace}</td>
                    <td><span className="mono text-[12px]">{s.contractVersion}</span>{outdated && <Badge tone="ember" className="ml-2">Needs upgrade</Badge>}</td>
                    <td><span className="inline-flex items-center gap-2 capitalize"><HealthDot health={s.health} />{s.health}</span></td>
                    <td className="num text-muted">{s.latencyMs ? `${s.latencyMs} ms` : "—"}</td>
                    <td className="text-faint text-[12px] whitespace-nowrap">{timeAgo(s.lastCheck)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
        <div className="space-y-6">
          <Panel title="Tool contract" meta={`platform supports ${supported}`}>
            <ul className="px-5 pb-4 space-y-2">
              {tools.map((t) => {
                const gated = !["intel.lookup", "detection.list"].includes(t);
                const write = t === "detection.deploy" || t === "case.create";
                return (
                  <li key={t} className="flex items-center gap-2 text-[13px]">
                    <span className="mono text-[12.5px] text-ice-2 flex-1">{t}</span>
                    <Badge tone={write ? "flare" : "muted"}>{write ? "write" : "read"}</Badge>
                    {gated ? <Badge tone="ember">gated</Badge> : <Badge tone="signal">open</Badge>}
                  </li>
                );
              })}
            </ul>
          </Panel>
          <Panel title="Onboarding a vendor" quiet>
            <ol className="px-5 pb-5 text-[12.5px] text-muted space-y-1.5 leading-relaxed list-decimal list-inside">
              <li>Implement all six tools against the vendor's API.</li>
              <li>Pass the contract conformance suite.</li>
              <li>Register through the tenant registry.</li>
            </ol>
            <p className="px-5 pb-5 -mt-2 text-[12px] text-faint">No orchestrator, data model, or tenant change required.</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
