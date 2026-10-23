import { test, expect } from '@playwright/test';

for (const version of ['v1', 'v2']) {
  for (const theme of ['light', 'dark']) {
    test(`${version} ${theme} period presets fill draft and custom dates confirm or cancel`, async ({ page }) => {
      await page.clock.install({ time: new Date('2026-10-21T12:00:00+08:00') });
      await page.setViewportSize({ width: 360, height: 844 });
      await page.goto(`/#/pages/attendance/${version}?theme=${theme}&chrome=wechat`);
      const trigger = page.locator(version === 'v1' ? '.att-date' : '.att-v2-date');
      await expect(trigger).toContainText('本月');
      await trigger.click();
      const sheet = page.getByRole('dialog', { name: '统计时段', exact: true });
      for (const option of await sheet.getByRole('group', { name: '快捷时段', exact: true }).getByRole('button').all()) {
        await expect(option).toHaveCSS('font-size', '14px');
        await expect(option).toHaveCSS('height', '36px');
      }
      await expect(sheet.getByRole('button', { name: '本月', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText('2026/10/01');
      await sheet.getByRole('button', { name: '上月', exact: true }).click();
      await expect(sheet).toBeVisible();
      await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText('2026/09/01');
      await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText('2026/09/30');
      await sheet.getByRole('button', { name: '确认', exact: true }).click();
      await expect(trigger).toContainText('上月');
      await trigger.click();
      await expect(sheet.getByRole('button', { name: '上月', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await sheet.getByRole('button', { name: '最近30天', exact: true }).click();
      await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText('2026/09/22');
      await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText('2026/10/21');
      await sheet.getByRole('button', { name: '关闭弹层' }).click();
      await expect(trigger).toContainText('上月');
      await trigger.click();
      await sheet.getByRole('button', { name: /^开始日期/ }).click();
      const day = sheet.getByRole('listbox', { name: '日', exact: true });
      await day.focus();
      await day.press('ArrowDown');
      await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText('2026/09/02');
      await expect(sheet.getByRole('group', { name: '快捷时段', exact: true }).locator('[aria-pressed="true"]')).toHaveCount(0);
      await sheet.getByRole('button', { name: '确认', exact: true }).click();
      await expect(trigger).toContainText('09/02–09/30');
      await trigger.click();
      await expect(sheet.getByRole('group', { name: '快捷时段', exact: true }).locator('[aria-pressed="true"]')).toHaveCount(0);
      await sheet.getByRole('button', { name: '本月', exact: true }).click();
      await expect(sheet.getByRole('listbox')).toHaveCount(0);
      await sheet.getByRole('button', { name: /^结束日期/ }).click();
      await sheet.getByRole('listbox', { name: '月', exact: true }).focus();
      await sheet.getByRole('listbox', { name: '月', exact: true }).press('ArrowUp');
      await sheet.getByRole('button', { name: '确认', exact: true }).click();
      await expect(sheet.getByRole('alert')).toContainText('请选择有效的起止日期');
      const reset = sheet.getByRole('button', { name: '重置', exact: true });
      await reset.click();
      await expect(reset).toHaveClass(/button--soft/);
      await expect(sheet.getByRole('button', { name: '本月', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText('2026/10/01');
      await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText('2026/10/21');
      await expect(sheet.getByRole('alert')).toHaveCount(0);
      await expect(sheet.getByRole('listbox')).toHaveCount(0);
      await expect(sheet.locator('.sheet-footer')).toHaveCSS('height', '56px');
      await sheet.getByRole('button', { name: '关闭弹层' }).click();
      await expect(trigger).toContainText('09/02–09/30');
      await trigger.click();
      await sheet.getByRole('button', { name: '重置', exact: true }).click();
      await sheet.getByRole('button', { name: '确认', exact: true }).click();
      await expect(trigger).toContainText('本月');
    });
  }
}

test('custom wheels clamp leap days when year or month changes', async ({ page }) => {
  await page.clock.install({ time: new Date('2024-03-31T12:00:00+08:00') });
  await page.goto('/#/pages/attendance/v2');
  await page.locator('.att-v2-date').click();
  const sheet = page.getByRole('dialog', { name: '统计时段', exact: true });
  await sheet.getByRole('button', { name: /^结束日期/ }).click();
  const month = sheet.getByRole('listbox', { name: '月', exact: true });
  await month.focus();
  await month.press('ArrowUp');
  await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText('2024/02/29');
  const year = sheet.getByRole('listbox', { name: '年', exact: true });
  await year.focus();
  await year.press('ArrowDown');
  await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText('2025/02/28');
});
