import { test, expect } from '@playwright/test';

test('project preview top control goes back inside the preview and phone routes omit simulated chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 1137 });
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('.preview-web-title')).toContainText('黄老师-校管家');
  await expect(frame.locator('.preview-web-title')).toContainText('127.0.0.1');
  await expect(frame.locator('.preview-history')).toHaveCount(0);
  await expect(frame.locator('.preview-home-indicator')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const footerBottom = await frame.locator('.product-tabbar').evaluate((element) => element.getBoundingClientRect().bottom);
  expect(footerBottom).toBe(await frame.locator('html').evaluate(() => innerHeight));
  await frame.getByRole('button', { name: '出勤率', exact: true }).click();
  await expect(frame.getByRole('navigation', { name: '微信浏览导航' })).toBeVisible();
  const historyColor = await frame.locator('.preview-history').evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(frame.locator('.preview-home-indicator')).toHaveCSS('background-color', historyColor);
  await page.screenshot({ path: 'test-results/wechat-report-shell.png' });
  await frame.getByRole('button', { name: '微信顶部返回' }).click();
  await expect(frame.locator('.preview-web-title')).toContainText('黄老师-校管家');
  await expect(page).toHaveURL(/page=home/);
  await expect(frame.locator('.preview-history')).toHaveCount(0);
  await frame.getByRole('button', { name: '我的', exact: true }).click();
  await expect(frame.locator('.my-page')).toBeVisible();
  await expect(frame.locator('.preview-history')).toHaveCount(0);
  await expect(frame.locator('.preview-home-indicator')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.screenshot({ path: 'test-results/my-without-history.png' });
  await frame.getByRole('button', { name: '首页', exact: true }).click();
  await expect(frame.locator('.home-page')).toBeVisible();
  await expect(frame.locator('.preview-history')).toHaveCount(0);
  await frame.getByRole('button', { name: '微信顶部返回' }).click();
  await expect(frame.locator('.my-page')).toBeVisible();
  await expect(frame.locator('.preview-history')).toHaveCount(0);
  await page.goto('/#/pages/attendance/v2?theme=dark&chrome=wechat&role=manager');
  await page.getByRole('button', { name: '微信顶部返回' }).click();
  await expect(page).toHaveURL(/pages\/home\/v1\?theme=dark&role=manager&chrome=wechat/);
  await page.screenshot({ path: 'test-results/wechat-top-return-home.png' });
  for (const route of ['home', 'my', 'attendance']) {
    await page.goto(`/#/pages/${route}/v1?theme=light`);
    await expect(page.locator('.preview-chrome, .preview-history, .preview-home-indicator')).toHaveCount(0);
    await expect(page.locator('.att-header, .home-header')).toHaveCount(0);
  }
});

test('preview sheets stay inside web content and preserve native-looking bars', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/home/v1?theme=light&chrome=wechat');
  await page.getByRole('button', { name: '出勤率', exact: true }).click();
  await page.locator('.att-v2-value').click();
  const sheet = page.locator('.sheet');
  await expect(sheet).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const history = await page.locator('.preview-history').boundingBox();
  const header = await page.locator('.preview-chrome').boundingBox();
  const backdrop = await page.locator('.sheet-backdrop').boundingBox();
  const popup = await sheet.boundingBox();
  expect(backdrop!.y).toBe(header!.y + header!.height);
  expect(popup!.y + popup!.height).toBeLessThanOrEqual(history!.y);
  await expect(page.locator('.preview-home-indicator')).toBeVisible();
  await page.screenshot({ path: 'test-results/wechat-sheet-preserves-bars.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '微信后退' }).click();
  await expect(page).toHaveURL(/pages\/home\/v1/);

  await page.goto('/#/pages/attendance/v1?theme=light');
  await page.locator('.att-value').click();
  await expect(page.locator('.sheet')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const plain = await page.locator('.sheet').boundingBox();
  expect(plain!.y + plain!.height).toBe(844);
  await expect(page.locator('.preview-home-indicator, .preview-history')).toHaveCount(0);
});

test('short filtered report fills its scroll viewport without a background gap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1?theme=light&chrome=wechat');
  const name = (await page.locator('.att-group-name').first().textContent())!;
  await page.locator('.att-value').click();
  const sheet = page.getByRole('dialog', { name: '选择班级名称（可多选）' });
  await sheet.getByRole('button', { name, exact: true }).click();
  await sheet.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.locator('.att-summary')).toHaveCount(1);
  expect(await page.locator('.product-scroll').evaluate(el => el.querySelector('.att-body--report')!.getBoundingClientRect().height >= el.clientHeight)).toBe(true);
  await page.screenshot({ path: 'test-results/attendance-short-background.png' });
});
