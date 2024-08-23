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


test('store access token', async ({ page }) => {
  const signinURL =
    'https://fx-api-gateway.development.moniepoint.com/gateway/identity/v1/logins';

  await page.goto('/signin');

  //   Wait for the specific response from the signin request and perform the actions in parallel
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) => response.status() === 200 && response.url() === signinURL,
    ),
    // Fill in the signin form and submit
    await page.locator("input[name='phone']").fill('9020020020'),
    await page.locator("input[name='password']").fill('Password20@'),
    await page.locator('button[type="submit"]').click(),
  ]);

  // Extract the response data as JSON
  const responseData = await response.json();
  console.log('Raw response:', responseData);

  // Extract the token from the response data (assuming it's included in the response)
  const token = responseData.accessToken;

  // Set the token as a cookie
  await page.evaluate((token) => {
    document.cookie = `fx.remittance.token=${token}; path=/`;
  }, token);

  // Ensure that the navigation after signin is successful
  await expect(page).toHaveURL('/dashboard'); // Adjust the URL based on your application

  // Create an API request context with the extracted token
  const apiContext = await page.context().newPage();

  // Use the API context to make an authenticated API request
  const apiResponse = await apiContext.request.get(signinURL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Check if the response status is OK (status code 200)
  if (apiResponse.ok()) {
    const data = await apiResponse.json();
    console.log(data);

    // Continue with your tests or assertions on the API response
    expect(data).toHaveProperty('accessToken');
  } else {
    console.error('API request failed with status:', apiResponse.status());
    console.error('Response text:', await apiResponse.text());
  }
});
