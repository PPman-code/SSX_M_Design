# Customer Progressive Sticky Header Plan

**Goal:** Replace the abrupt two-layer reveal with a unified native-scrolling header.
**Scope:** CustomerInfoPage, its CSS, local useCustomerStickyHeader hook and focused browser tests. No global Tabs or business changes.
**Ruling:** Follow the agreed lighter native-scroll solution, not touch/wheel interception or strict gesture consumption. Keep the 48px operation row and remove its vertical 24px extra margin; header is 96px total.

- [x] Merge operation row and Tabs into one sticky container (top -48px, translateY 0..48px).
- [x] Add direction accumulation (open24/close12), frame-coalesced updates, active-touch hold, 160ms idle snap, interrupted-snap continuation and natural-top joining.
- [x] Preserve controlled tabs, title, filters, recorder action, semantic colors and reduced motion.
- [x] Verify four widths, partial/full/collapsed states, touch-event hold, native top joining, transparent footer and themes.
- [x] Final regression, read-only review and check/build; device/WebView touch feel remains unverified.

## Evidence
- Final pnpm check and pnpm build passed.
- 7 final header/theme tests passed, including four widths, partial/full/collapsed progress, active-touch hold, interrupted-snap freeze across frames and natural-top restoration.
- 13 additional Tabs/recording/filter regressions passed; four layout checks also passed.
- Independent read-only review found a snap cancellation jump; cross-frame regression reproduced it before fix, then passed after freezing the computed transform into the CSS variable before cancelling transition.
- Browser preview inspected through actual scrolling; expanded/collapsed screenshot checked. Device/WebView touch inertia and screen reader remain unverified. No commit/push/deploy.
