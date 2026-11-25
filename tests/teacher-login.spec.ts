import { expect, test, type Page } from '@playwright/test';

const route = '/#/pages/teacher-app/v1?theme=light';
async function enterAccount(page: Page, account = 'new@example.com') {
  await page.getByLabel('工作账号', { exact: true }).fill(account);
  await page.getByLabel('密码', { exact: true }).fill('888888');
}
async function verifyPhone(page: Page, send: '下一步' | '获取验证码', phone = '13800138000') {
  await page.getByLabel('手机号', { exact: true }).fill(phone);
  if (send === '下一步') await page.getByRole('checkbox', { name: '阅读并同意' }).check();
  await page.getByRole('button', { name: send, exact: true }).click();
  await page.getByLabel('验证码', { exact: true }).fill('123456');
}
async function expectCurrentSchool(page: Page, school = '青禾美术学校') {
  const settingsHeading = page.getByRole('heading', { name: '设置', exact: true });
  if (!await settingsHeading.isVisible()) {
    const mine = page.getByRole('button', { name: '我的', exact: true });
    if (await mine.getAttribute('aria-current') !== 'page') await mine.click();
    await expect(page.getByRole('heading', { name: '我的', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: `当前学校：${school}` })).toBeVisible();
    await page.getByRole('button', { name: '设置', exact: true }).click();
  }
  await expect(settingsHeading).toBeFocused();
  await expect(page.getByText('当前学校', { exact: true })).toBeVisible();
  await expect(page.getByText(school, { exact: true })).toBeVisible();
}

test('direct login fills the viewport, including after it shrinks and expands during input', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);

  const app = page.locator('.app-page');
  await expect(app).toHaveCSS('height', '844px');
  const surface = await page.locator('.teacher-login-card').evaluate(card => {
    const sample = document.createElement('span');
    sample.style.color = 'var(--color-background-surface)';
    card.appendChild(sample);
    const color = getComputedStyle(sample).color;
    sample.remove();
    return color;
  });
  await expect(page.locator('html')).toHaveCSS('background-color', surface);
  await expect(page.locator('body')).toHaveCSS('background-color', surface);
  await expect(page.locator('.app-home-indicator')).toHaveCount(0);

  const phone = page.getByRole('textbox', { name: '手机号', exact: true });
  await phone.focus();
  await page.setViewportSize({ width: 390, height: 520 });
  await expect(app).toHaveCSS('height', '520px');
  await phone.blur();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(app).toHaveCSS('height', '844px');
  await expect(page.locator('html')).toHaveCSS('overflow-y', 'hidden');
  await expect(page.locator('main.product-scroll')).toHaveCSS('overflow-y', 'auto');
});

test('the phone login submit button keeps its own pressed color in both themes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark']) {
    await page.goto(route.replace('theme=light', `theme=${theme}`));
    await expect(page.locator('html')).toHaveAttribute('data-color-mode', theme);
    const submit = page.getByRole('button', { name: '下一步', exact: true });
    await submit.scrollIntoViewIfNeeded();
    const [restColor, pressedColor] = await submit.evaluate(el => {
      const sample = document.createElement('span');
      el.appendChild(sample);
      const colors = ['--button-tone', '--button-tone-pressed'].map(variable => {
        sample.style.color = `var(${variable})`;
        return getComputedStyle(sample).color;
      });
      sample.remove();
      return colors;
    });
    expect(pressedColor).not.toBe(restColor);
    await expect(submit).toHaveCSS('background-color', restColor);
    const bounds = (await submit.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down();
    await expect(submit).toHaveCSS('background-color', pressedColor);
    await page.mouse.move(0, 0);
    await page.mouse.up();
    await expect(submit).toHaveCSS('background-color', restColor);
  }
});

