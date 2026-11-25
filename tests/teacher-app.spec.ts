import { test, expect } from '@playwright/test';

test('App workspace isolates its container, offers copyable login fixtures and keeps H5 navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.goto('/#/?page=home&theme=light');
  const nav = page.getByRole('navigation', { name: '工作区导航' });
  await nav.getByRole('link', { name: '教师端-app', exact: true }).click();
  const app = page.frameLocator('iframe');
  await expect(nav.getByRole('link', { name: '教师端-app', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(app.getByRole('heading', { name: '手机号登录' })).toBeVisible();
  await expect(app.getByRole('navigation', { name: 'App 顶部导航' })).toHaveCount(0);
  await expect(app.locator('.preview-wechat-nav, .preview-history')).toHaveCount(0);
  await expect(app.locator('.preview-system-status')).toBeVisible();
  const config = page.getByRole('region', { name: '登录演示数据' });
  await expect(config.getByRole('group', { name: '手机号登录' }).getByLabel('验证码', { exact: true })).toHaveValue('123456');
  await expect(config.getByLabel('入职登记手机号', { exact: true })).toHaveValue('13700137000');
  await expect(config.getByLabel('已绑定手机号的工作账号', { exact: true })).toHaveValue('teacher@example.com');
  await expect(config.getByLabel('未绑定手机号的工作账号', { exact: true })).toHaveValue('new@example.com');
  await expect(page.getByLabel('导航背景', { exact: true })).toHaveCount(0);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await config.getByRole('button', { name: '复制未绑定手机号的工作账号' }).click();
  await expect(config.getByRole('status')).toHaveText('已复制');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('new@example.com');
  await config.getByRole('button', { name: '复制入职登记手机号' }).click();
  await expect(config.getByRole('status')).toHaveText('已复制');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('13700137000');
  await expect(page.getByRole('link', { name: '独立打开' })).not.toHaveAttribute('href', /chrome=/);
  await expect(config.getByText(/体验冲突时，先用/)).toBeHidden();
  await config.getByText('测试说明', { exact: true }).click();
  await expect(config.getByText(/体验冲突时，先用/)).toBeVisible();
  await config.getByText('测试说明', { exact: true }).click();
  await page.screenshot({ path: '/private/tmp/ssx-login/workspace-fixtures.png', fullPage: true });
  await page.getByRole('button', { name: '切换到深色' }).click();
  await expect(app.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  await expect(config).toBeVisible();
  await config.screenshot({ path: '/private/tmp/ssx-login/workspace-fixtures-dark.png' });
  await nav.getByRole('link', { name: '老师端-h5', exact: true }).click();
  await expect(app.locator('.preview-wechat-nav')).toBeVisible();
  await expect(app.getByRole('navigation', { name: 'App 顶部导航' })).toHaveCount(0);
  await nav.getByRole('link', { name: '家长端-h5', exact: true }).click();
  await expect(app.locator('.preview-wechat-nav')).toBeVisible();
});

test('App preview uses one Home indicator above the page and bottom sheet', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/#/pages/teacher-app/v1?theme=light&chrome=app');
  const indicator = page.locator('.app-home-indicator');
  await expect(indicator).toHaveCount(1);
  await expect(indicator).toHaveCSS('height', '34px');
  await expect(indicator).toHaveCSS('pointer-events', 'none');
  await expect(page.locator('.app-page')).toHaveCSS('padding-bottom', '34px');
  const cardBounds = await page.locator('.teacher-login-card').boundingBox();
  const indicatorBounds = await indicator.boundingBox();
  expect(cardBounds!.y + cardBounds!.height).toBeLessThanOrEqual(indicatorBounds!.y);

  await page.getByRole('textbox', { name: '手机号', exact: true }).fill('13700137000');
  await page.getByRole('button', { name: '下一步', exact: true }).click();
  const privacy = page.getByRole('dialog', { name: '服务协议及隐私保护' });
  await expect(privacy).toBeVisible();
  await expect(privacy.locator('.sheet-footer')).toHaveCSS('padding-bottom', '42px');
  await expect(page.locator('.preview-home-indicator')).toHaveCount(1);
  await expect(privacy.locator('.preview-home-indicator')).toHaveCount(0);
});

for (const width of [360, 375, 390, 430]) {
  test(`App direct route has its own navigation and fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/teacher-app/v1?theme=light&appBack=none&appAction=more');
    await page.reload();
    await expect(page.getByRole('navigation', { name: 'App 顶部导航' })).toBeVisible();
    await expect(page.locator('.preview-system-status, .preview-wechat-nav, .preview-home-indicator')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'App 返回' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'App 更多' })).toBeVisible();
    await expect(page).toHaveTitle('教师端-app');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
