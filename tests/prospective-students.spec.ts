import { test, expect } from '@playwright/test';
import { createCustomers, dateLabel, emptyFilters, invalidDateRange, selectCustomers } from '../src/pages/prospective-students/v1/model';

for (const theme of ['light', 'dark']) {
  test(`customer ownership uses searchable selectors and preserves two-stage drafts in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}&chrome=wechat`);
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    const campus = filter.getByRole('button', { name: '中心名称 不限', exact: true });
    await expect(campus).toHaveCSS('height', '56px');
    await expect(filter.getByRole('button', { name: '北京乐博', exact: true })).toHaveCount(0);
    await campus.click();
    let selector = page.getByRole('dialog', { name: '选择中心名称', exact: true });
    await selector.getByRole('textbox', { name: '搜索中心名称', exact: true }).fill('北京');
    await selector.getByRole('button', { name: '北京乐博', exact: true }).click();
    await selector.getByRole('textbox', { name: '搜索中心名称', exact: true }).fill('不存在');
    await expect(selector.getByRole('status')).toHaveText('没有匹配的选项');
    await selector.getByRole('button', { name: '取消', exact: true }).click();
    await expect(campus).toBeFocused();
    await campus.click();
    selector = page.getByRole('dialog', { name: '选择中心名称', exact: true });
    await selector.getByRole('button', { name: '北京乐博', exact: true }).click();
    await selector.getByRole('button', { name: '上海乐博', exact: true }).click();
    await selector.getByRole('button', { name: '确定', exact: true }).click();
    await expect(filter.getByRole('button', { name: '中心名称 已选 2 个中心', exact: true })).toBeVisible();
    await filter.getByRole('button', { name: '主责任人 不限', exact: true }).click();
    const owner = page.getByRole('dialog', { name: '选择主责任人', exact: true });
    await owner.getByRole('textbox', { name: '搜索主责任人', exact: true }).fill('王');
    await owner.getByRole('radio', { name: '王老师', exact: true }).click();
    await owner.getByRole('button', { name: '确定', exact: true }).click();
    await expect(filter.getByRole('button', { name: '主责任人 王老师', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listitem')).toHaveCount(10);
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    await filter.getByRole('button', { name: '主责任人 不限', exact: true }).click();
    await owner.getByRole('radio', { name: '王老师', exact: true }).click();
    await owner.getByRole('button', { name: '确定', exact: true }).click();
    await filter.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('listitem')).toContainText(['陈小雨', '赵梓萱']);
  });
}

test('customer dates, blank dates and combined filters follow the requirements', () => {
  expect(dateLabel('2026-10-20', true, '2026-10-20')).toBe('今天');
  expect(dateLabel('2027-01-05', true, '2026-10-20')).toBe('2027年1月5日');
  expect(dateLabel('2026-11-05', true, '2026-10-20')).toBe('11月5日');
  expect(dateLabel('', true)).toBe('待定');
  const customers = createCustomers(); const filters = emptyFilters();
  filters.status = ['跟进中', '待邀约']; filters.campus = ['北京乐博'];
  expect(selectCustomers(customers, '', filters, 'inputDate', true).map(customer => customer.name)).toEqual(['廖小龙', '林依诺']);
  filters.nextDate = ['2000-01-01', '2099-01-01'];
  expect(selectCustomers(customers, '', filters, 'nextDate', false).every(customer => !!customer.nextDate)).toBe(true);
  filters.nextDate = ['2026-10-22', '2026-10-20'];
  expect(invalidDateRange(filters)).toBe(true);
});

for (const width of [360, 375, 390, 430]) {
  test(`customer list fits ${width}px and keeps its bottom action visible`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/prospective-students/v1?theme=light');
    await expect(page.getByRole('listitem')).toHaveCount(10);
    await expect(page.locator('.prospect-count')).toHaveCSS('height', '48px');
    await expect(page.getByRole('button', { name: '返回首页', exact: true })).toHaveCount(0);
    await expect(page.locator('.preview-chrome, .prospect-header')).toHaveCount(0);
    const toolsBox = await page.locator('.prospect-tools').boundingBox();
    expect(toolsBox!.y).toBe(0);
    await expect(page.getByRole('button', { name: '添加客户', exact: true })).toBeInViewport();
    await expect(page.getByRole('link', { name: '拨打廖小龙电话' })).toHaveAttribute('href', 'tel:13219717182');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const firstCard = page.getByRole('listitem').first();
    const callBox = await firstCard.locator('.prospect-call').boundingBox();
    const avatarBox = await firstCard.locator('.prospect-avatar').boundingBox();
    expect(callBox!.y).toBeCloseTo(avatarBox!.y, 0);
    await expect(firstCard.locator('.prospect-phone-row .prospect-call')).toHaveCount(0);
    await expect(firstCard.locator('.prospect-card-links').getByRole('link', { name: '拨打廖小龙电话' })).toBeVisible();
    await page.screenshot({ path: `test-results/prospects-${width}.png` });
  });
}