test('login questions advance upward together and only the featured question has the AI icon', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await page.clock.install();
  await page.goto(route);
  const questions = page.locator('.guanzai-questions');
  const featured = questions.locator('[data-slot="featured"]');
  const icon = questions.locator('.guanzai-question-icon');
  await expect(featured).toHaveText('看一下今天的排课。');
  await expect(featured.locator('.guanzai-question-icon')).toHaveCount(1);

  await page.clock.fastForward(2200);
  await expect(featured).toHaveText('今天有哪些试听课？');
  await expect(questions.locator('[data-slot="upper"]')).toHaveText('看一下今天的排课。');
  await expect(questions.locator('[data-slot="exit"]')).toHaveText('这周的出勤率如何？');
  await expect(icon).toHaveCount(1);
  await expect(featured.locator('.guanzai-question-icon')).toHaveCount(1);

  await page.clock.fastForward(2200);
  const featuredText = featured.locator('.guanzai-question-text');
  await expect(featuredText).toHaveText('今天还有什么事情要处理？');
  await expect(featuredText).toHaveCSS('overflow', 'visible');
  await expect(featuredText).toHaveCSS('white-space', 'normal');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await expect(featured).toHaveText('看一下今天的排课。');
  await page.clock.runFor(4400);
  await expect(featured).toHaveText('看一下今天的排课。');
});

test('WeChat login opens a simulation and continues through SMS verification', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.goto(route);
  const wechat = page.getByRole('button', { name: '微信登录', exact: true });
  await expect(wechat).toHaveCSS('height', '48px');
  await wechat.click();
  const dialog = page.getByRole('dialog', { name: '微信登录' });
  await expect(dialog.getByText(/模拟微信授权/)).toBeVisible();
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(dialog).toBeHidden();
  await expect(wechat).toBeFocused();
  await wechat.click();
  await dialog.getByRole('button', { name: '验证手机号' }).click();
  await expect(page.getByRole('heading', { name: '输入验证码' })).toBeFocused();
  await expect(page.getByText('13700137000', { exact: true })).toBeVisible();
  await page.getByLabel('验证码', { exact: true }).fill('123456');
  await expect(page.getByRole('heading', { name: '选择学校' })).toBeVisible();
});

