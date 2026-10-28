import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`AI recorder keeps purple controls and animated signal usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const theme = width === 430 ? 'dark' : 'light';
    await page.goto(`/#/pages/customer-info/v1?customer=customer-1&chrome=wechat&theme=${theme}`);
    await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
    const startSheet = page.getByRole('dialog', { name: '开启 AI 沟通记录', exact: true });
    await expect(startSheet.getByRole('heading', { name: '适用场景' })).toBeVisible();
    await expect(startSheet.getByText('廖小龙', { exact: true })).toBeVisible();
    await expect(startSheet.getByRole('button', { name: '开始记录', exact: true })).toBeVisible();
    await expect.poll(() => startSheet.evaluate(el => getComputedStyle(el).transform)).toBe('matrix(1, 0, 0, 1, 0, 0)');
    await page.screenshot({ path: `outputs/ai-start-sheet-${width}.png` });
    await page.getByRole('button', { name: '开始记录', exact: true }).click();
    const footer = page.locator('.ai-recording-footer');
    const pause = page.getByRole('button', { name: '暂停录音', exact: true });
    const finish = page.getByRole('button', { name: '结束录音', exact: true });
    const timer = page.getByRole('timer');
    const wave = page.locator('.ai-recording-signal');
    await expect(pause).toBeVisible(); await expect(finish).toBeVisible();
    await expect(pause.locator('use')).toHaveAttribute('href', /#SSX-pause-mini-fill$/);
    const hint = footer.locator('.ai-recorder');
    await expect(hint).toHaveText('录音中，收起后继续实时转写');
    const minimize = page.getByRole('button', { name: '收起', exact: true });
    await expect(minimize).toHaveCSS('font-size', '14px');
    await expect(minimize.locator('svg')).toBeVisible();
    const hintBox = (await hint.boundingBox())!;
    expect(hintBox.y + hintBox.height).toBeLessThan((await wave.boundingBox())!.y);
    expect(hintBox.x).toBeGreaterThanOrEqual(16);
    expect(hintBox.x + hintBox.width).toBeLessThanOrEqual(width - 16);
    await expect(wave).not.toHaveAttribute('data-paused', 'true');
    await expect.poll(() => wave.evaluate(el => (el as HTMLCanvasElement).width)).toBeGreaterThan(0);
    const initial = await wave.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    await expect.poll(() => wave.evaluate(el => (el as HTMLCanvasElement).toDataURL())).not.toBe(initial);
    const boxes = await Promise.all([timer, pause, finish].map(locator => locator.boundingBox()));
    expect(boxes[0]!.x + boxes[0]!.width).toBeLessThan(boxes[1]!.x);
    expect(boxes[1]!.x + boxes[1]!.width).toBeLessThan(boxes[2]!.x);
    for (const button of [pause, finish]) {
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(40); expect(box.width).toBeGreaterThanOrEqual(40);
    }
    expect(await page.locator('.product-scroll').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    const footerBox = (await footer.boundingBox())!;
    expect(footerBox.y + footerBox.height).toBeLessThanOrEqual((await page.locator('.preview-history').boundingBox())!.y + 1);
    await expect(page.locator('.ai-live-segment').first()).toBeVisible();
    expect(Math.abs((boxes[1]!.x + boxes[1]!.width / 2) - width / 2)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `outputs/ai-refined-recording-${width}.png` });
    const intro = await pause.evaluate(el => new Promise<{ label: string | null; expanded: string | null; detailWidth: number }>(resolve => {
      (el as HTMLButtonElement).click();
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const pill = document.querySelector('.ai-recorder')!;
        resolve({ label: pill.querySelector('.ai-recorder-label')!.textContent, expanded: pill.getAttribute('data-expanded'), detailWidth: pill.querySelector('.ai-recorder-detail')!.getBoundingClientRect().width });
      }));
    }));
    expect(intro.label).toBe('已暂停');
    expect(intro.expanded).toBe('false');
    expect(intro.detailWidth).toBe(0);
    await expect(hint).toHaveText('已暂停，点击下方按钮继续');
    await expect(hint).toHaveAttribute('data-expanded', 'true');
    await expect(hint).toHaveCSS('transition-property', 'width');
    await expect(wave).toHaveAttribute('data-paused', 'true');
    const paused = await wave.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    await expect.poll(async () => {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      return wave.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    }).toBe(paused);
    const resume = page.getByRole('button', { name: '继续录音', exact: true });
    if (width === 390) {
      await expect.poll(() => hint.evaluate(el => el.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
      await page.screenshot({ path: 'outputs/ai-refined-paused.png' });
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(hint).toHaveCSS('transition-property', 'none');
    await expect(hint.locator('.ai-recorder-detail')).toHaveCSS('transition-property', 'none');
    await resume.click();
    const still = await wave.evaluate(el => (el as HTMLCanvasElement).toDataURL());
    await expect.poll(() => wave.evaluate(el => (el as HTMLCanvasElement).toDataURL())).toBe(still);
    await finish.click();
    await expect(page.getByRole('dialog', { name: '结束本次沟通记录？', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '继续记录', exact: true }).click();
    await expect(pause).toBeVisible();
  });
}

test('recording sheet cancels cleanly and processing return button preserves the pending record', async ({ page }) => {
  await page.addInitScript(() => { if (!localStorage.getItem('ssx-ai-communication-prototype-v1')) localStorage.setItem('ssx-ai-communication-prototype-v1', JSON.stringify({ records: [], communications: [], seeded: ['pending-showcase-v5:customer-1:刘亦菲'], storageError: false })); });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/customer-info/v1?customer=customer-1&chrome=wechat&theme=light');
  const entry = page.getByRole('button', { name: 'AI 实时记录', exact: true });
  await entry.click();
  await page.getByRole('button', { name: '关闭弹层', exact: true }).click();
  await expect(entry).toBeVisible();
  await expect(page.locator('.ai-pending-entry')).toHaveCount(0);
  await entry.click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
  await expect(page.locator('.ai-live-segment').first()).toBeVisible();
  await page.getByRole('button', { name: '结束录音', exact: true }).click();
  await page.getByRole('button', { name: '结束记录', exact: true }).click();
  const back = page.getByRole('button', { name: '返回学员，稍后查看', exact: true });
  await expect(back).toHaveClass(/button--primary/);
  await expect(page.locator('.ai-process-steps p')).toHaveCount(3);
  await expect(page.locator('.ai-process-steps p').first()).toHaveText('已关联学员：廖小龙');
  await expect(page.locator('.ai-processing > p').first()).not.toContainText('廖小龙');
  await page.screenshot({ path: 'outputs/ai-processing-return.png' });
  await expect(page.locator('.ai-process-steps p').nth(2)).toHaveAttribute('data-current', 'true');
  await page.screenshot({ path: 'outputs/ai-processing-aligned-icons.png' });
  await back.click();
  await expect(page).toHaveURL(/customer-info/);
  const pending = page.getByRole('button', { name: /AI 记录 · 1 条待处理/ });
  await expect(pending).toBeVisible();
  await pending.click();
  await expect(page.getByRole('button', { name: '生成沟通记录', exact: true })).toBeVisible({ timeout: 12000 });
});

test('interrupted recording keeps one primary action and a text return action', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat');
  await page.getByRole('button', { name: 'AI 实时记录', exact: true }).click();
  await page.getByRole('button', { name: '开始记录', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: '查看中断记录', exact: true })).toHaveClass(/button--primary/);
  await expect(page.getByRole('button', { name: '返回学员，稍后查看', exact: true })).toHaveClass(/button--text/);
  await page.screenshot({ path: 'outputs/ai-interrupted-text-return.png' });
});
