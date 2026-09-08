# Hunter by Novacoast

**See beyond the signal.** A dark navy, interactive UI design prototype for an agentic threat hunting platform.

This is the design-stage deliverable: ten linked screens, a unique SVG brand mark, seeded operational data, and clickable analyst workflows. It is intentionally lightweight vanilla JavaScript/CSS, ready to hand off for a Next.js implementation. No AI, database, authentication, vendor connections, or backend services.

## Run

```sh
npm ci
npm run dev
```

Open http://localhost:5173. Use `npm run build` for the static production bundle and `npm run preview` to inspect it.

## Review

Start a hunt on Overview, complete Learn → Observe → Check → Keep, then draft a detection. Try approval decisions, LOTL dispositions, baseline promotion, report release, tenant scoping, and audit export. Demo decisions persist in local storage; Settings → Reset demo restores the seed.

[Design and implementation handoff](docs/DESIGN.md) covers branding, tokens, screens, states, responsive behavior, limitations, and the next implementation phase.

## Vercel

Import `runtalan/hunter`, select Vite, build with `npm run build`, output `dist`. No environment variables required. A `vercel.json` config is included. This delivery prepares the prototype for hosting; it does not deploy a live site.

## Validation

Production build and JavaScript syntax checks pass. The connected browser was unavailable during authoring, so visual browser QA and responsive inspection remain outstanding. Functional DOM checks exercise core UI paths without a live browser. Charts, report summaries, and source examples are illustrative; the single-tenant hunt uses one fixed process-execution fixture regardless of prompt text.