test('an unregistered phone can bind, then resolve a conflict using the old phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await verifyPhone(page, '下一步');
  await expect(page.getByRole('heading', { name: '绑定工作账号' })).toBeFocused({ timeout: 4000 });
  await page.getByRole('button', { name: '绑定', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('请输入学校分配的工作账号。');
  await enterAccount(page);
  await page.getByRole('button', { name: '绑定', exact: true }).click();
  await expectCurrentSchool(page);
  await page.getByRole('button', { name: '退出登录' }).click();
  await verifyPhone(page, '下一步');
  await expectCurrentSchool(page);
  await page.getByRole('button', { name: '退出登录' }).click();
  await verifyPhone(page, '下一步', '13900139000');
  await enterAccount(page);
  await page.getByRole('button', { name: '绑定', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('138****8000');
  await page.screenshot({ path: '/private/tmp/ssx-login/binding-conflict-recovery.png' });
  await page.getByRole('button', { name: '返回手机号登录' }).click({ timeout: 4000 });
  await verifyPhone(page, '下一步', '13800138000');
  await expectCurrentSchool(page);
  await page.getByRole('button', { name: '解绑手机号' }).click();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveValue('13800138000');
  await expect(page.getByLabel('手机号', { exact: true })).toHaveAttribute('readonly');
  await expect(page.getByRole('button', { name: '确认解绑' })).toHaveCount(0);
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.getByLabel('验证码', { exact: true }).fill('123456');
  await expectCurrentSchool(page);
  await expect(page.getByText('尚未绑定')).toBeVisible();
  await page.getByRole('button', { name: '退出登录' }).click();
  await verifyPhone(page, '下一步', '13900139000');
  await enterAccount(page);
  await page.getByRole('button', { name: '绑定', exact: true }).click();
  await expectCurrentSchool(page);
  await expect(page.getByText('已绑定 139****9000')).toBeVisible();
});

test('login opens with phone by default and account login supports replacement phone binding', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await expect(page.getByRole('button', { name: 'App 返回' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: '手机号登录' })).toHaveText('🎉欢迎登录校管家');
  const agreement = page.getByRole('checkbox', { name: '阅读并同意' });
  await expect(agreement).not.toBeChecked();
  await agreement.click();
  await expect(agreement).toBeChecked();
  await expect(page.getByLabel('手机号', { exact: true })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'App 顶部导航' })).toHaveCount(0);
  await expect(page.getByRole('group', { name: '登录方式' })).toHaveCount(0);
  await expect(page.getByText('账号或密码有问题？请联系学校管理员。')).toHaveCount(0);
  await page.screenshot({ path: '/private/tmp/ssx-login/phone-first.png' });
  await page.getByRole('button', { name: '账号登录' }).press('Enter');
  await expect(page.getByRole('heading', { name: '账号登录' })).toBeFocused();
  await expect(page.getByText('账号或密码有问题？请联系学校管理员。')).toBeVisible();
  await page.screenshot({ path: '/private/tmp/ssx-login/account-alternate.png' });
  await page.getByRole('navigation', { name: 'App 顶部导航' })
    .getByRole('button', { name: '返回手机号登录' }).press('Enter');
  await expect(page.getByRole('heading', { name: '手机号登录' })).toBeFocused();
  await page.getByRole('button', { name: '账号登录' }).press('Enter');
  await expect(page.getByLabel('验证码', { exact: true })).toHaveCount(0);
  await enterAccount(page);
  await page.getByLabel('密码', { exact: true }).press('Enter');
  await expect(page.getByRole('heading', { name: '绑定手机号' })).toBeFocused({ timeout: 4000 });
  await expect(page.getByText('青禾美术学校', { exact: true })).toBeVisible();
  const phone = page.getByLabel('手机号', { exact: true });
  await expect(phone).toHaveValue('13700137000');
  await page.getByRole('button', { name: '暂不绑定' }).click();
  await expectCurrentSchool(page);
  await expect(page.getByText('尚未绑定')).toBeVisible();
  await page.getByRole('button', { name: '去绑定手机号' }).click();
  await expect(phone).toHaveValue('13700137000');
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.getByLabel('验证码', { exact: true }).fill('12345');
  await page.getByRole('button', { name: 'App 返回' }).click();
  await expect(phone).toHaveValue('13700137000');
  await phone.fill('13800138000');
  await expect(page.getByLabel('验证码', { exact: true })).toHaveCount(0);
  await verifyPhone(page, '获取验证码');
  await expectCurrentSchool(page);
  await expect(page.getByText('已绑定 138****8000')).toBeVisible();
  await page.getByRole('button', { name: '退出登录' }).click();
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expectCurrentSchool(page);
  await expect(page.getByText('已绑定 138****8000')).toBeVisible();
});

test('unavailable App entries share the same toast without selecting the attendance task', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.clock.setFixedTime(new Date(2026, 10, 24, 10, 45));
  await page.goto(`${route}&chrome=app&payment=enabled`);
  const toast = page.locator('.toast[data-type="text"]').getByText('未接入', { exact: true });
  const agreement = page.getByRole('button', { name: '《服务协议》', exact: true });
  await agreement.click();
  await expect(toast).toBeVisible();
  await expect(toast).toBeHidden();

  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page, 'teacher@example.com');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  const tasks = page.getByRole('region', { name: '我的待办' });
  const attendance = tasks.getByRole('button', { name: /1\s*待点名/ });
  const followUp = tasks.getByRole('button', { name: /待跟进/ });
  await attendance.scrollIntoViewIfNeeded();
  const background = await followUp.evaluate(button => getComputedStyle(button).backgroundColor);
  const scroll = page.locator('main.product-scroll');
  const top = await scroll.evaluate(element => element.scrollTop);
  await attendance.click();
  await expect(toast).toBeVisible();
  await expect(attendance).toHaveCSS('background-color', background);
  expect(await scroll.evaluate(element => element.scrollTop)).toBe(top);
  await page.screenshot({ path: '/private/tmp/ssx-attendance-unavailable.png' });
  await expect(toast).toBeHidden();

  for (const label of ['AIRA', '查看个人信息', '收费报名']) {
    if (label === '查看个人信息') await page.getByRole('button', { name: '我的', exact: true }).click();
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(toast).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(toast).toBeHidden();
  }
});

