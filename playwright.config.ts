import { defineConfig, devices } from '@playwright/test'

// The app instance used for health/signIn tests (e.g. started via `npm run start-feature` with PORT=3007).
const APP_URL = 'http://localhost:3007'
// The app instance used for the sendMoney start page tests (defaults to the app's own default port - see server/app.ts).
const URL_SEND_MONEY = 'http://localhost:3000'

export default defineConfig({
  outputDir: './test_results/playwright/test-output',
  testDir: './integration_tests/specs',
  /* Maximum time one test can run for. (millis) */
  timeout: 3 * 60 * 1000,
  /* Maximum time test suite can run for. (millis) */
  globalTimeout: 60 * 60 * 1000,
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Ensure tests run consecutively due to inability to share wiremock instance */
  workers: 1,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'test_results/playwright/report', open: process.env.CI ? 'never' : 'on-failure' }],
    ['junit', { outputFile: 'test_results/playwright/junit.xml' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30 /* seconds */ * 1000,
    timezoneId: 'Europe/London',
    launchOptions: { slowMo: 150 },
    screenshot: 'only-on-failure',
    trace: process.env.CI ? 'off' : 'on',
    ...devices['Desktop Chrome'],
    testIdAttribute: 'data-qa',
  },

  /* Configure projects */
  projects: [
    {
      name: 'app-desktop-chrome',
      use: { baseURL: APP_URL, ...devices['Desktop Chrome'] },
      testDir: './integration_tests/specs',
      testMatch: ['health.spec.ts', 'signIn.spec.ts'],
    },
    {
      name: 'send-money-desktop-chrome',
      use: { baseURL: URL_SEND_MONEY, ...devices['Desktop Chrome'] },
      testDir: './integration_tests/specs/sendMoney',
    },
  ],
})
