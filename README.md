# TELOS

TELOS is a workspace for service businesses to manage the client journey from
lead through project completion.

## Local development

Requirements: Node.js 22.13+ and pnpm 10.x.

```sh
pnpm install
pnpm dev
```

The development server uses port 8443 by default. Set `PORT` to use a different
port.

## Scripts

- `pnpm dev` starts the Vite development server.
- `pnpm typecheck` checks TypeScript.
- `pnpm build` creates a production build.
- `pnpm lint` runs ESLint.
- `pnpm test` runs Vitest unit tests.
- `pnpm test:e2e` runs Playwright browser tests.
- `pnpm format` formats project files with oxfmt.

Install the Playwright browser the first time before running end-to-end tests:

```sh
pnpm exec playwright install chromium
```

## Project structure

- `src/main.tsx` mounts the React app.
- `src/App.tsx`, `src/routes.ts`, and `src/navigation.ts` select and navigate
  between client-side routes using the browser History API.
- `src/components/ui/` contains shared interface primitives.
- `src/layout/` contains the workspace sidebar, top bar, and app shell.
- `src/pages/` contains the dashboard and workspace page placeholders.
- `src/portal/` contains the separate client portal layout and starter page.
- `tests/unit/` contains route and other domain unit tests.
- `tests/e2e/` contains browser smoke tests.
- `src/index.css` imports Tailwind CSS and defines design tokens in `@theme`.
- `vite.config.ts` configures React, Tailwind CSS v4, and the local server.

The current screens use demo copy and do not persist data. The original Figma
artwork is not copied into this repository; `/reference` explains this and the
unfinished workspace pages are intentionally simple placeholders. Data types,
storage services, and backend setup will be documented as those phases are
approved.
