# TELOS development

## Stack and commands

- React 19, strict TypeScript, Vite 8, Tailwind CSS v4, pnpm 10, Node.js 22.12+.
- `pnpm install` installs dependencies; `pnpm dev` starts the server (default port 8443; `PORT` overrides it).
- `pnpm exec tsc --noEmit`, `pnpm build`, and `pnpm format` verify and format changes.
- The dev server is not assumed to be running.

## Project conventions

- App entry: `src/App.tsx`; global styles and Tailwind import: `src/index.css`; React mount: `src/main.tsx`.
- Keep TypeScript strict, use semantic HTML, and retain visible keyboard focus.
- Preserve TELOS's purple identity and DM Sans. Keep changes responsive and use readable text.
- Do not invent detailed screens beyond the supplied product brief; use simple pages or empty states and flag assumptions for review.
- Ask before adding dependencies or test/lint tools. Complete work in small steps and wait for approval at phase boundaries.
- Run type-check, production build, formatting, and a browser visual check for each implementation step.
- Keep baseline screenshots in the ignored `baseline-screenshots/` folder. Do not commit secrets or local environment files.
