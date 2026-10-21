# TELOS development

## Stack and commands

- React 19, strict TypeScript 5.7, Vite 8, Tailwind CSS v4, pnpm 10, Node.js 22.13+.
- `pnpm install` installs dependencies; `pnpm dev` starts the server on localhost (default port 8443; `PORT` overrides it).
- `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm format` verify and format changes.
- The dev server is not assumed to be running.

## Project conventions

- React mount: `src/main.tsx`; route selection: `src/App.tsx` and `src/routes.ts`; browser-history navigation: `src/navigation.ts`.
- Shared UI primitives live in `src/components/ui/`; the workspace shell is in `src/layout/`; workspace pages are in `src/pages/`; client portal layout and page are in `src/portal/`.
- Typed workspace data contracts and adapters live in `src/data/`; domain calculations live in `src/domain/`.
- Design tokens live in the Tailwind v4 `@theme` block in `src/index.css`.
- Unit tests live in `tests/unit/`; browser flows live in `tests/e2e/`.
- Keep TypeScript strict, use semantic HTML, and retain visible keyboard focus.
- Preserve TELOS's purple identity and DM Sans. Keep changes responsive and use readable text.
- Do not invent detailed screens beyond the supplied product brief; use simple pages or empty states and flag assumptions for review.
- Keep routing dependency-free unless approved otherwise. Ask before adding dependencies or test/lint tools. Complete work in small steps and wait for approval at phase boundaries.
- Run type-check, production build, formatting, and a browser visual check for each implementation step.
- Keep baseline screenshots in the ignored `baseline-screenshots/` folder. Do not commit secrets or local environment files.

## Domain vocabulary

- Leads move through `new → contacted → qualified → proposal → won`; `lost` is terminal and requires a reason. `won` records the converted client; project creation is separate.
- Converting a lead to a client moves its open follow-ups to that client; completed/sent follow-ups remain on the lead.
- A client can have multiple projects. Project status is `planning`, `in_progress`, `on_hold`, `completed`, or `cancelled`; task and milestone work status is separate.
- Follow-ups attach to exactly one lead or client. `overdue` is computed from an open follow-up's due time, not stored as a status.
- Activities and project files require `internal` or `portal` visibility. Portal access is scoped to a client/project pair.
- Core types are in `src/domain/types.ts`. The public preview uses browser-local demo data; authenticated leads, clients, projects, follow-ups, and activities use the typed Supabase adapter and tenant-scoped RLS migration. No Supabase project is configured in this checkout yet.
- Keep UI components behind the typed workspace service. Do not expose a Supabase service-role key in frontend code; configure only public project values with `.env.local`.
- Auth routes are `/business/login`, `/customer/login`, `/business/verify`, `/business/preview`, `/business/requests`, and `/customer/access`. One Google identity may use both business and customer spaces; business verification is manually approved and customer access is request-based.
- `supabase/migrations/` contains RLS-protected business applications, access requests, workspace data, and atomic workspace RPCs. Portal permissions and customer-scoped data access still need their own RLS policies; demo data is not production persistence.

## Open product decisions

- Whether leads may move backward or reopen after being lost, and the allowed lost reasons.
- Which activity types can be shared to the portal and the default visibility for new events/files.
- Workspace currency/timezone defaults and whether portal access can cover multiple projects.
