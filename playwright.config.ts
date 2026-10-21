import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  // Preserve nothing after each run so the output dir never accumulates
  // (bulk cleanup of leftovers trips the local safe-delete guard).
  preserveOutput: 'never',
  // trace 'off': 'retain-on-failure' records every test and leaves ~400 trace
  // shards in test-results/.playwright-artifacts-*, whose bulk cleanup trips the
  // local safe-delete guard. Re-enable temporarily when debugging a failure.
  use: { baseURL: 'http://127.0.0.1:5178', channel: 'chrome', trace: 'off' },
  webServer: { command: 'pnpm dev:lan', url: 'http://127.0.0.1:5178', reuseExistingServer: !process.env.CI },
});
