# 页面版本

业务页面后续放 src/pages/<page-name>/v1/，按实际需求注册固定路由。
大改版新增完整版本目录并保留旧路由；小调整留在当前版本。
冻结版本涉及共享组件变化时检查是否改变旧版，不以共享默认值静默改稿。
业务页由 src/page-registry.ts 登记；“我的”v1 路由 /pages/my/v1，状态为设计草稿。工作区通过 ?page=my 切换；手机二维码使用当前页面固定版本路由，不包含模拟系统栏。

出勤率 v2 从 v1 完整复制，固定路由 /pages/attendance/v2，工作区 ?page=attendance-v2。页面配置可切换两个版本，默认 attendance 与首页入口保持 v1。两版页面/数据/CSS/装饰资源独立，共享本地组件库和语义 token。

## 2026-10-15 · B/D 出勤率版本留存

当前仅对外展示出勤率 v2：首页只保留出勤率 v2，版本选择中隐藏 v1，交付目录不再列 v1。旧工作区 ?page=attendance 指向 v2，?page=attendance-v2 继续可用。v1 源码/数据/资源与固定路由 /pages/attendance/v1 均保留供历史回看，登记在 archivedBusinessPages，不删除。此决定取代之前两版并列入口与版本切换说明。