test('the prebound demo account opens its own school without a binding prompt', async ({ page }) => {
  await page.goto(route);
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page, 'teacher@example.com');
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible();
  await expectCurrentSchool(page, '星禾艺术学校');
  await expect(page.getByText('已绑定 137****7000')).toBeVisible();
  await page.getByRole('button', { name: '退出登录' }).click();
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '绑定手机号' })).toBeFocused();
});

test('account login can confirm the prefilled onboarding phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveValue('13700137000');
  await page.screenshot({ path: '/private/tmp/ssx-login/account-prefill.png' });
  await page.getByRole('button', { name: '获取验证码' }).click();
  await page.getByLabel('验证码', { exact: true }).fill('123456');
  await expectCurrentSchool(page);
  await expect(page.getByText('已绑定 137****7000')).toBeVisible();
});

test('an onboarding phone can enter a campus directly with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await verifyPhone(page, '下一步', '13700137000');
  const heading = page.getByRole('heading', { name: '选择学校' });
  await expect(heading).toBeFocused({ timeout: 4000 });
  await expect(page.locator('.app-page-title')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'App 返回' })).toBeVisible();
  await expect(page.getByText('本次入职', { exact: true })).toBeVisible();
  await expect(page.getByText('城南校区', { exact: true })).toBeVisible();
  await expect(page.getByText('已离职', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /启程培训学校/ })).toBeDisabled();
  await page.getByRole('button', { name: '没找到我的校区' }).click();
  await expect(page.getByRole('heading', { name: '绑定工作账号' })).toBeFocused({ timeout: 4000 });
  await expect(page.getByText('没有工作账号或密码？请向学校管理员索取。')).toBeVisible();
  await expect(page.getByText('已验证 137****7000')).toBeVisible();
  await page.getByRole('button', { name: 'App 返回' }).click();
  await expect(heading).toBeFocused();
  await page.keyboard.press('Tab');
  const school = page.getByRole('button', { name: /星禾艺术学校/ });
  await expect(school).toBeFocused();
  await expect(school).toHaveAccessibleName(/城南校区.*本次入职/);
  await expect(school.locator('.teacher-login-school-avatar')).toHaveText('星');
  await expect(page.getByText('137****7000 关联的学校')).toBeVisible();
  for (const width of [360, 375, 390, 430]) {
    await page.setViewportSize({ width, height: 844 });
    const bounds = await school.boundingBox();
    expect(bounds?.x).toBeGreaterThanOrEqual(20);
    expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width - 20);
    expect(bounds?.height).toBeGreaterThanOrEqual(88);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '/private/tmp/ssx-login/select-school-direct.png' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: /云谷科技培训学校/ })).toBeFocused();
  await page.keyboard.press('Enter');
  await expectCurrentSchool(page, '云谷科技培训学校');
  await page.screenshot({ path: '/private/tmp/ssx-login/success-reviewed.png' });
  await page.getByRole('button', { name: '退出登录' }).click();
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '绑定手机号' })).toBeFocused();
  await expect(page.getByText('青禾美术学校', { exact: true })).toBeVisible();
  await expect(page.getByLabel('手机号', { exact: true })).toHaveValue('13700137000');
});

