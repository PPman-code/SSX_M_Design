import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [360, 390]) {
    test(`popup searches share compact spacing at ${width}px in ${theme}`, async ({ context }) => {
      for (const kind of ['中心名称', '主责任人', 'attendance/v1', 'attendance/v2']) {
        const page = await context.newPage();
        await page.setViewportSize({ width, height: 844 });
        const customer = !kind.startsWith('attendance');
        await page.goto(`/#/pages/${customer ? 'prospective-students/v1' : kind}?theme=${theme}&chrome=wechat`);
        if (customer) {
          await page.getByRole('button', { name: '筛选客户', exact: true }).click();
          await page.getByRole('dialog', { name: '筛选客户', exact: true }).getByRole('button', { name: `${kind} 不限`, exact: true }).click();
        } else {
          await page.getByRole('button', { name: '选择班级名称', exact: true }).click();
        }
        const sheet = page.getByRole('dialog', { name: customer ? `选择${kind}` : '选择班级名称（可多选）', exact: true });
        const content = sheet.locator(':scope > .sheet-content');
        const search = content.getByRole('search');
        const field = search.locator('.search-field');
        await expect(content).toHaveCSS('padding-top', '0px');
        await expect(search).toHaveCSS('height', '48px');
        await expect(search).toHaveCSS('margin-top', '0px');
        await expect(field).toHaveCSS('height', '36px');
        const positions = await search.evaluate(element => {
          const outer = element.getBoundingClientRect();
          const field = element.querySelector('.search-field')!.getBoundingClientRect();
          const heading = element.closest('.sheet')!.querySelector('.sheet-heading')!.getBoundingClientRect();
          const list = element.parentElement!.querySelector('.sheet-selection-list')!.getBoundingClientRect();
          return { top: field.top - outer.top, bottom: outer.bottom - field.bottom, headingGap: outer.top - heading.bottom, listGap: list.top - outer.bottom };
        });
        expect(positions).toEqual({ top: 6, bottom: 6, headingGap: 0, listGap: 0 });
        const input = search.getByRole('textbox');
        await input.fill('不存在');
        await expect(sheet.getByRole('status')).toContainText('没有匹配');
        await search.getByRole('button', { name: /清除/ }).click();
        await expect(input).toHaveValue('');
        await expect(input).toBeFocused();
        await sheet.getByRole('button', { name: '关闭弹层', exact: true }).click();
        await page.close();
      }
    });
  }
}
