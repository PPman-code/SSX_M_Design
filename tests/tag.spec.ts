import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`Tag sizes stay independent of parent typography in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 1600 });
    await page.goto(`/#/mobile?theme=${theme}`);
    const section = page.getByRole('region', { name: '标签 Tag', exact: true });
    for (const [size, height, padding, roundedPadding] of [['sm', 18, 4, 8], ['md', 20, 4, 8], ['lg', 24, 6, 12]] as const) {
      const sample = section.locator(`.ssx-tag[data-size="${size}"]`).first();
      await expect(sample).toHaveCSS('height', `${height}px`);
      await expect(sample).toHaveCSS('font-size', '12px');
      await expect(sample).toHaveCSS('font-weight', '400');
      await expect(sample).toHaveCSS('padding-left', `${padding}px`);
      const rounded = section.locator(`.ssx-tag[data-size="${size}"][data-round="true"]`).first();
      await expect(rounded).toHaveCSS('height', `${height}px`);
      await expect(rounded).toHaveCSS('padding-left', `${roundedPadding}px`);
    }
    for (const variant of ['soft', 'solid', 'outline', 'dashed']) {
      await expect(section.locator(`.ssx-tag[data-variant="${variant}"]`).first()).toBeVisible();
    }
    await section.screenshot({ path: `/tmp/ssx-tags-${theme}.png` });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/student-info/v1?student=s4&theme=${theme}&chrome=wechat`);
    const profile = page.locator('.student-detail-profile');
    await expect(profile.locator('.ssx-tag')).toHaveCount(2);
    for (const tag of await profile.locator('.ssx-tag').all()) {
      await expect(tag).toHaveCSS('height', '18px');
      await expect(tag).toHaveCSS('font-size', '12px');
      await expect(tag).toHaveCSS('font-weight', '400');
    }
    await expect.poll(() => profile.locator('img').evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    await expect.poll(() => page.locator('.student-detail-actions img').evaluateAll(es => es.every(el => (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `/tmp/ssx-tag-student-${theme}.png` });
  });
}
