import { enterEmptyPointsEditor } from './helpers/points';
import { test, expect } from '@playwright/test';

test('business document titles match navigation without product suffixes', async ({ page }) => {
  for (const [route, title] of [
    ['student-info/v1?student=s1', '金灿灿'],
    ['students/v1', '学员管理'],
    ['prospective-students/v1', '意向客户管理'],
    ['my/v1', '我的'],
    ['home/v1', '黄老师-校管家'],
    ['attendance/v1', '出勤率报表'],
    ['attendance/v2', '出勤率报表'],
  ]) {
    await page.goto(`/#/pages/${route}`);
    await expect(page).toHaveTitle(title);
  }
  await page.goto('/#/pages/student-info/v1?student=s2&chrome=wechat');
  await expect(page).toHaveTitle('欧阳丽丽');
  await expect(page.locator('.preview-web-title strong')).toHaveText('欧阳丽丽');
});

for (const chrome of [false, true]) {
  test(`points editor grows to usable top before content scrolls, preview=${chrome}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 740 });
    await page.goto(`/#/pages/student-info/v1?student=s1${chrome ? '&chrome=wechat' : ''}`);
    await page.getByRole('button', { name: '加减积分', exact: true }).click();
    await page.getByRole('menuitem', { name: '加分', exact: true }).click();
    const main = await enterEmptyPointsEditor(page);
    const short = (await main.boundingBox())!;
    expect(short.height).toBeLessThan(400);
    await main.getByRole('button', { name: '选择积分项', exact: true }).click();
    const selector = page.getByRole('dialog', { name: '选择加分项', exact: true });
    for (const option of await selector.getByRole('checkbox').all()) await option.check();
    await selector.getByRole('button', { name: '确认选择', exact: true }).click();
    await expect.poll(async () => (await main.boundingBox())!.y).toBeCloseTo((chrome ? 98 : 0) + 16, 0);
    const content = main.locator(':scope > .sheet-content');
    expect(await content.evaluate(el => el.scrollHeight > el.clientHeight)).toBe(true);
    const footerBefore = (await main.locator('.sheet-footer').boundingBox())!;
    await content.evaluate(el => { el.scrollTop = el.scrollHeight; });
    await expect(main.getByRole('button', { name: '添加积分项', exact: true })).toBeInViewport();
    expect((await main.locator('.sheet-footer').boundingBox())!.y).toBe(footerBefore.y);
  });
}
