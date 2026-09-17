# Contributing to Hunter

Hunter is a local-first UI prototype. Contributors work on the interface and scripted flows locally, then submit pull requests on GitHub. Production deployment is handled separately by the project owner; contributors do not need Vercel access.

## Prerequisites

- Node.js compatible with the installed Next.js version
- npm

## Start locally

```bash
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000). There are no required API keys, databases, backend services, or `.env` values. If port 3000 is busy, Next.js will offer another local port.

## Validate a change

Use the browser to test the route or flow you changed, including the relevant navigation and interactive states. Then run:

```bash
npm run lint
npm run build
```

The prototype stores interactive state in memory, so a browser refresh returns it to the seeded demo state. There is no persistent test data to clean up.

## Pull requests

Keep PRs small and focused. Include:

- What changed and why
- Routes and flows tested locally
- `npm run lint` and `npm run build` results
- Screenshots or a short recording for visual/flow changes when useful

Avoid committing secrets, `.env` files, generated `.next` output, or Vercel credentials. Do not modify deployment settings unless the project owner requests it.

## Code map

See `CLAUDE.md` for the preferred locations for routes, components, seeded data, client state, and global styling.
