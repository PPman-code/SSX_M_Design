import type { Page } from '@playwright/test';

/** Reach the empty editor through the supported remove-all path. */
export async function enterEmptyPointsEditor(page: Page, subtract = false) {
  const verb = subtract ? '减' : '加';
  const selector = page.getByRole('dialog', { name: `选择${verb}分项`, exact: true });
  await selector.getByRole('checkbox').first().check();
  await selector.getByRole('button', { name: '确认选择', exact: true }).click();
  const main = page.getByRole('dialog', { name: `${verb}积分`, exact: true });
  await main.getByRole('button', { name: /^移除/ }).click();
  return main;
}

/** Add an unrestricted rule while its selection layer is open. */
export async function addUnlimitedRule(page: Page, verb: string, name: string) {
  const selector = page.getByRole('dialog', { name: `选择${verb}分项`, exact: true });
  await selector.getByRole('button', { name: '新增', exact: true }).click();
  const create = page.getByRole('dialog', { name: `新增${verb}分规则`, exact: true });
  await create.getByRole('textbox', { name: '规则名称', exact: true }).fill(name);
  await create.getByRole('button', { name: '不限分值', exact: true }).click();
  await create.getByRole('button', { name: '保存并选中', exact: true }).click();
}