test('a missing campus can be resolved by binding the school-issued account', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await verifyPhone(page, '下一步', '13700137000');
  await page.getByRole('button', { name: '没找到我的校区' }).click({ timeout: 4000 });
  await page.screenshot({ path: '/private/tmp/ssx-login/missing-campus-bind.png' });
  await enterAccount(page);
  await page.getByRole('button', { name: '绑定', exact: true }).click();
  await expectCurrentSchool(page);
  await expect(page.getByText('已绑定 137****7000')).toBeVisible();
});

test('a verified account survives reload and reopening until explicit logout', async ({ page, context }) => {
  await page.goto(route);
  await page.getByRole('button', { name: '账号登录' }).click();
  await enterAccount(page);
  await page.getByRole('button', { name: '登录', exact: true }).click();
  await expect(page.getByRole('heading', { name: '绑定手机号' })).toBeFocused();
  await page.reload();
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible({ timeout: 4000 });
  await expectCurrentSchool(page);
  await expect(page.getByText('尚未绑定')).toBeVisible();

  const reopened = await context.newPage();
  await reopened.goto(route);
  await expect(reopened.getByRole('heading', { name: '工作台' })).toBeVisible();
  await expectCurrentSchool(reopened);
  await reopened.getByRole('button', { name: '退出登录' }).click();
  await expect(page.getByRole('heading', { name: '手机号登录' })).toBeVisible();
  await reopened.reload();
  await expect(reopened.getByRole('heading', { name: '手机号登录' })).toBeVisible();
});

test('phone login retains both campus and binding across a reload and logout', async ({ page }) => {
  await page.goto(route);
  await verifyPhone(page, '下一步', '13700137000');
  await page.getByRole('button', { name: /云谷科技培训学校/ }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '工作台' })).toBeVisible({ timeout: 4000 });
  await expectCurrentSchool(page, '云谷科技培训学校');
  await page.getByRole('button', { name: '退出登录' }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: '手机号登录' })).toBeVisible();
  await verifyPhone(page, '下一步', '13700137000');
  await expect(page.getByRole('heading', { name: '选择学校' })).toBeFocused();
  await expect(page.getByRole('button', { name: /星禾艺术学校/ })).toBeEnabled();
  await page.getByRole('button', { name: /云谷科技培训学校/ }).click();
  await expectCurrentSchool(page, '云谷科技培训学校');
});

test('a phone bound to two schools prompts for a school on the next login', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  await verifyPhone(page, '下一步', '13700137000');
  await page.getByRole('button', { name: /云谷科技培训学校/ }).click();
  await expectCurrentSchool(page, '云谷科技培训学校');
  await page.getByRole('button', { name: '退出登录' }).click();
  await verifyPhone(page, '下一步', '13700137000');
  await expect(page.getByRole('heading', { name: '选择学校' })).toBeFocused({ timeout: 4000 });
  await expect(page.getByRole('button', { name: /星禾艺术学校/ })).toBeEnabled();
  await page.screenshot({ path: '/private/tmp/ssx-login/multi-bound-schools.png' });
  await page.getByRole('button', { name: /云谷科技培训学校/ }).click();
  await expectCurrentSchool(page, '云谷科技培训学校');
});

