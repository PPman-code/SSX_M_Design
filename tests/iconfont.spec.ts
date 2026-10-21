import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`current icon library exposes the new symbol and updated checks in ${theme}`, async ({ page }) => {
    await page.goto(`/#/handoff?theme=${theme}`);
    const details = page.locator('.icon-library-details');
    await details.getByText('查看全部 186 个图标', { exact: true }).click();
    await expect(details.locator('.icon-tile')).toHaveCount(186);
    const search = details.getByRole('searchbox');
    await search.fill('zujiangouxuan');
    const tile = details.locator('.icon-tile');
    await expect(tile).toHaveCount(1);
    await expect(tile.locator('use')).toHaveAttribute('href', /#SSX-zujiangouxuan$/);
    const symbol = await page.request.get('/iconfont/ssx-design.symbol.svg');
    const source = await symbol.text();
    expect(source).toContain('id="SSX-zujiangouxuan"');
    expect(source).toContain('id="SSX-check"');
    expect(source).toContain('id="SSX-close"');
    const response = await page.request.get('/downloads/ssx-design-5242145.zip');
    expect(response.ok()).toBe(true);
  });
}
