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
- A client can have multiple projects. Project status is `planning`, `in_progress`, `on_hold`, `completed`, or `cancelled`; task and milestone work status is separate.
- Follow-ups attach to exactly one lead or client. `overdue` is computed from an open follow-up's due time, not stored as a status.
- Activities and project files require `internal` or `portal` visibility. Portal access is scoped to a client/project pair.
- Core types are in `src/domain/types.ts`. Leads, follow-ups, and activity currently use a browser-local demo adapter. Google OAuth client code and a first RLS-protected auth migration are present, but no Supabase project is configured and lead/project data is not hosted.
- Keep UI components behind the typed workspace service. Do not expose a Supabase service-role key in frontend code; configure only public project values with `.env.local`.
- Auth routes are `/business/login`, `/customer/login`, `/business/verify`, `/business/preview`, `/business/requests`, and `/customer/access`. One Google identity may use both business and customer spaces; business verification is manually approved and customer access is request-based.
- `supabase/migrations/` contains RLS-protected application and access-request tables. Future tenant data tables and portal permissions still need their own RLS policies; local demo data is not production persistence.

## Open product decisions

- Whether leads may move backward or reopen after being lost, and the allowed lost reasons.
- Whether an open follow-up moves from a lead to its client on conversion.
- Which activity types can be shared to the portal and the default visibility for new events/files.
- Workspace currency/timezone defaults and whether portal access can cover multiple projects.
