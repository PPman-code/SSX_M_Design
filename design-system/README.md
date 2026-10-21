# 设计系统目录

先读 ../DESIGN.md。基础规范继承 WOne_PC_Design 的 2026-10-12 本地快照。

- foundations.md：排版、尺寸、布局差异。
- token-sync.md：三层 token 与来源追踪。
- components.md / component-registry.md：组件详细约定与轻量索引；Input 三种布局为候选 API，含业务字段待迁移记录。
- interaction.md / accessibility.md：触控、弹层、键盘与可访问性。
- page-patterns.md / page-versioning.md：页面组织、顶部 56/48/40 层级、单栏吸顶与版本。
- list-pages.md：人员管理列表的已确认规则、候选基线与迁移入口。
- iconography.md：本地图标资产。
- governance.md：变更边界与状态。

当前包含首页、我的、出勤率、学员管理及意向客户等业务设计样本；实际可见版本以 src/page-registry.ts 为准。样本数量不代表视觉规范、生产业务或真机兼容已全部验收。
