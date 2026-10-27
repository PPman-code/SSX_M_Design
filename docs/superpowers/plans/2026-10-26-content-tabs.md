# Content Tabs Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement inline; no delegation or commits requested.

**Goal:** Extract the three content-tab implementations into a local controlled Tabs component while preserving page behavior and appearance.

**Architecture:** Tabs owns tab buttons, stable ARIA IDs, roving focus, keyboard activation and common indicator styling. Pages retain content state, panel rendering, counts, sticky position and scroll direction handling. Bottom navigation TabBar remains separate.

**Tech Stack:** React 19, TypeScript, semantic CSS, existing Playwright.

**Spec:** DESIGN.md; design-system/page-patterns.md; design-system/accessibility.md; user's 2026-10-26 request.

## Global Constraints
- Use local UI components and --color-* semantic variables; do not edit generated tokens.
- Preserve 48px page tab height, 24x3px fixed indicators, existing content-width indicator, counts and selected text weights.
- Do not change routes, business filters, recorder state or current sticky/reveal behavior.
- Existing CustomerPage.tsx and prospective-students.spec.ts edits remain untouched.
- No commit, push, deployment or package installation.

## Review Focus
- Arrow navigation wraps and Home/End moves focus and selection; panel labelling follows selection.
- Two simultaneous tablists never steal focus through global element IDs.
- Count labels retain typography and do not alter screen-reader names or filters.
- Tab refactoring does not move the sticky containing block or reveal threshold.
- Light/Dark colors and fixed/content indicators remain faithful at 360/375/390/430px.

## Tasks
- [x] Define and verify shared controlled Tabs API: items(value,label,id,panelId), value, onValueChange, label; height 48/56, stretch/content layout and fixed/label indicator. Support standard div attributes/ref.
- [x] Migrate StudentPage, CustomerInfoPage and RecordDetailPage; remove repeated per-button keyboard handlers and common CSS, keep page-scoped layout/color overrides.
- [x] Add focused browser regression for keyboard wrapping, Home/End, panel IDs and page-specific visuals; run existing relevant suites.
- [x] Update task route, component registry, migration notes and changelog. Keep Tabs Candidate until broader API review.
- [x] Run pnpm check/build, appropriate E2E and browser screenshots; report device verification limits.

## Verification and rulings
- 2026-10-26: initial shared-tabs regression failed against legacy .student-tabs (missing shared component), then all 51 tests in tabs/students/AI suites passed after migration. Screenshots for all three light presentations inspected; Dark covered by existing and new browser regressions. Device touch/WebView and screen reader not tested.
- Read-only independent reviewer found no important issues; confirmed stable IDs, local focus, styles and unchanged sticky behavior.
- Minor API limits retained for Candidate review: generated IDs are internal, so callers with externally labelled panels should supply explicit IDs (all three migrations do); simultaneous-instance/generated-ID focus tests are not added in this page migration. Component-local refs and useId provide isolation; no global ID lookup remains.
- Ruling: preserve the page-specific colors, weights and indicator types through scoped variables instead of promoting a uniform visual redesign. Keep the component native and controlled to preserve existing shared-panel rendering; no new package.
- No commit/push/deploy; pre-existing prospective-customer changes untouched. This task prepares Tabs only; progressive gesture reveal remains a separate subsequent change.

2026-10-26 后续补齐：用户反馈组件库看不到Tabs，已在MobilePreview介绍下方加入三组TabsExamples。新增图库测试覆盖多实例独立受控、焦点隔离及自动ID唯一性，前述对应测试缺口已补齐；8项Tabs E2E通过，Light/Dark截图已检查。
