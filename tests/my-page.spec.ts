import { test, expect } from '@playwright/test';

for (const width of [360, 375, 390, 430]) {
  test(`my page fits ${width}px, scrolls above the tab bar and uses local assets`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/my/v1?chrome=wechat');
    await expect(page.getByRole('button', { name: '查看个人信息' })).toBeVisible();
    await expect(page.getByRole('button', { name: '我的', exact: true })).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect.poll(() => page.locator('img').evaluateAll((images) => images.every((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0))).toBe(true);
    const images = await page.locator('img').evaluateAll((elements) => elements.map((image) => ({
      loaded: image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0, width: image.getBoundingClientRect().width,
      source: image.getAttribute('src'),
    })));
    expect(images.every((image) => image.loaded && image.width > 0 && (image.source?.startsWith('/pages/my/v1/') || image.source?.startsWith('/preview/wechat/')))).toBe(true);
    await page.getByRole('button', { name: '帮助中心', exact: true }).scrollIntoViewIfNeeded();
    const help = await page.getByRole('button', { name: '帮助中心', exact: true }).boundingBox();
    const tabs = await page.getByRole('navigation', { name: '主导航' }).boundingBox();
    expect(help!.y + help!.height).toBeLessThanOrEqual(tabs!.y + 1);
    await page.screenshot({ path: `test-results/my-page-${width}.png`, fullPage: true });
  });
}

test('my page provides entry feedback and restores focus without a real transaction', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/pages/my/v1?payment=enabled');
  await expect(page.locator('.preview-chrome')).toHaveCount(0);
  const button = page.getByRole('button', { name: '收费报名', exact: true });
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('“收费报名”的后续页面待提供。', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '关闭弹层' }).click();
  await expect(button).toBeFocused();
  await page.getByRole('button', { name: '仅收款说明' }).click();
  await expect(page.getByRole('dialog', { name: '使用说明' })).toBeVisible();
  await expect(page.getByText('“仅收款”是快速收款方式，并不是学员正式的报名收费。')).toBeVisible();
  await page.getByRole('button', { name: '知道了', exact: true }).click();
  await expect(page.getByRole('button', { name: '仅收款说明' })).toBeFocused();
});

