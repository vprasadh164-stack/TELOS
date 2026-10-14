# TELOS development

## Stack and commands

- React 19, strict TypeScript 5.7, Vite 8, Tailwind CSS v4, pnpm 10, Node.js 22.13+.
- `pnpm install` installs dependencies; `pnpm dev` starts the server on localhost (default port 8443; `PORT` overrides it).
- `pnpm exec tsc --noEmit`, `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm format` verify and format changes.
- The dev server is not assumed to be running.

## Project conventions

- React mount: `src/main.tsx`; route selection: `src/App.tsx` and `src/routes.ts`; browser-history navigation: `src/navigation.ts`.
- Shared UI primitives live in `src/components/ui/`; the workspace shell is in `src/layout/`; workspace pages are in `src/pages/`; client portal layout and page are in `src/portal/`.
- Design tokens live in the Tailwind v4 `@theme` block in `src/index.css`.
- Unit tests live in `tests/unit/`; browser flows live in `tests/e2e/`.
- Keep TypeScript strict, use semantic HTML, and retain visible keyboard focus.
- Preserve TELOS's purple identity and DM Sans. Keep changes responsive and use readable text.
- Do not invent detailed screens beyond the supplied product brief; use simple pages or empty states and flag assumptions for review.
- Keep routing dependency-free unless approved otherwise. Ask before adding dependencies or test/lint tools. Complete work in small steps and wait for approval at phase boundaries.
- Run type-check, production build, formatting, and a browser visual check for each implementation step.
- Keep baseline screenshots in the ignored `baseline-screenshots/` folder. Do not commit secrets or local environment files.
