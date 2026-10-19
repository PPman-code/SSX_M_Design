import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`v2 copies the report and keeps detail navigation in v2 at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/attendance/v2?role=teacher');
    await expect(page.locator('.att-v2-overview')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/attendance-v2-${width}.png` });
    await page.locator('.att-v2-summary').first().getByRole('button').first().click();
    const table = page.getByRole('table', { name: '计费及未计费出勤人次' });
    await expect(table).toBeVisible();
    await expect(table.getByRole('row')).toHaveCount(4);
    await expect(table.getByRole('rowheader')).toHaveText(['出勤', '缺勤', '缺勤已补']);
    await expect(page.locator('.att-v2-summary .att-v2-breakdown-subset')).toHaveCount(0);
    await page.locator('.att-v2-inline').scrollIntoViewIfNeeded();
    await page.locator('.att-v2-summary').first().screenshot({ path: `test-results/attendance-v2-expanded-${width}.png` });
    await page.getByRole('button', { name: '查看课次明细', exact: true }).click();
    await expect(page).toHaveURL(/\/pages\/attendance\/v2\?.*view=detail/);
    await expect(page.locator('.att-v2-lesson').first()).toBeVisible();
    const lesson = page.locator('.att-v2-lesson').first();
    await expect(lesson.getByRole('table')).toBeVisible();
    await expect(lesson.getByRole('rowheader')).toHaveText(['出勤', '缺勤', '缺勤已补']);
    await expect(lesson.getByRole('columnheader')).toHaveText(['统计项', '计费', '未计费', '比率']);
    await expect(lesson.locator('.att-v2-detail-rate')).toContainText('补课后出勤率');
    await expect(lesson.locator('.att-v2-lesson-head')).not.toContainText('出勤率');
    await expect(lesson.locator('.att-v2-lesson-head .att-v2-lesson-counts')).toHaveCount(0);
    await expect(lesson.locator('.att-v2-lesson-body .att-v2-lesson-counts')).toBeVisible();
    await expect(lesson.locator('.att-v2-lesson-counts')).toContainText('实到/应到');
    await expect(lesson.locator('.att-v2-lesson-counts')).toContainText('试听');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await lesson.getByRole('button', { name: '查看补课后出勤率规则' }).click();
    const explanation = page.getByRole('dialog', { name: '气泡提示' });
    await expect(explanation).toContainText('属于缺勤中的一部分');
    await expect(explanation).toContainText('计费／未计费是否参与计算');
    await expect(explanation).toContainText('以当前生效的统计规则为准');
    await page.screenshot({ path: `test-results/attendance-v2-rate-info-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(explanation).toBeHidden();
    await expect(lesson.getByRole('button', { name: '查看补课后出勤率规则' })).toBeFocused();
    await page.screenshot({ path: `test-results/attendance-v2-detail-${width}.png` });
    await page.goBack();
    await expect(page.locator('.att-v2-overview')).toBeVisible();
  });
}

test('only v2 is active while v1 remains available for archive review', async ({ page }) => {
  await page.goto('/#/?page=attendance&role=teacher&theme=light');
  await expect(page.locator('iframe')).toHaveAttribute('src', './#/pages/attendance/v2?theme=light&role=teacher&chrome=wechat');
  await expect(page.getByRole('combobox', { name: '页面版本', exact: true })).toHaveValue('/pages/attendance/v2');
  await expect(page.getByLabel('当前身份')).toHaveCount(0);
  await page.goto('/#/handoff?theme=light');
  await expect(page.getByRole('heading', { name: '出勤率报表 · v1', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '出勤率报表 · 1.1', exact: true })).toBeVisible();
  await page.goto('/#/pages/attendance/v1?theme=light');
  await expect(page.locator('.att-overview')).toBeVisible();
});
