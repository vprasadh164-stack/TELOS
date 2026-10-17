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
- `src/auth/` contains Google OAuth flows, business-verification gating, and
  customer project-access request screens.
- `supabase/migrations/` contains database tables, RLS policies, and RPCs for
  business applications and customer access requests.
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

## Authentication setup

The sign-in pages use Supabase Auth's Google OAuth. They are intentionally
inactive until you connect a Supabase project:

1. Create a Supabase project and copy `.env.example` to `.env.local`.
2. Set `VITE_SUPABASE_URL` and the project's public anon/publishable key in
   `.env.local`. Never put a service-role key in frontend variables.
3. In Supabase Auth, enable Google and configure the Google OAuth client ID and
   secret in the Supabase dashboard (not in this repository). Add
   `http://localhost:8443/auth/callback` to the allowed redirect URLs.
4. Apply `supabase/migrations/20261017000000_auth_and_access_requests.sql`
   using the Supabase SQL editor or CLI.
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

**Current persistence boundary:** lead, follow-up, and project demo data still
uses browser local storage (separate keys per signed-in business account); it
is not synced to Supabase. Do not use this preview to store real or sensitive
customer data. Tenant-backed business records, actual project-scoped portal
access, and admin review UI must be implemented before production use. Database
RLS in this migration protects the new application/request tables; it does not
yet protect future leads/projects tables, which must each receive their own
RLS policies before being exposed.

The approved sales vocabulary is `new → contacted → qualified → proposal → won`
with `lost` as a terminal lead outcome. Project lifecycle and task/milestone
statuses are separate; see `AGENTS.md` for open product decisions.

## Deploying to Cloudflare Pages

Cloudflare Pages has a free tier and can build this private GitHub repository.
The project is a static Vite app: use `pnpm build` as the build command and
`dist` as the build output directory. Pages automatically serves the SPA entry
point for client-side routes such as `/business/login`.

1. Create a Cloudflare account and connect GitHub under **Workers & Pages** >
   **Create application** > **Pages** > **Import an existing Git repository**.
   Authorize access to the private `vprasadh164-stack/TELOS` repository.
2. Choose `main` as the production branch, `pnpm build` as the build command,
   and `dist` as the build output directory. Set the `NODE_VERSION` build
   environment variable to `22.13.0`.
3. For the temporary public demo, set `VITE_DEMO_MODE` to `true` in the
   production environment variables, then deploy. The generated `*.pages.dev`
   address can be used to inspect the site before connecting the custom domain.
4. Add `telos.codes` under the Pages project's **Custom domains**. Cloudflare
   requires the apex domain's DNS zone to use Cloudflare nameservers. At
   Name.com, change the domain's nameservers to the pair Cloudflare assigns.
   Review/import any existing DNS records first so other domain services, such
   as email, are not disrupted. Add `www.telos.codes` separately if desired.
5. After DNS and TLS become active, test `https://telos.codes/` and a direct
   visit to `https://telos.codes/leads`.

### Temporary demo preview without Supabase

Setting `VITE_DEMO_MODE=true` opts the deployment into an **unauthenticated
public demo**: anyone who visits the site can view and edit sample data in their
own browser. The app displays a demo notice, and edits stay in that browser's
local storage. Do not enter real customer, business, or confidential
information.

When Supabase is ready, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`,
apply the migration above, and configure Supabase Auth's site URL and Google
OAuth redirects for `https://telos.codes/auth/callback`. Remove
`VITE_DEMO_MODE` or set it to `false` and redeploy to restore the production
sign-in gate. Without Supabase or this explicit demo setting, production
intentionally fails closed. The temporary preview does not enable Google
sign-in, business verification, or real customer portal access.
