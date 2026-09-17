@AGENTS.md

# Hunter contributor notes

## Goal

This repository is a UI prototype for local development and functional testing. Keep changes focused on the interface, interaction flow, copy, styling, and seeded demo data unless the task explicitly asks for backend work.

## Local workflow

```bash
npm ci
npm run dev
```

Open http://localhost:3000. Use `npm run lint` and `npm run build` before opening a pull request. The app has no required environment variables or external services. Client-side state is seeded in `src/lib/data.ts` and held in `src/lib/store.tsx`; refreshing the browser resets the prototype state.

## Where to work

- Routes and screen composition: `src/app/**`
- Reusable UI primitives: `src/components/ui/**`
- App shell/navigation: `src/components/shell/**`
- Hunt simulation and flow: `src/components/hunt/HuntSession.tsx`
- Seeded demo records and types: `src/lib/data.ts`
- Client state/actions: `src/lib/store.tsx`
- Global design tokens and CSS: `src/app/globals.css`

## Collaboration boundaries

Do not add Vercel credentials, deployment configuration, secrets, or production integrations. Local changes should be submitted as GitHub pull requests for review. Keep unrelated files and existing user changes intact. When changing a flow, test the full path in the browser and mention the route(s) tested in the PR.

## Next.js

This project uses Next.js 16 App Router. Read the relevant guide under `node_modules/next/dist/docs/` before changing framework conventions. Prefer the existing patterns in the repository and keep client-only state in components already marked with `"use client"`.
