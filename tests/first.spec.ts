import test, { expect } from "@playwright/test";
import fs from "fs";
import { getSnapshotPath } from "../utils/snapshot-helper";

test.describe("Auth test", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test.afterEach(async ({ page }, testInfo) => {
    const screenshotPath = getSnapshotPath({
      dirPath: "../test-results/screenshots",
      testName: testInfo.title,
    });
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath });
    }
  });

  test("Open letcode and verify title", async ({ page }) => {
    const title = await page.title();
    expect(title).toBe("Solid Github Repositories");
  });

  test("open letcode and login", async ({ page }) => {
    const title = await page.title();
    expect(title).toBe("Solid Github Repositories");

    // await Promise.all([
    //   page.waitForNavigation({
    //     /* url: "/signin" */
    //   }), // Updated to waitForURL
    //   page.click("text=/.*Log in.*/"),
    // ]);
    /**
     await page.click('input[id="usernameInput"]');
     await page.fill('input[id="usernameInput"]', "SegunCodes");
     await page.getByRole("button", { name: "Fetch" }).click();
     * /
    // await page.fill('input[name="password"]', "Pass123$");
    // await Promise.all([
    //   page.waitForNavigation({
    //     /* url: "/" */
    //   }), // Updated to waitForURL
    //   page.click("//button[normalize-space()='LOGIN']"), // Corrected selector
    // ]);
    await page.getByRole("link", { name: "Saved" }).click();
    expect(page.url()).toBe(
      "https://solid-app-github-repos.vercel.app/saved-repos"
    );
  });
});
