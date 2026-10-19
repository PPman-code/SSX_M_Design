import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`mobile buttons use theme blue and status text meets contrast in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', theme);
    await expect(page.getByRole('button', { name: '主要操作', exact: true })).toHaveCSS('background-color', theme === 'light' ? 'rgb(40, 120, 232)' : 'rgb(64, 158, 255)');
    const ratios = await page.locator('.state-pill').evaluateAll((elements) => {
      function luminance(value: string) {
        const channels = value.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((v) => v / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
      }
      return elements.map((element) => {
        const style = getComputedStyle(element);
        const [low, high] = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => a - b);
        return { name: element.textContent, ratio: (high + 0.05) / (low + 0.05) };
      });
    });
    expect(ratios.length).toBe(3);
    for (const result of ratios) expect(result.ratio, result.name ?? '').toBeGreaterThanOrEqual(4.5);
  });
}

test('desktop workspace switches real iframe width and synchronizes theme', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '移动端设计工作区' })).toBeVisible();
  const frame = page.locator('iframe[title="移动端组件预览"]');
  await page.getByRole('button', { name: '430', exact: true }).click();
  await expect(frame).toHaveCSS('width', '430px');
  await page.getByRole('button', { name: '切换到深色' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-color-mode', 'dark');
  await page.screenshot({ path: 'test-results/workspace-dark.png', fullPage: true });
  await page.getByRole('button', { name: '切换到浅色' }).click();
  await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-color-mode', 'light');
  await expect(page.frameLocator('iframe').getByRole('button', { name: '次要操作' })).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await page.screenshot({ path: 'test-results/workspace-light.png', fullPage: true });
});

test('preview return link navigates top level without nesting the workspace', async ({ page }) => {
  await page.goto('/');
  await page.frameLocator('iframe').getByRole('link', { name: '返回工作区' }).click();
  await expect(page.frameLocator('iframe').getByRole('heading', { name: '组件预览', exact: true })).toBeVisible();
  await expect(page.frameLocator('iframe').locator('iframe')).toHaveCount(0);
});

test('mobile selector cancels drafts, commits selection and restores focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/mobile');
  const trigger = page.getByRole('button', { name: /选择示例.*默认/ });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('radio', { name: '宽松', exact: true }).check();
  await page.getByRole('button', { name: '关闭弹层' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(page.getByRole('radio', { name: '默认', exact: true })).toBeChecked();
  await page.getByRole('radio', { name: '宽松', exact: true }).check();
  await page.getByRole('button', { name: '确认', exact: true }).click();
  await expect(page.getByRole('button', { name: /选择示例.*宽松/ })).toBeVisible();
  await page.getByRole('button', { name: /选择示例.*宽松/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  const toggle = page.getByRole('switch', { name: '接收提醒' });
  await toggle.click();
  await expect(toggle).not.toBeChecked();
});

for (const width of [360, 375, 390, 430]) {
  test(`mobile layout fits ${width}px and handles long input`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile');
    await page.getByLabel('名称').fill('这是用于检查长文本的移动端组件预览 ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.getByRole('heading', { name: '组件预览', exact: true })).toBeVisible();
    await page.screenshot({ path: `test-results/mobile-${width}.png`, fullPage: true });
  });
}

test('handoff direct URL survives reload; unknown routes offer recovery', async ({ page }) => {
  await page.goto('/#/handoff');
  await page.reload();
  await expect(page.getByRole('heading', { name: '设计规范与交付' })).toBeVisible();
  await expect(page.getByText('--color-background-brand-bold', { exact: true })).toBeVisible();
  await page.goto('/#/missing');
  await expect(page.getByRole('link', { name: '返回工作区' })).toBeVisible();
});

test('handoff switches within the workspace shell and preserves preview settings', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/#/?theme=dark');
  await page.getByRole('button', { name: '430', exact: true }).click();
  const nav = page.getByRole('navigation', { name: '工作区导航' });
  await nav.getByRole('link', { name: '设计规范与交付', exact: true }).click();
  await expect(nav).toBeVisible();
  await expect(nav.getByRole('link', { name: '设计规范与交付', exact: true })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('heading', { name: '设计规范与交付', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '页面预览' })).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-color-mode', 'dark');
  await page.screenshot({ path: 'test-results/workspace-handoff.png', fullPage: true });
  await nav.getByRole('link', { name: /组件预览/ }).click();
  await expect(page.getByRole('region', { name: '页面预览' })).toBeVisible();
  await expect(page.getByRole('button', { name: '430', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.device-shell')).toBeVisible();
  await expect(page.frameLocator('iframe').locator('html')).toHaveAttribute('data-color-mode', 'dark');
});

test('phone access distinguishes local addresses and produces a QR code', async ({ page }) => {
  await page.route('**/__preview-addresses', (route) => route.fulfill({
    contentType: 'application/json', body: JSON.stringify({ urls: ['http://192.168.1.8:5178/'] }),
  }));
  await page.goto('/');
  await page.getByRole('button', { name: '手机预览', exact: true }).click();
  await expect(page.getByRole('img', { name: '手机预览二维码' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'http://192.168.1.8:5178/#/mobile' })).toBeVisible();
  await expect(page.getByText('手机和电脑需连接同一 Wi-Fi')).toBeVisible();
});

test('unavailable LAN address explains how to proceed without localhost QR', async ({ page }) => {
  await page.route('**/__preview-addresses', (route) => route.fulfill({
    contentType: 'application/json', body: '{"urls":[]}',
  }));
  await page.goto('/');
  await page.getByRole('button', { name: '手机预览', exact: true }).click();
  await expect(page.getByText(/未检测到局域网地址/)).toBeVisible();
  await expect(page.getByRole('img', { name: '手机预览二维码' })).toHaveCount(0);
});

test('sidebar exposes one project tab instead of a business page list', async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 1051 });
  await page.goto('/#/?theme=light');
  const nav = page.getByRole('navigation', { name: '工作区导航' });
  await expect(nav.getByRole('link')).toHaveCount(3);
  await expect(page.getByRole('navigation', { name: '业务页面' })).toHaveCount(0);
  await expect(page.locator('.pages-label')).toHaveCount(0);
  const project = nav.getByRole('link', { name: '项目预览', exact: true });
  await project.click();
  await expect(project).toHaveAttribute('aria-current', 'page');
  await expect(page.frameLocator('iframe').getByRole('region', { name: '报表中心', exact: true })).toBeVisible();
  await page.screenshot({ path: 'test-results/workspace-project-tab.png' });
  await page.goto('/#/?page=attendance&theme=light');
  await expect(project).toHaveAttribute('aria-current', 'page');
  await expect(page.frameLocator('iframe').locator('.att-v2-overview')).toBeVisible();
});
