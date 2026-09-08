# Hunter — UI design handoff

Hunter by Novacoast is an analyst workspace for proactive threat hunting. Its brand promise is **See beyond the signal.** This repository is a clickable design reference, not the production application. Implement the production interface in Next.js / React / TypeScript using the TDD service contracts; preserve this prototype as a visual reference.

## Design direction

Precision after dark: near-black navy, dimensional blue surfaces, cool typography, generous space around decisions, and compact operational lists. The proprietary angular H mark joins two uprights with a directional cut. Avoid generic hooded hackers, circuit-board imagery, bright neon washes, orange, or purple. The radar graphic is decorative; it must never imply a live scan.

Hunter is the primary brand; “BY NOVACOAST” is a quiet endorsement. The wordmark uses lowercase **hunter**; product prose uses **Hunter**.

## Tokens

| Token | Value | Purpose |
|---|---|---|
| Canvas | `#080d17` | Main background |
| Navigation | `#0b111d` | Persistent workspace shell |
| Surface | `#101825` | Tables and panels |
| Border | `#202b3d` | Low-contrast structure |
| Primary text | `#e7edf7` | Titles and principal content |
| Secondary text | `#8795ad` | Supporting content |
| Accent | `#6b9fff` | Focus, links, selection |
| Primary action | `#83acff` on `#071326` | Deliberate next step |
| Success | `#65d8ba` | Completed or healthy state |
| Pending | `#e8c080` on `#342c22` | Human decision required |
| High severity | `#f29ea9` on `#38242e` | Investigate or deny |

Typography: Space Grotesk for wordmark, page headings, and metrics; DM Sans for interface text; monospace for event IDs and source snippets. Google Fonts are used with system fallbacks. Body 12–14 px; compact metadata 10–11 px; major headings 30 px. Reference desktop shell has a 222 px sidebar, 72 px top bar, and 38 px page padding. Panels use 9–12 px radius, controls 6–8 px. Spacing follows 4/8/12/16/20/24/32/40 px increments.

## Screen inventory

| Screen | Primary purpose | Interactive reference |
|---|---|---|
| Overview | Prompt entry, operating metrics, recent work | Start hunt; attention cards; tenant scope |
| Hunt workspace | Browse and conduct LOCK hunts | Hypothesis → Learn → Observe → approved simulation → Check → Keep |
| Approvals | Review scoped consequential actions | Inspect payload, approve/deny, deployment co-sign |
| LOTL findings | Review trusted-tool anomalies | Approved / Removed / Escalated / Accepted risk with rationale |
| Baselines | Eight statistical monitoring views | Open signal, inspect outlier, propose approval-gated hunt |
| Detections | Core/tenant rules and pipeline status | Inspect illustrative Sigma, adopt core rule as tenant draft |
| Tenants | Maturity, source health, context | Inspect context, enter tenant-scoped workspace |
| Reports | Customer Success review and release | Review summary, download, request release approval |
| Audit trail | Attributable operations history | Inspect events, search, export JSON |
| Settings | Analyst workspace and prototype controls | Reset seeded state; open this handoff |

## Interaction contracts

Global tenant scope is selected explicitly. Never infer it from prompt text. Scoped lists filter immediately. Changing scope exits the active prototype session. Production should warn about unsaved analyst notes before a scope change. Core detection library needs a separate tab so a selected tenant can still discover inheritable rules.

New hunt: require a hypothesis and an explicit tenant. Learn shows tenant context, known-benign software, recent history, and guardrails. Observe presents the exact tool, source, time window, query filters, and result limit. Approval and execution are separate states. Check presents normalized results, native references, and an analyst outcome. Keep requires evidence and saves the LOCK record. Detection promotion creates a draft PR; it does not merge or deploy.

Multi-tenant production extension: use explicit tenant checkboxes in the new-hunt dialog; show the selected count and vendors. Open one independently scoped lane per tenant, each with its own LOCK phase, approvals, results, errors, and git destination. An unresolved approval or failed connector in one lane must not block another. Never combine raw results across lanes. The clickable reference demonstrates the single-tenant lane only.

Approvals: show requester identity, tenant, action, proposed payload, bounded scope, backtest noise, and required approvers. Approve/deny decisions are terminal. In production, co-signers must authenticate individually; prototype checkboxes merely demonstrate the required UI. Report release must include full report preview and a release gate; no autonomous outbound communication.

