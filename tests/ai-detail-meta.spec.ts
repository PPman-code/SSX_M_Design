import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`record metadata fits one row at ${width}px and wraps long content`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat&scenario=single');
    await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
    const meta = page.locator('.ai-detail-meta');
    await expect(meta).toBeVisible();
    const items = await meta.locator('span').evaluateAll(nodes => nodes.map(el => el.getBoundingClientRect().top));
    expect(new Set(items).size).toBe(1);
    if (width === 390) await page.screenshot({ path: 'outputs/ai-detail-meta-inline.png' });
    await meta.locator('span').last().evaluate(el => { el.textContent = '关联学员：这是一位用于检查窄屏自动换行的长名称学员'; });
    const bounds = await meta.evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, height: el.clientHeight }));
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.width);
    expect(bounds.height).toBeGreaterThan(20);
  });
}
