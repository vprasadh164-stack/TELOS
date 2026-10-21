import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: true,
  reporter: "list",
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:8444",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "corepack pnpm@10 exec vite --host localhost --port 8444",
    env: { VITE_DEMO_MODE: "true" },
    reuseExistingServer: false,
    timeout: 60_000,
    url: "http://localhost:8444",
  },
});
