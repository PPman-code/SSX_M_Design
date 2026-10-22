import { test, expect } from '@playwright/test';

for (const subtract of [false, true]) {
  test(`points selection switches from independent close to editor back: subtract=${subtract}`, async ({ page }) => {
    const verb = subtract ? '减' : '加';
    await page.goto('/#/pages/student-info/v1?student=s1');
    const trigger = page.getByRole('button', { name: '加减积分', exact: true });
    async function start() {
      await trigger.click();
      await page.getByRole('menuitem', { name: `${verb}分`, exact: true }).click();
    }
    await start();
    const selector = page.getByRole('dialog', { name: `选择${verb}分项`, exact: true });
    const main = page.getByRole('dialog', { name: `${verb}积分`, exact: true });
    await expect(main).toBeHidden();
    await expect(selector.getByRole('button', { name: '返回', exact: true })).toHaveCount(0);
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await expect(page.getByText('请先选择积分项', { exact: true })).toBeVisible();
    await expect(main).toBeHidden();
    await selector.getByRole('checkbox').first().check();
    await selector.getByRole('button', { name: '关闭弹层', exact: true }).click();
    await expect(selector).toBeHidden();
    await expect(main).toBeHidden();
    await expect(trigger).toBeFocused();
    await start();
    await expect(selector.getByRole('status')).toHaveText('已选 0 项');
    await selector.getByRole('button', { name: '新增', exact: true }).click();
    const create = page.getByRole('dialog', { name: `新增${verb}分规则`, exact: true });
    await create.getByRole('textbox', { name: '规则名称', exact: true }).fill('入口新增规则');
    await create.getByRole('button', { name: '返回', exact: true }).click();
    const discard = page.getByRole('dialog', { name: '放弃本次修改？', exact: true });
    await expect(discard).toBeVisible();
    await discard.getByRole('button', { name: '继续编辑', exact: true }).click();
    await expect(create.getByRole('textbox', { name: '规则名称', exact: true })).toHaveValue('入口新增规则');
    await create.getByRole('button', { name: '增加默认分值', exact: true }).click();
    await create.getByRole('button', { name: '保存并选中', exact: true }).click();
    await expect(selector.getByRole('status')).toHaveText('已选 1 项');
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await expect(main).toBeVisible();
    await expect(main.locator('.points-entry-count')).toHaveText('1');
    await main.getByRole('textbox', { name: '入口新增规则原因', exact: true }).fill('保留父表单');
    await main.getByRole('button', { name: '添加积分项', exact: true }).click();
    await expect(selector.getByRole('button', { name: '关闭弹层', exact: true })).toHaveCount(0);
    await expect(selector.locator('.sheet-handle')).toBeVisible();
    await selector.getByRole('checkbox').first().check();
    await selector.getByRole('button', { name: '返回', exact: true }).click();
    await expect(main.locator('.points-entry-count')).toHaveText('1');
    await expect(main.getByRole('textbox', { name: '入口新增规则原因', exact: true })).toHaveValue('保留父表单');
    await main.getByRole('button', { name: '移除入口新增规则', exact: true }).click();
    await expect(main.locator('.points-entry-count')).toHaveText('0');
    await expect(main.getByRole('button', { name: '选择积分项', exact: true })).toBeVisible();
    await expect(main.getByRole('group', { name: `本次${verb}分汇总`, exact: true })).toContainText('请选择积分项');
  });
}
