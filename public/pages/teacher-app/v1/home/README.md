# 教师端 App 首页素材

来源：用户指定 Figma `hoN0voWKmRtnWBPuzMw1yB` / `6398:77289`，2026-11-24。

- `guanzai.png`：`6399:77578`，管仔原稿，展示 126×135，object-fit contain。
- `report-card.svg`：`6403:2509`，经营数据卡片异形背景，原设计 351×76，随卡片流式宽度展示。
- `course-finished.svg` / `course-ongoing.svg` / `course-upcoming.svg`：`6406:7829` / `6406:7908` / `6406:7933`，8×8 的时间轴状态点，取消复用结束状态点。

以下图标原稿保存于 `public/icons/teacher-app/` 并通过本地 Icon 调用：

| Icon 名称 | 文件 | 来源节点 | 槽位 |
| --- | --- | --- | --- |
| home-prospective | prospective-students.svg | 6406:7557 | 20×20 |
| home-students | student-management.svg | 6406:7561 | 20×20 |
| home-enrollment | enrollment-payment.svg | 6406:7565 | 20×20 |
| home-orders | order-management.svg | 6406:7571 | 20×20 |
| home-timetable | timetable.svg | 6406:7624 | 20×20 |
| home-roll-call | roll-call.svg | 6406:7628 | 20×20 |
| home-classes | class-management.svg | 6406:7632 | 20×20 |
| home-notification | notification.svg | 6400:77715 | 18×18 |
| home-report-badge | report-badge.svg | 6411:10971 | 18×18 |

功能及经营数据图标保留 SVG 原始填色；通知为单色，alpha 遮罩跟随页面语义文字色。学校箭头复用已下载的本地 school-chevron 图标，右箭头复用既有 ssx-design。运行时无临时 Figma URL。

2026-11-25 V：经营数据专区标题替换为用户提供的 `Frame 2117777245.png`，本地保存为 `report-title.png`（345×66），以115×22显示，保持原比例与22px标题行高；alt保留标题语义。暗色预览转为单色亮色保证可见，浅色使用原始图片。旧report-badge SVG保留溯源，不再用于此标题。
