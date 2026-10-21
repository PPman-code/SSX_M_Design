import { test, expect } from '@playwright/test';

for (const theme of ['light', 'dark']) {
  test(`input editing, accessibility and actions in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    const section = page.getByRole('region', { name: '输入框 Input', exact: true });
    for (const [status, name] of [['success', 'check'], ['warning', 'exclamation'], ['error', 'close']]) {
      await expect(section.locator(`.ssx-input--${status} .ssx-input-status use`).first()).toHaveAttribute('href', new RegExp(`#SSX-${name}$`));
    }
    await expect(section.getByRole('textbox', { name: '备注（选填）', exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]')).toHaveCSS('height', '56px');
    const clear = section.getByRole('button', { name: '清除填写完成' });
    await expect(clear.locator('svg')).toHaveCSS('width', '18px');
    await expect(clear.locator('svg')).toHaveCSS('height', '18px');
    expect(await clear.evaluate(el => getComputedStyle(el).color)).toBe(await clear.evaluate(el => { const probe = document.createElement('span'); probe.style.color = 'var(--color-icon-placeholder)'; el.append(probe); const color = getComputedStyle(probe).color; probe.remove(); return color; }));
    expect(await clear.evaluate(el => parseFloat(getComputedStyle(el, '::after').width))).toBeGreaterThanOrEqual(40);
    for (const icon of await section.locator('.ssx-input-status, .ssx-input-label-icon > svg, .ssx-input-prefix > svg, .ssx-input-icon > svg').all()) {
      await expect(icon).toHaveCSS('width', '18px');
      await expect(icon).toHaveCSS('height', '18px');
    }
    const clearable = section.getByRole('textbox', { name: '可清除', exact: true });
    await clearable.fill('测试输入');
    await section.getByRole('button', { name: '清除可清除' }).click();
    await expect(clearable).toHaveValue('');
    await expect(clearable).toBeFocused();
    const password = section.getByLabel('密码', { exact: true });
    await password.fill('secret');
    await expect(password).toHaveAttribute('type', 'password');
    await section.getByRole('button', { name: '显示密码' }).click();
    await expect(password).toHaveAttribute('type', 'text');
    await section.getByRole('button', { name: '隐藏密码' }).click();
    await expect(password).toHaveAttribute('type', 'password');
    await expect(section.getByLabel('不可编辑', { exact: true })).toBeDisabled();
    await expect(section.getByLabel('只读信息', { exact: true })).toHaveAttribute('readonly', '');
    const invalid = section.getByLabel('错误示例', { exact: true });
    await expect(invalid).toHaveAttribute('aria-invalid', 'true');
    await expect(invalid).toHaveAccessibleDescription('请输入正确的内容');
    await expect(section.getByRole('textbox', { name: '必填信息', exact: true })).toHaveAttribute('required', '');
    const readonly = section.getByLabel('只读信息', { exact: true });
    await readonly.focus();
    await page.keyboard.type('不可写入');
    await expect(readonly).toHaveValue('只读内容');
    await expect(section.getByRole('textbox', { name: '无标签输入', exact: true })).toBeVisible();
    await section.getByRole('button', { name: '发送验证码' }).click();
    await expect(section.getByRole('status')).toContainText('演示验证码：123456');
  });
}

