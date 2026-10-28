import { test, expect } from '@playwright/test';

for (const [width, theme] of [[360, 'light'], [390, 'light'], [430, 'light'], [390, 'dark']] as const) {
  test(`calendar date draft, pending and month list ${width} ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-28T10:00:00+08:00'));
    await page.setViewportSize({ width, height: 844 });
    await page.goto(`/#/pages/communication-form/v1?customer=customer-1&theme=${theme}&chrome=wechat`);
    const field = page.getByRole('button', { name: /^下次跟进日期/ });
    await field.click();
    const calendar = page.getByRole('dialog', { name: '下次跟进日期', exact: true });
    await expect(calendar.getByRole('button', { name: '2026-10-27', exact: true })).toBeDisabled();
    await calendar.getByRole('button', { name: '2026-10-30', exact: true }).click();
    await calendar.getByRole('button', { name: '关闭弹层', exact: true }).click();
    await expect(field).toContainText('待定');
    await field.click();
    await calendar.getByRole('button', { name: '2026-10-30', exact: true }).click();
    await expect(calendar.getByRole('button', { name: '2026-10-30', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => calendar.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    expect(await calendar.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await calendar.locator('.sheet-content').evaluate(el => { el.scrollTop = 0; });
    await page.screenshot({ path: `outputs/calendar-${width}-${theme}.png` });
    const pending = await calendar.getByRole('button', { name: '待定', exact: true }).boundingBox();
    const confirm = await calendar.getByRole('button', { name: '确定', exact: true }).boundingBox();
    expect(pending!.x).toBeLessThan(confirm!.x);
    expect(pending!.y).toBe(confirm!.y);
    await calendar.getByRole('button', { name: '确定', exact: true }).click();
    await expect(field).toContainText('2026/10/30');
    await field.click();
    await calendar.getByRole('button', { name: '2027-02-28', exact: true }).scrollIntoViewIfNeeded();
    await calendar.getByRole('button', { name: '2027-02-28', exact: true }).click();
    await expect(calendar.getByRole('button', { name: '2027-02-29', exact: true })).toHaveCount(0);
    await calendar.getByRole('button', { name: '确定', exact: true }).click();
    await expect(field).toContainText('2027/02/28');
    await field.click();
    await calendar.getByRole('button', { name: '待定', exact: true }).click();
    await expect(field).toContainText('待定');
    await page.getByRole('switch', { name: '承诺到访', exact: true }).check();
    await page.getByRole('button', { name: /^到访日期/ }).click();
    const visit = page.getByRole('dialog', { name: '到访日期', exact: true });
    await expect(visit.getByRole('button', { name: '待定', exact: true })).toHaveCount(0);
    await visit.getByRole('button', { name: '2026-11-01', exact: true }).click();
    await visit.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('button', { name: /^到访日期/ })).toContainText('2026/11/01');
  });
}
