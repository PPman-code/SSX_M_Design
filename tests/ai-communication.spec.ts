import { test, expect } from '@playwright/test';
import { rangeForPreset } from '../src/lib/date-range';
const base = '/#/pages/customer-info/v1?customer=customer-1';
async function start(page: import('@playwright/test').Page, query = '') {
  await page.goto(base + query);
  await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
}
async function finish(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '结束并生成总结', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: '结束记录', exact: true }).click();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible({ timeout: 12000 });
}

test('customer entry and recording pause, minimize, summary and idempotent submission', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1');
  await page.getByRole('button', { name: '廖小龙客户主页', exact: true }).click();
  await expect(page).toHaveURL(/customer-info/);
  await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
  await page.getByRole('button', { name: '暂停录音', exact: true }).click();
  await page.getByRole('button', { name: '收起', exact: true }).click();
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  await page.getByRole('button', { name: 'AI 已暂停', exact: true }).click();
  await page.getByRole('button', { name: '继续录音', exact: true }).click();
  await finish(page);
  await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
  await expect(page.getByLabel('沟通内容', { exact: true })).toHaveValue(/核心摘要[\s\S]*沟通过程[\s\S]*待跟进事项/);
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByText('来源：AI 实时记录', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '查看 AI 记录', exact: true }).click();
  await expect(page.getByRole('button', { name: '查看沟通记录', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toHaveCount(0);
});

test('discarded AI form regenerates original and deletion preserves submitted communication', async ({ page }) => {
  await start(page); await finish(page);
  await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
  await page.getByLabel('沟通内容', { exact: true }).fill('不应保存的草稿');
  await page.goBack();
  await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
  await expect(page.getByLabel('沟通内容', { exact: true })).not.toHaveValue('不应保存的草稿');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await page.getByRole('button', { name: '查看 AI 记录', exact: true }).click();
  await page.getByRole('button', { name: 'AI 记录操作', exact: true }).click();
  await page.getByRole('menuitem', { name: '删除 AI 记录', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('已提交的沟通记录将保留');
  await page.getByRole('dialog').getByRole('button', { name: '删除', exact: true }).click();
  await expect(page.getByText('来源：AI 实时记录', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '查看 AI 记录', exact: true })).toHaveCount(0);
});

test('offline and microphone denial create no empty record', async ({ page }) => {
  for (const query of ['&start=offline', '&mic=denied']) {
    await start(page, query);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL(/customer-info/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  }
});

test('single pending opens directly, title and speaker edits stay local to the AI record', async ({ page }) => {
  await page.goto(base + '&scenario=single');
  await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
  await expect(page).toHaveURL(/ai-record/);
  await page.getByRole('button', { name: '修改记录标题', exact: true }).click();
  await page.getByLabel('记录标题', { exact: true }).fill('周末体验课沟通');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.getByRole('heading', { name: '周末体验课沟通', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '完整转写', exact: true }).click();
  await page.getByRole('button', { name: '说话人 2', exact: true }).first().click();
  await page.getByLabel('说话人名称', { exact: true }).fill('家长');
  await page.getByRole('button', { name: '保存并同步更新', exact: true }).click();
  await expect(page.getByRole('button', { name: '家长', exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: '定位到 00:27', exact: true }).click();
  await expect(page.getByRole('slider', { name: '录音进度' })).toHaveValue('27');
  await page.getByRole('tab', { name: 'AI 总结', exact: true }).click();
  await expect(page.locator('.ai-summary-core')).toContainText('家长希望孩子通过编程课程');
  await page.reload();
  await expect(page.getByRole('heading', { name: '周末体验课沟通', exact: true })).toBeVisible();
});

test('multiple pending states and creator permissions are isolated', async ({ page }) => {
  await page.goto(base + '&scenario=multiple');
  await page.getByRole('button', { name: /AI 记录 · 3 条待处理/ }).click();
  await expect(page).toHaveURL(/ai-pending/);
  await expect(page.locator('.ai-pending-card')).toHaveCount(3);
  await page.locator('.ai-pending-main').first().click();
  const ownRecord = page.url();
  await page.goto(ownRecord + '&teacher=other');
  await expect(page.getByRole('heading', { name: '记录不存在或暂无查看权限' })).toBeVisible();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toHaveCount(0);
  await page.goto(base + '&teacher=other');
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
});

test('recording survives minimize, blocks second customer and recovers interrupted on reload', async ({ page }) => {
  await page.goto('/#/pages/prospective-students/v1');
  await page.getByRole('button', { name: '廖小龙客户主页', exact: true }).click();
  await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
  await page.getByRole('button', { name: '暂停录音', exact: true }).click();
  await page.getByRole('button', { name: '收起', exact: true }).click();
  await page.goBack();
  await page.getByRole('button', { name: '王五五客户主页', exact: true }).click();
  await page.getByRole('button', { name: 'AI 已暂停', exact: true }).click();
  await expect(page).toHaveURL(/customer=customer-1/);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '继续录音', exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: '查看中断记录', exact: true }).click();
  await expect(page.getByRole('button', { name: '处理已保存片段', exact: true })).toBeVisible();
});

test('processing failure retries failed phase and submission failure preserves input', async ({ page }) => {
  await start(page, '&process=error&save=error');
  await page.getByRole('button', { name: '结束并生成总结', exact: true }).click();
  await page.getByRole('button', { name: '结束记录', exact: true }).click();
  await expect(page.getByRole('button', { name: '重新处理', exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '重新处理', exact: true }).click();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
  await page.getByLabel('沟通内容', { exact: true }).fill('老师确认后的沟通内容');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('提交失败');
  await expect(page.getByLabel('沟通内容', { exact: true })).toHaveValue('老师确认后的沟通内容');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page).toHaveURL(/communication-detail/);
  await expect(page.getByText('老师确认后的沟通内容', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('button', { name: '查看沟通记录', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  await expect(page.getByText('来源：AI 实时记录', { exact: true })).toHaveCount(1);
});

test('manual source remains manual and overlength input is never truncated', async ({ page }) => {
  await page.goto(base);
  await page.getByRole('button', { name: '添加沟通记录', exact: true }).click();
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('请输入沟通内容');
  await page.getByLabel('沟通内容', { exact: true }).fill('长'.repeat(1001));
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('不能超过1000字');
  await expect(page.getByLabel('沟通内容', { exact: true })).toHaveValue('长'.repeat(1001));
  await page.getByLabel('沟通内容', { exact: true }).fill('核心摘要：手工粘贴的 AI 文字');
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page.getByText('来源：手动添加', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '查看 AI 记录', exact: true })).toHaveCount(0);
});

test('offline finish retains recording and empty content cannot generate communication', async ({ page, context }) => {
  await start(page);
  await page.getByRole('button', { name: '暂停录音', exact: true }).click();
  await context.setOffline(true);
  await page.getByRole('button', { name: '结束并生成总结', exact: true }).click();
  await expect(page.getByRole('button', { name: '继续录音', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await context.setOffline(false);
  await page.getByRole('button', { name: '收起', exact: true }).click();
  await page.goto(base + '&scenario=empty');
  await page.reload();
  await page.getByRole('button', { name: /AI 记录 · 2 条待处理/ }).click();
  await page.locator('.ai-pending-main').filter({ hasText: '无有效沟通内容' }).click();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toHaveCount(0);
  await expect(page.getByText('未识别到有效沟通内容，无法生成沟通记录')).toBeVisible();
});

for (const width of [360, 375, 390, 430]) {
  test(`AI detail fits ${width}px and preview overlays stay in product viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + '&scenario=single&chrome=wechat');
    await expect(page.locator('.ai-entry-footer')).toHaveCSS('height', await page.locator('.preview-history').count() ? '56px' : '90px');
    await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toHaveCSS('height', '40px');
    expect((await page.locator('.ai-entry-footer').boundingBox())!.y + 48).toBeLessThanOrEqual((await page.locator('.preview-home-indicator').boundingBox())!.y);
    if (width === 390) await page.screenshot({ path: 'outputs/ai-communication-customer.png' });
    await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
    expect(await page.locator('.product-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
    await expect(page.locator('.product-footer')).toHaveCSS('height', '56px');
    await page.getByRole('button', { name: '修改记录标题', exact: true }).click();
    await expect.poll(async () => (await page.getByRole('dialog', { name: '修改标题', exact: true }).boundingBox())!.y + (await page.getByRole('dialog', { name: '修改标题', exact: true }).boundingBox())!.height).toBeLessThanOrEqual((await page.locator('.preview-history').boundingBox())!.y + 1);
    const box = (await page.getByRole('dialog', { name: '修改标题', exact: true }).boundingBox())!;
    const scroll = (await page.locator('.product-scroll').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(scroll.y);
    expect(box.x + box.width).toBeLessThanOrEqual(width);
    expect(box.y + box.height).toBeLessThanOrEqual((await page.locator('.preview-history').boundingBox())!.y + 1);
    if (width === 390) await page.screenshot({ path: 'outputs/ai-communication-edit.png' });
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog', { name: '修改标题', exact: true })).toBeHidden();
    await page.screenshot({ path: `outputs/ai-communication-${width}.png` });
  });
}

test('dark AI detail and recording entry render without overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '&scenario=single&theme=dark&chrome=wechat');
  await page.screenshot({ path: 'outputs/ai-communication-customer-dark.png' });
  await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
  await expect(page).toHaveTitle('AI 记录详情');
  expect(await page.locator('.product-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBeTruthy();
  await page.screenshot({ path: 'outputs/ai-communication-dark.png' });
});

test('submitted AI record is read-only for another teacher and pending count stays private', async ({ page }) => {
  await page.goto(base + '&scenario=single');
  await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
  const recordUrl = page.url();
  await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page).toHaveURL(/communication-detail/);
  await page.goto(recordUrl + '&teacher=other');
  await expect(page.getByRole('button', { name: '查看沟通记录', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '修改记录标题', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'AI 记录操作', exact: true })).toHaveCount(0);
});

test('storage write failure refuses to start a false recording', async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); }; });
  await start(page);
  await expect(page.getByRole('dialog')).toContainText('本地存储不可用，未开始记录');
  await expect(page).toHaveURL(/customer-info/);
});

test('original customer tabs and filtering remain available beside AI entry', async ({ page }) => {
  await page.goto(base);
  await expect(page.getByRole('tab')).toHaveText(['沟通记录', '试听记录', '优惠券', '意向课程']);
  await page.getByRole('button', { name: '查看客户资料', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('廖小龙');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '筛选', exact: true }).click();
  await page.getByRole('button', { name: '售前', exact: true }).click();
  await page.getByRole('button', { name: '售后', exact: true }).click();
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-communication-card')).toHaveCount(2);
  await expect(page.locator('.ai-communication-card').first()).toContainText('上课表现');
  await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: '意向课程', exact: true }).click();
  await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '添加沟通记录', exact: true })).toBeVisible();
  await expect(page.locator('.ai-entry-footer')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.locator('.ai-entry-footer')).toHaveCSS('box-shadow', 'none');
});

test('forbidden state blocks direct AI record, recording and submission routes', async ({ page }) => {
  await page.goto(base + '&scenario=single');
  await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
  const recordUrl = page.url();
  await page.goto(recordUrl + '&state=forbidden');
  await expect(page.getByRole('heading', { name: '记录不存在或暂无查看权限' })).toBeVisible();
  await page.goto(recordUrl.replace('/ai-record/', '/communication-form/') + '&state=forbidden');
  await expect(page.getByRole('button', { name: '提交', exact: true })).toHaveCount(0);
  await page.goto(recordUrl.replace('/ai-record/', '/ai-recording/') + '&state=forbidden');
  await expect(page.getByRole('button', { name: '结束并生成总结', exact: true })).toHaveCount(0);
});

test('same browser tabs share one elapsed-time checkpoint', async ({ page, context }) => {
  await start(page);
  await expect.poll(async () => page.locator('.ai-record-timer').innerText()).not.toBe('00:00');
  const second = await context.newPage();
  await second.goto(base);
  const before = await page.locator('.ai-record-timer').innerText();
  await page.waitForTimeout(3200);
  const after = await page.locator('.ai-record-timer').innerText();
  const seconds = (value: string) => Number(value.split(':')[0]) * 60 + Number(value.split(':')[1]);
  expect(seconds(after) - seconds(before)).toBeGreaterThanOrEqual(2);
  expect(seconds(after) - seconds(before)).toBeLessThanOrEqual(4);
  await second.close();
});

test('network loss during processing preserves record and requires retry', async ({ page, context }) => {
  await start(page);
  await page.getByRole('button', { name: '结束并生成总结', exact: true }).click();
  await page.getByRole('button', { name: '结束记录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '正在整理这次沟通', exact: true })).toBeVisible();
  await context.setOffline(true);
  await expect(page.getByRole('button', { name: '重新处理', exact: true })).toBeVisible({ timeout: 8000 });
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toHaveCount(0);
  await context.setOffline(false);
  await page.getByRole('button', { name: '重新处理', exact: true }).click();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible({ timeout: 10000 });
});

test('recording storage failure stays interrupted after capacity is restored', async ({ page }) => {
  await start(page);
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'ssx-ai-communication-prototype-v1') throw new DOMException('Full', 'QuotaExceededError');
      return original.call(this, key, value);
    };
    window.setTimeout(() => { Storage.prototype.setItem = original; }, 2500);
  });
  await expect(page.getByRole('heading', { name: '录音已中断', exact: true })).toBeVisible({ timeout: 5000 });
  await page.waitForTimeout(3000);
  await expect(page.getByRole('heading', { name: '录音已中断', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '结束并生成总结', exact: true })).toHaveCount(0);
});

test('opening a same-origin tab with copied session does not interrupt the owner', async ({ page }) => {
  await start(page);
  const popupEvent = page.waitForEvent('popup');
  await page.evaluate(url => window.open(url, '_blank'), base);
  const copied = await popupEvent;
  await expect(copied.getByRole('button', { name: 'AI 正在记录', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '暂停录音', exact: true })).toBeVisible();
  await copied.close();
});

test('all six H5 pages rely on WeChat navigation without a duplicate page bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const chrome of ['', '&chrome=wechat']) {
    for (const [route, title] of [['customer-info', '意向客户信息'], ['ai-recording', 'AI 实时记录'], ['ai-pending', '待处理 AI 记录'], ['ai-record', 'AI 记录详情'], ['communication-form', '添加沟通记录'], ['communication-detail', '沟通记录详情']]) {
      await page.goto(`/#/pages/${route}/v1?customer=customer-1${chrome}`);
      await expect(page).toHaveTitle(title);
      await expect(page.locator('.ai-page-heading')).toHaveCount(0);
      await expect(page.getByRole('button', { name: '返回', exact: true })).toHaveCount(0);
      await expect(page.locator('.preview-wechat-nav')).toHaveCount(chrome ? 1 : 0);
    }
  }
});

for (const width of [360, 375, 390, 430]) {
  test(`customer communication tabs pin with a surface background and student title at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(base + '&chrome=wechat');
    await expect(page.locator('.ai-communication-card')).toHaveCount(4);
    await expect(page.locator('.preview-web-title strong')).toHaveText('意向客户信息');
    const scroll = page.locator('.product-scroll');
    const tabs = page.getByRole('tablist', { name: '客户详情分类', exact: true });
    await scroll.evaluate(el => { el.scrollTop = 400; });
    await expect(page.locator('.preview-web-title strong')).toHaveText('廖小龙');
    await expect(page).toHaveTitle('廖小龙');
    await expect(tabs).toHaveAttribute('data-stuck', 'true');
    await expect(tabs).toHaveCSS('height', '48px');
    expect(Math.abs((await tabs.boundingBox())!.y - (await scroll.boundingBox())!.y)).toBeLessThanOrEqual(1);
    expect(await tabs.evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await page.locator('.ai-communication-card').first().evaluate(el => getComputedStyle(el).backgroundColor));
    await scroll.evaluate(el => { el.scrollTop = 360; });
    await expect(page.locator('.ai-customer-page')).toHaveClass(/is-actions-revealed/);
    await expect(page.getByRole('button', { name: '转正式学员', exact: true })).toBeInViewport();
    expect(Math.abs((await tabs.boundingBox())!.y - (await scroll.boundingBox())!.y - 72)).toBeLessThanOrEqual(1);
    await scroll.evaluate(el => { el.scrollTop = 320; });
    await expect(page.locator('.ai-customer-page')).toHaveClass(/is-actions-revealed/);
    if (width === 390) await page.screenshot({ path: 'outputs/ai-customer-actions-revealed.png' });
    await scroll.evaluate(el => { el.scrollTop = 370; });
    await expect(page.locator('.ai-customer-page')).not.toHaveClass(/is-actions-revealed/);
    await scroll.evaluate(el => { el.scrollTop = 700; });
    expect(Math.abs((await tabs.boundingBox())!.y - (await scroll.boundingBox())!.y)).toBeLessThanOrEqual(1);
    if (width === 390) await page.screenshot({ path: 'outputs/ai-communication-sticky.png' });
    await scroll.evaluate(el => { el.scrollTop = 0; });
    await expect(page.locator('.preview-web-title strong')).toHaveText('意向客户信息');
    await expect(tabs).not.toHaveAttribute('data-stuck');
    if (width === 390) await page.screenshot({ path: 'outputs/ai-communication-customer.png' });
  });
}

for (const theme of ['light', 'dark']) {
  test(`customer actions remain below all tabs without a white panel in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + `&theme=${theme}&chrome=wechat&scenario=single`);
    await expect(page.locator('.ai-customer-tabs')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('.product-scroll')).toHaveCSS('background-attachment', 'local');
    await verifyAITextContrast(page);
    const footer = page.locator('.ai-entry-footer');
    for (const name of ['沟通记录', '试听记录', '优惠券', '意向课程']) {
      await page.getByRole('tab', { name, exact: true }).click();
      await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: '添加沟通记录', exact: true })).toBeVisible();
      await expect(footer).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      const scrollBox = (await page.locator('.product-scroll').boundingBox())!;
      const footerBox = (await footer.boundingBox())!;
      expect(scrollBox.y + scrollBox.height).toBeGreaterThan(footerBox.y + 40);
      await expect(footer).toHaveCSS('box-shadow', 'none');
      await expect(footer).toHaveCSS('border-top-width', '0px');
    }
    await page.getByRole('tab', { name: '沟通记录', exact: true }).click();
    await page.locator('.product-scroll').evaluate(el => { el.scrollTop = 400; });
    await expect(page.locator('.preview-web-title strong')).toHaveText('廖小龙');
    if (theme === 'dark') await page.screenshot({ path: 'outputs/ai-communication-sticky-dark.png' });
  });
}

