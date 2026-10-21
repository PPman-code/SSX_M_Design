import { test, expect } from '@playwright/test';
for (const mode of ['light', 'dark']) {
  test(`collapse supports exclusive, multiple, disabled and card states in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const group = page.getByRole('group', { name: '基础折叠示例', exact: true });
    const first = group.getByRole('button', { name: '基础折叠标题', exact: true });
    const second = group.getByRole('button', { name: '带图标与说明', exact: true });
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    for (const item of await group.getByRole('button').all()) {
      await expect(item).toHaveCSS('height', '56px');
      const total = await item.evaluate(el => el.closest('.collapse-item')!.getBoundingClientRect().height);
      expect(total).toBe(56);
    }
    await expect(first).toHaveCSS('line-height', '24px');
    for (const icon of await group.locator('svg').all()) {
      await expect(icon).toHaveCSS('width', '18px');
      await expect(icon).toHaveCSS('height', '18px');
    }
    await expect(page.getByLabel('基础输入', { exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]')).toHaveCSS('height', '56px');
    await expect(page.getByRole('group', { name: '单元格示例', exact: true }).locator('.base-cell').first()).toHaveCSS('height', '56px');
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveCSS('height', '56px');
    const panelId = await first.getAttribute('aria-controls');
    await expect(page.locator(`[id="${panelId}"]`)).toBeVisible();
    await group.getByRole('button', { name: '面板内操作' }).click();
    await expect(page.getByText('已操作折叠内容')).toBeVisible();
    await second.click();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(group.getByRole('button', { name: '禁用折叠面板' })).toBeDisabled();
    await expect(group.getByText('禁用内容不应打开。')).toHaveCount(0);
    const multiple = page.getByRole('group', { name: '多项折叠示例' });
    const buttons = multiple.getByRole('button');
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true');
    await buttons.last().click();
    await expect(buttons.first()).toHaveAttribute('aria-expanded', 'true');
    await expect(buttons.last()).toHaveAttribute('aria-expanded', 'true');
    const card = page.getByRole('group', { name: '卡片折叠示例' });
    await expect(card.locator('.collapse-summary')).toBeVisible();
    await expect(card.locator('.collapse-panel')).toHaveCount(0);
    const cardTrigger = card.getByRole('button');
    await expect(cardTrigger).toHaveCSS('height', '56px');
    await cardTrigger.click();
    await expect(card.locator('.collapse-panel')).toBeVisible();
    await expect(card.locator('.collapse-summary')).toBeVisible();
    await cardTrigger.focus();
    await page.keyboard.press('Space');
    await expect(card.locator('.collapse-panel')).toHaveCount(0);
    await expect(card.locator('.collapse-summary')).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await first.click();
    await expect(group.locator('.collapse-panel')).toHaveCount(1);
    const reducedPanel = group.locator('.collapse-panel[data-open]');
    await expect(reducedPanel).toBeVisible();
    expect(await reducedPanel.evaluate(el => parseFloat(getComputedStyle(el).transitionDuration))).toBeLessThanOrEqual(0.001);
    const section = page.getByRole('region', { name: '折叠面板', exact: true });
    expect(await section.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await section.screenshot({ path: `test-results/collapse-${mode}.png` });
  });
}
