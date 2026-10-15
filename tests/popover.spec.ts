import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`popover positions and dismisses correctly in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const section = page.getByRole('region', { name: '气泡提示', exact: true });
    for (const label of ['上左', '上方', '上右', '下左', '下方', '下右']) {
      const trigger = section.getByRole('button', { name: `${label}气泡`, exact: true });
      await trigger.click();
      const popup = page.getByRole('dialog', { name: '气泡提示' });
      await expect(popup).toBeVisible();
      await expect(popup).toContainText(`${label}的轻量说明`);
      const bounds = await popup.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(11);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(364);
      await page.keyboard.press('Escape');
      await expect(popup).toBeHidden();
      await expect(trigger).toBeFocused();
    }
    await section.getByRole('button', { name: '黑色气泡', exact: true }).click();
    await expect(page.locator('.popover--dark')).toBeVisible();
    await expect(page.locator('.popover--dark')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.screenshot({ path: `test-results/popover-dark-${mode}.png` });
    await section.getByRole('heading', { name: '气泡提示', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '气泡提示' })).toBeHidden();
    await section.getByRole('button', { name: '带关闭气泡', exact: true }).click();
    await page.getByRole('button', { name: '关闭气泡', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '气泡提示' })).toBeHidden();
    await section.getByRole('button', { name: '带按钮气泡', exact: true }).click();
    await page.screenshot({ path: `test-results/popover-action-${mode}.png` });
    await page.getByRole('button', { name: '确认', exact: true }).click();
    await expect(section.getByText('已执行气泡按钮操作')).toBeVisible();
    await expect(page.getByRole('dialog', { name: '气泡提示' })).toBeHidden();
    await section.getByRole('button', { name: '带文本气泡', exact: true }).click();
    await page.getByRole('button', { name: '查看', exact: true }).click();
    await expect(section.getByText('已执行气泡文本操作')).toBeVisible();
    await expect(page.getByRole('dialog', { name: '气泡提示' })).toBeHidden();
  });
}
