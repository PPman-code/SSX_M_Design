import { test, expect } from '@playwright/test';

test('dedicated numeric font is downloaded and rendered without relying on local fonts', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const fontResponse = page.waitForResponse(response => response.url().endsWith('/fonts/numeric/JingBeiNumber-Bold.ttf'));
  await page.goto('/#/pages/parent-course-detail/v1?theme=light&chrome=wechat');
  const response = await fontResponse;
  expect(response.status()).toBe(200);
  expect((await response.body()).length).toBe(3016);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.parent-course-price')).toHaveCSS('font-family', /SSX JingBei Number/);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  const { root } = await cdp.send('DOM.getDocument');
  const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.parent-course-price' });
  const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
  expect(fonts.some(font => font.isCustomFont && font.glyphCount > 0)).toBe(true);
  await page.screenshot({ path: 'outputs/parent-jingbei-price.png' });
  await page.getByRole('button', { name: '选择少儿声乐启蒙课规格参数', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: '选择规格参数', exact: true });
  await expect(sheet.getByRole('button', { name: '20课时', exact: true })).not.toHaveCSS('font-family', /SSX JingBei Number/);
  await expect(sheet.locator('.parent-class-choice').first()).not.toHaveCSS('font-family', /SSX JingBei Number/);
  await expect(page.locator('body')).not.toHaveCSS('font-family', /SSX JingBei Number/);
  await cdp.detach();
});