test('home entry and search by school work, sorting toggles direction', async ({ page }) => {
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: '意向学员', exact: true }).click();
  await expect(page.getByRole('region', { name: '页面配置', exact: true })).toContainText('意向客户管理');
  await frame.getByRole('textbox', { name: '搜索客户' }).fill('实验小学');
  await expect(frame.getByRole('listitem')).toHaveCount(3);
  await frame.getByRole('button', { name: '清除搜索' }).click();
  await frame.getByRole('button', { name: '排序', exact: true }).click();
  await frame.getByRole('button', { name: '按意向级别排序' }).click();
  await expect(frame.getByRole('listitem').first()).toContainText('张子涵');
  await frame.getByRole('button', { name: '排序', exact: true }).click();
  await frame.getByRole('button', { name: '按意向级别排序' }).click();
  await expect(frame.getByRole('listitem').first()).toContainText('黎晓露');
  await expect(page.getByRole('link', { name: '独立打开' })).toHaveAttribute('href', /prospective-students\/v1/);
});

test('filter drafts cancel, validate ranges, apply and reset only on confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/prospective-students/v1?theme=dark&chrome=wechat');
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  let dialog = page.getByRole('dialog', { name: '筛选客户', exact: true });
  const bounds = await dialog.boundingBox();
  expect(bounds!.x + bounds!.width).toBeCloseTo(390, 0);
  expect(bounds!.height).toBeGreaterThan(650);
  await dialog.getByRole('button', { name: '客户状态 不限', exact: true }).click();
  await page.getByRole('dialog', { name: '选择客户状态', exact: true }).getByRole('button', { name: '待邀约', exact: true }).click();
  await page.getByRole('dialog', { name: '选择客户状态', exact: true }).getByRole('button', { name: '确定', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listitem')).toHaveCount(10);
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  dialog = page.getByRole('dialog', { name: '筛选客户', exact: true });
  await dialog.getByRole('button', { name: '下次跟进时间 不限', exact: true }).click();
  const dates = page.getByRole('dialog', { name: '下次跟进时间', exact: true });
  await dates.getByRole('button', { name: '本月', exact: true }).click();
  await dates.getByRole('button', { name: /^结束日期/ }).click();
  const month = dates.getByRole('listbox', { name: '月', exact: true });
  await month.focus(); await month.press('ArrowUp');
  await dates.getByRole('button', { name: '确认', exact: true }).click();
  await expect(dates.getByRole('alert')).toContainText('开始日期不能晚于结束日期');
  await dates.getByRole('button', { name: '关闭弹层' }).click();
  await dialog.getByRole('button', { name: '重置', exact: true }).click();
  await dialog.getByRole('button', { name: '客户状态 不限', exact: true }).click();
  await page.getByRole('dialog', { name: '选择客户状态', exact: true }).getByRole('button', { name: '待邀约', exact: true }).click();
  await page.getByRole('dialog', { name: '选择客户状态', exact: true }).getByRole('button', { name: '确定', exact: true }).click();
  await page.screenshot({ path: 'test-results/prospects-filter-dark.png' });
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  await page.getByRole('button', { name: '重置', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listitem')).toHaveCount(2);
});

test('batch selection stays scrollable, edits selected customers and keeps batch mode', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/prospective-students/v1');
  await page.getByRole('button', { name: '批量管理', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '搜索客户' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /拨打/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '更多', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: '修改', exact: true })).toHaveCount(0);
  await page.getByRole('checkbox', { name: '选择王五五' }).check();
  await page.getByRole('button', { name: '更多', exact: true }).click();
  await page.getByRole('menu', { name: '更多操作', exact: true }).getByRole('menuitem', { name: '修改', exact: true }).click();
  await expect(page.getByRole('menu', { name: '更多操作', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: '保存修改' })).toBeEnabled();
  await expect(page.getByRole('dialog').locator('.sheet-footer')).toHaveCSS('height', '56px');
  await expect(page.getByRole('button', { name: '客户状态 请选择' })).toHaveCSS('height', '56px');
  await expect(page.getByRole('button', { name: '所属校区 请选择' })).toHaveCSS('height', '56px');
  await page.getByRole('button', { name: '客户状态 请选择' }).click();
  const selector = page.getByRole('dialog', { name: '选择状态', exact: true });
  await expect(selector.locator('.sheet-handle')).toBeVisible();
  await expect(selector.getByRole('button', { name: '返回', exact: true })).toBeVisible();
  await expect(selector.getByRole('search')).toHaveCSS('height', '48px');
  await expect(selector.locator('.search-field')).toHaveCSS('height', '36px');
  await expect(selector.locator('.sheet-content')).toHaveCSS('padding-top', '0px');
  await expect(selector.getByRole('button', { name: '取消', exact: true })).toHaveCount(0);
  await page.getByRole('textbox', { name: '搜索状态' }).fill('跟进');
  await page.getByRole('radio', { name: '跟进中', exact: true }).click();
  await page.getByRole('button', { name: '保存修改' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: '选择王五五' })).not.toBeChecked();
  await expect(page.getByRole('listitem').filter({ hasText: '王五五' })).toContainText('跟进中');
  await page.getByRole('checkbox', { name: '全选', exact: true }).check();
  await expect(page.locator('.prospect-batch-heading')).toContainText('已选 10 位');
  await page.getByRole('listitem').last().scrollIntoViewIfNeeded();
  await expect(page.getByRole('button', { name: '更多', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: '更多', exact: true }).click();
  await expect(page.getByRole('menuitem', { name: '删除', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menuitem', { name: '删除', exact: true })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/prospects-batch.png' });
  await page.getByRole('button', { name: '取消', exact: true }).click();
  await expect(page.getByRole('textbox', { name: '搜索客户' })).toBeVisible();
});

test('failed batch save keeps selections and form values', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1?save=error');
  await page.getByRole('button', { name: '批量管理', exact: true }).click();
  await page.getByRole('checkbox', { name: '选择王五五' }).check();
  await page.getByRole('button', { name: '更多', exact: true }).click();
  await page.getByRole('menu', { name: '更多操作', exact: true }).getByRole('menuitem', { name: '修改', exact: true }).click();
  await expect(page.getByRole('menu', { name: '更多操作', exact: true })).toBeHidden();
  await page.getByRole('button', { name: '所属校区 请选择' }).click();
  await page.getByRole('radio', { name: '北京乐博', exact: true }).click();
  await page.getByRole('button', { name: '保存修改' }).click();
  await expect(page.getByRole('alert')).toContainText('保存失败');
  await expect(page.getByRole('button', { name: '所属校区 北京乐博' })).toBeVisible();
  await page.getByRole('dialog', { name: '批量修改', exact: true }).getByRole('button', { name: '关闭弹层' }).click();
  await page.getByRole('dialog', { name: '放弃本次修改？', exact: true }).getByRole('button', { name: '放弃修改', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: '选择王五五' })).toBeChecked();
});

