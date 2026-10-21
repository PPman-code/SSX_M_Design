import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`search uses compact field and filled clear icon with focus restoration in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, label] of [['mobile', '搜索示例'], ['pages/students/v1', '搜索学员'], ['pages/prospective-students/v1', '搜索客户']]) {
      await page.goto(`/#/${route}?theme=${theme}`);
      const input = page.getByRole('textbox', { name: label, exact: true });
      const search = input.locator('xpath=ancestor::div[contains(concat(" ",@class," ")," search ")]');
      await expect(search).toHaveCSS('height', '56px');
      await expect(search.locator('.search-field')).toHaveCSS('height', '36px');
      await expect(input).toHaveCSS('height', '36px');
      await input.fill('测试');
      const clear = search.getByRole('button', { name: /清除/ });
      await expect(clear.locator('use')).toHaveAttribute('href', /#SSX-close-circle-fill$/);
      expect(await clear.evaluate(el => parseFloat(getComputedStyle(el, '::after').height))).toBeGreaterThanOrEqual(40);
      await clear.click();
      await expect(input).toHaveValue('');
      await expect(input).toBeFocused();
      await expect(clear).toHaveCount(0);
    }
  });
}
