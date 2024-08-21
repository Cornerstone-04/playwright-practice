import test, { expect } from "@playwright/test";
import { getSnapshotPath } from "../utils/snapshot-helper";
import fs from "fs";

const signinURL = "https://api.fishdey.com/api/v2/user/login";

test.use({
  baseURL: "https://fishdey.com",
  headless: false,
});

test.describe(() => {
  //   test.beforeEach(async ({ page }) => await page.goto("/"));

  test.afterEach(async ({ page }, testInfo) => {
    const screenshotPath = getSnapshotPath({
      dirPath: "../test-results/tokenTest",
      testName: testInfo.title,
    });
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath });
    }
  });

  test("Read signin response", async ({ page }) => {
    await page.goto("/sell/signin");
    const [response] = await Promise.all([
      page.waitForResponse(
        (response) => response.status() == 200 && response.url() == signinURL
        //     &&
        //   response.body().then((body) => {
        //     console.log(body);
        //     return body.includes("Oyeyemi Mubarak");
        //   })
      ),
      await page.getByLabel("Phone no").fill("09071248300"),
      await page.getByLabel("Password").fill("newP@ss1"),
      await page.getByRole("button", { name: "Sign in" }).click(),
    ]);

    const responseData = await response.json();
    console.log("Raw response:", responseData);

    const token = responseData.data.token;

    await page.evaluate((token) => {
      // localStorage.setItem("authToken", token);
      // Or alternatively, set it as a cookie
      document.cookie = `authToken=${token}; path=/`;
    }, token);
    await expect(page).toHaveURL("/sell/store")
  });
});
