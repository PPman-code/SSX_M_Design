import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`student status colors match between list and profile in ${theme}`, async ({ page }) => {
    await page.goto(`/#/pages/students/v1?theme=${theme}`);
    const colors = await page.locator('.student-card .student-status').evaluateAll(es => es.map(el => ({ text: el.textContent, foreground: getComputedStyle(el).color, background: getComputedStyle(el).backgroundColor })));
    for (const [index, color] of colors.entries()) {
      await page.goto(`/#/pages/student-info/v1?student=s${index + 1}&theme=${theme}`);
      const status = page.locator('.student-detail-profile .student-status-colors');
      await expect(status).toHaveText(color.text!);
      await expect(status).toHaveCSS('color', color.foreground);
      await expect(status).toHaveCSS('background-color', color.background);
      await expect(status).toHaveCSS('height', '18px');
    }
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`profile name, number, gender and copy action fit at ${width}`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/student-info/v1?student=s1&chrome=wechat');
    const profile = page.locator('.student-detail-profile');
    const name = profile.locator('.student-detail-name');
    await expect(name).toHaveText('金灿灿（XGJ001）');
    await expect(name).toHaveCSS('text-overflow', 'ellipsis');
    await expect(profile.getByRole('img', { name: '男', exact: true })).toBeVisible();
    await expect(profile).toContainText('在班组数量：2');
    await page.getByRole('button', { name: '复制学员姓名', exact: true }).click();
    await expect(page.getByText('已复制：金灿灿（XGJ001）', { exact: true })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('金灿灿');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(await profile.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect.poll(() => profile.locator('.ai-avatar img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await page.screenshot({ path: `/tmp/ssx-student-profile-${width}.png` });
    await page.getByRole('button', { name: '查看学员资料', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '学员资料', exact: true })).toContainText('XGJ001');
  });
}

test('female gender and zero class group count remain visible', async ({ page }) => {
  await page.goto('/#/pages/student-info/v1?student=s3');
  await expect(page.locator('.student-detail-profile').getByRole('img', { name: '女', exact: true })).toBeVisible();
  await page.goto('/#/pages/student-info/v1?student=s2');
  await expect(page.locator('.student-detail-profile')).toContainText('在班组数量：0');
});

test('failed copy does not claim success or open the profile', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } });
    document.execCommand = () => false;
  });
  await page.goto('/#/pages/student-info/v1?student=s1');
  await page.getByRole('button', { name: '复制学员姓名', exact: true }).click();
  await expect(page.getByRole('region', { name: '轻提示', exact: true }).getByText('复制失败，请长按姓名复制', { exact: true })).toBeVisible();
  await expect(page.getByText('已复制：金灿灿（XGJ001）', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});
