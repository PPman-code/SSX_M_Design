import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`AI record menu stays readable above its player in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/customer-info/v1?customer=customer-1&theme=${theme}&chrome=wechat&scenario=single`);
    await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
    await page.getByRole('button', { name: 'AI 记录操作', exact: true }).click();
    const menu = page.getByRole('menu', { name: 'AI 记录操作', exact: true });
    await expect(menu).toBeVisible();
    // The menu must occlude text and the native range control underneath it.
    await expect(menu.locator('.popover-menu-list')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
    await expect(menu.locator('.popover-menu-arrow')).toHaveCSS('background-color', 'rgb(20, 20, 20)');
    await page.screenshot({ path: `outputs/ai-menu-${theme}.png` });
    await menu.getByRole('menuitem', { name: '修改标题', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '修改标题', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'AI 记录操作', exact: true }).click();
    await page.getByRole('menuitem', { name: '删除 AI 记录', exact: true }).click();
    const confirmation = page.getByRole('dialog', { name: '删除 AI 记录？', exact: true });
    await expect(confirmation).toBeVisible();
    await confirmation.getByRole('button', { name: '取消', exact: true }).click();
    await expect(page.getByRole('heading', { name: '廖小龙的沟通记录', exact: true })).toBeVisible();
  });
}

for (const theme of ['light', 'dark']) {
  test(`detail more trigger stays under the pointer throughout a press in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/customer-info/v1?customer=customer-1&theme=${theme}&chrome=wechat&scenario=interrupted`);
    await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
    const trigger = page.getByRole('button', { name: 'AI 记录操作', exact: true });
    const before = (await trigger.boundingBox())!;
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
    await page.mouse.down();
    const menu = page.getByRole('menu', { name: 'AI 记录操作', exact: true });
    await expect(menu).toBeVisible();
    const during = (await trigger.boundingBox())!;
    expect(during.x).toBeCloseTo(before.x, 1);
    expect(during.y).toBeCloseTo(before.y, 1);
    await page.mouse.up();
    await expect(menu).toBeVisible();
    await page.screenshot({ path: `outputs/ai-detail-more-stable-${theme}.png`, clip: { x: 0, y: 98, width: 390, height: 300 } });
    await menu.getByRole('menuitem', { name: '修改标题', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '修改标题', exact: true })).toBeVisible();
  });
}
