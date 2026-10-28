# 图标规范

## 正式来源

图标以用户在 Iconfont 的 ssx-design 项目上传并审核通过的最新内容为准。每次更新按该项目下载包同步；历史归档仅供追溯，不参与运行时，也不覆盖最新版本。

- 图标库：ssx-design；Iconfont 项目 ID：5242145。
- 最新包：用户提供 download.zip；更新日期：2026-10-28；共 208 个图标（新增删除、AI录音转写文件图标，无删除或改名）。
- 当前原始归档：design-assets/iconfont/ssx-design-5242145-2026-10-28-208.zip；旧归档保留供追溯。
- 运行时：public/iconfont/ssx-design.symbol.svg 与 iconfont.json。
- 页面入口：src/components/ui/Icon/index.ts。

原包 sss- 前缀在生成时统一为 SSX-。大小写、camelCase 和下划线名称统一为 kebab-case，例如 MoneyCollectFilled → money-collect-filled、chat_1_line → chat-1-line。公开名称使用 kebab-case，与源图形一一对应。
彩色图标保留 Iconfont 原始 fill/stroke 色值；单色图标使用 currentColor 跟随页面文字颜色。路径、viewBox 和原始比例保持不变。
不执行压缩包内 JS，仅提取 SVG Symbol；构建只接受受控 symbol/g/path 节点与属性。

## 使用

页面只使用 Icon，不拼接 Symbol ID，不导入 Iconfont 的字体 CSS/JS。
默认 md=18px，主要移动端导航可用 lg=24px；点击区域独立扩到 44px。
说明入口统一 question-circle，移动端点击展开，不依赖悬停。
装饰图标不传 label；独立表达含义提供中文 label，图标按钮可由按钮自身命名。

## 生成与交付

pnpm generate:icons 从归档自动生成 sprite、名称类型、JSON 与公开下载包。
pnpm check:generated 检查生成物同步；pnpm test:icons 检查归档、名称映射与 SVG 边界。
交付页提供全部图标预览、英文名称检索与原始 ZIP 下载。
新增包先核对项目 ID、名称与已有调用点；删除、改名属于 API 变更，必须检查使用处。
初始化 PC 图标库已被本项目专属库替换，原导入记录仅为历史来源，不参与运行时。

## 品牌 Logo

左上角仍复用 PC 项目的 public/brand/wone-logo.png，独立复制，36 × 36px，保留原色和比例。品牌 Logo 与 UI 图标分开管理。

## 用户指定的组件勾叉补充（2026-10-20）

用户明确要求采用 [Arco 581:10712](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/Arco-Design-Mobile-Components--Community-?node-id=581-10712) 的组件专用勾叉，作为本次任务范围内的来源补充，不替换现有 Iconfont 包，不引入另一套运行时图标库。

- 原始 SVG 本地保存于 public/icons/selection/check.svg、close.svg，均为 16 × 16px；保持文件路径数据、viewBox 及图形比例。
- 仍通过本地 Icon 公开 API 调用，名称 selection-check / selection-close；用原始 SVG 的 alpha 遮罩着色，颜色来自调用组件 currentColor（--color-*），不用源稿固定白色。
- 两枚补充图标不写入生成的 iconNames / ssx-design Symbol 或 Iconfont 下载包，不冒充 Iconfont 项目中的正式图标；来源记录见同目录 README。
- 普通 Checkbox 勾和三种尺寸 Toggle 状态勾叉使用 16px；卡片角标保留其既有 14px / 12px 槽位。其他图标调用不变。

2026-10-21 单元格装饰图标统一为 md=18px：覆盖 Cell、Input 字段、折叠标题及 MenuCell 的前置/尾部/状态/说明/箭头槽。头像与嵌入的选择/开关控件保持独立尺寸；图形大小不改变布局热区或行高。

## Loading 渐变图标（2026-10-21 用户提供）

Icon loading 覆盖为用户提供的 loading-blue.svg / loading-white.svg 渐变圆环。原稿在 public/icons/loading 原样保留；ring-mask.svg 采用原稿 clipPath 的 16×16 圆环轮廓，CSS 按原稿 from 90deg 绘制 transparent → currentColor 角度渐变，颜色跟随组件 --color-* 语义映射。运行适配使用行内 SVG，源 SVG 的 foreignObject 结构保留供溯源。不得退回旧 ssx-design loading 或 CSS border spinner；不改生成物。

已覆盖 Loading/下拉刷新、Toast、Button/Dialog 动作和 Toggle 的标准环形加载；各调用方保持原有 18px 按钮、开关随尺寸变化的图标及 24/28/32px Loading、24/32px Toast。三点与显式自定义图形仍按自身类型展示。Light/Dark 与减少动效均需检查，真机/WebView 渲染另验收。

2026-10-23 用户确认场景例外（V）：我的页面常用功能、服务与帮助菜单为功能入口，前置图标使用本地lg=24px；尾部箭头保持md=18px，56px行高与12px图文间距保持。仅.my-menu作用域覆盖，不放大全局MenuCell/Cell/Input图标。

2026-10-26 更新迁移（V/D）：192枚包保留的187枚图形与上一版一致，新增gouwuche/xuexishangcheng/shoucang/shoucangxuanzhong/mic-ai-fill，移除heart/heart-fill。家长端底栏改用新增商城/购物车/收藏；客户列表意向级别改用shoucangxuanzhong，其他图标调用不变。原189枚包保留归档，当前运行及下载仅使用192枚包。

2026-10-26 座位图标更新：用户download (1).zip增加frame（座位），193枚无删除/改名/既有图形变化。网格座位使用32px图形、至少40px按钮，图例16px；选中图标上方显示座位号，颜色采用本项目语义状态。仅选座图场景，不改变普通单元格18px规范。

2026-10-28 播放图标更新（V）：新增 play-large-fill、pause-mini-fill、stop-fill；AI 记录详情回放使用前两枚替换 caret-right/stop，保留40px按钮及原播放状态逻辑。停止图标仅入库，不扩大页面替换范围。

2026-10-28 文件缩略图更新：206枚包新增wenjian1/shipin1/tupian1/excel/pdf/ppt/txt/word/yuyin/sparkling-2-fill；原196枚名称全部保留。沟通表单按类型使用对应彩色文件图标，未知格式统一wenjian1，图片仍直接预览，不扩大其他业务替换范围。

2026-10-28 V：208枚包新增a-delete-oneshanchu1、a-ailuyinzhuanxiesvg，无删除或改名。AI待处理及详情删除菜单采用垃圾桶；共用沟通表单AI原始记录卡采用专用文件图标。
