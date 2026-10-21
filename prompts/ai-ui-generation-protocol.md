# AI UI Generation Protocol

Use this protocol when AI creates or edits product UI.

## Route First

1. Read `DESIGN.md`.
2. Declare `D`, `V`, `I`, or `B` and the expected files.
3. Follow the task reading router; do not load every design-system file.
4. For a new page, start from `page-patterns.md` and `component-registry.md`. For people-management lists, also read `list-pages.md` and compare both existing student/customer pages.
5. Read detailed component rules only when changing, auditing, or migrating a component.
6. Read `current-state.md` only for legacy discovery or migration.

## Pre-Code Checklist

- user task and page goal
- existing page pattern
- top-bar roles and initial levels: 56px first level, 48px second level, 40px count/batch strip; a standalone first-level Tab is 56px
- explicit scroll ownership and sticky target: generally scroll the first bar away and keep only the second bar sticky at its original 48px; initial top placement is not simultaneous stickiness
- standard single-row bottom toolbar: 56px plus safe area; preserve documented multi-row exceptions
- registered component APIs to reuse
- missing or unresolved component needs
- semantic/component token mapping
- states and responsive behavior
- content, data-format, and accessibility checks relevant to this task
- whether the requested scope changes documentation, visuals, interaction, or business behavior

## Required Analysis Output

```text
Change level: D / V / I / B
Expected files:
- ...

Page/layout structure:
- ...

Registered component reuse:
- ...

Token mapping:
- ...

States and validation:
- ...
```

For a `B` change, state impact, risk, verification and rollback. Proceed within the user-authorized scope; ask only for new business scope or irreversible actions, as AGENTS.md requires.

## Code Rules

- Consume Recommended components through their stable public APIs.
- Do not reproduce component internals inside a page.
- Use semantic/component tokens through the platform consumer layer.
- Do not use physical palette values directly in page code.
- Keep token sync separate from unrelated page redesign work.
- Do not introduce unapproved icon or UI libraries.
- A visual-only task must preserve callbacks, routes, state, persistence, and API behavior.
- Match platform interaction: pressed feedback for touch; hover only where a pointer platform needs it.

## Verification

Check only the affected scope, plus regression risks introduced by shared components:

- declared change level stayed within scope
- registered components and semantic tokens were used
- interaction and business behavior were preserved when not authorized
- relevant states, responsive layout, text overflow, data formatting, and accessibility pass
- shared-component call sites and migration compatibility were checked when applicable

## Cross-Page Consistency Gate

- Identify common semantics, intentional business differences, and implementation drift before editing.
- Consult `design-system/list-pages.md` for confirmed list rules and open migrations. Keep confirmed rules, observed values and candidate baselines separate.
- Reuse existing local Icon and component APIs; inventory every shared consumer before changing a default. Source SVG exceptions need provenance, a missing-icon mapping and Light/Dark checks.
- Compare search geometry, count strip, card spacing, identity hierarchy, tag geometry, touch targets, focus, and modal draft/confirm behavior in both pages. A visual-only task cannot silently change sticky behavior, fields, sorting or filtering.
- Extract only a stable API demonstrated by both consumers. Keep business data, column count and callbacks in callers; a candidate is not a Recommended component.
- Deliver a migration status list. A documentation change does not mean code was migrated. No commit, push, deployment or display-version increment unless requested under the project release rules.

表单输入优先核对本地 Input 的候选 API（components.md）；横排 56px、垂直 86px、标签外置输入区 48px 不套用导航层级，也不替换 Search。复用时核对字段校验、只读/禁用、键盘和提交语义，现有业务字段未批量迁移。

最小点击热区使用 layout.touchTarget=40px（2026-10-21 用户更新），视觉更小时用 .touch-target 透明扩展，不改变 flex 盒模型。筛选 chip 单行最小 40px；弹层选择列表已确认的 48px 保留。Input 与选择 Cell 混排先读 components.md 审查，当前尚未完成表单列与状态统一。
