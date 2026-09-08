# Hunter

Hunt from the prompt. An agentic threat hunting console by Novacoast.

This is a **UI prototype** for functional testing. There is no backend, no AI, and no database. Every screen is driven by seeded, in-memory data in `src/lib/data.ts`, and interactive actions (approvals, LOTL dispositions, outlier confirmation, report release, the hunt session itself) mutate client state only. Refresh the page to reset.

## What is here

| Route | Screen |
|---|---|
| `/login` | Sign-in with the brand hero (OIDC placeholders) |
| `/` | Overview: pending approvals, open findings, outliers, tenants, data-plane health |
| `/hunt` | Hunt from the prompt. Scripted LOCK session with approval gates, per-tenant fan-out lanes, credential issuance, results, enrich under a standing grant, and the Keep card that commits the hunt record |
| `/hunts`, `/hunts/[id]` | Hunt record index and the LOCK record detail |
| `/detections`, `/detections/[id]` | Sigma library (core and tenant), compiled backends, backtest, deploy state |
| `/lotl` | LOTL findings triage with the four dispositions |
| `/baselines`, `/baselines/[id]` | The eight baseline dashboards and their outliers |
| `/approvals` | The single approval queue for every gated action |
| `/reports` | Per-tenant drafts and released reports |
| `/tenants`, `/tenants/[slug]` | Tenant registry, maturity model, AGENTS.md, isolation |
| `/servers` | MCP server registry and the six-tool contract |
| `/audit` | Append-only audit log |

Tenant scope is selected in the top bar and filters every screen. Empty scope means all tenants, and the Hunt screen fans out one lane per tenant.

## Design system

Tokens live in `src/app/globals.css`. Palette: abyss `#060B16`, trench `#0B1424`, hull `#111C30`, seam `#1B2A45`, ice `#8FD0FF`, cobalt `#2F6BFF`, signal `#35E0C2`, flare `#FF6B7A`, ember `#FFC24B`. Type: Manrope for UI, IBM Plex Mono for telemetry, queries, and identifiers only.

Approval gates are the core object of the product and use a consistent language: ember for pending, flare for write actions (deploy, case), cobalt for release, signal for approved.

## Run

```bash
npm install
npm run dev
```

Build with `npm run build`. Deploys as a standard Next.js app on Vercel.

## Handoff notes

- `src/lib/store.tsx` is the only state. Replace it with real API calls; the shapes in `src/lib/data.ts` mirror the control-plane tables in the technical design document.
- `src/components/hunt/HuntSession.tsx` is a scripted simulation of the orchestrator. The message and lane types map to the tool-call envelope in the MCP contract.
- `src/components/ui/index.tsx` holds the primitives (Badge, Button, Panel, Stat, Sparkline, Maturity, Code, Segmented).
