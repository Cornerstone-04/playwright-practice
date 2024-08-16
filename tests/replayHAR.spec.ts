import test from "@playwright/test";
import { getSnapshotPath } from "../utils/snapshot-helper";
import fs from "fs";

test.describe("Replay with HAR", () => {
  test.beforeEach(async ({ page }) => {
    // Set up route from HAR file for replaying network requests
    await page.routeFromHAR("har/github-portfolio.har", {
      update: false,
    });

    // Navigate to the target URL and wait until the DOM is fully loaded
    await page.goto(
      "https://cornerstone-github.netlify.app/repositories/color-factory",
      {
        waitUntil: "domcontentloaded",
      }
    );
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Generate the path for the screenshot
    const screenshotPath = getSnapshotPath({
      dirPath: "../test-results/waitForResponse",
      testName: testInfo.title,
    });

    // Take a screenshot if it doesn't already exist
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath, fullPage: true });
    }
  });

  test("Track all requests", async ({ page }) => {
    // Adding a listener to track all requests
    page.on("request", (request) => {
      console.log("Request made: ", request.url());
    });

    // Wait for a few seconds to allow all requests to be captured
    await page.waitForTimeout(5000);
  });
});
