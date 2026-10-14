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
