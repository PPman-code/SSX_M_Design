# 移动端字体规范

用户于 2026-10-14 提供并要求记录的移动端字体标准，优先于初始化时从 PC 继承的移动端字号、字重建议。
原始参考：[移动端字体规范](../design-assets/typography/mobile-type-spec-2026-10-14.png)。

| 字号（原图 pt） | 字重 | 行间距 | 使用场景 |
| --- | --- | --- | --- |
| 24 | Regular / Medium | 1.4 倍 | 超大标题 |
| 20 | Regular / Medium | 未指定 | 重要标题 |
| 18 | Regular / Medium | 未指定 | 评分等重要标题或阅读类文字 |
| 17 | Regular / Medium | 未指定 | 标题 |
| 16 | Regular / Medium | 未指定 | 按钮等大多数操作类文字 |
| 15 | Regular / Medium | 未指定 | 大多数正文或次重要文字 |
| 14 | Regular | 未指定 | 大多数次级文字 |
| 12 | Regular | 未指定 | 大多数辅助信息类文字 |
| 11 | Regular | 未指定 | 徽标数或补充文字 |
| 10 | Regular | 未指定 | 辅助信息类补充文字 |
| 9 | Regular | 未指定 | 小标签类文字 |

## 实现与迁移边界

- Regular 对应 CSS font-weight: 400，Medium 对应 500；不把 Medium 写成 600。
- 原图单位为 pt，不能未经核对直接按 CSS pt 换算；此记录不改变现有 CSS 的 px 数值。H5 的字号单位映射在实际组件调整时核对。
- 原图的破折号按未指定记录，不自动视为全部 1.4 倍。行高在组件实施时明确。
- 用户先前明确的出勤率卡片辅助指标标签继续为 11px / 20px、400。
- 9–12 的级别按表中辅助用途使用，不替代正文或输入文字；输入仍需满足手机输入体验，交互区域保持至少 40 × 40px（2026-10-21 用户更新）。
- 公共 Button 默认字号已于 2026-10-22 迁移为 16px/24px；sm 14px 与语义专用组件的显式规格保留。正文 16px、强调 600 等其余存量值仍需逐项核对，不表示已全局迁移。2026-10-20 已将 11px (`--typography-font-size-badge`)、15px (`--typography-font-size-regular`)、17px (`--typography-font-size-title-sm`)、20px (`--typography-font-size-title-lg`) 补充至 `tokens.json` 并自动生成到 `tokens.css`，后续各组件调整时逐步替换硬编码 px。
- 数字专用字体及报表数字的既有规格另行保留，参考图未规定这些数值。
- 日期区间对齐（2026-10-21）：同列比较的日期保留补零格式，并使用 `font-variant-numeric: tabular-nums`，防止比例数字造成等长日期视觉宽度不一。已核对客户筛选三项日期摘要及 DateRangeFields 起止日期；保持原字体族、字号和行高，不将所有正文改为等宽字体。其他数字场景按用途核对。
