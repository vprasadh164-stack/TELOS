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
  Supabase client configuration and workspace adapter.
- `src/auth/` contains Google OAuth flows, business-verification gating, and
  customer project-access request screens.
- `supabase/migrations/` contains database tables, RLS policies, and atomic
  RPCs for authentication, workspace data, and customer access requests.
- `tests/unit/` contains route and other domain unit tests.
- `tests/e2e/` contains browser smoke tests.
- `src/index.css` imports Tailwind CSS and defines design tokens in `@theme`.
- `vite.config.ts` configures React, Tailwind CSS v4, and the local server.

The GitHub Pages site is still an unauthenticated local-storage demo. The
authenticated workspace now has a Supabase data adapter and tenant-scoped
database schema, but no Supabase project is connected to this repository yet.
Create a Supabase project, apply both migrations in order, and configure
Google OAuth before using the authenticated workspace. Copy `.env.example` to
`.env.local` and set the project's URL and public anon/publishable key. The
browser must only receive that public key; never put a service-role key in
frontend configuration. Demo data is not automatically copied to a new
Supabase workspace. The original Figma artwork is not copied into this
repository; `/reference` explains this and unfinished pages remain intentionally
simple placeholders.

The current workspace flow supports adding and searching leads, stage filters
and counts, sorting, lead profiles with activity, scheduling/completing
follow-ups, converting eligible leads into clients, creating planning projects,
and viewing client/project lists. These operations use Supabase RPCs and
database transactions in an authenticated workspace; the public demo uses
browser local storage. "Log as sent" records an activity only; no email is
delivered. Project milestones, tasks, files, full project details, and customer
portal permissions are not yet connected to Supabase.

The Pricing page is a placeholder until subscription terms and Stripe are
configured. No plan prices, checkout, or charges are active. Google sign-in
screens are present, but OAuth remains unavailable until the Supabase public
key and Google provider are configured as described below.

## Authentication setup

The sign-in pages use Supabase Auth's Google OAuth. To connect a project:

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and the project's public anon/publishable key in
   `.env.local`. Never put a service-role key in frontend variables.
3. In Supabase Auth, enable Google and configure the Google OAuth client ID and
   secret in the Supabase dashboard (not in this repository). Add
   `http://localhost:8443/auth/callback` and, when ready to replace the public
   demo, `https://telos.codes/auth/callback` to the allowed redirect URLs.
4. Run `supabase/migrations/20261017000000_auth_and_access_requests.sql` and
   then `supabase/migrations/20261019000000_workspace_data.sql` in the
   Supabase SQL editor, in that order.
5. Restart `pnpm dev` and use `/login` to choose the business or customer sign-in.

Business sign-in and customer sign-in use the same Google identity, but start
separate flows. A business must submit its name, contact email, website
(optional), and a short description. Pending applications see a sample
read-only preview; they cannot open workspace data or perform actions. A
reviewer approves an application using a trusted Supabase administrator
account, for example in the SQL editor:

```sql
update public.business_applications
set status = 'approved', reviewed_at = now()
where owner_id = '<auth.users id to approve>';
```

Customers can submit a request using the business contact email and project
reference. The database accepts requests only for a verified business, and
only that business and the requesting customer can read them. Approval records
the business's decision; connecting an approved request to actual project
portal permissions is still future work.

**Current persistence boundary:** an authenticated, approved business account
loads and mutates its leads, clients, projects, follow-ups, and activities in
its RLS-protected Supabase workspace. The GitHub Pages demo remains
browser-local, and it is separate from any authenticated workspace. No
Supabase project or OAuth provider is configured yet, so the live domain is
still the sample demo. Project milestones, tasks, files, portal access, and
customer-scoped data policies are not implemented; do not treat the portal or
demo as production-ready.

The approved sales vocabulary is `new → contacted → qualified → proposal → won`
with `lost` as a terminal lead outcome. Project lifecycle and task/milestone
statuses are separate; see `AGENTS.md` for open product decisions.

## Deploying to GitHub Pages

GitHub Pages is free for public repositories. The `Deploy GitHub Pages`
workflow builds the site from `main` and publishes the `dist` directory with
`VITE_DEMO_MODE=true`. It also copies the app entry point to `404.html` so
direct visits and refreshes on client-side routes work. The `public/CNAME` file
configures `telos.codes`.

1. Make `vprasadh164-stack/TELOS` public, then open its **Settings > Pages**.
   Set the build and deployment source to **GitHub Actions**.
2. In **Settings > Pages**, verify that `telos.codes` is listed as the custom
   domain after the first workflow deployment. Enforce HTTPS when the option
   becomes available.
3. At Name.com, keep the current nameservers and edit DNS records. Point the
   apex (`@`) to GitHub Pages with these four A records: `185.199.108.153`,
   `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`. Optionally add
   the four corresponding AAAA records from GitHub's custom-domain guide. To
   use `www.telos.codes`, add a CNAME for `www` pointing to
   `vprasadh164-stack.github.io`. Check for conflicting existing records first.
4. Wait for DNS and certificate provisioning, then test
   `https://telos.codes/` and a direct visit to `https://telos.codes/leads`.

Every push to `main` automatically builds and deploys the latest demo. No
hosting provider account or deployment secret is required.

### Temporary demo preview without Supabase

Setting `VITE_DEMO_MODE=true` opts the deployment into an **unauthenticated
public demo**: anyone who visits the site can view and edit sample data in their
own browser. The app displays a demo notice, and edits stay in that browser's
local storage. Do not enter real customer, business, or confidential
information.

When Supabase is ready, configure `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as GitHub Actions variables, apply both migrations,
and configure Supabase Auth's site URL and Google OAuth redirects for
`https://telos.codes/auth/callback`. Only then remove `VITE_DEMO_MODE` from the
workflow and redeploy to restore the production sign-in gate. Until this is
done, the public site intentionally remains a sample-data preview.
