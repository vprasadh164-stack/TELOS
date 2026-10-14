import { defineConfig } from "@playwright/test";

export default defineConfig({
  fullyParallel: true,
  reporter: "list",
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:8443",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "corepack pnpm@10 dev",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    url: "http://localhost:8443",
  },
});
