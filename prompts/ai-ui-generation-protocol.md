# AI UI Generation Protocol

Use this protocol when AI creates or edits product UI.

## Route First

1. Read `DESIGN.md`.
2. Declare `D`, `V`, `I`, or `B` and the expected files.
3. Follow the task reading router; do not load every design-system file.
4. For a new page, start from `page-patterns.md` and `component-registry.md`.
5. Read detailed component rules only when changing, auditing, or migrating a component.
6. Read `current-state.md` only for legacy discovery or migration.

## Pre-Code Checklist

- user task and page goal
- existing page pattern
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

For a `B` change, also state impact, risk, verification, rollback, and wait for explicit approval.

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
