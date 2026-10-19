import { test, expect } from '@playwright/test';

test('configuration follows preview navigation and edits the current report without breaking back', async ({ page }) => {
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  const config = page.getByRole('region', { name: '页面配置', exact: true });
  await expect(config).toContainText('首页 · v1');
  await frame.getByRole('button', { name: '出勤率', exact: true }).click();
  await expect(config).toContainText('出勤率报表');
  await expect(config.getByLabel('当前身份')).toHaveCount(0);
  await expect(config).not.toContainText('统计身份');
  await config.getByLabel('页面版本').selectOption('/pages/attendance/v1');
  await expect(frame.locator('.att-overview')).toBeVisible();
  await expect(config.getByLabel('页面版本')).toHaveValue('/pages/attendance/v1');
  await expect(config.getByLabel('页面版本').locator('option')).toHaveText(['1.0', '1.1']);
  await expect(page.getByRole('link', { name: '独立打开' })).toHaveAttribute('href', /attendance\/v1\?.*role=teacher/);
  await expect(page.getByRole('link', { name: '独立打开' })).not.toHaveAttribute('href', /chrome=/);
  await expect.poll(() => frame.locator('html').evaluate(() => location.hash)).toContain('role=teacher');
  await config.getByLabel('页面版本').selectOption('/pages/attendance/v2');
  await expect(frame.locator('.att-v2-overview')).toBeVisible();
  await frame.locator('.att-v2-summary').first().getByRole('button').first().click();
  await frame.getByRole('button', { name: '查看课次明细', exact: true }).click();
  await expect(config).toContainText('上课明细');
  await config.getByLabel('页面版本').selectOption('/pages/attendance/v1');
  await expect(config).toContainText('上课明细');
  await expect.poll(() => frame.locator('html').evaluate(() => location.hash)).toContain('view=detail');
  await config.getByLabel('页面版本').selectOption('/pages/attendance/v2');
  await frame.getByRole('button', { name: '微信后退', exact: true }).click();
  await expect(config).toContainText('出勤率报表');
  await frame.getByRole('button', { name: '微信后退', exact: true }).click();
  await expect(frame.getByRole('region', { name: '报表中心', exact: true })).toBeVisible();
  await expect(config).toContainText('首页 · v1');
  await expect(config.getByLabel('当前身份')).toHaveCount(0);
});

test('configuration follows my page and applies its display state to the preview', async ({ page }) => {
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  const config = page.getByRole('region', { name: '页面配置', exact: true });
  await frame.getByRole('button', { name: '我的', exact: true }).click();
  await expect(config).toContainText('我的 · v1');
  await config.getByLabel('收费管家状态').selectOption('enabled');
  await expect.poll(() => frame.locator('html').evaluate(() => location.hash)).toContain('payment=enabled');
  await expect(config.getByLabel('收费管家状态')).toHaveValue('enabled');
  await frame.getByRole('button', { name: '首页', exact: true }).click();
  await expect(config).toContainText('首页 · v1');
  await expect(config.getByLabel('收费管家状态')).toHaveCount(0);
});
