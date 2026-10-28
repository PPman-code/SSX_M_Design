import { test, expect } from '@playwright/test';

test('record detail uses the supplied play and pause icons', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/customer-info/v1?customer=customer-1&theme=light&chrome=wechat&scenario=single');
  await page.getByRole('button', { name: /AI 记录 · 1 条待处理/ }).click();
  const play = page.getByRole('button', { name: '播放录音', exact: true });
  await expect(play.locator('use')).toHaveAttribute('href', /#SSX-play-large-fill$/);
  await play.click();
  const pause = page.getByRole('button', { name: '暂停回放', exact: true });
  await expect(pause.locator('use')).toHaveAttribute('href', /#SSX-pause-mini-fill$/);
  await page.screenshot({ path: 'outputs/ai-player-pause-icon.png' });
  await pause.click();
  await expect(play).toBeVisible();
  await page.screenshot({ path: 'outputs/ai-player-play-icon.png' });
});
