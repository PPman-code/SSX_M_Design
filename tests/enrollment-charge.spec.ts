import { expect, test } from '@playwright/test';

test('H5 quick charge sets and clears amount, switches tabs, and previews both personal poster states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/home/v1?theme=light&chrome=wechat');
  await page.getByRole('button', { name: '报名收费', exact: true }).click();
  await expect(page).toHaveURL(/enrollment-charge\/v1.*chrome=wechat/);
  const tabBar = page.getByRole('tablist', { name: '报名收费' });
  await expect(tabBar.getByRole('tab', { name: '快速收费', selected: true })).toBeVisible();
  await expect(tabBar).toHaveCSS('height', '56px');
  const indicator = tabBar.locator('.ssx-tabs-indicator');
  await expect(indicator).toHaveCSS('width', '24px');
  await expect(indicator).toHaveCSS('height', '3px');
  const panel = page.getByRole('tabpanel', { name: '快速收费' });
  await expect(panel.locator('.quick-charge-header')).toHaveCSS('height', '56px');
  const qr = panel.getByRole('img', { name: '快速收费演示二维码' });
  await expect(qr).toBeVisible();
  await expect.poll(() => qr.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  for (const width of [360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const size = await panel.evaluate(node => ({ width: node.clientWidth, content: node.scrollWidth }));
    expect(size.content).toBeLessThanOrEqual(size.width);
    await expect.poll(() => tabBar.evaluate(bar => {
      const selected = bar.querySelector('[aria-selected="true"]')!.getBoundingClientRect();
      const line = bar.querySelector('.ssx-tabs-indicator')!.getBoundingClientRect();
      return Math.abs(selected.left + selected.width / 2 - line.left - line.width / 2);
    })).toBeLessThan(1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  if (process.env.SSX_CHARGE_SCREENSHOT) {
    await page.locator('.enrollment-charge').screenshot({ path: process.env.SSX_CHARGE_SCREENSHOT, animations: 'disabled' });
  }
  const campusTrigger = panel.getByRole('button', { name: /^选择校区/ });
  await expect(campusTrigger).toHaveText('星禾艺术城南…');
  await campusTrigger.click();
  const campusPicker = page.getByRole('dialog', { name: '选择校区' });
  await expect(campusPicker.getByRole('radio', { name: '星禾艺术城南校区', checked: true })).toBeVisible();
  await campusPicker.getByRole('radio', { name: '滨江校区' }).click();
  await expect(campusPicker).toBeHidden();
  await expect(campusTrigger).toHaveText('滨江校区');
  await expect(campusTrigger).toBeFocused();
  await panel.getByRole('button', { name: '设置金额' }).click();
  const editor = page.getByRole('dialog', { name: '设置交费金额' });
  await expect(editor.getByRole('button', { name: '保存金额' })).toBeDisabled();
  const amountInput = editor.getByRole('textbox', { name: '交费金额' });
  await amountInput.fill('128.5');
  if (process.env.SSX_CHARGE_SCREENSHOT) {
    await editor.screenshot({ path: process.env.SSX_CHARGE_SCREENSHOT.replace(/\.png$/, '-amount.png'), animations: 'disabled' });
  }
  await editor.getByRole('button', { name: '保存金额' }).click();
  await expect(panel.getByRole('heading', { name: '¥128.50' })).toBeVisible();
  if (process.env.SSX_CHARGE_SCREENSHOT) {
    await page.screenshot({ path: process.env.SSX_CHARGE_SCREENSHOT.replace(/\.png$/, '-fixed.png'), animations: 'disabled' });
  }
  await panel.getByRole('button', { name: '修改金额' }).click();
  await editor.getByRole('textbox', { name: '交费金额' }).fill('22');
  await editor.getByRole('button', { name: '取消' }).click();
  await page.getByRole('button', { name: '放弃修改' }).click();
  await expect(panel.getByRole('heading', { name: '¥128.50' })).toBeVisible();
  await page.getByRole('tab', { name: '学员收费' }).click();
  await expect(page.getByText('学员收费暂未开放')).toBeVisible();
  await page.getByRole('tab', { name: '快速收费' }).click();
  await expect(panel.getByRole('heading', { name: '¥128.50' })).toBeVisible();

  const generatePoster = panel.getByRole('button', { name: '生成海报' });
  await generatePoster.click();
  const poster = page.getByRole('dialog', { name: /^个人收费海报-/ });
  await expect(poster).toHaveAccessibleName('个人收费海报-含金额');
  await expect(poster).toHaveAccessibleDescription('正式收款后，经手人记录为当前老师。');
  const description = poster.locator('.sheet-description');
  await page.setViewportSize({ width: 320, height: 844 });
  await expect.poll(() => description.evaluate(node => {
    const title = node.parentElement!.querySelector('h2')!;
    const bounds = node.getBoundingClientRect();
    return { gap: bounds.top - title.getBoundingClientRect().bottom, singleLine: bounds.height === parseFloat(getComputedStyle(node).lineHeight) };
  })).toEqual({ gap: 4, singleLine: true });
  await page.setViewportSize({ width: 390, height: 844 });
  const posterImage = poster.getByRole('img');
  await expect(posterImage).toHaveAccessibleName('滨江校区个人收费海报，金额¥128.50');
  await expect(posterImage).toHaveCSS('border-radius', '8px');
  await expect.poll(() => posterImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1080);
  await expect(poster.getByText('长按保存海报')).toBeVisible();
  await expect(poster.getByRole('group', { name: '海报类型' })).toHaveCount(0);
  await expect(poster.getByRole('button', { name: '保存图片' })).toHaveCount(0);
  const fixedPoster = await posterImage.getAttribute('src');
  if (process.env.SSX_CHARGE_SCREENSHOT) {
    await page.screenshot({ path: process.env.SSX_CHARGE_SCREENSHOT.replace(/\.png$/, '-poster-fixed.png'), animations: 'disabled' });
  }
  await poster.getByRole('button', { name: '关闭弹层' }).click();
  await expect(generatePoster).toBeFocused();

  await panel.getByRole('button', { name: '清除金额', exact: true }).click();
  await expect(panel.getByRole('heading', { name: '扫码交费' })).toBeVisible();
  await generatePoster.click();
  await expect(poster).toHaveAccessibleName('个人收费海报-未设置金额');
  await expect(posterImage).toHaveAccessibleName('滨江校区个人收费海报，未设置金额');
  await expect.poll(() => posterImage.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1080);
  expect(await posterImage.getAttribute('src')).not.toBe(fixedPoster);
  await expect(poster.getByText('长按保存海报')).toBeVisible();
  if (process.env.SSX_CHARGE_SCREENSHOT) {
    await page.screenshot({ path: process.env.SSX_CHARGE_SCREENSHOT.replace(/\.png$/, '-poster-open.png'), animations: 'disabled' });
  }
  await poster.getByRole('button', { name: '关闭弹层' }).click();
  await page.getByRole('button', { name: '微信后退' }).click();
  await expect(page).toHaveURL(/pages\/home\/v1/);
});
