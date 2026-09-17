# Contributing to Hunter

Hunter is a local-first UI prototype. Contributors work on the interface and scripted flows locally, then submit pull requests on GitHub. Production deployment is handled separately by the project owner; contributors do not need Vercel access.

## Quick setup for Alex

1. Open the project repository: <https://github.com/runtalan/hunter>.
2. Click **Fork** and create the fork under `alexbecerra711-ux`.
3. Install [Node.js](https://nodejs.org/) (the current LTS version) and Git.
4. In Terminal, clone the fork and enter the project:

   ```bash
   git clone https://github.com/alexbecerra711-ux/hunter.git
   cd hunter
   npm ci
   npm run dev
   ```

5. Open <http://localhost:3000> in a browser. The app is a seeded UI prototype; no database, API keys, `.env` file, Vercel account, or other services are needed.

Claude Code can work in the cloned `hunter` folder. VSCode can open it with **File → Open Folder**. Ask Claude to change the UI, copy, seeded data, or scripted flow and to keep the change focused.

To stop the local server, press `Ctrl+C` in Terminal. Refreshing the browser resets interactive demo state.

## Submit a change for review

From the project folder, create a branch, make the change, and run the checks:

```bash
git switch -c describe-your-change
npm run lint
npm run build
git status
git add .
git commit -m "Describe the change"
git push -u origin describe-your-change
```

Then open <https://github.com/alexbecerra711-ux/hunter> on GitHub. Click **Compare & pull request**, set the base repository to `runtalan/hunter`, base branch to `main`, and submit the pull request. In the description, include what changed, which routes/flows were tested, and the results of `npm run lint` and `npm run build`.

Do not push directly to `main`, add database work, commit secrets, or change Vercel settings. The project owner will review and merge the pull request, then handle deployment and database work.

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
