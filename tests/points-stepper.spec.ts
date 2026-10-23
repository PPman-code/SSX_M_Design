import { addUnlimitedRule } from './helpers/points';
import { test, expect } from '@playwright/test';

for (const operation of ['add', 'subtract']) {
  test(`${operation} fixed values are static, unrestricted input is 40px, rule default uses direct input`, async ({ page }) => {
    const verb = operation === 'add' ? '加' : '减';
    const fixedName = operation === 'add' ? '课堂表现积极' : '迟到';
    const fixedValue = operation === 'add' ? '3' : '1';
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto('/#/pages/student-info/v1?student=s1');
    await page.getByRole('button', { name: '加减积分', exact: true }).click();
    await page.getByRole('menuitem', { name: `${verb}分`, exact: true }).click();
    const selector = page.getByRole('dialog', { name: `选择${verb}分项`, exact: true });
    await selector.getByRole('checkbox', { name: new RegExp(`^${fixedName}`) }).check();
    await addUnlimitedRule(page, verb, '自由分值');
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    const main = page.getByRole('dialog', { name: `${verb}积分`, exact: true });
    const fixed = main.getByRole('region', { name: fixedName, exact: true });
    await expect(fixed.getByRole('textbox', { name: `${fixedName}${verb}分分值`, exact: true })).toHaveCount(0);
    await expect(fixed.locator('.base-cell-value')).toHaveText(`${fixedValue} 分`);
    await expect(main.getByRole('button', { name: new RegExp(`^(增加|减少)${verb}分分值$`) })).toHaveCount(0);
    const amount = main.getByRole('textbox', { name: `自由分值${verb}分分值`, exact: true });
    await expect(amount).toHaveCSS('height', '40px');
    await expect(amount).toHaveAttribute('placeholder', '0');
    await expect(main.locator('.points-value-input')).toHaveCSS('height', '56px');
    await main.getByRole('button', { name: `确认${verb}分`, exact: true }).click();
    await expect(amount).toBeFocused();
    await expect(main.getByRole('alert')).toContainText('大于 0');
    await amount.fill('2.25');
    await main.getByRole('button', { name: '添加积分项', exact: true }).click();
    await selector.getByRole('button', { name: '新增', exact: true }).click();
    const create = page.getByRole('dialog', { name: `新增${verb}分规则`, exact: true });
    await expect(create.getByRole('button', { name: '增加默认分值', exact: true })).toHaveCount(0);
    await create.getByRole('textbox', { name: `默认${verb}分分值`, exact: true }).fill('1');
    await expect(create.getByRole('textbox', { name: `默认${verb}分分值`, exact: true })).toHaveCSS('text-align', 'right');
    await expect(create.getByRole('textbox', { name: `默认${verb}分分值`, exact: true })).toHaveValue('1');
    await create.getByRole('button', { name: '返回', exact: true }).click();
    await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).getByRole('button', { name: '放弃修改', exact: true }).click();
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await expect(amount).toHaveValue('2.25');
    await main.getByRole('button', { name: `确认${verb}分`, exact: true }).click();
    await expect(page.getByText(`${verb}分成功 本次 ${operation === 'add' ? '+' : '−'}${Number(fixedValue) + 2.25} 分`, { exact: true })).toBeVisible();
  });
}
