import { test, expect } from '@playwright/test';
for (const width of [360, 375, 390, 430]) {
  test(`home placeholders and report navigation fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/home/v1?theme=light&chrome=wechat');
    await expect(page.getByRole('region', { name: '常用功能', exact: true }).getByRole('button')).toHaveCount(25);
    const reports = page.getByRole('region', { name: '报表中心', exact: true });
    await expect(reports.getByRole('button')).toHaveCount(10);
    await expect(reports.getByRole('button', { name: '出勤率', exact: true })).toHaveCount(1);
    await expect(reports.getByRole('button', { name: '出勤率 v2', exact: true })).toHaveCount(0);
    await expect(reports.locator('img')).toHaveCount(1);
    const attendanceIcon = reports.getByRole('button', { name: '出勤率', exact: true }).locator('img');
    await expect(attendanceIcon).toHaveCSS('width', '32px');
    await expect(attendanceIcon).toHaveCSS('height', '32px');
    await expect.poll(() => attendanceIcon.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(reports.locator('.home-placeholder').first()).toHaveCSS('width', '32px');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('.product-scroll').screenshot({ path: `test-results/home-${width}.png` });
    await reports.scrollIntoViewIfNeeded();
    await reports.screenshot({ path: `test-results/home-reports-${width}.png` });
    await reports.getByRole('button', { name: '出勤率', exact: true }).click();
    await expect(page).toHaveURL(/pages\/attendance\/v2.*from=home/);
    await expect(page.locator('.att-header')).toHaveCount(0);
    await page.getByRole('button', { name: '查看统计范围说明' }).click();
    await expect(page.locator('.att-v2-scope')).toContainText('任课老师或助教');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '微信后退', exact: true }).click();
    await expect(page).toHaveURL(/pages\/home\/v1/);
    await page.getByRole('navigation', { name: '主导航' }).getByRole('button', { name: '我的', exact: true }).click();
    await expect(page).toHaveURL(/pages\/my\/v1/);
  });
}
test('home switches simulated role, preserves dark theme and provides placeholder feedback', async ({ page }) => {
  await page.goto('/#/pages/home/v1?theme=dark');
  await page.getByRole('button', { name: '老师', exact: true }).click();
  await page.getByRole('radio', { name: '学管师', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await page.getByRole('button', { name: '报名收费', exact: true }).click();
  await expect(page.locator('.toast-message')).toHaveText('报名收费页面待补充');
  await page.getByRole('button', { name: '出勤率', exact: true }).click();
  await page.getByRole('button', { name: '查看统计范围说明' }).click();
  await expect(page.locator('.att-v2-scope')).toContainText('学管师');
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/theme=dark/);
});

test('home and my reuse identical tab icons and switch active state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 858 });
  await page.goto('/#/pages/home/v1?theme=light&chrome=wechat&role=teacher');
  const nav = page.getByRole('navigation', { name: '主导航', exact: true });
  const home = nav.getByRole('button', { name: '首页', exact: true });
  const my = nav.getByRole('button', { name: '我的', exact: true });
  await expect(nav.locator('.home-placeholder')).toHaveCount(0);
  await expect(home.locator('use')).toHaveAttribute('href', /#SSX-home-1-fill$/);
  await expect(my.locator('use')).toHaveAttribute('href', /#SSX-user-3-fill$/);
  await expect(home).toHaveAttribute('aria-current', 'page');
  await my.click();
  await expect(page).toHaveURL(/pages\/my\/v1/);
  await expect(my).toHaveAttribute('aria-current', 'page');
  await expect(home.locator('use')).toHaveAttribute('href', /#SSX-home-1-fill$/);
  await expect(my.locator('use')).toHaveAttribute('href', /#SSX-user-3-fill$/);
  await home.click();
  await expect(page).toHaveURL(/pages\/home\/v1/);
  await expect(home).toHaveAttribute('aria-current', 'page');
  await expect(page).toHaveURL(/role=teacher/);
  await page.screenshot({ path: 'test-results/home-shared-tabs.png' });
});