LOTL: require analyst rationale for each disposition. Approved writes a tenant allowlist decision; Removed records verification of removal (never performs host remediation); Escalated creates a hunt-promotion approval; Accepted risk records rationale, accountable owner, and an expiration/review date in production. Promotion approval opens a hunt, whose query execution still requires separate approval.

Detections: source hunt → draft Sigma PR → human review/merge → compilation → backtest approval/query → deployment approval → per-backend deployment result. Core adoption creates a tenant draft. Show compile failures and native deployment errors inline, with scoped retry. Reference source snippets are illustrative rather than executable rule implementations.

Reports: draft → release request → authorized review → released. Production preview must render the actual report, scope, reporting dates, and included records; prototype summaries use fixed synthetic content. A denied release should return to draft with a reason and permit revised resubmission.

Audit: production is append-only and durable, linked to approval IDs and request/response hashes. Browser-local demo logs are neither secure nor immutable. Export must respect tenant and analyst grants.

## Baseline catalog

The TDD refers to eight dashboards without supplying the canonical program document. These labels are proposed design placeholders: rare process execution, outbound data volume, beaconing/periodicity, first-seen domains, authentication anomalies, privilege drift, rare parent-child processes, and new persistence mechanisms. Confirm IDs, techniques, query templates, and cadence with detection engineering before implementation.

Cards show technique, baseline window, refresh cadence, and outlier status. Drill-down needs a tenant-specific time series, observed value, historical distribution, freshness, entity, and rationale. The current charts are illustrative and do not recompute for a selected tenant.

## Responsive and accessible behavior

At 1150 px, stacked panels replace the overview's two columns. At 750 px, navigation becomes a toggleable drawer, metrics form a 2×2 grid, and cards become a single column. Wide operational tables retain horizontal scrolling. Keyboard users can activate drill-down rows with Enter/Space; dialogs use native focus management and Escape dismissal. Controls have labels and visible focus styles. Status always includes text, not color alone.

Production work: validate WCAG AA contrast (especially small muted metadata), increase touch targets to 44 px, use semantic row links/buttons instead of focusable rows, add loading announcements, ensure drawer focus containment, and test at 320/390/768/1440 px plus 200% zoom. Visual browser QA remains required before accepting the implementation.

## Required production states

- Loading: stable skeletons in metrics, lists, and detail views; do not show fake live values.
- Empty: explain whether no records exist or filters exclude them; offer the appropriate clear-filter/start-hunt action.
- Connector outage: identify affected tenant/source; preserve other tenant sessions; disable only dependent actions.
- Stale baseline: show last refresh and stale badge; do not present historical values as current.
- Query failure or zero results: show bounded request and outcome, retry through approval rules, retain audit reference.
- Unauthorized action: disabled action with policy reason and named required role; enforce on server.
- Expired approval/session: require fresh approval; do not silently reuse old authorization.
- Concurrent decision: refresh queue and show actual decider/time; disable duplicate submission.
- Git write failure: keep draft and offer retry; do not claim a committed record until a SHA exists.

## Implementation boundaries

The prototype has no AI, authentication, API, database, credential handling, vendor access, or real git/report operations. Local storage holds synthetic decisions. Counts derive from seeded lists; charts and report summaries are illustrative. No real security enforcement should be inferred from any badge. Persistent in-progress sessions, full multi-tenant fan-out, role-specific queues, actual compiled source, backtest execution, and backend failures belong to the next implementation phase.

Suggested React decomposition: AppShell, TenantScopeSelector, PageHeader, StatusBadge, MetricCard, HuntComposer, LOCKStepper, ScopedQueryProposal, EvidenceTable, ApprovalDetail, DispositionDialog, DetectionPipeline, BaselineCard, TenantContextPanel, ReportPreview, AuditEventDetail. Keep domain models and fixtures separate from component code. Connect adapters to the TDD `/v1` endpoints only after the design is accepted.

## Functional review script

1. Start from Overview; enter a hypothesis; explicitly select Acme Industries.
2. Review Learn; form a proposal; deny it and verify no results appear.
3. Form again; approve simulation; choose outcome and enter reasoning; save LOCK; download record.
4. Draft Sigma; verify Draft PR state rather than Deployed.
5. Open LOTL; escalate AnyDesk with rationale; review new hunt-promotion approval.
6. Review a deployment request; verify both sign-offs are required.
7. Inspect a draft report; request release; approve in queue; verify report status.
8. Change tenant; search/filter tables; inspect audit events and export.
9. Reset demo to replay.
