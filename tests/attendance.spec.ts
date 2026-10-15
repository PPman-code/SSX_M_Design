import { test, expect, type Page } from '@playwright/test';

async function chooseDimension(page: Page, name: string) {
  await page.getByRole('button', { name: '汇总维度', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: '汇总维度', exact: true });
  await sheet.getByRole('radio', { name, exact: true }).click();
  await expect(sheet).toBeHidden();
}

test('dimension sheet applies immediately, closes on current value, and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/#/pages/attendance/v1?chrome=wechat');
  const trigger = page.getByRole('button', { name: '汇总维度', exact: true });
  await trigger.click();
  let sheet = page.getByRole('dialog', { name: '汇总维度', exact: true });
  await expect(sheet.locator('.sheet-footer')).toHaveCount(0);
  await expect(sheet.getByRole('radio', { name: '班级名称', exact: true })).toBeChecked();
  await sheet.getByRole('button', { name: '关闭弹层' }).click();
  await expect(trigger).toHaveText('按照班级名称汇总');
  await trigger.click();
  sheet = page.getByRole('dialog', { name: '汇总维度', exact: true });
  await sheet.getByRole('radio', { name: '课程名称', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toHaveText('按照课程名称汇总');
  await expect(trigger).toBeFocused();
  await trigger.click();
  sheet = page.getByRole('dialog', { name: '汇总维度', exact: true });
  await sheet.getByRole('radio', { name: '课程名称', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(trigger).toBeFocused();
});

for (const width of [360, 375, 390, 430]) {
  test(`attendance report fits ${width}px and renders overview with grouped rows`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/attendance/v1');
    await expect(page.locator('.att-overview')).toBeVisible();
    await expect(page.getByText('整体概览', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '查看统计范围说明' }).click();
    await expect(page.locator('.att-scope')).toContainText('作为班主任');
    await page.keyboard.press('Escape');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const rates = page.locator('.att-rates b');
    await expect(rates.first()).toContainText('%');
    expect(await page.locator('.att-summary').count()).toBeGreaterThanOrEqual(4);
    await expect(page.locator('.att-load')).toHaveText(/加载更多分组|已显示全部数据/);
    await page.screenshot({ path: `test-results/attendance-${width}.png`, fullPage: true });
  });
}

test('attendance report expands a group and drills into lesson details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1');
  const firstRow = page.locator('.att-summary').first();
  const name = (await firstRow.locator('.att-group-name').textContent())!;
  await firstRow.getByRole('button').first().click();
  await expect(page.locator('.att-inline')).toBeVisible();
  await expect(page.getByText('补课后出勤率', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: '查看课次明细' }).click();
  await expect(page).toHaveTitle('上课明细 · 智校');
  await expect(page.locator('.att-lesson')).toHaveCount(6);
  await expect(page.locator('.att-lesson').first()).toContainText(name);
  await page.screenshot({ path: 'test-results/attendance-detail.png', fullPage: true });
  await page.goBack();
  await expect(page.locator('.att-overview')).toBeVisible();
});

test('attendance filters keep a draft until confirmed and mark the change', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1');
  await expect(page.locator('.att-filter-mark')).toHaveCount(0);
  await page.getByRole('button', { name: '筛选条件' }).click();
  const sheet = page.getByRole('dialog', { name: '筛选条件' });
  await expect(sheet).toBeVisible();
  const trial = sheet.getByRole('button', { name: '试听学员' });
  await expect(trial).toHaveAttribute('aria-pressed', 'false');
  await trial.click();
  await expect(trial).toHaveAttribute('aria-pressed', 'true');
  await sheet.getByRole('button', { name: '关闭弹层' }).click();
  await expect(page.locator('.att-filter-mark')).toHaveCount(0);
  await page.getByRole('button', { name: '筛选条件' }).click();
  const reopened = page.getByRole('dialog', { name: '筛选条件' });
  await expect(reopened.getByRole('button', { name: '试听学员' })).toHaveAttribute('aria-pressed', 'false');
  await reopened.getByRole('button', { name: '试听学员' }).click();
  await reopened.getByRole('button', { name: '确认' }).click();
  await expect(page.locator('.att-filter-mark')).toBeVisible();
});

test('attendance date sheet switches the reporting period', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1');
  await expect(page.locator('.att-date-label')).toHaveText('最近30天');
  await page.locator('.att-date').click();
  const sheet = page.getByRole('dialog', { name: '统计时段' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: '本月', exact: true }).click();
  await expect(sheet).toBeHidden();
  await expect(page.locator('.att-date-label')).toHaveText('本月');
});

test('attendance report switches dimension and filters by value', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1');
  await chooseDimension(page, '上课校区');
  await expect(page.getByRole('button', { name: '汇总维度', exact: true })).toHaveText('按照上课校区汇总');
  await expect(page.getByLabel('上课校区汇总列表')).toBeVisible();
  await expect(page.locator('.att-group-campus')).toHaveCount(0);
  await expect(page.locator('.att-group-cards .collapse-leading')).toHaveCount(0);
  await page.locator('.att-value').click();
  const sheet = page.getByRole('dialog', { name: '选择上课校区（可多选）' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: '北京乐博' }).click();
  await sheet.getByRole('button', { name: '确认' }).click();
  await expect(page.locator('.att-value-label')).toHaveText('北京乐博');
  await expect(page.locator('.att-summary')).toHaveCount(1);
});

