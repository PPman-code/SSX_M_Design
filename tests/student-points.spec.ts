import { enterEmptyPointsEditor } from './helpers/points';
import { test, expect, type Page } from '@playwright/test';
import { pointsInCents, formatPoints } from '../src/pages/student-info/v1/points-model';

async function openAdd(page: Page) {
  await page.getByRole('button', { name: '加减积分', exact: true }).click();
  await page.getByRole('menuitem', { name: '加分', exact: true }).click();
  return enterEmptyPointsEditor(page);
}
test('points use decimal-safe positive values', () => {
  expect(formatPoints(pointsInCents('0.1')! + pointsInCents('0.2')!)).toBe('0.3');
  expect(pointsInCents('1.111')).not.toBeNull();
  for (const value of ['', '0', '-1', 'abc', 'Infinity', '1e4']) expect(pointsInCents(value)).toBeNull();
});
for (const theme of ['light', 'dark']) {
  for (const width of [360, 390, 430]) {
    test(`add points follows nested drafts and confirms once at ${width} ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/#/pages/student-info/v1?student=s1&theme=${theme}&chrome=wechat`);
      let main = await openAdd(page);
      await expect(main.locator('.points-student-summary')).toContainText('金灿灿');
      await expect(main).toContainText(/金灿灿：\s*128 积分/);
      await expect(main.getByRole('button', { name: '确认加分' })).toBeEnabled();
      await expect(main.getByRole('button', { name: '减积分', exact: true })).toHaveCount(0);
      await expect(main.locator('.sheet-footer')).toHaveCSS('height', '56px');
      await expect(main.getByRole('button', { name: '取消', exact: true })).toHaveCount(0);
      await expect(main.locator('.sheet-footer').getByRole('group', { name: '本次加分汇总' })).toBeVisible();
      await main.getByRole('button', { name: '选择积分项', exact: true }).click();
      const selector = page.getByRole('dialog', { name: '选择加分项', exact: true });
      await expect(selector.locator('.search')).toHaveCSS('height', '48px');
      await expect(selector.getByRole('button', { name: '取消', exact: true })).toHaveCount(0);
      await expect(selector.locator('.sheet-footer').getByRole('status')).toHaveText('已选 0 项');
      await expect(selector.locator('.sheet-footer')).toHaveCSS('height', '56px');
      await selector.getByRole('checkbox', { name: '课堂表现积极 +3 分', exact: true }).click();
      await selector.getByRole('button', { name: '返回', exact: true }).click();
      await expect(main.locator('.points-entry-count')).toHaveText('0');
      await main.getByRole('button', { name: '选择积分项', exact: true }).click();
      await selector.getByRole('checkbox', { name: '课堂表现积极 +3 分', exact: true }).click();
      await selector.getByRole('checkbox', { name: '按时完成作业 +2 分', exact: true }).click();
      await expect(selector.locator('.sheet-footer').getByRole('status')).toHaveText('已选 2 项');
      const countBox = await selector.locator('.sheet-footer').getByRole('status').boundingBox();
      const confirmBox = await selector.getByRole('button', { name: '确认选择', exact: true }).boundingBox();
      expect(countBox!.x + countBox!.width).toBeLessThanOrEqual(confirmBox!.x);
      await selector.getByRole('button', { name: '确认选择', exact: true }).click();
      await expect(main.getByRole('group', { name: '本次加分汇总' })).toContainText('+5 分');
      await expect(main.getByRole('textbox', { name: '课堂表现积极加分分值', exact: true })).toHaveCount(0);
      await expect(main.getByRole('region', { name: '课堂表现积极', exact: true })).toContainText('3 分');
      await main.getByRole('textbox', { name: '课堂表现积极加分原因', exact: true }).fill('课堂发言');
      await expect(main.getByRole('group', { name: '本次加分汇总' })).toContainText('+5 分');
      await main.getByRole('button', { name: '关闭弹层', exact: true }).click();
      if (await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).isVisible()) await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).getByRole('button', { name: '放弃修改', exact: true }).click();
      main = await openAdd(page);
      await expect(main).toContainText(/金灿灿：\s*128 积分/);
      await expect(main.locator('.points-entry-count')).toHaveText('0');
      await main.getByRole('button', { name: '选择积分项', exact: true }).click();
      await selector.getByRole('checkbox', { name: '课后练习优秀 +5 分', exact: true }).click();
      await selector.getByRole('button', { name: '确认选择', exact: true }).click();
      await main.getByRole('button', { name: '确认加分', exact: true }).click();
      await expect(page.getByText('加分成功 本次 +5 分', { exact: true })).toBeVisible();
      main = await openAdd(page);
      await expect(main).toContainText(/金灿灿：\s*133 积分/);
      expect(await main.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    });
  }
  test(`create rules, search, validate unlimited amounts and remove in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(`/#/pages/student-info/v1?student=s1&theme=${theme}`);
    const main = await openAdd(page);
    await main.getByRole('button', { name: '选择积分项', exact: true }).click();
    const selector = page.getByRole('dialog', { name: '选择加分项', exact: true });
    await selector.getByRole('textbox', { name: '搜索积分项', exact: true }).fill('不存在');
    await expect(selector.locator('.points-empty')).toHaveText('没有匹配的积分项');
    await selector.getByRole('button', { name: '新增', exact: true }).click();
    const create = page.getByRole('dialog', { name: '新增加分规则', exact: true });
    await create.getByRole('button', { name: '保存并选中', exact: true }).click();
    await expect(create.getByRole('alert')).toHaveText('请输入规则名称');
    await create.getByRole('textbox', { name: '规则名称', exact: true }).fill('课堂表现积极');
    await create.getByRole('textbox', { name: '默认加分分值', exact: true }).fill('2');
    await create.getByRole('button', { name: '保存并选中', exact: true }).click();
    await expect(create.getByRole('alert')).toHaveText('规则名称已存在');
    await create.getByRole('textbox', { name: '规则名称', exact: true }).fill('主动帮助同学');
    await create.getByRole('button', { name: '不限分值', exact: true }).click();
    await expect(create.getByRole('textbox', { name: '默认加分分值', exact: true })).toHaveCount(0);
    await create.getByRole('textbox', { name: '备注（选填）', exact: true }).fill('主动帮助');
    await create.getByRole('button', { name: '保存并选中', exact: true }).click();
    await expect(create).toBeHidden();
    await expect(selector.getByRole('checkbox', { name: '主动帮助同学 不限分值', exact: true })).toHaveAttribute('aria-checked', 'true');
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await expect(main.getByRole('button', { name: '确认加分' })).toBeEnabled();
    const amount = main.getByRole('textbox', { name: '主动帮助同学加分分值', exact: true });
    await amount.fill('-2');
    await expect(main.getByRole('button', { name: '确认加分' })).toBeEnabled();
    await amount.fill('2.5');
    await expect(main.getByRole('textbox', { name: '主动帮助同学加分原因', exact: true })).toHaveValue('主动帮助');
    await expect(main.getByRole('button', { name: '确认加分' })).toBeEnabled();
    await main.getByRole('button', { name: '移除主动帮助同学', exact: true }).click();
    await expect(main.getByRole('button', { name: '确认加分' })).toBeEnabled();
    await main.getByRole('button', { name: '选择积分项', exact: true }).click();
    await expect(selector.getByRole('checkbox', { name: '主动帮助同学 不限分值', exact: true })).toHaveAttribute('aria-checked', 'false');
  });
}

