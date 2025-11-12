import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("renders landing layout", async ({ page }) => {
    await page.goto("http://localhost:5173");
    await expect(page.getByText("Rogue Tier")).toBeVisible();
    await expect(page.getByText("Skill Tree")).toBeVisible();
  });
});
