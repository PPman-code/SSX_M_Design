# 首页 · v1 · 设计草稿

Figma 来源：hoN0voWKmRtnWBPuzMw1yB / 4195:60284。入口：工作区 ?page=home；产品固定路由 /pages/home/v1。

沿用原稿的身份、公告、待办事项、四列常用功能、报表中心、云学辅与今日课表。功能图标按用户要求使用 32px 对应色系色块，身份下拉、公告、说明和箭头使用本地 Icon（12/16px），底部导航复用公共 ProductTabBar 与真实 Iconfont 图标；暂不获取功能 Icon。四列随 360/375/390/430px 宽度自适应，文字允许换行。

报表中心新增「出勤率」，连接已有 /pages/attendance/v1；携带 role、theme 和预览 chrome，from=home 用于返回首页。底部「我的」连接既有页面，其首页 Tab 也连接此页面。身份切换为前端设计模拟，未接后端权限；无权限身份由已有报表空态呈现。其他入口只展示 Toast 提示，不伪造已完成的业务。

公告日期、待办数量、今日课程是原稿示例。占位色复用已有角色色阶，通过 color.home.placeholder.* 语义 token 输出；黄色补充 gold.600（#FFC600）以保留原稿黄色系，其他色块复用既有色阶；分类色不改变项目主题蓝。

真机、微信容器、软键盘未验收。

待办数量使用 typography.fontFamily.numeric 数字字体栈及 tabular-nums，24px / 34px；不加载网络字体，实际字体根据设备可用字体回退。

2026-10-15：首页报表中心新增「出勤率 v2」入口，与原「出勤率」并列，进入 /pages/attendance/v2 并保留身份、主题与预览外壳参数。

## 2026-10-15 · B/D 出勤率版本留存

当前仅对外展示出勤率 v2：首页只保留出勤率 v2，版本选择中隐藏 v1，交付目录不再列 v1。旧工作区 ?page=attendance 指向 v2，?page=attendance-v2 继续可用。v1 源码/数据/资源与固定路由 /pages/attendance/v1 均保留供历史回看，登记在 archivedBusinessPages，不删除。此决定取代之前两版并列入口与版本切换说明。

## 2026-10-15 · V 出勤率入口图标

使用用户提供的出勤率.png，原图72×72，保存 public/pages/home/v1/attendance.png，页面按32×32 CSS px显示，保留透明背景及原始颜色。其他入口仍沿用占位图标。