for (const width of [360, 375, 390, 430]) {
  test(`input reference geometry at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/#/mobile?theme=light');
    const section = page.getByRole('region', { name: '输入框 Input', exact: true });
    const horizontal = section.getByLabel('基础输入', { exact: true }).locator('xpath=ancestor::div[contains(@class,"ssx-input ")]');
    await expect(horizontal).toHaveCSS('height', '56px');
    for (const label of ['备注（选填）', '必填信息', '可清除', '账号', '联系电话', '验证码', '价格', '数量', '填写完成', '只读信息', '不可编辑']) {
      const field = section.getByRole('textbox', { name: label, exact: true });
      await expect(field.locator('xpath=ancestor::div[contains(@class,"field-divider")]')).toHaveCSS('height', '56px');
    }
    await expect(section.getByLabel('辅助说明', { exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]')).toHaveCSS('height', '80px');
    await expect(section.getByLabel('较长的标签内容', { exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]')).toHaveCSS('height', '80px');
    await expect(horizontal.locator('.ssx-input-label')).toHaveCSS('width', '81px');
    const account = section.getByRole('textbox', { name: '账号', exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]');
    await expect(account.locator('.ssx-input-label-icon use')).toHaveAttribute('href', /#SSX-user$/);
    await expect(account.locator('.ssx-input-body .ssx-input-prefix')).toHaveCount(0);
    const iconPosition = await account.locator('label').evaluate(el => {
      const text = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
      const range = document.createRange(); range.selectNodeContents(text!);
      return { iconRight: el.querySelector('svg')!.getBoundingClientRect().right, textLeft: range.getBoundingClientRect().left };
    });
    expect(iconPosition.textLeft - iconPosition.iconRight).toBe(8);
    const phone = section.getByRole('textbox', { name: '联系电话', exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]');
    await expect(phone.locator('.ssx-input-body .ssx-input-prefix')).toHaveText('+86');
    const requiredLabel = section.getByRole('textbox', { name: '必填信息', exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]').locator('label');
    await expect(requiredLabel).toHaveText('必填信息*');
    const positions = await requiredLabel.evaluate(el => {
      const range = document.createRange(); range.selectNodeContents(el.firstChild!);
      return { textLeft: range.getBoundingClientRect().left, textRight: range.getBoundingClientRect().right, labelLeft: el.getBoundingClientRect().left, starLeft: el.querySelector('.ssx-input-required')!.getBoundingClientRect().left };
    });
    expect(positions.textLeft).toBe(positions.labelLeft);
    expect(positions.starLeft - positions.textRight).toBe(4);
    const vertical = section.getByLabel('垂直布局', { exact: true }).locator('xpath=ancestor::div[contains(@class,"ssx-input ")]');
    await expect(vertical).toHaveCSS('height', '86px');
    const external = page.getByLabel('名称', { exact: true });
    await expect(external.locator('xpath=..')).toHaveCSS('height', '48px');
    await expect(external).toHaveCSS('font-size', '16px');
    expect(await section.evaluate(el => el.scrollWidth)).toBeLessThanOrEqual(await section.evaluate(el => el.clientWidth));
    const action = section.getByRole('button', { name: '显示密码' });
    await expect(action).toHaveCSS('width', '24px');
    expect(await action.evaluate(el => parseFloat(getComputedStyle(el, '::after').width))).toBeGreaterThanOrEqual(40);
  });
}

for (const theme of ['light', 'dark']) {
  test(`input and cell share inset dividers without input focus decoration in ${theme}`, async ({ page }) => {
    await page.goto(`/#/mobile?theme=${theme}`);
    const input = page.getByLabel('基础输入', { exact: true });
    const inputRow = input.locator('xpath=ancestor::div[contains(@class,"field-divider")]');
    const cells = page.getByRole('group', { name: '单元格示例', exact: true });
    const cell = cells.locator('.base-cell').first();
    const divider = async (locator: typeof cell) => locator.evaluate(el => {
      const css = getComputedStyle(el, '::after');
      return { left: css.left, right: css.right, height: css.height, color: css.backgroundColor, content: css.content };
    });
    const before = await divider(inputRow);
    expect(before).toMatchObject({ left: '16px', right: '16px', height: '1px' });
    expect(await divider(cell)).toEqual(before);
    for (const group of [cells, inputRow.locator('xpath=..')]) {
      const sizes = await group.evaluate(el => ({ total: el.getBoundingClientRect().height, rows: Array.from(el.children).reduce((sum, row) => sum + row.getBoundingClientRect().height, 0) }));
      expect(sizes.total).toBe(sizes.rows);
    }
    await expect(inputRow).toHaveCSS('height', '56px');
    await expect(cell).toHaveCSS('height', '56px');
    await input.fill('聚焦时只显示光标');
    await expect(input).toBeFocused();
    expect(await divider(inputRow)).toEqual(before);
    await expect(inputRow).toHaveCSS('box-shadow', 'none');
    await expect(cells.locator('.base-cell').last()).toHaveCSS('height', '56px');
    expect((await divider(cells.locator('.base-cell').last())).content).toBe('none');
    const external = page.getByLabel('名称', { exact: true });
    const body = external.locator('xpath=..');
    const border = await body.evaluate(el => getComputedStyle(el).borderColor);
    await external.focus();
    await expect(body).toHaveCSS('border-color', border);
    const finalRow = page.getByLabel('较长的标签内容', { exact: true }).locator('xpath=ancestor::div[contains(@class,"field-divider")]');
    expect((await divider(finalRow)).content).toBe('none');
  });
}
