import { expect, test } from '@playwright/test';

test('teacher App charge navigation returns through the charge hub to the workbench', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/teacher-app/v1?theme=light&chrome=app');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();

  const chargeEntry = page.getByRole('button', { name: '收费', exact: true });
  await chargeEntry.click();
  const chargeHub = page.getByRole('main', { name: '报名收费', exact: true });
  await chargeHub.getByRole('button', { name: /^快速收费/ }).click();
  const quickCharge = page.getByRole('main', { name: '快速收费', exact: true });
  await expect(quickCharge).toBeVisible();
  const homeIndicator = page.locator('.app-home-indicator');
  await expect(homeIndicator).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  const panel = quickCharge.locator('.quick-charge-panel');
  await expect(panel).toHaveCSS('padding-bottom', '48px');
  const panelBounds = (await panel.boundingBox())!;
  const indicatorBounds = (await homeIndicator.boundingBox())!;
  expect(panelBounds.y + panelBounds.height).toBeCloseTo(indicatorBounds.y + indicatorBounds.height, 0);
  await page.getByRole('button', { name: '返回报名收费', exact: true }).click();
  await expect(chargeHub).toBeVisible();
  await page.getByRole('button', { name: '返回首页', exact: true }).click({ timeout: 3000 });
  await expect(chargeEntry).toBeVisible();
});

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

test('teacher App order management uses navigation controls and filters demo orders', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/teacher-app/v1?theme=light&chrome=app');
  await page.getByRole('button', { name: '账号登录', exact: true }).click();
  await page.getByLabel('工作账号', { exact: true }).fill('teacher@example.com');
  await page.getByLabel('密码', { exact: true }).fill('888888');
  await page.getByRole('button', { name: '登录', exact: true }).click();

  await page.getByRole('button', { name: '订单', exact: true }).click();
  const orders = page.getByRole('main', { name: '订单管理', exact: true });
  const nav = page.getByRole('navigation', { name: 'App 顶部导航', exact: true });
  await expect(nav).toHaveCSS('height', '44px');
  await expect(orders.getByRole('tab', { name: '全部 (15)' })).toHaveAttribute('aria-selected', 'true');
  await expect(orders.getByRole('tab', { name: '已付款 (10)' })).toBeVisible();
  await nav.getByRole('button', { name: '学员收费', exact: true }).click();
  await expect(page.getByText('学员收费功能请在现有业务系统中办理', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '学员收费', exact: true })).toHaveCount(1);
  const searchRow = orders.getByRole('search', { name: '搜索学员订单区域' });
  const search = searchRow.getByRole('textbox', { name: '搜索学员订单' });
  await expect(searchRow).toHaveCSS('height', '56px');
  await expect(search).toBeVisible();
  await expect(search).not.toBeFocused();
  await search.fill('s6805');
  const partial = orders.getByRole('article', { name: '张子墨的订单' });
  await expect(orders.getByRole('article')).toHaveCount(1);
  await expect(partial.getByText('欠交', { exact: true })).toBeVisible();
  await partial.getByRole('button', { name: '去收款' }).click();
  await page.getByRole('dialog', { name: '订单收款' }).getByRole('button', { name: '确认模拟收款' }).click();
  await expect(partial.getByText('欠交', { exact: true })).toHaveCount(0);
  await searchRow.getByRole('button', { name: '清除搜索' }).click();

  await nav.getByRole('button', { name: '切换校区：全部校区' }).click();
  await page.getByRole('dialog', { name: '选择校区' }).getByRole('radio', { name: '城西校区' }).click();
  await expect(orders.getByRole('tab', { name: '全部 (4)' })).toBeVisible();
  await searchRow.getByRole('button', { name: '筛选订单', exact: true }).click();
  const filters = page.getByRole('dialog', { name: '筛选订单' });
  await filters.getByRole('radio', { name: '待收款' }).click();
  await filters.getByRole('button', { name: '确定', exact: true }).click();
  await expect(orders.getByText('暂无符合条件的订单')).toBeVisible();
  await nav.getByRole('button', { name: '返回首页', exact: true }).click();

  await page.getByRole('button', { name: '收费', exact: true }).click();
  await page.getByRole('button', { name: /^订单管理/ }).click();
  await expect(orders.getByRole('tab', { name: '已关闭 (2)' })).toBeVisible();
  await nav.getByRole('button', { name: '返回报名收费', exact: true }).click();
  await expect(page.getByRole('main', { name: '报名收费' })).toBeVisible();
});
