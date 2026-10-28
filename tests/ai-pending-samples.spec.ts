import { test, expect } from '@playwright/test';
const url = '/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat';
async function openList(page: import('@playwright/test').Page) {
  await page.goto(url);
  await page.getByRole('button', { name: /AI 记录 · 7 条待处理/ }).click();
}
test('default pending samples cover all pending statuses and stay available after reload', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openList(page);
  await expect(page.locator('.ai-pending-card')).toHaveCount(7);
  for (const text of ['总结已完成', '正在完成转写', '正在生成 AI 总结', '转写失败，请重试', '总结失败，请重试', '无有效沟通内容'])
    await expect(page.locator('.ai-status').filter({ hasText: text })).toHaveCount(1);
  await expect(page.locator('.ai-status').filter({ hasText: '录音已中断' })).toHaveCount(1);
  // Past the simulation clock threshold, processing examples must still be reviewable.
  await page.waitForTimeout(2200);
  await expect(page.getByText('正在完成转写', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'outputs/ai-pending-default-states.png' });
  await page.goto(url);
  await page.reload();
  await expect(page.getByRole('button', { name: /AI 记录 · 7 条待处理/ })).toBeVisible();
});
for (const title of ['课程费用与报名方式咨询', '家长课后学习反馈']) {
  test(`failed sample can recover: ${title}`, async ({ page }) => {
    await openList(page);
    await page.locator('.ai-pending-main').filter({ hasText: title }).click();
    await expect(page.getByRole('button', { name: '重新处理', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '重新处理', exact: true }).click();
    await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible({ timeout: 10000 });
  });
}
test('empty and interrupted examples preserve their real available content', async ({ page }) => {
  await openList(page);
  await page.locator('.ai-pending-main').filter({ hasText: '未接通的电话沟通' }).click();
  await expect(page.getByRole('heading', { name: '无有效沟通内容', exact: true })).toBeVisible();
  await expect(page.locator('.ai-empty')).toContainText('未识别到有效内容，无法生成沟通记录。');
  await expect(page.locator('.product-footer')).toHaveCount(0);
  await page.screenshot({ path: 'outputs/ai-empty-combined-notice.png' });
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toHaveCount(0);
  await openList(page);
  await page.locator('.ai-pending-main').filter({ hasText: '试听课安排确认' }).click();
  await page.getByRole('tab', { name: '完整转写', exact: true }).click();
  await expect(page.locator('.ai-transcript-segment')).toHaveCount(2);

});

test('deleting a default sample does not repopulate it on revisit', async ({ page }) => {
  await openList(page);
  await page.getByRole('button', { name: '更多：未接通的电话沟通', exact: true }).click();
  await page.getByRole('menuitem', { name: '删除', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '删除 AI 记录？', exact: true });
  await dialog.getByRole('button', { name: '删除', exact: true }).click();
  await expect(page.locator('.ai-pending-card')).toHaveCount(6);
  await page.goto(url);
  await page.reload();
  await expect(page.getByRole('button', { name: /AI 记录 · 6 条待处理/ })).toBeVisible();
});

test('legacy accumulated demo records refresh once without removing submitted communications', async ({ page }) => {
  await openList(page);
  await page.evaluate(() => {
    const key = 'ssx-ai-communication-prototype-v1';
    const state = JSON.parse(localStorage.getItem(key)!);
    const sample = state.records[0];
    state.records = Array.from({ length: 20 }, (_, index) => ({ ...sample, id: `old-${index}` }));
    state.records.push({ ...sample, id: 'submitted-ai', communicationId: 'saved-communication' });
    state.communications = [{ id: 'saved-communication', content: '已经提交的沟通内容' }];
    state.seeded = ['pending-showcase-v1:customer-1:刘亦菲'];
    localStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto(url);
  await page.reload();
  await page.getByRole('button', { name: /AI 记录 · 7 条待处理/ }).click();
  await expect(page.locator('.ai-pending-card')).toHaveCount(7);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ssx-ai-communication-prototype-v1')!));
  expect(saved.records.some((item: { id: string }) => item.id === 'submitted-ai')).toBe(true);
  expect(saved.communications[0].content).toBe('已经提交的沟通内容');
});

test('students have isolated pending samples with different counts, topics and empty states', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(url.replace('customer-1', 'customer-2'));
  await page.getByRole('button', { name: /AI 记录 · 2 条待处理/ }).click();
  await expect(page.locator('.ai-pending-card')).toHaveCount(2);
  await expect(page.locator('.ai-pending-main').first()).toContainText('王五五的美术体验课回访');
  await page.screenshot({ path: 'outputs/ai-pending-student-2.png' });
  await page.goto(url.replace('customer-1', 'customer-3'));
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  await page.goto(url.replace('customer-1', 'customer-4'));
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  await openList(page);
  await expect(page.locator('.ai-pending-card')).toHaveCount(7);
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem('ssx-ai-communication-prototype-v1')!).records);
  expect(records.filter((item: { customerId: string }) => item.customerId === 'customer-2')).toHaveLength(2);
  expect(records.filter((item: { customerId: string }) => item.customerId === 'customer-3')).toHaveLength(0);
});

test('every first-student pending state opens its corresponding page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openList(page);
  const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('ssx-ai-communication-prototype-v1')!).records.filter((item: { customerId: string }) => item.customerId === 'customer-1').map((item: { id: string; status: string; title: string }) => ({ id: item.id, status: item.status, title: item.title })));
  expect(ids).toHaveLength(7);
  for (const item of ids) {
    await page.goto(`/#/pages/ai-record/v1?customer=customer-1&record=${encodeURIComponent(item.id)}&theme=light&chrome=wechat`);
    await expect(page.getByRole('heading', { name: item.title, exact: true })).toBeVisible();
    if (item.status === 'transcribing' || item.status === 'summarizing') {
      await page.getByRole('button', { name: '查看处理进度', exact: true }).click();
      await expect(page.locator('.ai-process-steps p')).toHaveCount(3);
    } else if (item.status === 'ready') await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible();
    else if (item.status === 'failed') await expect(page.getByRole('button', { name: '重新处理', exact: true })).toBeVisible();
    else if (item.status === 'interrupted') await expect(page.getByRole('button', { name: '处理已保存片段', exact: true })).toBeVisible();
    else await expect(page.getByRole('heading', { name: '无有效沟通内容', exact: true })).toBeVisible();
  }
});
