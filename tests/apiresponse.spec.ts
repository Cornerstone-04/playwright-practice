import test, { expect } from "@playwright/test";
import { getSnapshotPath } from "../utils/snapshot-helper";
import fs from "fs";

condt userName = "Barry-san";

test.describe("Wait for API response", () => {
  test.beforeEach(async ({ page }) => page.goto("/"));

  test.afterEach(async ({ page }, testInfo) => {
    const screenshotPath = getSnapshotPath({
      dirPath: "../test-results/waitForResponse",
      testName: testInfo.title,
    });
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath });
    }
  });

  test("Read API response", async ({ page }) => {
    const [response] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.status() == 200 &&
          response.url() ==
            `https://api.github.com/users/${userName}/repos?sort=created`
        //     &&
        //   response.body().then((body) => {
        //     console.log(body);
        //     return body.includes("Oyeyemi Mubarak");
        //   })
      ),
      page.fill("input[id='usernameInput']", userName),
      page.getByText("Fetch", { exact: true }).click(),
    ]);

    await expect(page.locator(`text=Github Repos for ${userName}`)).toBeVisible();

    console.log("Raw response:", await response.json());
  });
});
