import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  for (const width of [360, 390, 430]) {
    test(`student card opens points entry at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(`/#/pages/students/v1?theme=${theme}&chrome=wechat&from=home`);
      await page.getByRole('button', { name: '金灿灿学员详情', exact: true }).click();
      await expect(page).toHaveURL(/pages\/student-info\/v1\?/);
      await expect(page).toHaveURL(/student=s1/);
      await expect(page).toHaveURL(new RegExp(`theme=${theme}`));
      await expect(page.locator('.preview-wechat-nav')).toContainText('金灿灿');
      await expect(page.getByRole('heading', { name: '金灿灿的学员信息', exact: true })).toBeAttached();
      await expect(page.locator('.student-info-footer')).toHaveCSS('height', '56px');
      expect(await page.locator('.student-info-page').evaluate(el => getComputedStyle(el).backgroundColor)).toBe(await page.locator('.student-info-footer').evaluate(el => getComputedStyle(el).backgroundColor));
      const trigger = page.getByRole('button', { name: '加减积分', exact: true });
      await expect(trigger).toHaveCSS('height', '40px');
      await trigger.click();
      const menu = page.getByRole('menu', { name: '积分操作', exact: true });
      await expect(menu.getByRole('menuitem')).toHaveText(['加分', '减分', '积分清零']);
      const box = (await menu.boundingBox())!;
      const content = (await page.locator('.product-scroll').boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
      expect(box.y).toBeGreaterThanOrEqual(content.y);
      expect(box.y + box.height).toBeLessThanOrEqual((await trigger.boundingBox())!.y);
      await page.keyboard.press('Escape');
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      for (const label of ['加分', '减分', '积分清零']) {
        await trigger.click();
        await menu.getByRole('menuitem', { name: label, exact: true }).click();
        await expect(menu).toBeHidden();
        if (label === '加分' || label === '减分') {
          const sheet = page.getByRole('dialog', { name: label === '加分' ? '选择加分项' : '选择减分项', exact: true });
          await expect(sheet).toBeVisible();
          await sheet.getByRole('button', { name: '关闭弹层', exact: true }).click();
          await expect(sheet).toBeHidden();
        } else await expect(page.getByText(`${label}操作待设计`, { exact: true })).toBeVisible();
      }
      await page.getByRole('button', { name: '微信后退', exact: true }).click();
      await expect(page).toHaveURL(/pages\/students\/v1/);
    });
  }
}

test('workspace follows student info and preserves identity in direct preview', async ({ page }) => {
  await page.goto('/#/?page=students&theme=dark');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: '欧阳丽丽学员详情', exact: true }).click();
  await expect(frame.getByRole('heading', { name: '欧阳丽丽的学员信息', exact: true })).toBeAttached();
  await expect(page.getByRole('region', { name: '页面配置', exact: true })).toContainText('学员信息');
  await expect(page.getByRole('link', { name: '独立打开', exact: true })).toHaveAttribute('href', /student=s2/);
});

test('standalone info omits simulated navigation and invalid student cannot perform points actions', async ({ page }) => {
  await page.goto('/#/pages/student-info/v1?student=s1');
  await expect(page.locator('.preview-chrome, .preview-history')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toBeVisible();
  await page.goto('/#/pages/student-info/v1?student=missing');
  await expect(page.getByRole('button', { name: '加减积分', exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('未找到学员');
});

test('direct WeChat preview keeps the points button above the simulated home indicator', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/student-info/v1?student=s1&chrome=wechat');
  const button = (await page.getByRole('button', { name: '加减积分', exact: true }).boundingBox())!;
  const home = (await page.locator('.preview-home-indicator').boundingBox())!;
  expect(button.y + button.height).toBeLessThanOrEqual(home.y);
});
