import { expect, test } from '@playwright/test';

test('account actions live in settings and returning to mine keeps the session', async ({ page }) => {
  await page.goto('/#/pages/teacher-app/v1?theme=light');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await page.getByRole('button', { name: '我的', exact: true }).click();
  await page.getByRole('button', { name: '首页', exact: true }).click();
  await page.getByRole('button', { name: '我的', exact: true }).click();
  for (const width of [360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const name = (await page.locator('.my-name').boundingBox())!;
    const school = (await page.locator('.teacher-mine-school').boundingBox())!;
    const profile = (await page.locator('.my-profile').boundingBox())!;
    expect(Math.abs(school.x - name.x)).toBeLessThan(1);
    // Inline font boxes can differ from their line box by 1–2px.
    expect(school.y).toBeGreaterThanOrEqual(name.y + name.height - 2);
    expect(school.y + school.height).toBeLessThanOrEqual(profile.y + profile.height);
    expect(school.x + school.width).toBeLessThanOrEqual(profile.x + profile.width);
  }
  await expect(page.getByRole('button', { name: '退出登录', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '解绑手机号', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '当前学校：星禾艺术学校' })).toBeVisible();
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await expect(page.getByRole('heading', { name: '设置', exact: true })).toBeFocused();
  await expect(page.getByText('已绑定 137****7000', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '工作台导航' })).toHaveCount(0);
  await page.getByRole('button', { name: '返回我的', exact: true }).click();
  await expect(page.getByRole('button', { name: '设置', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('button', { name: '退出登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '手机号登录', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: '手机号登录', exact: true })).toBeVisible();
});
