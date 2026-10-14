# TELOS

TELOS is a workspace for service businesses to manage the client journey from
lead through project completion.

## Local development

Requirements: Node.js 22.12+ and pnpm 10.x.

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
- `pnpm format` formats project files with oxfmt.

## Project structure

- `src/App.tsx` is the current app entry component.
- `src/index.css` contains global styles and the Tailwind CSS import.
- `src/main.tsx` mounts the app.
- `vite.config.ts` configures React, Tailwind CSS v4, and the local server.

The app is at its initial setup stage. Product screens and a fuller project
guide will be added in later steps.
