import { test, expect } from '@playwright/test';

test('configuration follows preview navigation and edits the current report without breaking back', async ({ page }) => {
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  const config = page.getByRole('region', { name: '页面配置', exact: true });
  await expect(config).toContainText('首页 · v1');
  await frame.getByRole('button', { name: '出勤率', exact: true }).click();
  await expect(config).toContainText('出勤率报表 · v2');
  await expect(config.getByLabel('当前身份')).toHaveValue('teacher');
  await frame.locator('.att-v2-summary').first().getByRole('button').first().click();
  await frame.getByRole('button', { name: '查看课次明细', exact: true }).click();
  await expect(config).toContainText('上课明细 · v2');
  await frame.getByRole('button', { name: '微信后退', exact: true }).click();
  await expect(config).toContainText('出勤率报表 · v2');
  await config.getByLabel('当前身份').selectOption('principal');
  await expect(frame.getByText('校长身份暂无出勤率报表数据')).toBeVisible();
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
