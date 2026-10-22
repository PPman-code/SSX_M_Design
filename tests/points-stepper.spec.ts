import { enterEmptyPointsEditor } from './helpers/points';
import { test, expect } from '@playwright/test';

for (const operation of ['add', 'subtract']) {
  test(`${operation} points stepper supports buttons, decimal editing and rule defaults`, async ({ page }) => {
    const verb = operation === 'add' ? '加' : '减';
    const rule = operation === 'add' ? '课堂表现积极' : '迟到';
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto('/#/pages/student-info/v1?student=s1');
    await page.getByRole('button', { name: '加减积分', exact: true }).click();
    await page.getByRole('menuitem', { name: `${verb}分`, exact: true }).click();
    const main = await enterEmptyPointsEditor(page, operation === 'subtract');
    await main.getByRole('button', { name: '选择积分项', exact: true }).click();
    const selector = page.getByRole('dialog', { name: `选择${verb}分项`, exact: true });
    await selector.getByRole('checkbox', { name: new RegExp(`^${rule}`) }).check();
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    const amount = main.getByRole('textbox', { name: `${rule}${verb}分分值`, exact: true });
    const row = main.locator('.ssx-stepper');
    await expect(row).toHaveCSS('height', '56px');
    await expect(row.getByRole('button', { name: `增加${verb}分分值`, exact: true })).toHaveCSS('height', '28px');
    await amount.fill('0.1');
    await row.getByRole('button', { name: `增加${verb}分分值`, exact: true }).click();
    await expect(amount).toHaveValue('1.1');
    await row.getByRole('button', { name: `减少${verb}分分值`, exact: true }).click();
    await expect(amount).toHaveValue('0.1');
    await row.getByRole('button', { name: `减少${verb}分分值`, exact: true }).click();
    await expect(amount).toHaveValue('0');
    await main.getByRole('button', { name: `确认${verb}分`, exact: true }).click();
    await expect(main.getByRole('alert')).toContainText('大于 0');
    await amount.fill('2.25');
    await main.getByRole('button', { name: '添加积分项', exact: true }).click();
    await selector.getByRole('button', { name: '新增', exact: true }).click();
    const create = page.getByRole('dialog', { name: `新增${verb}分规则`, exact: true });
    await expect(create.getByRole('textbox', { name: `默认${verb}分分值`, exact: true })).toHaveAttribute('placeholder', '0');
    await create.getByRole('button', { name: '增加默认分值', exact: true }).click();
    await expect(create.getByRole('textbox', { name: `默认${verb}分分值`, exact: true })).toHaveValue('1');
    await create.getByRole('button', { name: '返回', exact: true }).click();
    await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).getByRole('button', { name: '放弃修改', exact: true }).click();
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await main.getByRole('button', { name: `确认${verb}分`, exact: true }).click();
    await expect(page.getByText(`${verb}分成功 本次 ${operation === 'add' ? '+' : '−'}2.25 分`, { exact: true })).toBeVisible();
  });
}
