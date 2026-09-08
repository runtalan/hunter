"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { approvals as seedApprovals, lotlFindings as seedFindings, outliers as seedOutliers, reports as seedReports, tenants, currentAnalyst, type Approval, type LotlFinding, type Outlier, type Report } from "./data";

interface Store {
  scope: string[]; // tenant ids; empty = all tenants
  setScope: (ids: string[]) => void;
  toggleTenant: (id: string) => void;
  inScope: (tenantId: string) => boolean;
  approvals: Approval[];
  decide: (id: string, decision: "approved" | "denied") => void;
  findings: LotlFinding[];
  disposition: (id: string, d: LotlFinding["disposition"]) => void;
  outliers: Outlier[];
  confirmOutlier: (id: string, confirmed: boolean) => void;
  reports: Report[];
  releaseReport: (id: string) => void;
  toasts: Toast[];
  toast: (msg: string, kind?: Toast["kind"]) => void;
}
export interface Toast { id: number; msg: string; kind: "ok" | "warn" | "info" }

const Ctx = createContext<Store | null>(null);

export function HunterProvider({ children }: { children: ReactNode }) {
  const [scope, setScope] = useState<string[]>([]);
  const [approvals, setApprovals] = useState(seedApprovals);
  const [findings, setFindings] = useState(seedFindings);
  const [outliers, setOutliers] = useState(seedOutliers);
  const [reports, setReports] = useState(seedReports);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const now = () => new Date().toISOString();

  const value = useMemo<Store>(() => ({
    scope, setScope,
    toggleTenant: (id) => setScope((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])),
    inScope: (tenantId) => scope.length === 0 || scope.includes(tenantId),
    approvals,
    decide: (id, decision) => {
      setApprovals((a) => a.map((x) => (x.id === id ? { ...x, decision, decidedBy: currentAnalyst.id, decidedAt: now() } : x)));
      toast(decision === "approved" ? "Approved. Credential issued and action forwarded to the MCP gateway." : "Denied. Recorded in the audit log.", decision === "approved" ? "ok" : "warn");
    },
    findings,
    disposition: (id, d) => {
      setFindings((f) => f.map((x) => (x.id === id ? { ...x, disposition: d, dispositionedBy: currentAnalyst.id, dispositionedAt: now() } : x)));
      const label = { approved: "Approved. Added to approved-software.yml.", removed: "Marked removed. Overlay updated.", escalated: "Escalated. Hunt proposal sent for approval.", accepted_risk: "Accepted risk. Recorded in the overlay with a note.", open: "Reopened." }[d];
      toast(label, d === "escalated" ? "info" : "ok");
    },
    outliers,
    confirmOutlier: (id, confirmed) => {
      setOutliers((o) => o.map((x) => (x.id === id ? { ...x, confirmed } : x)));
      toast(confirmed ? "Confirmed. Hunt proposal queued for approval." : "Dismissed. Baseline tuning note committed.", confirmed ? "info" : "ok");
    },
    reports,
    releaseReport: (id) => {
      setReports((r) => r.map((x) => (x.id === id ? { ...x, status: "released", releasedBy: currentAnalyst.id, releasedAt: now() } : x)));
      toast("Released. Delivery queued to the customer contact.");
    },
    toasts, toast,
  }), [scope, approvals, findings, outliers, reports, toasts, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHunter() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useHunter outside provider");
  return v;
}

export const allTenants = tenants;
