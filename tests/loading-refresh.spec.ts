import { test, expect, type Page } from '@playwright/test';

async function pull(page: Page, amount = 180) {
  const viewport = page.locator('.product-scroll');
  const bounds = (await viewport.boundingBox())!;
  const x = bounds.x + bounds.width - 8, y = bounds.y + 70;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x, y + amount, { steps: 10 });
  await page.mouse.up();
}

for (const theme of ['light', 'dark']) {
  test(`loading variants and reduced motion in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    const examples = page.getByRole('region', { name: '加载 Loading', exact: true });
    for (const [size, pixels] of [['sm', '24px'], ['md', '28px'], ['lg', '32px']]) {
      const row = examples.locator(`.loading-demo-sizes > [data-size="${size}"]`);
      await expect(row.locator('.ssx-loading-spinner').first()).toHaveCSS('width', pixels);
      await expect(row.locator('.ssx-loading-spinner').first()).toHaveCSS('height', pixels);
      await expect(row.locator('.ssx-loading-spinner').first()).toHaveAttribute('data-icon', 'loading');
      await expect(row.locator('.ssx-loading-spinner').first().locator('foreignObject > div')).toHaveCSS('mask-image', /icons\/loading\/ring-mask\.svg/);
    }
    await expect(examples.locator('.ssx-loading-dots i')).toHaveCount(3);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const graphic of await examples.locator('.ssx-loading-spinner, .ssx-loading-dots i').all()) await expect(graphic).toHaveCSS('animation-name', 'none');
    await examples.getByRole('button', { name: '重试', exact: true }).click();
    await expect(examples).toContainText('正在重新加载…');
  });
}

for (const route of ['home/v1', 'my/v1', 'students/v1', 'prospective-students/v1', 'attendance/v1', 'attendance/v2']) {
  test(`refresh preserves page state and viewport in ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/${route}?theme=light&chrome=wechat`);
    await expect(page.locator('.pull-refresh')).toHaveCSS('height', '0px');
    await pull(page, 60);
    await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
    await pull(page);
    await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'refreshing');
    await expect(page.locator('.pull-refresh')).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('.pull-refresh')).toContainText('刷新中…');
    await expect(page.locator('.pull-refresh')).toContainText('模拟刷新完成');
    await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
    const viewport = page.locator('.product-scroll');
    await viewport.evaluate(el => { el.scrollTop = 150; });
    if (await viewport.evaluate(el => el.scrollTop > 0)) {
      await pull(page);
      await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
    }
  });
}

test('refresh preserves student filters and supports touch without triggering card details', async ({ page }) => {
  await page.goto('/#/pages/students/v1?theme=dark&chrome=wechat');
  await page.getByRole('textbox', { name: '搜索学员', exact: true }).fill('金灿灿');
  const scroll = page.locator('.product-scroll');
  const bounds = (await scroll.boundingBox())!;
  const touch = (y: number) => ({ identifier: 1, clientX: bounds.x + bounds.width - 8, clientY: bounds.y + y });
  await scroll.dispatchEvent('touchstart', { touches: [touch(60)] });
  await scroll.dispatchEvent('touchmove', { touches: [touch(240)] });
  await scroll.dispatchEvent('touchend', { touches: [] });
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'refreshing');
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'success');
  await expect(page.getByRole('textbox', { name: '搜索学员', exact: true })).toHaveValue('金灿灿');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.locator('.toast')).toHaveCount(0);
});

test('customer batch mode disables refresh and keyboard can refresh a normal page', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1');
  const refresh = page.getByRole('button', { name: '刷新当前页面', exact: true });
  await refresh.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'refreshing');
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
  await page.getByRole('button', { name: '批量管理', exact: true }).click();
  await page.getByRole('checkbox', { name: '选择王五五', exact: true }).check();
  await expect(refresh).toBeDisabled();
  await page.locator('.product-scroll').evaluate(el => { el.scrollTop = 0; });
  await pull(page);
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
  await expect(page.getByRole('checkbox', { name: '选择王五五', exact: true })).toBeChecked();
});

test('refresh failure can retry and active requests reject duplicate gestures', async ({ page }) => {
  await page.goto('/#/mobile');
  const region = page.getByRole('region', { name: '加载 Loading', exact: true });
  const viewport = region.getByLabel('下拉刷新演示列表', { exact: true });
  const indicator = region.locator('.pull-refresh');
  await region.getByRole('button', { name: '成功模式', exact: true }).click();
  await viewport.scrollIntoViewIfNeeded();
  async function touchPull() {
    const box = (await viewport.boundingBox())!;
    const touch = (y: number) => ({ identifier: 1, clientX: box.x + box.width - 8, clientY: box.y + y });
    await viewport.dispatchEvent('touchstart', { touches: [touch(20)] });
    await viewport.dispatchEvent('touchmove', { touches: [touch(200)] });
    await viewport.dispatchEvent('touchend', { touches: [] });
  }
  await touchPull();
  await expect(indicator).toHaveAttribute('data-state', 'error');
  await expect(region).toContainText('模拟完成 0 次');
  await region.getByRole('button', { name: '失败模式', exact: true }).click();
  await touchPull();
  await expect(indicator).toHaveAttribute('data-state', 'refreshing');
  await touchPull();
  await expect(indicator).toHaveAttribute('data-state', 'success');
  await expect(region).toContainText('模拟完成 1 次');
});

test('horizontal, multitouch and input gestures do not refresh and navigation cancels work', async ({ page }) => {
  await page.goto('/#/pages/students/v1');
  const viewport = page.locator('.product-scroll');
  const indicator = page.locator('.pull-refresh');
  const point = (x: number, y: number, identifier = 1) => ({ identifier, clientX: x, clientY: y });
  await viewport.dispatchEvent('touchstart', { touches: [point(300, 70)] });
  await viewport.dispatchEvent('touchmove', { touches: [point(300, 110)] });
  await viewport.dispatchEvent('touchmove', { touches: [point(100, 100)] });
  await viewport.dispatchEvent('touchend', { touches: [] });
  await expect(indicator).toHaveAttribute('data-state', 'idle');
  await viewport.dispatchEvent('touchstart', { touches: [point(300, 70)] });
  await viewport.dispatchEvent('touchmove', { touches: [point(300, 250), point(200, 250, 2)] });
  await viewport.dispatchEvent('touchend', { touches: [] });
  await expect(indicator).toHaveAttribute('data-state', 'idle');
  const input = page.getByRole('textbox', { name: '搜索学员', exact: true });
  await input.dispatchEvent('touchstart', { touches: [point(100, 20)] });
  await input.dispatchEvent('touchmove', { touches: [point(100, 220)] });
  await input.dispatchEvent('touchend', { touches: [] });
  await expect(indicator).toHaveAttribute('data-state', 'idle');
  await page.getByRole('button', { name: '金灿灿学员详情', exact: true }).click();
  await expect(page.locator('.toast-message')).toHaveText('金灿灿的学员详情待对接');
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.getByRole('button', { name: '刷新当前页面', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(indicator).toHaveAttribute('data-state', 'refreshing');
  await page.goto('/#/pages/my/v1');
  await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'idle');
  expect(errors).toEqual([]);
});

for (const route of ['students', 'prospective-students']) for (const theme of ['light', 'dark']) {
  test(`refresh stays below the ${route} top bars in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/${route}/v1?theme=${theme}&chrome=wechat`);
    const toolbar = page.locator(route === 'students' ? '.student-toolbar' : '.prospect-tools');
    const lastBar = page.locator(route === 'students' ? '.student-tabs' : '.prospect-tools');
    const before = (await toolbar.boundingBox())!;
    const barBefore = (await lastBar.boundingBox())!;
    const viewport = (await page.locator('.product-scroll').boundingBox())!;
    await page.mouse.move(viewport.x + viewport.width - 8, viewport.y + 140);
    await page.mouse.down();
    await page.mouse.move(viewport.x + viewport.width - 8, viewport.y + 320, { steps: 10 });
    await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'ready');
    expect((await toolbar.boundingBox())!.y).toBe(before.y);
    expect((await lastBar.boundingBox())!.y).toBe(barBefore.y);
    const indicator = (await page.locator('.pull-refresh').boundingBox())!;
    expect(indicator.y).toBe(barBefore.y + barBefore.height);
    const count = (await page.locator(route === 'students' ? '.student-count' : '.prospect-count').boundingBox())!;
    expect(count.y).toBe(indicator.y + indicator.height);
    await page.mouse.up();
    await expect(page.locator('.pull-refresh')).toHaveAttribute('data-state', 'refreshing');
    expect((await toolbar.boundingBox())!.y).toBe(before.y);
    await page.screenshot({ path: `test-results/refresh-below-header-${route}-${theme}.png` });
  });
}
