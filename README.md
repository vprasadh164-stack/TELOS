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
- `src/pages/` contains the working demo dashboard and leads flow plus simple placeholders for unfinished screens.
- `src/portal/` contains the separate client portal layout and starter page.
- `src/domain/types.ts` defines the approved workspace, lead, client, project,
  activity, follow-up, message, file, and portal-access types.
- `src/domain/dashboard-metrics.ts` derives dashboard counts and pipeline totals.
- `src/data/` contains the typed workspace service, browser demo adapter, and
  Supabase client configuration.
- `tests/unit/` contains route and other domain unit tests.
- `tests/e2e/` contains browser smoke tests.
- `src/index.css` imports Tailwind CSS and defines design tokens in `@theme`.
- `vite.config.ts` configures React, Tailwind CSS v4, and the local server.

Leads, follow-ups, and activity persist in this browser's local storage for the
demo. Supabase's SDK and a public-key client factory are installed, but no
Supabase project is connected yet; the app uses the local demo adapter until
the database schema, row-level security policies, authentication, and project
credentials are set up. Copy `.env.example` to `.env.local` only when you have
a Supabase project. The browser must only receive the public anon/publishable
key; never put a service-role key in frontend configuration. The original
Figma artwork is not copied into this repository; `/reference` explains this
and unfinished pages remain intentionally simple placeholders.

The working demo slice covers adding and searching leads, stage filters and
counts, sorting, lead profiles with activity, scheduling/completing follow-ups,
logging a template follow-up as sent, and dashboard metrics derived from demo
data. "Log as sent" records an activity only; no email is delivered. The next
approved core-flow work is lead conversion, project creation, and project
details.

The approved sales vocabulary is `new → contacted → qualified → proposal → won`
with `lost` as a terminal lead outcome. Project lifecycle and task/milestone
statuses are separate; see `AGENTS.md` for open product decisions.
