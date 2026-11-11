import { test, expect } from '@playwright/test';

const url = '/#/pages/student-info/v1?student=s1&theme=light&chrome=wechat';
test('formal detail shares communication workflow and scopes points to its tab', async ({ page }) => {
  await page.goto(url);
  await expect(page.getByRole('tablist', { name: '学员详情分类' }).getByRole('tab')).toHaveText(['沟通记录', '报读课程', '课消明细', '出勤明细', '在读班级', '积分', '优惠券', '请假记录', '附件', '课表', '课堂点评']);
  await expect(page.getByRole('tab', { name: '沟通记录', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '报名收费', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '添加沟通记录', exact: true }).click();
  await expect(page.locator('.ai-form-student')).toContainText('金灿灿');
  await page.getByRole('textbox', { name: '沟通内容', exact: true }).fill('正式学员课后练习沟通');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page).toHaveURL(/student-info\/v1.*student=s1/);
  await expect(page.locator('.ai-communication-card').filter({ hasText: '正式学员课后练习沟通' })).toBeVisible();
  await page.getByRole('tab', { name: '积分', exact: true }).click();
  await expect(page.getByRole('button', { name: '添加沟通记录', exact: true })).toHaveCount(0);
  await expect(page.getByRole('tabpanel')).toBeEmpty();
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toHaveCSS('height', '48px');
  await page.getByRole('button', { name: '加减积分', exact: true }).click();
  await page.getByRole('menuitem', { name: '加分', exact: true }).click();
  await page.getByRole('checkbox', { name: '课堂表现积极 +3 分', exact: true }).check();
  await page.getByRole('button', { name: '确认选择', exact: true }).click();
  await page.getByRole('button', { name: '确认加分', exact: true }).click();
  await expect(page.locator('.student-points-panel, .student-points-balance')).toHaveCount(0);
  await expect(page.getByText('加分成功 本次 +3 分', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '沟通记录', exact: true }).click();
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toHaveCount(0);
});

test('formal student recording returns to the same student after processing', async ({ page }) => {
  await page.goto(url + '&scenario=none');
  await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
  await expect(page.locator('.ai-record-identity')).toContainText('金灿灿');
  await page.getByRole('button', { name: '结束录音', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '结束记录', exact: true }).click();
  await page.getByRole('button', { name: '返回学员，稍后查看', exact: true }).click();
  await expect(page).toHaveURL(/student-info\/v1.*student=s1/);
  await expect(page.getByRole('button', { name: '查看学员资料', exact: true })).toContainText('金灿灿');
});

for (const [width, theme] of [[360, 'light'], [375, 'light'], [390, 'light'], [430, 'light'], [390, 'dark']] as const) {
  test(`formal detail actions and footer fit ${width}px ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(url.replace('theme=light', `theme=${theme}`));
    await page.getByRole('button', { name: '展开全部学员功能', exact: true }).click();
    await expect(page.getByRole('button', { name: '收起学员功能', exact: true })).toHaveCSS('height', '24px');
    await expect(page.locator('.student-detail-action-group')).toHaveCSS('height', '176px');
    const expandIcon = page.locator('.student-detail-expand-icon');
    await expect(expandIcon).toHaveCSS('width', '24px');
    await expect(expandIcon).toHaveCSS('height', '8px');
    await page.getByRole('button', { name: '不限日期', exact: true }).click();
    const dates = page.getByRole('dialog', { name: '选择日期', exact: true });
    const handleColor = await dates.locator('.sheet-handle').evaluate(el => getComputedStyle(el).backgroundColor);
    await dates.getByRole('button', { name: '关闭弹层', exact: true }).click();
    await expect(expandIcon).toHaveCSS('color', handleColor);
    const actions = page.getByLabel('学员业务操作', { exact: true });
    await expect(actions.getByRole('button')).toHaveText(['报名收费', '请假申请', '上传附件', '发优惠券', '转校', '调班', '退费', '结转']);
    for (const image of await actions.locator('img').all()) {
      await expect(image).toHaveCSS('width', '24px');
      await expect(image).toHaveCSS('height', '24px');
      await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    }
    const add = page.getByRole('button', { name: '添加沟通记录', exact: true });
    await expect(add).toHaveCSS('height', '40px');
    const card = await page.getByRole('button', { name: '查看学员资料', exact: true }).boundingBox();
    expect(card!.x).toBeGreaterThanOrEqual(0);
    expect(card!.x + card!.width).toBeLessThanOrEqual(width);
    await page.screenshot({ animations: 'disabled', path: `/tmp/formal-student-${width}-${theme}.png` });
    await page.getByRole('button', { name: '收起学员功能', exact: true }).click();
    await expect(page.getByRole('button', { name: '展开全部学员功能', exact: true })).toHaveCSS('height', '24px');
    await expect(page.locator('.student-detail-action-group')).toHaveCSS('height', '104px');
    await expect(page.getByRole('button', { name: '转校', exact: true })).toHaveCount(0);
    await page.getByRole('tab', { name: '沟通记录', exact: true }).press('End');
    await expect(page.getByRole('tab', { name: '课堂点评', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('暂无课堂点评记录');
    await page.getByRole('tab', { name: '积分', exact: true }).click();
    const points = page.getByRole('button', { name: '加减积分', exact: true });
    await expect(points).toHaveCSS('height', '48px');
    // Direct WeChat preview has no history bar and reserves a 34px simulated safe area.
    await expect(page.locator('.student-info-footer')).toHaveCSS('height', '98px');
    const buttonBox = (await points.boundingBox())!;
    const historyBox = (await page.locator('.preview-home-indicator').boundingBox())!;
    expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(historyBox.y);
    await page.screenshot({ animations: 'disabled', path: `/tmp/formal-student-points-${width}-${theme}.png` });
  });
}

test('formal and prospective communication records remain isolated', async ({ page }) => {
  await page.goto(url);
  await page.locator('.ai-communication-card').first().getByRole('button', { name: '修改', exact: true }).click();
  await page.getByRole('textbox', { name: '沟通内容', exact: true }).fill('只属于正式学员金灿灿的沟通');
  const savedId = new URLSearchParams(page.url().split('?')[1]).get('communication');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page).toHaveURL(/student-info.*student=s1/);
  await page.goto(`/#/pages/communication-form/v1?communication=${savedId}`);
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page).toHaveURL(/student-info.*student=s1/);
  await expect(page.getByText('只属于正式学员金灿灿的沟通', { exact: true })).toBeVisible();
  await page.goto('/#/pages/customer-info/v1?customer=customer-1');
  await expect(page.getByText('只属于正式学员金灿灿的沟通', { exact: true })).toHaveCount(0);
  await page.goto('/#/pages/student-info/v1?student=s2');
  await expect(page.getByText('只属于正式学员金灿灿的沟通', { exact: true })).toHaveCount(0);
  await page.goto(url);
  await expect(page.getByText('只属于正式学员金灿灿的沟通', { exact: true })).toBeVisible();
});
