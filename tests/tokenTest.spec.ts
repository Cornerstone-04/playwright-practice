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