test('phone login opens a dedicated verification page and returns to the entered number', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const testTime = new Date('2026-11-19T12:00:00+08:00');
  await page.clock.install({ time: testTime });
  await page.clock.pauseAt(new Date(testTime.getTime() + 1000));
  await page.goto(route);
  await expect(page.getByRole('heading', { name: '手机号登录' })).toBeVisible();
  await expect(page.getByLabel('验证码', { exact: true })).toHaveCount(0);
  const phone = page.getByLabel('手机号', { exact: true });
  await phone.fill('123456');
  await page.getByRole('button', { name: '下一步' }).click();
  const formatAlert = page.getByRole('dialog', { name: '手机号格式不正确' });
  await expect(formatAlert).toHaveText(/^手机号格式不正确\s*我知道了$/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('验证码已发送', { exact: true })).toHaveCount(0);
  await formatAlert.getByRole('button', { name: '我知道了', exact: true }).click();
  await page.clock.runFor(300);
  await expect(formatAlert).toBeHidden();
  await expect(phone).toHaveValue('123456');
  await phone.fill('13700137000');
  await page.getByRole('button', { name: '下一步' }).click();
  const privacy = page.getByRole('dialog', { name: '服务协议及隐私保护' });
  await expect(privacy).toBeVisible();
  await expect(privacy).toHaveClass(/sheet--selection/);
  await expect(privacy.locator('.sheet-handle')).toBeVisible();
  await expect(privacy.getByRole('button', { name: '关闭弹层' })).toBeVisible();
  await privacy.getByRole('button', { name: '不同意', exact: true }).click();
  await page.clock.runFor(350);
  await expect(privacy).toBeHidden();
  await expect(phone).toHaveValue('13700137000');
  await expect(page.getByRole('checkbox', { name: '阅读并同意' })).not.toBeChecked();
  await expect(page.getByText('验证码已发送', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '下一步' }).click();
  await privacy.getByRole('button', { name: '同意并登录', exact: true }).click();
  await expect(privacy.getByRole('button', { name: '发送中', exact: true })).toBeDisabled();
  await expect(page.getByRole('heading', { name: '输入验证码' })).toHaveCount(0);
  await page.clock.runFor(600);
  await expect(page.getByRole('heading', { name: '输入验证码' })).toBeFocused();
  await expect(page.getByText('验证码已发送', { exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('接收手机号 13700137000');
  const code = page.getByRole('textbox', { name: '验证码' });
  const cells = page.locator('.ssx-verification-code-cell');
  await expect(code).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(cells).toHaveCount(6);
  await expect(phone).toHaveCount(0);
  await page.screenshot({ path: '/private/tmp/ssx-login/verification-page.png' });
  await expect(page.getByRole('button', { name: '登录', exact: true })).toHaveCount(0);
  const resend = page.getByRole('button', { name: /重新发送/ });
  await expect(resend).toHaveText('60 秒后重新发送');
  await expect(resend).toBeDisabled();
  await code.pressSequentially('12345');
  await expect(cells.nth(5)).toHaveAttribute('data-current', 'true');
  await code.click({ position: { x: 12, y: 24 } });
  await code.press('Backspace');
  await expect(cells).toHaveText(['1', '2', '3', '4', '', '']);
  await expect(cells.nth(4)).toHaveAttribute('data-current', 'true');
  await code.press('Home');
  await code.press('9');
  await expect(code).toHaveValue('12349');
  await code.fill('000000');
  await expect(page.getByRole('region', { name: '轻提示' }).getByText('验证码错误', { exact: true })).toBeVisible();
  await expect(code).toHaveValue('');
  await expect(code).toBeFocused();
  await page.clock.fastForward(59_000);
  await expect(resend).toHaveText('1 秒后重新发送');
  await expect(resend).toBeDisabled();
  await page.clock.fastForward(1000);
  await expect(resend).toHaveText('重新发送验证码');
  await expect(resend).toBeEnabled();
  await code.fill('12345');
  await resend.click();
  await expect(page.getByText('验证码已发送', { exact: true })).toBeVisible();
  await expect(resend).toHaveText('60 秒后重新发送');
  await expect(resend).toBeDisabled();
  await expect(code).toHaveValue('');
  await page.getByRole('button', { name: 'App 返回' }).click();
  await expect(page.getByRole('heading', { name: '手机号登录' })).toBeFocused();
  await expect(phone).toHaveValue('13700137000');
  await expect(page.getByLabel('验证码', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '下一步' }).click();
  await page.clock.runFor(600);
  await expect(resend).toBeDisabled();
  await code.pressSequentially('123456');
  await expect(page.getByRole('heading', { name: '选择学校' })).toBeFocused();
});
