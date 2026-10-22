import { test, expect } from '@playwright/test';

test('popover menu opens on click, runs an action, and restores focus', async ({ page }) => {
  await page.goto('/#/mobile?theme=light');
  const trigger = page.getByRole('button', { name: '深色菜单', exact: true });
  await trigger.hover();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await trigger.click();
  const menu = page.getByRole('menu', { name: '深色操作菜单' });
  await menu.getByRole('menuitem', { name: '扫一扫', exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByText('菜单结果：扫一扫', { exact: true })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`menu supports local icons, dot assets and disabled keyboard navigation in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    const trigger = page.getByRole('button', { name: theme === 'light' ? '浅色状态菜单' : '红点与禁用菜单', exact: true });
    await trigger.focus();
    await page.keyboard.press('ArrowDown');
    const menu = page.getByRole('menu', { name: theme === 'light' ? '浅色消息菜单' : '消息操作菜单' });
    await expect(menu.getByRole('menuitem', { name: '暂不可用', exact: true })).toHaveAttribute('aria-disabled', 'true');
    expect(await menu.locator('use').count()).toBeGreaterThan(0);
    for (const icon of await menu.locator('.popover-menu-icon > svg').all()) {
      await expect(icon).toHaveCSS('width', '20px');
      await expect(icon).toHaveCSS('height', '20px');
    }
    await expect(menu.getByRole('menuitem').first()).toHaveCSS('font-size', '16px');
    await expect.poll(() => menu.locator('.popover-menu-dot img').evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await page.keyboard.press('Home');
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: '暂不可用', exact: true })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(menu).toBeVisible();
    await expect(page.getByText('菜单结果：尚未操作', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowDown');
    await expect(menu.getByRole('menuitem', { name: /^消息中心/ })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`menu fits ${width}px and dismisses on outside click`, async ({ page }) => {
    await page.setViewportSize({ width, height: 640 });
    await page.goto('/#/mobile?theme=light');
    await page.getByRole('button', { name: '浅色菜单', exact: true }).click();
    const menu = page.getByRole('menu', { name: '浅色操作菜单' });
    await expect(menu).toBeVisible();
    const rect = await menu.boundingBox();
    expect(rect!.x).toBeGreaterThanOrEqual(0);
    expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
    expect(await menu.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await menu.screenshot({ path: `test-results/popover-menu-${width}.png` });
    await page.mouse.click(4, 4);
    await expect(menu).toBeHidden();
  });
}

for (const theme of ['light', 'dark']) {
  test(`menu arrows point outward and share panel color in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const [route, triggerName, menuName] of [
      ['pages/student-info/v1?student=s1', '加减积分', '积分操作'],
      ['mobile?', '带图标菜单', '图标操作菜单'],
    ]) {
      await page.goto(`/#/${route}&theme=${theme}`);
      await page.getByRole('button', { name: triggerName, exact: true }).click();
      const menu = page.getByRole('menu', { name: menuName, exact: true });
      const arrow = menu.locator('.popover-menu-arrow');
      await expect(arrow).toHaveCSS('width', '14px');
      await expect(arrow).toHaveCSS('height', '6px');
      await expect(arrow).toHaveCSS('background-color', await menu.locator('.popover-menu-list').evaluate(el => getComputedStyle(el).backgroundColor));
      await expect(arrow.locator('img')).toHaveCount(0);
      const side = await arrow.getAttribute('data-side');
      const box = (await menu.boundingBox())!;
      const arrowBox = (await arrow.boundingBox())!;
      expect(['top', 'bottom']).toContain(side);
      if (side === 'top') expect(arrowBox.y).toBeCloseTo(box.y + box.height, 1);
      else expect(arrowBox.y + arrowBox.height).toBeCloseTo(box.y, 1);
      await page.keyboard.press('Escape');
    }
  });
}
