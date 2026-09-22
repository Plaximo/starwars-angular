import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    ...devices['Desktop Edge'],
    channel: 'msedge',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
