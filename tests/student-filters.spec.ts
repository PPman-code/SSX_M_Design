import { test, expect } from '@playwright/test';
import { defaultFilters, filterStudents, students } from '../src/pages/students/v1/model';

test('student filter predicates intersect ownership, enrollment, gender, ranges and dates', () => {
  const select = (patch: Partial<ReturnType<typeof defaultFilters>>) => filterStudents(students, '', { ...defaultFilters(), ...patch }).map(item => item.id);
  expect(select({ scope: 'self' })).toEqual(['s1', 's3', 's5', 's7']);
  expect(select({ gender: 'female' })).toEqual(['s3', 's4', 's6', 's8']);
  expect(select({ campuses: ['北京乐博'], classes: ['美术启蒙一班'], teachers: ['刘老师'] })).toEqual(['s1', 's7']);
  expect(select({ quantityRange: ['-20', '0'], tuitionRange: ['', '-1'] })).toEqual(['s2']);
  expect(select({ tuitionRange: ['4700', '4700'] })).toHaveLength(7);
  expect(select({ periods: ['暑假班'], courseTypes: ['精品小班'] })).toEqual(['s2', 's7']);
  expect(select({ periods: ['寒假班'], courseTypes: ['体验课程'] })).toEqual(['s4']);
  expect(select({ periods: ['春季班'], courseTypes: ['一对一'] })).toEqual([]);
  expect(select({ lastDate: ['2026-10-27', '2026-10-28'] })).toEqual(['s1', 's2']);
  expect(select({ birthDate: ['2018-01-01', '2018-12-31'] })).toEqual(['s3', 's6', 's8']);
  expect(select({ birthday: ['2026-11-01', '2026-02-01'] })).toEqual(['s3', 's4', 's5']);
});

