import { test, expect } from '@playwright/test';
for (const [theme, width] of [['light', 360], ['dark', 390]] as const) {
  test(`communication cards collapse, show attachments and separate status in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => {
      localStorage.setItem('ssx-ai-communication-prototype-v1', JSON.stringify({ records: [{ id: 'card-ai', customerId: 'customer-1', customerName: '廖小龙', creator: '刘亦菲', title: '廖小龙的沟通记录', status: 'ready', duration: 42, createdAt: '2026-10-28T08:00:00+08:00', segments: [], speakers: {}, summary: '沟通摘要' }], seeded: ['pending-showcase-v5:customer-1:刘亦菲'], storageError: false, communications: [{ id: 'card-review', customerId: 'customer-1', creator: '刘亦菲', createdAt: '2026-10-28T08:00:00+08:00', content: '核心摘要\n家长希望孩子通过编程课程锻炼逻辑思维，愿意先了解周末体验课安排。\n\n沟通过程\n老师了解孩子的兴趣和家长期望，建议先参加体验课，再根据基础制定学习计划。\n\n待跟进事项\n发送体验课时间并确认到访安排。', result: '有效沟通', mode: '电话', nextMode: '', nextDate: '', source: 'ai', aiId: 'card-ai', attachments: [{ name: '课程安排.pdf', type: 'pdf' }, { name: '课程介绍.png', image: 'mock/courses/vocal-course.png' }] }] }));
    });
    await page.goto(`/#/pages/customer-info/v1?customer=customer-1&theme=${theme}&chrome=wechat`);
    const card = page.locator('.ai-communication-card').first();
    await expect(card.locator('.ai-card-person p')).toHaveText('10/28 08:00 · 电话 · 有效沟通');
    await expect(card.locator('.ai-communication-result')).toHaveCount(0);
    await expect(card.locator('.ai-card-followup')).toHaveText('下次跟进：待定');
    await expect(card.locator('.ai-card-bottom')).not.toContainText('有效沟通');
    await expect(card.locator('.ai-card-attachment')).toHaveCount(3);
    await expect(card.locator('.ai-card-attachment img')).toBeVisible();
    const expand = card.getByRole('button', { name: '展开', exact: true });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    const height = (await card.locator('.ai-card-description').boundingBox())!.height;
    expect(height).toBeLessThanOrEqual(75);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/ai-communication-card-${theme}.png` });
    await expand.click();
    await expect(card.getByRole('button', { name: '收起', exact: true })).toHaveAttribute('aria-expanded', 'true');
    expect((await card.locator('.ai-card-description').boundingBox())!.height).toBeGreaterThan(height);
    await card.getByRole('button', { name: '收起', exact: true }).click();
    expect((await card.locator('.ai-card-description').boundingBox())!.height).toBe(height);
    expect(await page.locator('.product-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const ai = card.getByRole('button', { name: '查看 AI 原始录音与转写', exact: true });
    expect((await ai.boundingBox())!.width).toBe(72);
    expect((await ai.boundingBox())!.height).toBe(64);
    await ai.click();
    await expect(page).toHaveURL(/ai-record.*record=card-ai/);
  });
}

for (const width of [360, 390, 430]) {
  test(`fresh browser shows editable sample records and aligns action with name at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat');
    await expect(page.locator('.ai-communication-edit')).toHaveCount(4);
    const card = page.locator('.ai-communication-card').first();
    const name = await card.locator('.ai-card-person > b').boundingBox();
    const edit = card.getByRole('button', { name: '修改', exact: true });
    const action = await edit.boundingBox();
    expect(Math.abs(action!.y - name!.y)).toBeLessThan(1);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/communication-fresh-edit-${width}.png` });
    await edit.click();
    await expect(page).toHaveTitle('修改沟通记录');
    await expect(page.getByLabel('沟通内容', { exact: true })).toHaveValue(/与家长初步沟通/);
    await page.getByLabel('沟通内容', { exact: true }).fill('已确认周末体验时间。');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await expect(page).toHaveURL(/customer-info/);
    await expect(page.locator('.ai-communication-card')).toHaveCount(4);
    await expect(page.getByText('已确认周末体验时间。', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.locator('.ai-communication-card')).toHaveCount(4);
    await expect(page.getByText('已确认周末体验时间。', { exact: true })).toBeVisible();
  });
}