test('minimized recorder shares the AI action across tabs and returns to the same recording', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page, '&chrome=wechat');
  const recordingUrl = page.url();
  await page.getByRole('button', { name: '收起', exact: true }).click();
  const action = page.getByRole('button', { name: 'AI 正在记录', exact: true });
  await expect(action).toBeVisible();
  await expect(action).toContainText('点击可以进入录制页面');
  await expect(page.locator('.ai-active-entry')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toHaveCount(0);
  for (const name of ['试听记录', '优惠券', '意向课程', '沟通记录']) {
    await page.getByRole('tab', { name, exact: true }).click();
    await expect(action).toBeVisible();
  }
  await page.screenshot({ path: 'outputs/ai-communication-active-button.png' });
  await action.click();
  await expect(page).toHaveURL(recordingUrl);
  await page.getByRole('button', { name: '暂停录音', exact: true }).click();
  await page.getByRole('button', { name: '收起', exact: true }).click();
  await page.getByRole('button', { name: 'AI 已暂停', exact: true }).click();
  await expect(page).toHaveURL(recordingUrl);
  await expect(page.getByRole('button', { name: '继续录音', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '继续录音', exact: true }).click();
  await finish(page);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'AI 实时记录', exact: true })).toBeVisible();
});


async function verifyAITextContrast(page: import('@playwright/test').Page) {
  for (const selector of ['.ai-start-button', '.ai-pending-entry']) {
    const ratios = await page.locator(selector).evaluate(element => {
      const style = getComputedStyle(element);
      const stops = style.backgroundImage.match(/color\(srgb [^)]+\)|rgba?\([^)]+\)/g) ?? [];
      const canvas = document.createElement('canvas'); canvas.width = 1; canvas.height = 1;
      const context = canvas.getContext('2d')!;
      function luminance(color: string) {
        context.fillStyle = color; context.fillRect(0, 0, 1, 1);
        const rgb = Array.from(context.getImageData(0, 0, 1, 1).data).slice(0, 3).map(value => {
          const channel = value / 255; return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
        });
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
      }
      const foreground = luminance(style.color);
      return stops.map(stop => { const background = luminance(stop); return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05); });
    });
    expect(ratios.length).toBeGreaterThanOrEqual(2);
    expect(Math.min(...ratios), `${selector} text contrast`).toBeGreaterThanOrEqual(4.5);
  }
}

