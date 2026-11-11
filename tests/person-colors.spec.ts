import { test, expect } from '@playwright/test';
import { avatarAttributes } from '../src/lib/avatar-colors';
import { studentStatuses, students } from '../src/pages/students/v1/model';

const studentColors = [
  'rgb(215, 201, 255)',
  'rgb(255, 208, 177)',
  'rgb(157, 221, 255)',
  'rgb(168, 231, 175)',
  'rgb(255, 195, 229)',
];
const teacherColors = ['rgb(118, 163, 209)', 'rgb(140, 136, 206)', 'rgb(144, 153, 189)', 'rgb(132, 198, 184)'];

test('student states are restricted to the four confirmed choices and avatar allocation is stable', () => {
  expect(studentStatuses).toEqual(['在读', '试听', '休学', '退学']);
  expect(students.every(student => studentStatuses.includes(student.status))).toBe(true);
  expect(students.filter(student => student.status === '在读')).toHaveLength(5);
  for (const status of ['试听', '休学', '退学']) expect(students.filter(student => student.status === status)).toHaveLength(1);
  const first = avatarAttributes('student', 's6');
  expect(first).toEqual(avatarAttributes('student', 's6'));
  expect(first['data-avatar-color']).toMatch(/^[0-4]$/);
});

for (const theme of ['light', 'dark']) {
  test(`person colors use confirmed palettes and stay consistent across pages in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/#/pages/students/v1?theme=${theme}`);
    const resolved = await page.evaluate(() => [
      Array.from({ length: 5 }, (_, slot) => {
        const el = document.createElement('span');
        el.dataset.avatarKind = 'student'; el.dataset.avatarColor = String(slot); document.body.append(el);
        const color = getComputedStyle(el).backgroundColor; el.remove(); return color;
      }),
      Array.from({ length: 4 }, (_, slot) => {
        const el = document.createElement('span');
        el.dataset.avatarKind = 'teacher'; el.dataset.avatarColor = String(slot); document.body.append(el);
        const color = getComputedStyle(el).backgroundColor; el.remove(); return color;
      }),
    ]);
    expect(resolved).toEqual([studentColors, teacherColors]);
    const roles: Record<string, [string, string]> = {
      在读: ['--color-background-brand-subtle', '--color-text-brand-accessible'],
      试听: ['--color-background-warning-subtle', '--color-text-warning'],
      休学: ['--color-tag-category-violet-background', '--color-tag-category-violet-text'],
      退学: ['--color-background-neutral-subtle', '--color-text-subtle'],
    };
    const states = await page.locator('.student-status').evaluateAll(es => es.map(el => ({ status: el.textContent!, background: getComputedStyle(el).backgroundColor, foreground: getComputedStyle(el).color })));
    for (const state of states) {
      const expected = await page.evaluate(([bg, fg]) => {
        const el = document.createElement('span'); el.style.backgroundColor = `var(${bg})`; el.style.color = `var(${fg})`; document.body.append(el);
        const result = { background: getComputedStyle(el).backgroundColor, foreground: getComputedStyle(el).color }; el.remove(); return result;
      }, roles[state.status]);
      expect({ background: state.background, foreground: state.foreground }).toEqual(expected);
    }
    await page.getByRole('button', { name: '筛选学员', exact: true }).click();
    const filter = page.getByRole('dialog', { name: '筛选学员', exact: true });
    await expect(filter.getByRole('group', { name: '学员状态', exact: true }).getByRole('button')).toHaveText(['不限', '在读', '试听', '休学', '退学']);
    await filter.getByRole('button', { name: '关闭筛选', exact: true }).click();
    const card = page.getByRole('listitem').filter({ hasText: '林可欣' });
    const avatar = card.locator('.student-avatar');
    const color = await avatar.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(studentColors).toContain(color);
    await page.getByRole('button', { name: '学员排序', exact: true }).click();
    await page.getByRole('button', { name: '按姓名排序', exact: true }).click();
    await expect(avatar).toHaveCSS('background-color', color);
    await page.reload();
    await expect(avatar).toHaveCSS('background-color', color);
    await card.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `/tmp/ssx-student-status-avatars-${theme}.png` });
    await page.goto(`/#/pages/student-info/v1?student=s6&theme=${theme}`);
    await expect(page.locator('.student-detail-profile .ai-avatar')).toHaveCSS('background-color', color);
    for (const teacher of await page.locator('.ai-author-avatar').all()) {
      expect(teacherColors).toContain(await teacher.evaluate(el => getComputedStyle(el).backgroundColor));
      expect(await teacher.evaluate(el => getComputedStyle(el).color)).toBe('rgb(255, 255, 255)');
    }
    await expect.poll(() => page.locator('img').evaluateAll(es => es.every(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0))).toBe(true);
    await page.screenshot({ path: `/tmp/ssx-teacher-avatar-${theme}.png` });
    await page.goto(`/#/pages/prospective-students/v1?theme=${theme}`);
    const prospect = page.getByRole('listitem').filter({ hasText: '林依诺' }).locator('.prospect-avatar');
    const prospectColor = await prospect.evaluate(el => getComputedStyle(el).backgroundColor);
    expect(studentColors).toContain(prospectColor);
    await page.goto(`/#/pages/customer-info/v1?customer=customer-7&theme=${theme}`);
    await expect(page.locator('.ai-customer-profile .ai-avatar')).toHaveCSS('background-color', prospectColor);
  });
}
