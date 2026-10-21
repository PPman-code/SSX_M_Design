import { test, expect } from '@playwright/test';

for (const chrome of ['', '&chrome=wechat']) {
  for (const item of [
    { page: 'prospective-students', action: '.prospect-call', sticky: '.prospect-tools' },
    { page: 'students', action: '.student-round-action', sticky: '.student-tabs' },
  ]) {
    test(`${item.page} card actions stay below sticky controls ${chrome ? 'in WeChat preview' : 'standalone'}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 600 });
      await page.goto(`/#/pages/${item.page}/v1?theme=light${chrome}`);
      const action = page.locator(item.action).first();
      const scroll = page.locator('.product-scroll');
      const start = (await action.boundingBox())!;
      const viewport = (await scroll.boundingBox())!;
      await scroll.evaluate((element, offset) => { element.scrollTop = offset; }, start.y - viewport.y - 10);
      const moved = (await action.boundingBox())!;
      const sticky = (await page.locator(item.sticky).boundingBox())!;
      expect(moved.y + moved.height / 2).toBeGreaterThanOrEqual(sticky.y);
      expect(moved.y + moved.height / 2).toBeLessThan(sticky.y + sticky.height);
      await expect.poll(() => action.evaluate((element, stickySelector) => {
        const rect = element.getBoundingClientRect();
        return !!element.ownerDocument.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2)?.closest(stickySelector);
      }, item.sticky)).toBe(true);
    });
  }
}