test('empty, error, forbidden and masked-number states are explicit', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1?state=empty');
  await expect(page.getByText('暂无符合条件的客户')).toBeVisible();
  await page.getByRole('button', { name: '清除条件' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(10);
  await page.goto('/#/pages/prospective-students/v1?state=error');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(10);
  await page.goto('/#/pages/prospective-students/v1?state=forbidden');
  await expect(page.getByText('暂无客户查看权限')).toBeVisible();
  await expect(page.getByRole('button', { name: '添加客户', exact: true })).toHaveCount(0);
  await page.goto('/#/pages/prospective-students/v1?phone=masked');
  await expect(page.getByRole('link', { name: /拨打/ })).toHaveCount(0);
  await expect(page.getByRole('listitem').first()).toContainText('132****7182');
});

test('customer card opens the profile and preserves phone and batch selection', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1?phone=masked');
  const first = page.getByRole('listitem').first();
  await first.locator('.prospect-metrics').click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL(/pages\/customer-info\/v1.*customer=customer-1/);
  await page.goBack();
  await first.locator('.prospect-card-heading').click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL(/pages\/customer-info\/v1.*customer=customer-1/);
  await page.goBack();
  await first.getByRole('button', { name: '拨打廖小龙电话' }).click();
  await expect(page.getByText('暂无号码查看及拨号权限', { exact: true })).toBeVisible();
  await expect(page.getByText('廖小龙 · 客户主页请在现有业务系统中办理', { exact: true })).toBeHidden();
  await page.getByRole('button', { name: '批量管理' }).click();
  await expect(first.getByRole('button', { name: '廖小龙客户主页' })).toHaveCount(0);
  await first.click({ position: { x: 5, y: 5 } });
  await expect(page.getByRole('checkbox', { name: '选择廖小龙' })).toBeChecked();
});