for (const width of [360, 375, 390, 430]) {
  test(`unavailable payments and contact action sheet work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/my/v1?chrome=wechat');
    const dialog = page.getByRole('dialog', { name: '当前机构未开通收费管家', exact: true });
    for (const label of ['收费报名', '收款码', '扫码收款']) {
      const trigger = page.getByRole('button', { name: label, exact: true });
      await trigger.click();
      await expect(dialog).toBeVisible();
      await expect(dialog.getByText('线上收款', { exact: true })).toBeVisible();
      await expect(dialog.getByText('收款码收款', { exact: true })).toBeVisible();
      await expect(dialog.getByText('输入收款金额，扫付款码收款', { exact: true })).toBeVisible();
      expect((await dialog.boundingBox())!.width).toBe(Math.min(340, width - 32));
      expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
      const contact = dialog.getByRole('button', { name: '联系客服开通' });
      await expect(contact).toHaveCSS('background-color', 'rgb(40, 120, 232)');
      await expect(contact).toHaveCSS('border-radius', '8px');
      await expect(contact).toHaveCSS('font-size', '16px');
      await expect(contact).toHaveCSS('font-weight', '400');
      expect((await contact.boundingBox())!.height).toBe(40);
      expect((await contact.boundingBox())!.width).toBeGreaterThanOrEqual(40);
      await expect(contact).not.toHaveClass(/touch-target/);
      if (label === '收费报名') {
        await page.screenshot({ path: `test-results/payment-activation-${width}.png` });
        await contact.click();
        const sheet = page.getByRole('dialog', { name: '拨打客服热线', exact: true });
        await expect(sheet).toBeVisible();
        await expect(sheet.getByRole('link', { name: '拨打：400-800-5291' })).toHaveAttribute('href', 'tel:4008005291');
        await expect(sheet.getByRole('link', { name: '拨打：400-800-5292' })).toHaveAttribute('href', 'tel:4008005292');
        await page.screenshot({ path: `test-results/payment-contact-${width}.png`, animations: 'disabled' });
        await sheet.getByRole('button', { name: '取消', exact: true }).click();
        await expect(sheet).toBeHidden();
        await expect(dialog).toBeVisible();
        await expect(contact).toBeFocused();
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
    }
  });
}

test('workspace can preview enabled payments and share the same state', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.route('**/__preview-addresses', (route) => route.fulfill({ contentType: 'application/json', body: '{"urls":["http://192.168.1.8:5178/"]}' }));
  await page.goto('/#/?page=my&theme=light');
  await page.getByLabel('收费管家状态').selectOption('enabled');
  const frame = page.frameLocator('iframe');
  await frame.getByRole('button', { name: '收费报名', exact: true }).click();
  await expect(frame.getByText('“收费报名”的后续页面待提供。', { exact: true })).toBeVisible();
  await frame.getByRole('button', { name: '关闭弹层' }).click();
  await page.getByRole('button', { name: '手机预览', exact: true }).click();
  await expect(page.getByRole('link', { name: 'http://192.168.1.8:5178/#/pages/my/v1?theme=light&payment=enabled' })).toBeVisible();
});

test('workspace separates navigation, preview settings and current page configuration', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/#/?page=my&theme=light');
  const config = page.getByRole('region', { name: '页面配置', exact: true });
  await expect(config).toBeVisible();
  expect(await config.evaluate((element) => Boolean(element.closest('.page-config-panel')))).toBe(true);
  await expect(page.locator('.sidebar select, .sidebar input')).toHaveCount(0);
  await expect(page.getByRole('complementary', { name: '设计说明' })).toHaveCount(0);
  const settings = page.getByRole('group', { name: '通用预览设置', exact: true });
  await expect(settings).toBeVisible();
  await settings.getByRole('button', { name: '375', exact: true }).click();
  expect(await page.frameLocator('iframe').locator('body').evaluate(() => innerWidth)).toBe(375);
  await config.getByLabel('收费管家状态').selectOption('enabled');
  await expect(page.locator('iframe')).toHaveAttribute('src', './#/pages/my/v1?theme=light&payment=enabled&chrome=wechat');
  const configBox = await config.boundingBox();
  const previewBox = await page.getByRole('region', { name: '页面预览' }).boundingBox();
  expect(configBox!.x).toBeGreaterThan(previewBox!.x + previewBox!.width);
  await config.getByText('页面状态', { exact: false }).click();
  await expect(config.getByLabel('收费管家状态')).toBeHidden();
  await config.getByText('页面状态', { exact: false }).click();
  await expect(config.getByLabel('收费管家状态')).toBeVisible();
  await page.screenshot({ path: 'test-results/workspace-right-config.png', fullPage: true });
  await page.getByRole('navigation', { name: '工作区导航' }).getByRole('link', { name: /组件预览/ }).click();
  await expect(config).toHaveCount(0);
  await expect(settings.getByRole('button', { name: '375', exact: true })).toBeVisible();
  await page.goto('/#/?page=my&theme=light');
  await page.setViewportSize({ width: 375, height: 858 });
  await expect(config).toBeVisible();
  await expect(settings).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

for (const width of [360, 375, 390, 430]) {
  test(`collection explanation fits ${width}px and dismisses with focus restored`, async ({ page }) => {
    await page.setViewportSize({ width, height: 858 });
    await page.goto('/#/pages/my/v1?chrome=wechat');
    const trigger = page.getByRole('button', { name: '仅收款说明' });
    await expect(trigger.locator('use')).toHaveAttribute('href', /#SSX-question-circle$/);
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: '使用说明' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('2、“仅收款”后：', { exact: true })).toBeVisible();
    await expect(dialog.getByText('· 需通过【报名收费】或【新学员报名】完成报名流程后，才能进行上课、点名等后续操作。')).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box!.width).toBe(311);
    const viewport = await page.locator('.info-dialog-viewport').boundingBox();
    expect(Math.abs(box!.y + box!.height / 2 - (viewport!.y + viewport!.height / 2))).toBeLessThan(1);
    await page.screenshot({ path: `test-results/collection-help-${width}.png` });
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.locator('.info-dialog-viewport').click({ position: { x: 5, y: 5 } });
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test('workspace selects my v1 and shares its product route without simulated system bars', async ({ page }) => {
  await page.route('**/__preview-addresses', (route) => route.fulfill({ contentType: 'application/json', body: '{"urls":["http://192.168.1.8:5178/"]}' }));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/');
  await page.goto('/#/?page=my&theme=light');
  await expect(page.locator('iframe')).toHaveAttribute('src', './#/pages/my/v1?theme=light&chrome=wechat');
  await expect(page.getByLabel('微信外观预览', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('group', { name: '预览外壳', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: '独立打开', exact: true })).toHaveAttribute('href', '#/pages/my/v1?theme=light');
  await page.getByRole('button', { name: '手机预览', exact: true }).click();
  await expect(page.getByRole('link', { name: 'http://192.168.1.8:5178/#/pages/my/v1?theme=light' })).toBeVisible();
  await expect(page.getByRole('img', { name: '手机预览二维码' })).toBeVisible();
});

test('phone shell preserves viewport width and interaction while direct pages omit it', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/#/?page=my&theme=light');
  const frame = page.frameLocator('iframe');
  await expect(page.locator('.device-shell')).toBeVisible();
  await expect.poll(() => page.locator('.device-shell').evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth === 1350)).toBe(true);
  await expect(page.locator('.device-shell')).toHaveCSS('pointer-events', 'none');
  expect(await frame.locator('body').evaluate(() => innerWidth)).toBe(390);
  await frame.getByRole('button', { name: '查看个人信息' }).click();
  await expect(frame.getByRole('dialog')).toBeVisible();
  await frame.getByRole('button', { name: '关闭弹层' }).click();
  await expect(frame.getByRole('dialog')).toBeHidden();
  await page.locator('.device-frame').screenshot({ path: 'test-results/phone-shell-my.png', animations: 'disabled' });
  await page.getByRole('button', { name: '430', exact: true }).click();
  expect(await frame.locator('body').evaluate(() => innerWidth)).toBe(430);
  await expect(page.locator('.device-shell')).toBeVisible();
  await page.goto('/#/pages/my/v1?theme=light');
  await expect(page.locator('.device-shell, .preview-chrome')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`menu cell decoration icons are 18px in ${theme}`, async ({ page }) => {
    await page.goto(`/#/pages/my/v1?theme=${theme}`);
    const icons = page.locator('.menu-cell > svg, .menu-cell-arrow > svg');
    expect(await icons.count()).toBeGreaterThan(0);
    for (const icon of await icons.all()) {
      await expect(icon).toHaveCSS('width', '18px');
      await expect(icon).toHaveCSS('height', '18px');
    }
    await expect(page.locator('.menu-cell').first()).toHaveCSS('height', '56px');
  });
}
