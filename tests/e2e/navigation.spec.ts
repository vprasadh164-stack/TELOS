import { expect, test } from "@playwright/test";

test("workspace links navigate between starter pages", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Good (morning|afternoon|evening), Alex/ }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Leads" }).click();
  await expect(page).toHaveURL(/\/leads$/);
  await expect(page.getByRole("heading", { name: "Leads" })).toBeVisible();
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
