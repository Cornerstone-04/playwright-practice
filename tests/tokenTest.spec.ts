import test, { expect } from "@playwright/test";
import { getSnapshotPath } from "../utils/snapshot-helper";
import fs from "fs";

const signinURL = "https://api.fishdey.com/api/v2/user/login";
let authToken: string;

test.use({
  baseURL: "https://fishdey.com",
  headless: false,
});

test.describe(() => {
  test.afterEach(async ({ page }, testInfo) => {
    const screenshotPath = getSnapshotPath({
      dirPath: "../test-results/tokenTest",
      testName: testInfo.title,
    });
    if (!fs.existsSync(screenshotPath)) {
      await page.screenshot({ path: screenshotPath });
    }
  });

  test("Read signin response and store token", async ({ page }) => {
    await page.goto("/sell/signin");

    const [response] = await Promise.all([
      page.waitForResponse(
        (response) => response.status() === 200 && response.url() === signinURL
      ),
      await page.fill("input[name='phone']", "09071248300"),
      await page.fill("input[name='password']", "newP@ss1"),
      await page.getByRole("button", { name: "Sign in" }).click(),
    ]);

    const responseData = await response.json();
    console.log("Raw response:", responseData);

    authToken = responseData.data.token;

    await page.evaluate((token) => {
      document.cookie = `authToken=${token}; path=/`;
    }, authToken);

    await expect(page).toHaveURL("/sell/store");

    const fetchedResponse = await page.request.post(
      "https://api.fishdey.com/api/v1/category/fetch",
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        data: JSON.stringify({ type: "fish" }),
      }
    );

    const responseBody = await fetchedResponse.json();
    console.log("Protected resource response:", responseBody);

    // Check the status code
    expect(response.status()).toBe(200);
  });

  // test("Use token in another test", async ({ page }) => {
  //   // Assuming you need to navigate to a page that requires authentication
  //   await page.goto("/sell/store");

  //   // Debugging: Check if token is available
  //   console.log("Auth token:", authToken);

  //   // Set the token as a cookie manually if necessary
  //   await page.evaluate((token) => {
  //     document.cookie = `authToken=${token}; path=/`;
  //   }, authToken);

  //   // Verify that the correct text is visible
  //   await expect(page.locator("text=Welcome to Store")).toBeVisible();

  //   // Debugging: Log before making the request
  //   console.log("Making request to protected endpoint");

  //   // Make authenticated request
  //   const response = await page.request.post(
  //     "https://api.fishdey.com/api/v1/category/fetch",
  //     {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //         'Content-Type': 'application/json'
  //       },
  //       data: JSON.stringify({ type: "fish" }),
  //     }
  //   );

  //   const responseBody = await response.json();
  //   console.log("Protected resource response:", responseBody);

  //   // Check the status code
  //   expect(response.status()).toBe(200);
  // });
});
