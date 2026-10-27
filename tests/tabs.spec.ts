import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const scenario of [
    { route: 'students', name: '学员分类', count: 4 },
    { route: 'customer-info', name: '客户详情分类', count: 4 },
    { route: 'ai-record', name: 'AI 记录内容', count: 2 },
  ]) {
    test(`shared content tabs keep focus, panels and page presentation for ${scenario.route} in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      if (scenario.route === 'ai-record') {
        await page.goto(`/#/pages/customer-info/v1?customer=customer-1&scenario=single&theme=${theme}&chrome=wechat`);
        await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
      } else await page.goto(`/#/pages/${scenario.route}/v1?customer=customer-1&theme=${theme}&chrome=wechat`);
      const bar = page.getByRole('tablist', { name: scenario.name, exact: true });
      await expect(bar).toHaveClass(/ssx-tabs/);
      await expect(bar).toHaveCSS('height', '48px');
      const tabs = bar.getByRole('tab');
      await expect(tabs).toHaveCount(scenario.count);
      await tabs.first().focus();
      await tabs.first().press('ArrowLeft');
      await expect(tabs.last()).toBeFocused();
      await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
      const panel = await tabs.last().getAttribute('aria-controls');
      const id = await tabs.last().getAttribute('id');
      await expect(page.locator(`[id="${panel}"]`)).toHaveAttribute('aria-labelledby', id!);
      await tabs.last().press('ArrowRight');
      await expect(tabs.first()).toBeFocused();
      await tabs.first().press('End');
      await expect(tabs.last()).toBeFocused();
      await tabs.last().press('Home');
      await expect(tabs.first()).toBeFocused();
      await tabs.nth(1).click();
      await expect(tabs.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect(tabs.nth(1)).toHaveAttribute('tabindex', '0');
      await expect(tabs.first()).toHaveAttribute('tabindex', '-1');
      await expect(bar.locator('[aria-selected="true"]')).toHaveCount(1);
      if (scenario.route === 'students') {
        await expect(tabs.nth(1)).toHaveText('待沟通 (2)');
        await expect(tabs.nth(1).locator('span')).toHaveCSS('font-size', '12px');
      }
      if (theme === 'light') await page.screenshot({ path: `outputs/shared-tabs-${scenario.route}.png`, animations: 'disabled' });
    });
  }
}

for (const theme of ['light', 'dark']) {
  test(`component gallery exposes Tabs examples with independent focus and generated IDs in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const section = page.getByRole('region', { name: '标签页 Tabs', exact: true });
    await expect(section).toBeVisible();
    const first = section.getByRole('tablist', { name: '等分页签示例', exact: true });
    const primary = section.getByRole('tablist', { name: '首层页签示例', exact: true });
    const content = section.getByRole('tablist', { name: '内容宽度页签示例', exact: true });
    await expect(first).toHaveCSS('height', '48px');
    await expect(primary).toHaveCSS('height', '56px');
    await expect(content).toHaveAttribute('data-indicator', 'label');
    const ids = await section.getByRole('tab').evaluateAll(elements => elements.map(el => el.id));
    expect(new Set(ids).size).toBe(ids.length);
    await first.getByRole('tab', { name: '待沟通 (2)', exact: true }).click();
    await expect(section.getByRole('tabpanel', { name: '待沟通内容', exact: true })).toHaveText('当前：待沟通 · 2 条');
    await primary.getByRole('tab').first().focus();
    await primary.getByRole('tab').first().press('End');
    await expect(primary.getByRole('tab').last()).toBeFocused();
    await expect(first.getByRole('tab', { name: '待沟通 (2)', exact: true })).toHaveAttribute('aria-selected', 'true');
    await content.getByRole('tab', { name: '完整转写', exact: true }).click();
    await expect(section.getByRole('tabpanel', { name: '完整转写内容', exact: true })).toBeVisible();
    await section.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/tabs-examples-${theme}.png`, animations: 'disabled' });
  });
}


test('tabs indicator follows selection, content width, resize and reduced-motion preferences', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/mobile?theme=light');
  const section = page.getByRole('region', { name: '标签页 Tabs', exact: true });
  const fixed = section.getByRole('tablist', { name: '等分页签示例', exact: true });
  const content = section.getByRole('tablist', { name: '内容宽度页签示例', exact: true });
  async function checkAlignment(bar: import('@playwright/test').Locator, fullWidth = false) {
    const line = bar.locator('.ssx-tabs-indicator');
    const selected = bar.locator('[aria-selected="true"]');
    await expect.poll(async () => {
      const a = (await line.boundingBox())!, b = (await selected.boundingBox())!;
      return Math.abs(a.x + a.width / 2 - b.x - b.width / 2);
    }).toBeLessThan(1);
    if (fullWidth) await expect.poll(async () => Math.abs((await line.boundingBox())!.width - (await selected.boundingBox())!.width)).toBeLessThan(1);
    else await expect(line).toHaveCSS('width', '24px');
  }
  await checkAlignment(fixed);
  await expect(fixed.locator('.ssx-tabs-indicator')).toHaveCSS('transition-duration', '0.22s, 0.22s');
  await fixed.getByRole('tab').last().click();
  await checkAlignment(fixed);
  await fixed.getByRole('tab').nth(1).click();
  await fixed.getByRole('tab').first().click();
  await checkAlignment(fixed);
  await content.getByRole('tab').last().click();
  await checkAlignment(content, true);
  await page.setViewportSize({ width: 430, height: 844 });
  await checkAlignment(fixed);
  await checkAlignment(content, true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(fixed.locator('.ssx-tabs-indicator')).toHaveCSS('transition-property', 'none');
  expect(await fixed.locator('.ssx-tabs-indicator').evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001);
  await fixed.getByRole('tab').last().click();
  await checkAlignment(fixed);
});
