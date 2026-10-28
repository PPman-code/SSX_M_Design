import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`scene illustrations and shared content area fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat&scenario=single');
    await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
    const sheet = page.getByRole('dialog', { name: '开启 AI 沟通记录', exact: true });
    await expect(sheet.locator('.ai-scenario-grid figure')).toHaveCount(2);
    await expect.poll(() => sheet.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    const student = await sheet.locator('.sheet-footer .ai-start-student').boundingBox();
    const startButton = await sheet.getByRole('button', { name: '开始记录', exact: true }).boundingBox();
    expect(startButton!.y - (student!.y + student!.height)).toBeCloseTo(8, 0);
    await expect(sheet.locator('.ai-start-reminder li')).toHaveCount(3);
    const figures = await sheet.locator('figure').all();
    expect((await figures[1].boundingBox())!.x).toBeGreaterThan((await figures[0].boundingBox())!.x);
    expect(await sheet.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `outputs/ai-scenario-illustrations-${width}.png` });
    await sheet.getByRole('button', { name: '关闭弹层', exact: true }).click();
    await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
    await expect(page.locator('.ai-summary-notice')).toHaveText('AI 根据沟通内容生成，请核对关键信息');
    await expect(page.locator('.product-scroll')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    if (width === 390) {
      await page.screenshot({ path: 'outputs/ai-summary-white-background.png' });
      await page.locator('.ai-summary-notice').scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'outputs/ai-summary-notice.png' });
    }
    await page.getByRole('button', { name: '生成沟通记录', exact: true }).click();
    await expect(page.locator('.ai-form-person')).toHaveCSS('height', '48px');
    await expect(page.locator('.ai-form-source')).toHaveText('来源：AI 实时记录');
    await expect(page.getByRole('textbox', { name: '沟通内容', exact: true })).toHaveValue(/核心摘要/);
    await expect(page.getByRole('textbox', { name: '沟通内容', exact: true })).toHaveCSS('height', '150px');
    for (const label of ['选择聊天记录', '选择模板', 'AI识别', '添加附件']) await expect(page.getByText(label, { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI识别', exact: true })).toHaveCount(0);
    expect(await page.locator('.product-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    await page.screenshot({ path: `outputs/communication-content-ai-${width}.png` });
    await page.locator('.ai-content-attachments').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `outputs/communication-content-tools-${width}.png` });
  });
}

test('manual form preserves visit promise and confirms or cancels the local date picker', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/communication-form/v1?customer=customer-2&theme=light&chrome=wechat');
  await expect(page.locator('.ai-form-person')).toHaveCSS('height', '48px');
  const text = page.getByRole('textbox', { name: '沟通内容', exact: true });
  await expect(text).toHaveCSS('height', '150px');
  await expect(page.getByRole('button', { name: /下次跟进类型/ }).locator('.base-cell-required')).toHaveText('*');
  const counterBox = await page.locator('.ai-content-counter').boundingBox();
  const inputBox = await text.boundingBox();
  expect(counterBox!.x + counterBox!.width).toBeLessThan(inputBox!.x + inputBox!.width);
  expect(counterBox!.y + counterBox!.height).toBeLessThan(inputBox!.y + inputBox!.height);
  expect(counterBox!.y).toBeGreaterThan(inputBox!.y);
  await text.scrollIntoViewIfNeeded();
  await page.screenshot({ path: 'outputs/communication-content-placeholder.png' });
  await text.fill('家长承诺周末到访，已发送校区地址。');
  await page.getByRole('switch', { name: '承诺到访', exact: true }).check();
  const date = page.getByRole('button', { name: /下次跟进日期/ });
  await date.click();
  const picker = page.getByRole('dialog', { name: '下次跟进日期', exact: true });
  await picker.locator('.calendar-day:not(:disabled)').nth(1).click();
  await picker.getByRole('button', { name: '关闭弹层', exact: true }).click();
  await expect(date).toContainText('待定');
  await date.click();
  await picker.getByRole('button', { name: '确定', exact: true }).click();
  await expect(picker).toBeHidden();
  await expect(date).not.toContainText('待定');
  await date.click();
  await picker.getByRole('button', { name: '待定', exact: true }).click();
  await expect(picker).toBeHidden();
  await expect(date).toContainText('待定');
  await date.click();
  await picker.getByRole('button', { name: '关闭弹层', exact: true }).click();
  await expect(date).toContainText('待定');
  await page.getByRole('button', { name: /到访日期/ }).click();
  await expect(page.getByRole('dialog', { name: '到访日期', exact: true }).getByRole('button', { name: '待定', exact: true })).toHaveCount(0);
  await page.getByRole('dialog', { name: '到访日期', exact: true }).getByRole('button', { name: '关闭弹层', exact: true }).click();
  await date.click();
  await expect(picker).toBeVisible();
  await expect.poll(() => picker.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({ path: 'outputs/communication-date-pending.png' });
  await picker.getByRole('button', { name: '确定', exact: true }).click();
  await expect(page.getByRole('switch', { name: '承诺到访', exact: true })).toBeChecked();
  await page.screenshot({ path: 'outputs/communication-form-visit-date.png' });
  await page.getByRole('button', { name: '提交', exact: true }).click();
  await expect(page).toHaveTitle('修改沟通记录');
  await expect(page.getByRole('switch', { name: '承诺到访', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: '保存', exact: true })).toBeVisible();
});
