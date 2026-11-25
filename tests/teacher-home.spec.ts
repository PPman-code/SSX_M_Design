import { expect, test } from '@playwright/test';

test('home navigation turns solid after scrolling and restores its transparent top state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/teacher-app/v1?theme=light&chrome=app');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  const school = page.getByRole('button', { name: '当前校区：星禾艺术学校', exact: true });
  const top = page.locator('.app-page-top');
  await expect(school).toBeVisible();
  await expect(top).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(school).toHaveCSS('background-color', 'color(srgb 1 1 1 / 0.4)');
  await expect(page.getByRole('button', { name: '通知', exact: true })).toHaveCSS('background-color', 'color(srgb 1 1 1 / 0.4)');
  const scroll = page.locator('main.product-scroll');
  await scroll.evaluate(el => { el.scrollTop = 400; });
  await expect(top).toHaveCSS('background-color', 'color(srgb 1 1 1 / 0.94)');
  await expect(school).toBeVisible();
  await expect(school).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.getByRole('button', { name: '通知', exact: true })).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await scroll.evaluate(el => { el.scrollTop = 0; });
  await expect(top).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(school).toHaveCSS('background-color', 'color(srgb 1 1 1 / 0.4)');
  await page.getByRole('button', { name: '我的', exact: true }).click();
  await expect(page.getByRole('button', { name: '设置', exact: true })).toBeVisible();
});

test('today courses keep the four design states regardless of the device time', async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-24T06:00:00+08:00'));
  await page.goto('/#/pages/teacher-app/v1?theme=light');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  const courses = page.getByRole('region', { name: '今日课程', exact: true });
  await expect(courses.getByRole('button', { name: '共 4 节课', exact: true })).toBeVisible();
  await expect(courses.locator('.workbench-course-time strong')).toHaveText(['08:00–08:45', '09:00–09:45', '10:00–11:00', '14:00–14:45']);
  await expect(courses.locator('.workbench-attendance')).toHaveText(['已点名：7/10', '超时未点名：10/10', '已点名：7/10', '未点名：0/10']);
  await expect(courses.getByRole('button', { name: '点名', exact: true })).toHaveCount(4);
  const before = (await courses.textContent())!;
  await page.clock.setFixedTime(new Date('2026-11-24T21:00:00+08:00'));
  await page.reload();
  await expect(courses).toHaveText(before);
  await expect(page.getByRole('region', { name: '我的待办' }).getByRole('button', { name: /1\s*待点名/ })).toBeVisible();
});

test('floating app navigation preserves safe area and switches pages without covering the final course', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.goto('/#/pages/teacher-app/v1?theme=light&chrome=app');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  const nav = page.getByRole('navigation', { name: '工作台导航', exact: true });
  for (const width of [360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const bounds = (await nav.boundingBox())!;
    expect(bounds.x).toBeCloseTo(38, 0);
    expect(bounds.width).toBeCloseTo(width - 76, 0);
    expect(bounds.height).toBe(56);
    const indicator = (await page.locator('.app-home-indicator').boundingBox())!;
    expect(bounds.y + bounds.height).toBeCloseTo(indicator.y, 0);
    await page.locator('main.product-scroll').evaluate(el => { el.scrollTop = el.scrollHeight; });
    const lastCourse = (await page.locator('.workbench-course').last().boundingBox())!;
    expect(lastCourse.y + lastCourse.height).toBeLessThanOrEqual(bounds.y);
  }
  await nav.getByRole('button', { name: '我的', exact: true }).click();
  await expect(nav.getByRole('button', { name: '我的', exact: true })).toHaveAttribute('aria-current', 'page');
  await nav.getByRole('button', { name: 'AIRA', exact: true }).click();
  await expect(page.locator('.toast').getByText('未接入', { exact: true })).toBeVisible();
  await expect(nav.getByRole('button', { name: '我的', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('real App viewport paints the status safe area with the scrolling header and fills the host', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/teacher-app/v1?theme=light');
  // Desktop engines have zero hardware insets; supply representative geometry.
  await page.addStyleTag({ content: ':root { --app-top-safe-area: 59px; --product-bottom-safe-area: 34px; }' });
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  const app = page.locator('.app-page');
  const header = page.locator('.app-page-top');
  await expect(app).toHaveCSS('padding-top', '0px');
  await expect(header).toHaveCSS('padding-top', '59px');
  expect((await header.boundingBox())!.y).toBe(0);
  expect((await header.boundingBox())!.height).toBe(115);
  expect((await app.boundingBox())!.height).toBe(844);
  const scroll = page.locator('main.product-scroll');
  await scroll.evaluate(el => { el.scrollTop = 400; });
  await expect(header).toHaveCSS('background-color', 'color(srgb 1 1 1 / 0.94)');
  const nav = (await page.locator('.workbench-navigation').boundingBox())!;
  expect(nav.y + nav.height).toBe(810);
  await page.setViewportSize({ width: 390, height: 700 });
  expect((await app.boundingBox())!.height).toBe(700);
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  const host = await page.locator('html').evaluate(el => ({ scroll: el.scrollHeight, height: el.clientHeight }));
  expect(host.scroll).toBe(host.height);
});

test('teacher App preserves the restored translucent status bar configuration', async ({ page }) => {
  await page.goto('/#/pages/teacher-app/v1?theme=light');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent');
  await page.goto('/#/?page=teacher-app&theme=light');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent');
  await page.goto('/#/pages/my/v1?theme=light');
  await expect(page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')).toHaveAttribute('content', 'black-translucent');
});
