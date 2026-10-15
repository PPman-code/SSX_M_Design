import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`button styles preserve brand color and prevent repeated loading actions in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const section = page.getByRole('region', { name: '按钮', exact: true });
    const loading = section.getByRole('button', { name: '加载状态示例', exact: true });
    const background = mode === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)';
    await expect(loading).toHaveCSS('background-color', background);
    await loading.click();
    const busy = section.getByRole('button', { name: '处理中', exact: true });
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveCSS('background-color', background);
    await expect(busy.locator('.button-spinner')).toBeVisible();
    await section.getByRole('button', { name: '结束加载', exact: true }).click();
    await expect(loading).toBeEnabled();
    await expect(loading).not.toHaveAttribute('aria-busy', 'true');
    const icon = section.getByRole('button', { name: '仅图标确认', exact: true });
    await icon.focus();
    await page.keyboard.press('Space');
    await expect(section.getByText('已点击纯图标按钮')).toBeVisible();
    for (const name of ['主要操作', '次要操作', '辅助色按钮', '线框按钮', '文字按钮', '危险操作', '警告操作', '通栏按钮']) {
      const button = section.getByRole('button', { name, exact: true });
      expect((await button.boundingBox())!.height).toBe(44);
      await expect(button).toHaveCSS('border-radius', '8px');
      await expect(button).toHaveCSS('font-size', '15px');
      await expect(button).toHaveCSS('font-weight', '400');
    }
    expect(await section.getByRole('button', { name: '全圆角', exact: true }).evaluate((element) => parseFloat(getComputedStyle(element).borderRadius) >= element.getBoundingClientRect().height / 2)).toBe(true);
    await expect(section.getByRole('button', { name: '直角按钮', exact: true })).toHaveCSS('border-radius', '0px');
    await expect(section.getByRole('button', { name: '禁用线框', exact: true })).toBeDisabled();
    await expect(section.getByRole('button', { name: '禁用辅助色', exact: true })).toBeDisabled();
    expect(await section.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
    await section.screenshot({ path: `test-results/button-variants-${mode}.png` });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await loading.click();
    await expect(busy.locator('.button-spinner')).toHaveCSS('animation-name', 'none');
  });
}