test('fixed rule validation and keyboard cancellation preserve the balance', async ({ page }) => {
  await page.goto('/#/pages/student-info/v1?student=s1');
  const main = await openAdd(page);
  await main.getByRole('button', { name: '选择积分项', exact: true }).click();
  const selector = page.getByRole('dialog', { name: '选择加分项', exact: true });
  await selector.getByRole('button', { name: '新增', exact: true }).click();
  const create = page.getByRole('dialog', { name: '新增加分规则', exact: true });
  await create.getByRole('textbox', { name: '规则名称', exact: true }).fill('阅读打卡');
  await create.getByRole('textbox', { name: '默认加分分值', exact: true }).fill('0');
  await create.getByRole('button', { name: '保存并选中', exact: true }).click();
  await expect(create.getByRole('alert')).toHaveText('默认分值须大于 0');
  await create.getByRole('textbox', { name: '默认加分分值', exact: true }).fill('1.5');
  await create.getByRole('button', { name: '保存并选中', exact: true }).click();
  await expect(selector.getByRole('checkbox', { name: '阅读打卡 +1.5 分', exact: true })).toHaveAttribute('aria-checked', 'true');
  await selector.getByRole('button', { name: '确认选择', exact: true }).click();
  await expect(main.getByRole('textbox', { name: '阅读打卡加分分值', exact: true })).toHaveCount(0);
  await expect(main.getByRole('region', { name: '阅读打卡', exact: true })).toContainText('1.5 分');
  await page.keyboard.press('Escape');
  await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).getByRole('button', { name: '放弃修改', exact: true }).click();
  await expect(main).toBeHidden();
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toBeFocused();
  await openAdd(page);
  await expect(main).toContainText(/金灿灿：\s*128 积分/);
});