for (const theme of ['light', 'dark']) {
  test(`batch exposes business actions and keeps edit/delete in more in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    await page.getByRole('button', { name: '批量管理', exact: true }).click();
    const footer = page.locator('.prospect-footer--batch');
    await expect(footer.locator('.prospect-batch-actions > button')).toHaveText(['转为正式', '取消转化', '新开班试听', '跟班试听', '更多']);
    await expect(footer.getByRole('button', { name: '修改', exact: true })).toHaveCount(0);
    await expect(footer.getByRole('button', { name: '删除', exact: true })).toHaveCount(0);
    for (const button of await footer.locator('.prospect-batch-actions > button').all()) await expect(button).toBeEnabled();
    await page.getByRole('checkbox', { name: '选择王五五', exact: true }).check();
    for (const action of ['转为正式', '取消转化', '新开班试听', '跟班试听']) {
      await footer.getByRole('button', { name: action, exact: true }).click();
      const confirmation = page.getByRole('dialog', { name: action, exact: true });
      await expect(confirmation).toContainText(`将对已选的 1 位客户执行「${action}」。`);
      await expect(page.getByText(`${action}请在现有业务系统中办理`, { exact: true })).toBeHidden();
      await confirmation.getByRole('button', { name: '取消', exact: true }).click();
      await expect(footer.getByRole('button', { name: action, exact: true })).toBeFocused();
      await footer.getByRole('button', { name: action, exact: true }).click();
      await confirmation.getByRole('button', { name: '确认', exact: true }).click();
      await expect(confirmation).toBeHidden();
      await expect(page.getByText(`${action}请在现有业务系统中办理`, { exact: true })).toBeVisible();
    }
    const more = footer.getByRole('button', { name: '更多', exact: true });
    await more.click();
    const menu = page.getByRole('menu', { name: '更多操作', exact: true });
    await expect(menu.getByRole('menuitem')).toHaveText(['修改', '删除']);
    await menu.getByRole('menuitem', { name: '修改', exact: true }).click();
    await expect(menu).toBeHidden();
    const edit = page.getByRole('dialog', { name: '批量修改', exact: true });
    await expect(edit).toBeVisible();
    await edit.getByRole('button', { name: '取消', exact: true }).click();
    await expect(edit).toBeHidden();
    await expect(more).toBeFocused();
    await more.click();
    await menu.getByRole('menuitem', { name: '删除', exact: true }).click();
    await expect(menu).toBeHidden();
    const confirm = page.getByRole('dialog', { name: '删除客户', exact: true });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: '取消', exact: true }).click();
    await expect(confirm).toBeHidden();
    await expect(more).toBeFocused();
    await expect(page.getByRole('listitem')).toHaveCount(10);
    await expect(page.getByRole('checkbox', { name: '选择王五五', exact: true })).toBeChecked();
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`five batch actions fit ${width}px without clipped labels`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/prospective-students/v1?theme=light&chrome=wechat&from=home');
    await page.getByRole('button', { name: '批量管理', exact: true }).click();
    const footer = page.locator('.prospect-footer--batch');
    await expect(footer).toBeInViewport();
    await expect(footer.locator('.prospect-batch-heading')).toHaveCSS('height', '48px');
    for (const button of await footer.locator('.prospect-batch-actions > button').all()) {
      await expect(button).toHaveCSS('height', '56px');
      await expect(button.locator('svg')).toHaveCSS('width', '18px');
      expect(await button.locator('span').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
    expect(await footer.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const theme of ['light', 'dark']) {
  test(`customer option fields use searchable draft selectors in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 844 });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    await expect(filter.locator('.sheet-choice-section')).toHaveCount(4);
    await expect(filter.locator('.sheet-choice-section h3')).toHaveText(['查看客户范围', '意向级别', '学习基础', '家长期望通过课程重点培养的能力与学习目标']);
    for (const label of ['客户状态', '年级', '招生来源', '客户标签', '意向课程']) {
      await expect(filter.getByRole('button', { name: `${label} 不限`, exact: true })).toHaveCSS('height', '56px');
    }
    await filter.getByRole('button', { name: '年级 不限', exact: true }).click();
    const grade = page.getByRole('dialog', { name: '选择年级', exact: true });
    await grade.getByRole('textbox', { name: '搜索年级', exact: true }).fill('二');
    await grade.getByRole('radio', { name: '二年级', exact: true }).click();
    await grade.getByRole('button', { name: '取消', exact: true }).click();
    await expect(filter.getByRole('button', { name: '年级 不限', exact: true })).toBeFocused();
    await filter.getByRole('button', { name: '意向课程 不限', exact: true }).click();
    const courses = page.getByRole('dialog', { name: '选择意向课程', exact: true });
    await courses.getByRole('button', { name: '编程', exact: true }).click();
    await courses.getByRole('button', { name: '美术', exact: true }).click();
    await courses.getByRole('button', { name: '确定', exact: true }).click();
    await expect(filter.getByRole('button', { name: '意向课程 已选 2 项', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    await expect(filter.getByRole('button', { name: '意向课程 不限', exact: true })).toBeVisible();
  });
}

