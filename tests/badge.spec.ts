import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`badge displays six variants and updates attached unread count in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const section = page.getByRole('region', { name: '徽标', exact: true });
    await expect(section.locator('.badge-samples .badge')).toHaveCount(6);
    await expect(section.locator('.badge-samples .badge--dot')).toHaveCount(2);
    await expect(section.locator('.badge-samples .badge--bordered')).toHaveCount(3);
    const attached = section.locator('.badge-attached .badge-anchor').first();
    await expect(attached.getByRole('img', { name: '2 条未读消息' })).toHaveText('2');
    await section.getByRole('button', { name: '增加数量', exact: true }).click();
    await expect(attached.getByRole('img', { name: '3 条未读消息' })).toHaveText('3');
    await section.getByRole('button', { name: '超过上限', exact: true }).click();
    await expect(attached.getByRole('img', { name: '100 条未读消息' })).toHaveText('99+');
    await expect(attached.locator('.badge')).toHaveCSS('pointer-events', 'none');
    await section.screenshot({ path: `test-results/badges-${mode}.png` });
    await section.getByRole('button', { name: '消息', exact: true }).click();
    await expect(attached.locator('.badge')).toHaveCount(0);
    await expect(attached.getByRole('button', { name: '消息', exact: true })).toBeVisible();
    await section.getByRole('button', { name: '增加数量', exact: true }).click();
    await expect(attached.locator('.badge')).toHaveText('1');
    await section.getByRole('button', { name: '清空数量', exact: true }).click();
    await expect(attached.locator('.badge')).toHaveCount(0);
  });
}
