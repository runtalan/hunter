"use client";
import { Badge } from "./index";

export const actionLabel: Record<string, string> = { telemetry_query: "Query", detection_deploy: "Deploy", report_release: "Release", hunt_promotion: "Promote", case_create: "Case" };
export const componentLabel: Record<string, string> = { orchestrator: "Orchestrator", detection_compiler: "Detection compiler", lotl_engine: "LOTL engine", dashboard_service: "Baseline service", reporting_service: "Reporting service", approval_service: "Approval service", git_gateway: "Git gateway", credential_broker: "Credential broker", mcp_gateway: "MCP gateway" };

export function GateBar({ type }: { type: string }) {
  const c = type === "detection_deploy" || type === "case_create" ? "bg-flare" : type === "report_release" ? "bg-cobalt" : "bg-ember";
  return <span className={"w-1 self-stretch rounded-full shrink-0 " + c} />;
}

export function Outcome({ o, status }: { o: string | null; status: string }) {
  if (status === "open") return <Badge tone="ice" dot>Open</Badge>;
  if (o === "true_positive") return <Badge tone="flare">True positive</Badge>;
  if (o === "false_positive") return <Badge tone="signal">False positive</Badge>;
  return <Badge>Inconclusive</Badge>;
}

export function Level({ level }: { level: string }) {
  const tone = level === "critical" ? "flare" : level === "high" ? "ember" : level === "medium" ? "ice" : "muted";
  return <Badge tone={tone}>{level[0].toUpperCase() + level.slice(1)}</Badge>;
}

export function Origin({ origin }: { origin: string }) {
  return <Badge>{origin === "lotl" ? "LOTL" : origin === "dashboard" ? "Baseline" : "Hypothesis"}</Badge>;
}
