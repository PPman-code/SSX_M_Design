import { test, expect, type Page } from '@playwright/test';

async function gradientGap(page: Page) {
  return page.locator('.ai-customer-page').evaluate(el => {
    const root = el.querySelector<HTMLElement>('.product-scroll')!;
    const header = el.querySelector<HTMLElement>('.ai-customer-navigation')!;
    const tabs = el.querySelector<HTMLElement>('.ai-customer-tabs')!;
    const owner = [header, root].find(node => getComputedStyle(node).backgroundImage.includes('linear-gradient'));
    if (!owner) return 9999;
    const style = getComputedStyle(owner);
    const bottom = owner.getBoundingClientRect().top + parseFloat(style.backgroundPositionY) + parseFloat(style.backgroundSize.split(' ')[1]);
    return Math.abs(bottom - tabs.getBoundingClientRect().bottom);
  });
}

for (const theme of ['light', 'dark']) {
  for (const width of [360, 375, 390, 430]) {
    test(`student gradient follows the tab after actions expand at ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/#/pages/student-info/v1?student=s4&theme=${theme}&chrome=wechat`);
      const header = page.locator('.ai-customer-navigation');
      const root = page.locator('.product-scroll');
      await expect.poll(() => gradientGap(page)).toBeLessThan(1);
      await expect.poll(() => page.locator('.student-detail-actions img').evaluateAll(es => es.every(el => (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: `/tmp/ssx-detail-gradient-${width}-${theme}.png` });
      await page.getByRole('button', { name: '展开全部学员功能', exact: true }).click();
      await expect.poll(() => gradientGap(page)).toBeLessThan(1);
      await expect.poll(() => page.locator('.student-detail-actions img').evaluateAll(es => es.every(el => (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
      await page.screenshot({ path: `/tmp/ssx-detail-gradient-expanded-${width}-${theme}.png` });
      await root.evaluate(el => { el.scrollTop = 500; });
      await expect(header).toHaveAttribute('data-pinned');
      await expect(header).toHaveCSS('background-image', 'none');
      expect(await header.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await page.locator('.ai-customer-tabs').evaluate(el => getComputedStyle(el).backgroundColor));
      await root.evaluate(el => { el.scrollTop = 0; });
      await expect(header).not.toHaveAttribute('data-pinned');
      await expect.poll(() => gradientGap(page)).toBeLessThan(1);
      await page.getByRole('button', { name: '收起学员功能', exact: true }).click();
      await expect.poll(() => gradientGap(page)).toBeLessThan(1);
    });
  }
  test(`prospective detail keeps the same tab gradient alignment in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/customer-info/v1?customer=customer-3&theme=${theme}&chrome=wechat`);
    await expect.poll(() => gradientGap(page)).toBeLessThan(1);
    await page.screenshot({ path: `/tmp/ssx-prospective-gradient-${theme}.png` });
  });
}