test('communication date shortcuts handle calendar boundaries and cancel without applying', async ({ page }) => {
  expect(rangeForPreset('昨天', '2026-01-01')).toEqual(['2025-12-31', '2025-12-31']);
  expect(rangeForPreset('昨天', '2024-03-01')).toEqual(['2024-02-29', '2024-02-29']);
  expect(rangeForPreset('本周', '2026-10-25')).toEqual(['2026-10-19', '2026-10-25']);
  expect(rangeForPreset('最近 7 天', '2026-01-03')).toEqual(['2025-12-28', '2026-01-03']);
  expect(rangeForPreset('最近 1 年', '2026-10-23')).toEqual(['2025-10-24', '2026-10-23']);
  await page.clock.install({ time: new Date('2026-10-23T12:00:00+08:00') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '&chrome=wechat');
  await page.getByRole('button', { name: '不限日期', exact: true }).click();
  const sheet = page.getByRole('dialog', { name: '选择日期', exact: true });
  const options = sheet.getByRole('group', { name: '快捷时段' }).getByRole('button');
  await expect(options).toHaveText(['不限时间', '今天', '昨天', '本周', '最近 7 天', '最近 30 天', '最近 1 年', '本月']);
  await expect(sheet.getByRole('button', { name: '不限时间', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const ranges = [
    ['今天', '2026/10/23', '2026/10/23'], ['昨天', '2026/10/22', '2026/10/22'],
    ['本周', '2026/10/19', '2026/10/23'], ['最近 7 天', '2026/10/17', '2026/10/23'],
    ['最近 30 天', '2026/09/24', '2026/10/23'], ['最近 1 年', '2025/10/24', '2026/10/23'],
    ['本月', '2026/10/01', '2026/10/23'],
  ];
  for (const [name, start, end] of ranges) {
    await sheet.getByRole('button', { name, exact: true }).click();
    await expect(sheet.getByRole('button', { name: /^开始日期/ })).toContainText(start);
    await expect(sheet.getByRole('button', { name: /^结束日期/ })).toContainText(end);
    await expect(sheet.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await page.screenshot({ path: 'outputs/ai-history-date-shortcuts.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: '不限日期', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '不限日期', exact: true }).click();
  await sheet.getByRole('button', { name: '最近 7 天', exact: true }).click();
  await sheet.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-history-filter').getByRole('button', { name: '最近 7 天', exact: true })).toBeVisible();
  await page.locator('.ai-history-filter').getByRole('button', { name: '最近 7 天', exact: true }).click();
  await sheet.getByRole('button', { name: '不限时间', exact: true }).click();
  await sheet.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('button', { name: '不限日期', exact: true })).toBeVisible();
  await expect(page.locator('.ai-communication-card')).toHaveCount(4);
});

test('communication date and stage filters are independent and outbound drafts apply only on confirmation', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-23T12:00:00+08:00') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '&chrome=wechat');
  const bar = page.locator('.ai-history-filter');
  await expect(bar).toHaveCSS('height', '48px');
  await expect(bar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  for (const button of await bar.getByRole('button').all()) {
    await expect(button).toHaveCSS('font-size', '14px');
    await expect(button.locator('use')).toHaveAttribute('href', /#SSX-caret-down$/);
  }
  const filter = page.getByRole('dialog', { name: '筛选沟通记录', exact: true });
  await page.getByRole('button', { name: '筛选', exact: true }).click();
  await expect(filter.getByRole('group', { name: '快捷时段' })).toHaveCount(0);
  await expect(filter.getByRole('button', { name: '有效沟通', exact: true })).toHaveCount(0);
  await filter.getByRole('button', { name: '不包含', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(page.locator('.ai-communication-card')).toHaveCount(4);
  await page.getByRole('button', { name: '筛选', exact: true }).click();
  await expect(filter.getByRole('button', { name: '包含', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await filter.getByRole('button', { name: '不包含', exact: true }).click();
  await expect(filter.getByRole('button', { name: '售前', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(filter.getByRole('button', { name: '售后', exact: true })).toHaveAttribute('aria-pressed', 'false');
  for (const option of await filter.getByRole('group', { name: '沟通阶段', exact: true }).getByRole('button').all()) {
    await expect(option).toHaveCSS('height', '36px');
    await expect(option).toHaveCSS('font-size', '14px');
  }
  await expect(filter).toHaveCSS('min-height', '360px');
  const lastOption = (await filter.getByRole('button', { name: '售后', exact: true }).boundingBox())!;
  expect((await filter.locator('.sheet-footer').boundingBox())!.y - lastOption.y - lastOption.height).toBeGreaterThanOrEqual(40);
  await page.screenshot({ path: 'outputs/ai-history-stage-filter.png' });
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-communication-card')).toHaveCount(2);
  await page.getByRole('button', { name: '不限日期', exact: true }).click();
  const dates = page.getByRole('dialog', { name: '选择日期', exact: true });
  await expect(dates.getByRole('switch')).toHaveCount(0);
  await dates.getByRole('button', { name: '最近 7 天', exact: true }).click();
  await dates.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-communication-card')).toHaveCount(1);
  await page.getByRole('button', { name: '筛选', exact: true }).click();
  await filter.getByRole('button', { name: '重置', exact: true }).click();
  await filter.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-history-filter').getByRole('button', { name: '最近 7 天', exact: true })).toBeVisible();
  await expect(page.locator('.ai-communication-card')).toHaveCount(3);
  await page.locator('.ai-history-filter').getByRole('button', { name: '最近 7 天', exact: true }).click();
  await dates.getByRole('button', { name: '不限时间', exact: true }).click();
  await dates.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.locator('.ai-communication-card')).toHaveCount(4);
});
