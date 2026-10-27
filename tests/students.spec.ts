import { test, expect } from '@playwright/test';
import { defaultFilters, filterStudents, inTab, money, students } from '../src/pages/students/v1/model';

test('student examples preserve reference figures and independent category flags', () => {
  expect(money(-3782)).toBe('-¥3,782.00'); expect(money(4700)).toBe('¥4,700.00'); expect(money(0)).toBe('¥0');
  expect(students.filter(student => inTab(student, 'communication'))).toHaveLength(2);
  expect(students.filter(student => inTab(student, 'arrears'))).toHaveLength(2);
  expect(students.filter(student => inTab(student, 'birthday'))).toHaveLength(2);
  expect(filterStudents(students, '阳光', { ...defaultFilters(), statuses: ['在读'] })).toHaveLength(0);
});

for (const width of [360, 375, 390, 430]) {
  test(`student reference layout fits ${width}px with phone beside number`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 });
    await page.goto('/#/pages/students/v1?theme=light');
    await expect(page.getByRole('listitem')).toHaveCount(5);
    await expect(page.locator('.student-count')).toHaveCSS('height', '40px');
    const activeTab = page.getByRole('tab', { name: '全部', exact: true });
    const brandColors = { text: await activeTab.evaluate(element => getComputedStyle(element).color), underline: await page.locator('.student-tabs .ssx-tabs-indicator').evaluate(element => getComputedStyle(element).backgroundColor) };
    expect(brandColors.text).toBe(brandColors.underline);
    await expect(page.getByRole('tab', { name: '全部', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.preview-chrome')).toHaveCount(0);
    expect((await page.locator('.student-toolbar').boundingBox())!.y).toBe(0);
    const first = page.getByRole('listitem').first();
    await expect(first).toContainText('金灿灿'); await expect(first).toContainText('¥4,700.00');
    await expect(first.locator('dt')).toHaveText(['剩余学费', '剩余数量', '电子钱包', '有效期至']);
    const number = await first.locator('.student-phone-row > span').boundingBox();
    const phone = await first.locator('.student-phone img').boundingBox();
    expect(phone!.x - number!.x - number!.width).toBeGreaterThanOrEqual(0);
    expect(phone!.x - number!.x - number!.width).toBeLessThan(8);
    expect(Math.abs(phone!.y + phone!.height / 2 - number!.y - number!.height / 2)).toBeLessThan(2);
    for (const image of await page.locator('.student-page img').all()) {
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
    }
    await expect(page.getByRole('listitem').filter({ hasText: '欧阳丽丽' }).locator('.student-negative')).toHaveText(['-¥3,782.00', '-17']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/students-${width}.png` });
  });
}

test('home entry follows preview configuration and standalone link', async ({ page }) => {
  await page.goto('/#/?page=home&theme=light');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: '学员管理', exact: true }).click();
  await expect(frame.locator('.preview-web-title')).toContainText('学员管理');
  await expect(page.getByRole('region', { name: '页面配置', exact: true })).toContainText('学员管理');
  await expect(page.getByRole('link', { name: '独立打开' })).toHaveAttribute('href', /pages\/students\/v1/);
  await expect(page.getByRole('link', { name: '独立打开' })).not.toHaveAttribute('href', /chrome=/);
  await frame.getByRole('button', { name: '微信后退', exact: true }).click();
  await expect(frame.getByRole('button', { name: '意向学员', exact: true })).toBeVisible();
});

test('student categories, keyboard navigation and searches update counts', async ({ page }) => {
  await page.goto('/#/pages/students/v1');
  await page.getByRole('tab', { name: '全部', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: '待沟通 (2)', exact: true })).toBeFocused();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('tab', { name: '欠费 (2)', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await page.getByRole('textbox', { name: '搜索学员' }).fill('金妮');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('金妮妮');
  await page.getByRole('button', { name: '清除学员搜索' }).click();
  await page.getByRole('tab', { name: '生日 (2)', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(2);
});

test('student filters discard drafts, apply intersections and keep reset pending', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/students/v1?theme=dark&chrome=wechat');
  await page.getByRole('button', { name: '筛选学员', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '筛选学员', exact: true });
  const bounds = await dialog.boundingBox(); expect(bounds!.x + bounds!.width).toBeCloseTo(390, 0);
  await dialog.getByRole('button', { name: '退学', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await page.getByRole('button', { name: '筛选学员', exact: true }).click();
  await dialog.getByRole('button', { name: '退学', exact: true }).click();
  await dialog.getByRole('button', { name: '小于 0', exact: true }).click();
  await page.screenshot({ path: 'test-results/students-filter-dark.png' });
  await dialog.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('欧阳丽丽');
  await page.getByRole('button', { name: '筛选学员', exact: true }).click();
  await dialog.getByRole('button', { name: '重置', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listitem')).toHaveCount(1);
});

test('student sorting changes values and toggles its selected direction', async ({ page }) => {
  await page.goto('/#/pages/students/v1');
  await page.getByRole('button', { name: '学员排序' }).click();
  await page.getByRole('button', { name: '按剩余学费排序' }).click();
  const toast = page.locator('.toast:not([data-ending])');
  await expect(toast).toHaveText('已按降序排列');
  await expect(page.getByRole('listitem').first()).toContainText('金灿灿');
  await page.getByRole('button', { name: '学员排序' }).click();
  await page.getByRole('button', { name: '按剩余学费排序' }).click();
  await expect(toast).toHaveText('已按升序排列');
  await expect(page.getByRole('listitem').first()).toContainText('欧阳丽丽');
});

test('student preview includes loading, empty, failure, restricted and masked states', async ({ page }) => {
  await page.goto('/#/pages/students/v1?state=loading');
  await expect(page.getByRole('status')).toContainText('正在加载学员');
  await page.goto('/#/pages/students/v1?state=empty');
  await expect(page.getByText('暂无符合条件的学员')).toBeVisible();
  await page.getByRole('button', { name: '清除条件' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await page.goto('/#/pages/students/v1?state=error');
  await page.getByRole('button', { name: '重试' }).click();
  await expect(page.getByRole('listitem')).toHaveCount(5);
  await page.goto('/#/pages/students/v1?state=forbidden');
  await expect(page.getByText('暂无学员查看权限')).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.goto('/#/pages/students/v1?phone=masked');
  await expect(page.getByRole('link', { name: /拨打/ })).toHaveCount(0);
  await expect(page.getByRole('listitem').first()).toContainText('133****6666');
});

for (const chrome of ['', '&chrome=wechat']) {
  test(`only student tabs stick after scrolling ${chrome ? 'inside WeChat preview' : 'standalone'}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 600 });
    await page.goto(`/#/pages/students/v1?theme=light${chrome}`);
    const scroll = page.locator('.product-scroll');
    await scroll.evaluate(element => { element.scrollTop = 150; });
    const viewport = await scroll.boundingBox();
    const toolbar = await page.locator('.student-toolbar').boundingBox();
    const tabs = await page.getByRole('tablist', { name: '学员分类' }).boundingBox();
    expect(toolbar!.y + toolbar!.height).toBeLessThanOrEqual(viewport!.y);
    expect(tabs!.y).toBeCloseTo(viewport!.y, 0);
    await expect(page.getByRole('tab', { name: '全部', exact: true })).toBeInViewport();
    await page.screenshot({ path: `test-results/students-sticky-tabs-${chrome ? 'wechat' : 'standalone'}.png` });
    await scroll.evaluate(element => { element.scrollTop = 0; });
    await expect(page.getByRole('textbox', { name: '搜索学员' })).toBeInViewport();
    expect((await page.locator('.student-toolbar').boundingBox())!.y).toBeCloseTo(viewport!.y, 0);
  });
}

test('student heading navigates while metrics, phone and shortcuts remain independent', async ({ page }) => {
  await page.goto('/#/pages/students/v1?phone=masked');
  const first = page.getByRole('listitem').first();
  await first.locator('.student-metrics').click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL(/pages\/students\/v1/);
  await first.getByRole('button', { name: '拨打金灿灿电话' }).click();
  await expect(page.getByText('暂无号码查看及拨号权限', { exact: true })).toBeVisible();
  await first.getByRole('button', { name: '金灿灿课程信息' }).click();
  await expect(page.getByText('金灿灿的课程信息待对接', { exact: true })).toBeVisible();
  await first.getByRole('button', { name: '金灿灿学员二维码' }).click();
  await expect(page.getByText('金灿灿的学员二维码待对接', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/pages\/students\/v1/);
  await first.locator('.student-card-heading').click({ position: { x: 5, y: 5 } });
  await expect(page).toHaveURL(/pages\/student-info\/v1\?.*student=s1/);
});
