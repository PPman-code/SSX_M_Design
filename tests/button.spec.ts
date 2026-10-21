import { test, expect } from '@playwright/test';

for (const mode of ['light', 'dark']) {
  test(`button styles preserve brand color and prevent repeated loading actions in ${mode}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/mobile?theme=${mode}`);
    const section = page.getByRole('region', { name: '按钮', exact: true });
    await expect(section.getByRole('button', { name: '次要操作', exact: true })).toHaveClass(/button--soft/);
    const loading = section.getByRole('button', { name: '加载状态示例', exact: true });
    const background = mode === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)';
    await expect(loading).toHaveCSS('background-color', background);
    await loading.click();
    const busy = section.getByRole('button', { name: '处理中', exact: true });
    await expect(busy).toHaveAttribute('aria-busy', 'true');
    await expect(busy).toBeDisabled();
    await expect(busy).toHaveCSS('background-color', background);
    await expect(busy.locator('.button-spinner')).toBeVisible();
    await expect(busy.locator('.button-spinner')).toHaveAttribute('data-icon', 'loading');
    await section.getByRole('button', { name: '结束加载', exact: true }).click();
    await expect(loading).toBeEnabled();
    await expect(loading).not.toHaveAttribute('aria-busy', 'true');
    const icon = section.getByRole('button', { name: '仅图标确认', exact: true });
    await expect(icon).toHaveCSS('width', '40px');
    await expect(icon).toHaveCSS('height', '40px');
    await icon.focus();
    await page.keyboard.press('Space');
    await expect(section.getByText('已点击纯图标按钮')).toBeVisible();
    for (const name of ['主要操作', '次要操作', '中性描边按钮', '线框按钮', '危险操作', '警告操作', '通栏按钮']) {
      const button = section.getByRole('button', { name, exact: true });
      expect((await button.boundingBox())!.height).toBe(40);
      await expect(button).toHaveCSS('border-radius', '8px');
      await expect(button).toHaveCSS('font-size', '15px');
      await expect(button).toHaveCSS('font-weight', '400');
      const target = (await button.boundingBox())!;
      expect(target.height).toBeGreaterThanOrEqual(40);
      expect(target.width).toBeGreaterThanOrEqual(40);
    }
    const text = section.getByRole('button', { name: '文字按钮', exact: true });
    await expect(text).toHaveCSS('height', '24px');
    await expect(text).toHaveCSS('padding-top', '0px');
    await expect(text).toHaveCSS('padding-bottom', '0px');
    await expect(text).toHaveCSS('border-radius', '0px');
    await expect(text).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(await text.evaluate(el => parseFloat(getComputedStyle(el, '::after').height))).toBeGreaterThanOrEqual(40);
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
