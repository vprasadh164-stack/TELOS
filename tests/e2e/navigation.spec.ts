import { expect, test } from "@playwright/test";

test("workspace links navigate between starter pages", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening), Alex/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Leads" }).click();
  await expect(page).toHaveURL(/\/leads$/);
  await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();

  await page.getByRole("link", { name: "Pricing", exact: true }).click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { name: "Pricing is being prepared." })).toBeVisible();
  await expect(page.getByText(/No plan prices or charges are active/)).toBeVisible();
});

test("the client portal uses its own layout", async ({ page }) => {
  await page.goto("/portal/demo-project");

  await expect(page.getByText("Client portal")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your project, in one place." })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main navigation" })).toHaveCount(0);
});

test("a new lead and follow-up persist in the local demo workspace", async ({ page }) => {
  await page.goto("/leads");
  await page.getByRole("button", { name: "Add lead" }).click();
  await page.getByLabel("Name").fill("Taylor Demo");
  await page.getByLabel("Email").fill("taylor@example.com");
  await page.getByLabel("Source").fill("Website");
  await page.getByLabel("Estimated value").fill("2400");
  await page.getByRole("button", { name: "Save lead" }).click();

  await expect(page.getByRole("heading", { name: "Taylor Demo" })).toBeVisible();
  await page.getByRole("button", { name: "Schedule", exact: false }).click();
  await page.getByLabel("Next step").fill("Send the first estimate");
  await page.getByRole("button", { name: "Schedule follow-up" }).click();
  await expect(page.getByText("Send the first estimate", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Send follow-up" }).last().click();
  await page.getByRole("button", { name: "Log as sent" }).click();
  await expect(page.getByText("Follow-up logged as sent")).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Taylor Demo" })).toBeVisible();
  await expect(page.getByText("Sent", { exact: true })).toBeVisible();
});

test("a qualified lead converts to a client and can create a project", async ({ page }) => {
  await page.goto("/leads");
  await page.getByRole("button", { name: /Sofia Martin/ }).click();
  await page.getByRole("button", { name: "Convert to client" }).click();
  await page.getByRole("button", { name: "Confirm conversion" }).click();

  const clientPanel = page.getByRole("region", { name: "Converted client" });
  await expect(clientPanel.getByText("Sofia Martin")).toBeVisible();
  await expect(page.getByText("Confirm the project brief", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Create project" }).click();
  await page.getByLabel("Project name").fill("Kitchen refresh");
  await page.getByRole("button", { name: "Save project" }).click();

  await expect(clientPanel.getByText("Kitchen refresh")).toBeVisible();
  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByText("Kitchen refresh")).toBeVisible();

  await page.getByRole("link", { name: "Clients" }).click();
  await page.getByRole("link", { name: "Source lead" }).first().click();
  await expect(page).toHaveURL(/\/leads\/lead-sofia$/);
  await expect(
    page.getByRole("region", { name: "Converted client" }).getByRole("heading", {
      name: "Sofia Martin",
    }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("region", { name: "Converted client" }).getByRole("heading", {
      name: "Sofia Martin",
    }),
  ).toBeVisible();
});

test("business and customer sign-in have separate entry pages", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome to TELOS" })).toBeVisible();

  await page.getByRole("link", { name: /Business or freelancer/ }).click();
  await expect(page).toHaveURL(/\/business\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in to your workspace" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
  await expect(page.getByText(/Google sign-in is not connected yet/)).toBeVisible();

  await page.goto("/customer/login");
  await expect(page.getByRole("heading", { name: "Sign in to your client portal" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeDisabled();
});
