import { test, expect, type Page } from '@playwright/test';

async function checkFooter(page: Page, title?: string) {
  const dialog = title ? page.getByRole('dialog', { name: title, exact: true }) : page.getByRole('dialog');
  const footer = dialog.locator('.sheet-footer');
  await expect(footer).toHaveCSS('height', '56px');
  await expect(footer).toHaveCSS('padding-top', '8px');
  await expect(footer).toHaveCSS('padding-bottom', '8px');
  for (const button of await footer.getByRole('button').all()) await expect(button).toHaveCSS('height', '40px');
  const actions = footer.locator('.sheet-actions > button');
  if (await actions.count() === 2) await expect(actions.first()).toHaveClass(/button--soft/);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
}

for (const theme of ['light', 'dark']) {
  for (const preview of [false, true]) {
    test(`standard popup footers are 56px in ${theme}, preview=${preview}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const params = `theme=${theme}${preview ? '&chrome=wechat&from=home' : ''}`;
      for (const [route, label] of [['students', '筛选学员'], ['prospective-students', '筛选客户']]) {
        await page.goto(`/#/pages/${route}/v1?${params}`);
        await page.getByRole('button', { name: label, exact: true }).click();
        await checkFooter(page);
      }
      await page.getByRole('button', { name: '批量管理', exact: true }).click();
      await page.getByRole('checkbox', { name: '选择王五五', exact: true }).check();
      await page.getByRole('button', { name: '更多', exact: true }).click();
      await page.getByRole('menu', { name: '更多操作', exact: true }).getByRole('menuitem', { name: '修改', exact: true }).click();
      await expect(page.getByRole('menu', { name: '更多操作', exact: true })).toBeHidden();
      await checkFooter(page, '批量修改');
      for (const [version, prefix] of [['v1', 'att'], ['v2', 'att-v2']]) {
        await page.goto(`/#/pages/attendance/${version}?${params}`);
        for (const selector of [`.${prefix}-date`, '[aria-label="筛选条件"]', `.${prefix}-value`]) {
          await page.locator(selector).click();
          await checkFooter(page);
        }
      }
      await page.goto(`/#/mobile?theme=${theme}${preview ? '&chrome=status' : ''}`);
      for (const name of ['基础弹层', '选择弹层', '分组筛选', '多选列表', '长内容弹层']) {
        await page.getByRole('button', { name, exact: true }).click();
        await checkFooter(page);
      }
      await page.getByRole('button', { name: /^选择示例/ }).click();
      await checkFooter(page);
    });
  }
}
