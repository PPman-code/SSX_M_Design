import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`customer date selectors keep nested drafts and shared geometry in ${theme}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-10-21T12:00:00+08:00') });
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}&chrome=wechat`);
    const openFilter = page.getByRole('button', { name: '筛选客户', exact: true });
    await openFilter.click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    await expect(filter.getByRole('button', { name: '录入时间 不限', exact: true }).locator('.base-cell-value')).toHaveCSS('font-size', '14px');
    const next = filter.getByRole('button', { name: '下次跟进时间 不限', exact: true });
    await expect(next).toHaveCSS('height', '56px');
    await expect(filter.locator('input[type="date"]')).toHaveCount(0);
    const region = filter.getByRole('textbox', { name: '号码归属地', exact: true });
    const regionField = region.locator('xpath=ancestor::div[contains(@class,"ssx-input--external")]');
    await expect(regionField.locator('.ssx-input-body')).toHaveCSS('height', '44px');
    expect(await regionField.evaluate(el => el.querySelector('label')!.getBoundingClientRect().bottom < el.querySelector('.ssx-input-body')!.getBoundingClientRect().top)).toBe(true);
    await region.fill('北京');
    await filter.getByRole('button', { name: '清除号码归属地', exact: true }).click();
    await expect(region).toHaveValue('');
    await next.click();
    const picker = page.getByRole('dialog', { name: '下次跟进时间', exact: true });
    await expect(picker.getByRole('button', { name: /^开始日期/ })).toContainText('请选择');
    await picker.getByRole('button', { name: '上月', exact: true }).click();
    await picker.getByRole('button', { name: '关闭弹层' }).click();
    await expect(next).toBeFocused();
    await next.click();
    await expect(picker.getByRole('button', { name: /^开始日期/ })).toContainText('请选择');
    await picker.getByRole('button', { name: '本月', exact: true }).click();
    await picker.getByRole('button', { name: /^结束日期/ }).click();
    const month = picker.getByRole('listbox', { name: '月', exact: true });
    await month.focus(); await month.press('ArrowUp');
    await picker.getByRole('button', { name: '确认', exact: true }).click();
    await expect(picker.getByRole('alert')).toContainText('开始日期不能晚于结束日期');
    await picker.getByRole('button', { name: '重置', exact: true }).click();
    await expect(picker.getByRole('alert')).toHaveCount(0);
    await expect(picker.getByRole('listbox')).toHaveCount(0);
    await expect(picker.locator('.sheet-footer')).toHaveCSS('height', '56px');
    await picker.getByRole('button', { name: '本月', exact: true }).click();
    await picker.getByRole('button', { name: '确认', exact: true }).click();
    await expect(filter.getByRole('button', { name: /下次跟进时间.*2026\/10\/01.*2026\/10\/21/ })).toBeVisible();
    for (const label of ['录入时间', '上次沟通时间']) {
      await filter.getByRole('button', { name: `${label} 不限`, exact: true }).click();
      const sheet = page.getByRole('dialog', { name: label, exact: true });
      await sheet.getByRole('button', { name: '上月', exact: true }).click();
      await sheet.getByRole('button', { name: '确认', exact: true }).click();
      await expect(filter.getByRole('button', { name: new RegExp(`${label}.*2026/09/01.*2026/09/30`) })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await openFilter.click();
    await expect(filter.getByRole('button', { name: '下次跟进时间 不限', exact: true })).toBeVisible();
    await filter.getByRole('button', { name: '下次跟进时间 不限', exact: true }).click();
    await picker.getByRole('button', { name: '本月', exact: true }).click();
    await picker.getByRole('button', { name: '确认', exact: true }).click();
    await filter.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('listitem')).toContainText('廖小龙');
    await openFilter.click();
    await filter.getByRole('button', { name: /下次跟进时间.*2026\/10\/01/ }).click();
    await picker.getByRole('button', { name: '重置', exact: true }).click();
    await picker.getByRole('button', { name: '确认', exact: true }).click();
    await filter.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(10);
  });
}

test('customer date fields preserve open-ended ranges without changing other time filters', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00+08:00') });
  await page.goto('/#/pages/prospective-students/v1');
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
  await filter.getByRole('button', { name: '下次跟进时间 不限', exact: true }).click();
  const picker = page.getByRole('dialog', { name: '下次跟进时间', exact: true });
  await picker.getByRole('button', { name: /^开始日期/ }).click();
  await expect(picker.getByRole('button', { name: /^结束日期/ })).toContainText('请选择');
  await picker.getByRole('button', { name: '确认', exact: true }).click();
  await expect(filter.getByRole('button', { name: '下次跟进时间 2026/10/21 起', exact: true })).toBeVisible();
  await expect(filter.getByRole('button', { name: '录入时间 不限', exact: true })).toBeVisible();
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(4);
});

for (const width of [375, 390, 430]) {
  test(`selected customer ranges keep 56px rows without overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/prospective-students/v1?chrome=wechat');
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    await filter.getByRole('button', { name: '录入时间 不限', exact: true }).click();
    const dates = page.getByRole('dialog', { name: '录入时间', exact: true });
    await dates.getByRole('button', { name: '上月', exact: true }).click();
    await dates.getByRole('button', { name: '确认', exact: true }).click();
    const row = filter.getByRole('button', { name: /^录入时间.*\d/ });
    await expect(row.locator('.base-cell-value')).toHaveCSS('font-size', '12px');
    await expect(row).toHaveCSS('height', '56px');
    expect(await row.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await expect(filter.locator('.sheet-footer')).toHaveCSS('height', '56px');
  });
}

for (const theme of ['light', 'dark']) {
  test(`date summaries use equal-width digits in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.clock.install({ time: new Date('2026-10-21T12:00:00+08:00') });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    for (const [label, preset] of [['下次跟进时间', '本月'], ['录入时间', '上月'], ['上次沟通时间', '最近30天']]) {
      await filter.getByRole('button', { name: `${label} 不限`, exact: true }).click();
      const picker = page.getByRole('dialog', { name: label, exact: true });
      await picker.getByRole('button', { name: preset, exact: true }).click();
      await picker.getByRole('button', { name: '确认', exact: true }).click();
    }
    const values = filter.locator('.prospect-date-cells .base-cell-value');
    for (const value of await values.all()) {
      await expect(value).toHaveCSS('font-variant-numeric', 'tabular-nums');
      await expect(value).toHaveCSS('white-space', 'nowrap');
      await expect(value).toHaveCSS('height', '18px');
      expect(await value.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    const widths = await values.evaluateAll(elements => elements.map(element => {
      const style = getComputedStyle(element);
      const probe = document.createElement('span');
      probe.textContent = element.textContent;
      Object.assign(probe.style, { font: style.font, fontVariantNumeric: style.fontVariantNumeric, whiteSpace: 'nowrap', position: 'absolute', visibility: 'hidden' });
      document.body.append(probe);
      const width = probe.getBoundingClientRect().width;
      probe.remove();
      return width;
    }));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(0.1);
  });
}