test('attendance report shows an empty state without report permission', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/attendance/v1?role=principal');
  await expect(page.getByText('校长身份暂无出勤率报表数据')).toBeVisible();
  await expect(page.locator('.att-overview')).toHaveCount(0);
});

test('my page omits the duplicate attendance entry', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/my/v1');
  await expect(page.getByRole('button', { name: '出勤率报表', exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: '数据报表' })).toHaveCount(0);
  await page.screenshot({ path: 'test-results/my-without-attendance.png' });
});

test('workspace can switch the simulated attendance role', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/#/?page=attendance&theme=light');
  const config = page.getByRole('region', { name: '页面配置', exact: true });
  await expect(config.getByLabel('当前身份')).toBeVisible();
  await config.getByLabel('当前身份').selectOption('teacher');
  await expect(page.locator('iframe')).toHaveAttribute('src', './#/pages/attendance/v2?theme=light&role=teacher&chrome=wechat');
  const frame = page.frameLocator('iframe');
  await expect(frame.locator('.att-header')).toHaveCount(0);
  await frame.getByRole('button', { name: '查看统计范围说明' }).click();
  await expect(frame.locator('.att-v2-scope')).toContainText('任课老师或助教');
  await page.keyboard.press('Escape');
  await frame.getByRole('button', { name: '筛选条件' }).click();
  await expect(frame.getByRole('dialog').getByText('授课身份')).toBeVisible();
});

test('invalid role falls back safely and date search handles empty results', async ({ page }) => {
  await page.goto('/#/pages/attendance/v1?role=unexpected&theme=dark&from=home');
  await page.getByRole('button', { name: '查看统计范围说明' }).click();
  await expect(page.locator('.att-scope')).toContainText('作为班主任');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '选择班级名称' }).click();
  await page.getByRole('searchbox').fill('不存在的班级');
  await expect(page.getByText('没有匹配的选项')).toBeVisible();
  await page.getByRole('button', { name: '关闭弹层' }).click();
  await expect(page.locator('.preview-chrome, .preview-history, .att-header')).toHaveCount(0);
  await expect(page).toHaveURL(/theme=dark/);
});

test('attendance calculations exclude unfinished lessons and avoid counting makeup twice', async () => {
  const { buildLessons, computeStats, defaultFilters, scopeRecords, rangeFor } = await import('../src/pages/attendance/v1/attendance-data');
  const lessons = buildLessons('2026-10-14');
  const scoped = scopeRecords('headmaster', lessons, '2026-09-01', '2026-10-14', defaultFilters);
  expect(scoped.every((lesson) => lesson.status === 'finished')).toBe(true);
  const lesson = { ...lessons[0], scopedStudents: undefined, students: [{ ...lessons[0].students[0], isAttend: true, mendResult: { isAttend: true, isCost: true } }] };
  const stats = computeStats([lesson, lesson], defaultFilters);
  expect(stats.classes).toBe(1);
  expect(stats.people).toBe(1);
  expect(stats.make + stats.makeFree).toBe(0);
  expect(rangeFor('上月', '2026-01-14')).toEqual(['2025-12-01', '2025-12-31']);
});

test('wechat shell supports history back and forward through report and details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 858 });
  await page.goto('/#/pages/home/v1?chrome=wechat&theme=light');
  await expect(page.getByRole('navigation', { name: '微信浏览导航' })).toHaveCount(0);
  await page.getByRole('button', { name: '出勤率', exact: true }).click();
  await expect(page.locator('.att-header')).toHaveCount(0);
  await expect(page.locator('.preview-wechat-nav')).toContainText('出勤率报表');
  await expect(page.getByRole('button', { name: '微信后退' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '微信前进' })).toBeDisabled();
  await page.locator('.att-v2-summary').first().getByRole('button').first().click();
  await page.getByRole('button', { name: '查看课次明细' }).click();
  await expect(page.locator('.preview-wechat-nav')).toContainText('上课明细');
  await page.getByRole('button', { name: '微信后退' }).click();
  await expect(page.locator('.att-v2-overview')).toBeVisible();
  await expect(page.getByRole('button', { name: '微信前进' })).toBeEnabled();
  await page.getByRole('button', { name: '微信前进' }).click();
  await expect(page.locator('.preview-wechat-nav')).toContainText('上课明细');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-results/wechat-detail-shell.png' });
  await page.getByRole('button', { name: '微信后退' }).click();
  await page.getByRole('button', { name: '微信后退' }).click();
  await expect(page).toHaveURL(/pages\/home\/v1/);
  await expect(page.getByRole('button', { name: '微信后退' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '微信前进' })).toBeEnabled();
});

test('only class and course summaries use the updated Iconfont icons', async ({ page }) => {
  await page.goto('/#/pages/attendance/v1');
  await expect(page.locator('.att-group-cards .collapse-leading use').first()).toHaveAttribute('href', /#SSX-xuanban1$/);
  await chooseDimension(page, '课程名称');
  await expect(page.locator('.att-group-cards .collapse-leading use').first()).toHaveAttribute('href', /#SSX-xuanke1$/);
  for (const dimension of ['上课校区', '年份', '年级', '科目', '班级标签']) {
    await chooseDimension(page, dimension);
    await expect(page.locator('.att-group-cards .collapse-leading')).toHaveCount(0);
  }
});
