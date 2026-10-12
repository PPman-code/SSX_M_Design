import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`my page fits ${width}px, scrolls above the tab bar and uses local assets`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/my/v1?chrome=wechat');
    await expect(page.getByRole('button', { name: '查看个人信息' })).toBeVisible();
    await expect(page.getByRole('button', { name: '我的', exact: true })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
    const images = await page.locator('img').evaluateAll((elements) => elements.map((image) => ({
      loaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0, width: image.getBoundingClientRect().width,
      source: image.getAttribute('src'),
    })));
    expect(images.every((image) => image.loaded && image.width > 0 && (image.source?.startsWith('/pages/my/v1/') || image.source?.startsWith('/preview/wechat/')))).toBe(true);
    await page.getByRole('button', { name: '帮助中心', exact: true }).scrollIntoViewIfNeeded();
    const help = await page.getByRole('button', { name: '帮助中心', exact: true }).boundingBox();
    const tabs = await page.getByRole('navigation', { name: '主导航' }).boundingBox();
    expect(help!.y + help!.height).toBeLessThanOrEqual(tabs!.y + 1);
    await page.screenshot({ path: `test-results/my-page-${width}.png`, fullPage: true });
  });
}

test('my page provides entry feedback and restores focus without a real transaction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/my/v1');
  await expect(page.locator('.preview-chrome')).toHaveCount(0);
  const button = page.getByRole('button', { name: '收费报名', exact: true });
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('“收费报名”的后续页面待提供。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭弹层' }).click();
  await expect(button).toBeFocused();
  await page.getByRole('button', { name: '仅收款说明' }).click();
  await expect(page.getByText('此处说明文案待确认。')).toBeVisible();
});

test('workspace selects my v1 and shares its product route without simulated system bars', async ({ page }) => {
  await page.route('**/__preview-addresses', (route) => route.fulfill({ contentType: 'application/json', body: '{"urls":["http://192.168.1.8:5178/"]}' }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/');
  await page.getByRole('navigation', { name: '业务页面' }).getByRole('link', { name: /我的/ }).click();
  await expect(page.locator('iframe')).toHaveAttribute('src', './#/pages/my/v1?theme=light&chrome=wechat');
  await page.getByLabel('微信外观预览', { exact: true }).uncheck();
  await expect(page.frameLocator('iframe').locator('.preview-chrome')).toHaveCount(0);
  await page.getByRole('button', { name: '手机预览', exact: true }).click();
  await expect(page.getByRole('link', { name: 'http://192.168.1.8:5178/#/pages/my/v1?theme=light' })).toBeVisible();
  await expect(page.getByRole('img', { name: '手机预览二维码' })).toBeVisible();
});

test('phone shell preserves viewport width, interaction and the plain preview option', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/#/?page=my&theme=light');
  const frame = page.frameLocator('iframe');
  await expect(page.locator('.device-shell')).toBeVisible();
  await expect.poll(() => page.locator('.device-shell').evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 1350)).toBe(true);
  await expect(page.locator('.device-shell')).toHaveCSS('pointer-events', 'none');
  expect(await frame.locator('body').evaluate(() => innerWidth)).toBe(390);
  await frame.getByRole('button', { name: '查看个人信息' }).click();
  await expect(frame.getByRole('dialog')).toBeVisible();
  await frame.getByRole('button', { name: '关闭弹层' }).click();
  await expect(frame.getByRole('dialog')).toBeHidden();
  await page.locator('.device-frame').screenshot({ path: 'test-results/phone-shell-my.png', animations: 'disabled' });
  await page.getByRole('button', { name: '430', exact: true }).click();
  expect(await frame.locator('body').evaluate(() => innerWidth)).toBe(430);
  await page.getByRole('button', { name: '无外壳', exact: true }).click();
  await expect(page.locator('.device-shell')).toHaveCount(0);
  expect(await frame.locator('body').evaluate(() => innerWidth)).toBe(430);
  await expect(frame.getByRole('navigation', { name: '主导航' })).toBeVisible();
});