for (const theme of ['light', 'dark']) {
  test(`student selectors preserve nested drafts and filter intersections in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/students/v1?theme=${theme}&chrome=wechat`);
    const trigger = page.getByRole('button', { name: '筛选学员', exact: true });
    await trigger.click();
    const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
    const campus = filter.getByRole('button', { name: '校区名称 不限', exact: true });
    await expect(campus).toHaveCSS('height', '56px');
    await expect(filter.getByRole('switch')).toHaveCount(0);
    for (const title of await filter.locator('.sheet-choice-section h3, .student-filter-number legend, .base-cell-label').all()) await expect(title).toHaveCSS('font-size', '16px');
    for (const option of await filter.locator('.sheet-choice-option, .base-cell-value').all()) await expect(option).toHaveCSS('font-size', '14px');
    const statuses = filter.getByRole('group', { name: '学员状态', exact: true });
    await expect(statuses.getByRole('button')).toHaveCount(6);
    await statuses.getByRole('button', { name: '在读', exact: true }).click();
    await statuses.getByRole('button', { name: '试听', exact: true }).click();
    await expect(statuses.getByRole('button', { name: '在读', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(statuses.getByRole('button', { name: '试听', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await statuses.getByRole('button', { name: '不限', exact: true }).click();
    await expect(statuses.getByRole('button', { name: '在读', exact: true })).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({ path: `/tmp/ssx-student-filter-${theme}.png` });
    await campus.click();
    const selector = page.getByRole('dialog', { name: '选择校区名称', exact: true });
    await selector.screenshot({ path: `/tmp/ssx-student-filter-selector-${theme}.png` });
    await selector.getByRole('textbox', { name: '搜索校区名称', exact: true }).fill('北京');
    await selector.getByRole('button', { name: '北京乐博', exact: true }).click();
    await selector.getByRole('textbox', { name: '搜索校区名称', exact: true }).fill('不存在');
    await expect(selector.getByRole('status')).toHaveText('没有匹配的选项');
    await selector.getByRole('button', { name: '取消', exact: true }).click();
    await expect(campus).toBeFocused();
    await expect(campus).toContainText('不限');
    await campus.click();
    await selector.getByRole('button', { name: '北京乐博', exact: true }).click();
    await selector.getByRole('button', { name: '确定', exact: true }).click();
    await filter.getByRole('button', { name: '女', exact: true }).click();
    await filter.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('listitem')).toContainText('王小米');
    await trigger.click();
    await filter.getByRole('button', { name: '重置', exact: true }).click();
    await filter.getByRole('button', { name: '关闭筛选', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(1);
    await trigger.click();
    await filter.getByRole('button', { name: '重置', exact: true }).click();
    await filter.getByRole('button', { name: '确定', exact: true }).click();
    await expect(page.getByRole('listitem')).toHaveCount(8);
  });
}

test('numeric ranges reject invalid and reversed values then apply negative bounds', async ({ page }) => {
  await page.goto('/#/pages/students/v1');
  await page.getByRole('button', { name: '筛选学员', exact: true }).click();
  const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
  const min = filter.getByRole('textbox', { name: '剩余数量最低值', exact: true });
  const max = filter.getByRole('textbox', { name: '剩余数量最高值', exact: true });
  await min.fill('10'); await max.fill('1');
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(filter.getByRole('alert')).toContainText('最低值不能大于最高值');
  await expect(min).toBeFocused();
  await min.fill('abc');
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(filter.getByRole('alert')).toBeVisible();
  await min.fill('-20'); await max.fill('0');
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('欧阳晨宇');
});

test('date child confirms only parent draft and birthday ignores year', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-02T12:00:00+08:00') });
  await page.goto('/#/pages/students/v1');
  const trigger = page.getByRole('button', { name: '筛选学员', exact: true });
  await trigger.click();
  const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
  await filter.getByRole('button', { name: '沟通时间 不限', exact: true }).click();
  const date = page.getByRole('dialog', { name: '沟通时间', exact: true });
  await date.getByRole('button', { name: '本月', exact: true }).click();
  await date.getByRole('button', { name: /^结束日期/ }).click();
  const month = date.getByRole('listbox', { name: '月', exact: true });
  await month.focus(); await month.press('ArrowUp');
  await date.getByRole('button', { name: '确认', exact: true }).click();
  await expect(date.getByRole('alert')).toContainText('开始日期不能晚于结束日期');
  await date.getByRole('button', { name: '重置', exact: true }).click();
  await date.getByRole('button', { name: '上月', exact: true }).click();
  await date.getByRole('button', { name: '确认', exact: true }).click();
  await expect(filter.getByRole('button', { name: /沟通时间.*2026\/10\/01/ })).toBeVisible();
  await filter.getByRole('button', { name: '关闭筛选', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(8);
  await trigger.click();
  await filter.getByRole('button', { name: '生日 不限', exact: true }).click();
  const birthday = page.getByRole('dialog', { name: '生日', exact: true });
  await expect(birthday).toContainText('请选择生日的起止月日。');
  await birthday.getByRole('button', { name: /^开始日期/ }).click();
  await birthday.getByRole('button', { name: /^结束日期/ }).click();
  await birthday.getByRole('button', { name: '确认', exact: true }).click();
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('王小米');
});

for (const width of [360, 375, 390, 430]) {
  test(`full student filter fields fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/students/v1?chrome=wechat');
    await page.getByRole('button', { name: '筛选学员', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
    await expect(filter.getByRole('button', { name: '自己名下学员', exact: true })).toBeVisible();
    await page.screenshot({ path: `/tmp/ssx-student-filter-${width}-top.png` });
    for (const label of ['校区名称', '班级名称', '班级任课老师', '沟通时间', '出生日期', '生日']) {
      const row = filter.getByRole('button', { name: `${label} 不限`, exact: true });
      await row.scrollIntoViewIfNeeded();
      await expect(row).toHaveCSS('height', '56px');
    }
    await expect(filter.locator('.sheet-content')).toBeVisible();
    expect(await filter.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `/tmp/ssx-student-filter-${width}-bottom.png` });
    await filter.getByRole('button', { name: '出生日期 不限', exact: true }).click();
    const birthDate = page.getByRole('dialog', { name: '出生日期', exact: true });
    await expect(birthDate).toHaveCSS('min-height', '320px');
    const fieldsBox = (await birthDate.locator('.date-range-fields').boundingBox())!;
    const footerBox = (await birthDate.locator('.sheet-footer').boundingBox())!;
    expect(footerBox.y - fieldsBox.y - fieldsBox.height).toBeGreaterThanOrEqual(60);
    await birthDate.screenshot({ path: `/tmp/ssx-date-sheet-min-${width}.png` });
  });
}

for (const theme of ['light', 'dark']) {
  test(`birthday uses compact hint and month-day wheels including leap day in ${theme}`, async ({ page }) => {
    await page.clock.install({ time: new Date('2026-11-02T12:00:00+08:00') });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/students/v1?theme=${theme}&chrome=wechat`);
    await page.getByRole('button', { name: '筛选学员', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
    await filter.getByRole('button', { name: '生日 不限', exact: true }).click();
    const birthday = page.getByRole('dialog', { name: '生日', exact: true });
    await expect(birthday.locator('.student-filter-hint')).toHaveCSS('padding-top', '0px');
    await expect(birthday.locator('.student-filter-hint')).toHaveCSS('font-size', '12px');
    await birthday.getByRole('button', { name: '开始日期 请选择', exact: true }).click();
    await expect(birthday.getByRole('listbox', { name: '年', exact: true })).toHaveCount(0);
    await expect(birthday.getByRole('listbox')).toHaveCount(2);
    await expect(birthday.getByRole('button', { name: '开始日期 11月02日', exact: true })).toBeVisible();
    const month = birthday.getByRole('listbox', { name: '月', exact: true });
    await month.focus(); await month.press('Home'); await month.press('ArrowDown');
    const day = birthday.getByRole('listbox', { name: '日', exact: true });
    await day.focus(); await day.press('End');
    await expect(birthday.getByRole('button', { name: '开始日期 02月29日', exact: true })).toBeVisible();
    await birthday.screenshot({ path: `/tmp/ssx-birthday-month-day-${theme}.png` });
    await birthday.getByRole('button', { name: '确认', exact: true }).click();
    await expect(filter.getByRole('button', { name: '生日 02/29 至 不限', exact: true })).toBeVisible();
    await filter.getByRole('button', { name: '出生日期 不限', exact: true }).click();
    const birthDate = page.getByRole('dialog', { name: '出生日期', exact: true });
    await birthDate.getByRole('button', { name: '开始日期 请选择', exact: true }).click();
    await expect(birthDate.getByRole('listbox', { name: '年', exact: true })).toBeVisible();
    await expect(birthDate.getByRole('button', { name: '开始日期 2026/11/02', exact: true })).toBeVisible();
  });
}


test('student date minimum height stays within a short preview viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 360 });
  await page.goto('/#/pages/students/v1?chrome=wechat');
  await page.getByRole('button', { name: '筛选学员', exact: true }).click();
  await page.getByRole('dialog', { name: '筛选学员', exact: true }).getByRole('button', { name: '出生日期 不限', exact: true }).click();
  const date = page.getByRole('dialog', { name: '出生日期', exact: true });
  await date.screenshot({ path: '/tmp/ssx-date-sheet-short.png' });
  const bounds = (await date.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(98);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(360);
  await expect(date.getByRole('button', { name: '确认', exact: true })).toBeVisible();
});


test('course period and type chips use readable samples and apply only on confirmation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/students/v1?chrome=wechat');
  const trigger = page.getByRole('button', { name: '筛选学员', exact: true });
  await trigger.click();
  const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
  const periods = filter.getByRole('group', { name: '期段', exact: true });
  const types = filter.getByRole('group', { name: '类型', exact: true });
  await expect(periods.getByRole('button')).toHaveText(['不限', '春季班', '暑假班', '秋季班', '寒假班', '全年班']);
  await expect(types.getByRole('button')).toHaveText(['不限', '常规课程', '精品小班', '一对一', '体验课程', '短期集训']);
  await periods.getByRole('button', { name: '暑假班', exact: true }).click();
  await periods.getByRole('button', { name: '寒假班', exact: true }).click();
  await expect(periods.getByRole('button', { name: '暑假班', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await periods.getByRole('button', { name: '不限', exact: true }).click();
  await periods.getByRole('button', { name: '暑假班', exact: true }).click();
  await types.getByRole('button', { name: '精品小班', exact: true }).click();
  await types.scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/ssx-student-course-chips.png' });
  await filter.getByRole('button', { name: '关闭筛选', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(8);
  await trigger.click();
  await expect(periods.getByRole('button', { name: '不限', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await periods.getByRole('button', { name: '暑假班', exact: true }).click();
  await types.getByRole('button', { name: '精品小班', exact: true }).click();
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('listitem')).toContainText(['欧阳晨宇', '许子轩']);
});