test('customer scope uses mutually exclusive preview ownership and draft confirmation', async ({ page }) => {
  const data = createCustomers();
  for (const [scope, count] of [['self', 7], ['subordinates', 9], ['all', 10]] as const) {
    expect(selectCustomers(data, '', { ...emptyFilters(), scope }, 'name', false)).toHaveLength(count);
  }
  await page.goto('/#/pages/prospective-students/v1');
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
  await expect(filter.getByRole('button', { name: '所有人', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await filter.getByRole('button', { name: '自己负责', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listitem')).toHaveCount(10);
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  await filter.getByRole('button', { name: '包含下属', exact: true }).click();
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(9);
  await page.getByRole('button', { name: '筛选客户', exact: true }).click();
  await filter.getByRole('button', { name: '重置', exact: true }).click();
  await expect(filter.getByRole('button', { name: '所有人', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

for (const width of [360, 390]) {
  test(`custom filter examples wrap long options and preserve drafts at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/prospective-students/v1');
    await page.getByRole('button', { name: '筛选客户', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选客户', exact: true });
    const goals = filter.getByRole('group', { name: '家长期望通过课程重点培养的能力与学习目标', exact: true });
    const long = goals.getByRole('button', { name: '提升逻辑思维与独立解决问题的能力', exact: true });
    expect((await long.boundingBox())!.height).toBeGreaterThan(36);
    expect(await goals.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await long.click(); await goals.getByRole('button', { name: '兴趣', exact: true }).click();
    await expect(long).toHaveAttribute('aria-pressed', 'true');
    const experience = filter.getByRole('group', { name: '学习基础', exact: true });
    await experience.getByRole('button', { name: '零基础', exact: true }).click();
    await experience.getByRole('button', { name: '有基础', exact: true }).click();
    await expect(experience.getByRole('button', { name: '零基础', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await filter.getByRole('textbox', { name: '其他需要提前了解的学习情况与家长补充说明', exact: true }).fill('周末');
    await filter.getByRole('spinbutton', { name: '预计课程预算（元）', exact: true }).fill('3000');
    await filter.getByRole('button', { name: '重置', exact: true }).click();
    await expect(long).toHaveAttribute('aria-pressed', 'false');
    await expect(filter.getByRole('spinbutton', { name: '预计课程预算（元）', exact: true })).toHaveValue('');
  });
}

for (const theme of ['light', 'dark']) {
  test(`batch edit can clear pending selections without clearing customer data in ${theme}`, async ({ page }) => {
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    await page.getByRole('button', { name: '批量管理', exact: true }).click();
    await page.getByRole('checkbox', { name: '选择王五五', exact: true }).check();
    await page.getByRole('button', { name: '更多', exact: true }).click();
    await page.getByRole('menuitem', { name: '修改', exact: true }).click();
    const edit = page.getByRole('dialog', { name: '批量修改', exact: true });
    await edit.getByRole('button', { name: '客户状态 请选择', exact: true }).click();
    await page.getByRole('radio', { name: '跟进中', exact: true }).click();
    await edit.getByRole('button', { name: '所属校区 请选择', exact: true }).click();
    await page.getByRole('radio', { name: '北京乐博', exact: true }).click();
    await edit.getByRole('button', { name: '所属校区 北京乐博', exact: true }).click();
    await page.getByRole('textbox', { name: '搜索校区', exact: true }).fill('不存在');
    await page.getByRole('radio', { name: '不修改', exact: true }).click();
    await expect(edit.getByRole('button', { name: '所属校区 请选择', exact: true })).toBeVisible();
    await expect(edit.getByRole('button', { name: '客户状态 跟进中', exact: true })).toBeVisible();
    await edit.getByRole('button', { name: '客户状态 跟进中', exact: true }).click();
    await page.getByRole('radio', { name: '不修改', exact: true }).click();
    await expect(edit.getByRole('button', { name: '保存修改', exact: true })).toBeEnabled();
    await edit.getByRole('button', { name: '所属校区 请选择', exact: true }).click();
    await page.getByRole('radio', { name: '北京乐博', exact: true }).click();
    await edit.getByRole('button', { name: '保存修改', exact: true }).click();
    await expect(page.getByRole('listitem').filter({ hasText: '王五五' })).toContainText('待邀约');
  });
}

for (const theme of ['light', 'dark']) {
  test(`batch editor and nested choices follow sheet roles in ${theme}`, async ({ page }) => {
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    await page.getByRole('button', { name: '批量管理', exact: true }).click();
    await page.getByRole('checkbox', { name: '选择王五五', exact: true }).check();
    await page.getByRole('button', { name: '更多', exact: true }).click();
    await page.getByRole('menuitem', { name: '修改', exact: true }).click();
    const edit = page.getByRole('dialog', { name: '批量修改', exact: true });
    await expect(edit).toHaveClass(/sheet--editor/);
    await expect(edit.locator(':scope > .sheet-handle')).toHaveCount(0);
    await edit.getByRole('button', { name: '客户状态 请选择', exact: true }).click();
    const choice = page.getByRole('dialog', { name: '选择状态', exact: true });
    await expect(choice).toHaveClass(/sheet--selection/);
    await expect(choice.locator(':scope > .sheet-handle')).toBeVisible();
    await expect(choice.getByRole('button', { name: '关闭弹层', exact: true })).toHaveCount(0);
    await expect(choice.getByRole('button', { name: '返回', exact: true })).toHaveCSS('font-size', '14px');
    await choice.getByRole('button', { name: '返回', exact: true }).click();
    await expect(edit.getByRole('button', { name: '客户状态 请选择', exact: true })).toBeFocused();
    await edit.getByRole('button', { name: '客户状态 请选择', exact: true }).click();
    await choice.getByRole('radio', { name: '跟进中', exact: true }).click();
    await edit.getByRole('button', { name: '所属校区 请选择', exact: true }).click();
    const campus = page.getByRole('dialog', { name: '选择校区', exact: true });
    await expect(campus.getByRole('button', { name: '关闭弹层', exact: true })).toHaveCount(0);
    await expect(campus.locator('.sheet-handle')).toBeVisible();
    await campus.getByRole('button', { name: '返回', exact: true }).click();
    await expect(edit.getByRole('button', { name: '所属校区 请选择', exact: true })).toBeFocused();
    await expect(edit.getByRole('button', { name: '客户状态 跟进中', exact: true })).toBeVisible();
    await expect(page.getByRole('dialog', { name: '放弃本次修改？', exact: true })).toHaveCount(0);
    await edit.getByRole('button', { name: '取消', exact: true }).click();
    const warning = page.getByRole('dialog', { name: '放弃本次修改？', exact: true });
    await warning.getByRole('button', { name: '继续编辑', exact: true }).click();
    await expect(edit.getByRole('button', { name: '客户状态 跟进中', exact: true })).toBeVisible();
    await edit.getByRole('button', { name: '关闭弹层', exact: true }).click();
    await warning.getByRole('button', { name: '放弃修改', exact: true }).click();
    await expect(edit).toBeHidden();
    await expect(page.getByRole('listitem').filter({ hasText: '王五五' })).toContainText('待邀约');
    await expect(page.getByRole('checkbox', { name: '选择王五五', exact: true })).toBeChecked();
  });
}
