# 组件规范

## 单元格尺寸口径（2026-10-21 用户确认）

所有单元格标注高度均包含分隔线：输入、选择、普通信息行、单选/多选行统一按最终外框测量。56px 行加 1px 下划线后总高仍为 56px，不能变为 57px；48px、40px 同理。边框用 border-box 计入高度，或将线绝对定位在单元格内部 bottom:0；不得增加额外的分隔线兄弟节点占据行间高度。末行隐藏分隔线时也不能改变行高。多行内容自然增高，但分隔线依然计入最终高度。

## 首个业务页面组件

MobilePage 接收 title、children、footer、previewChrome 和 previewHistory（默认 true）；真实页面使用浏览器安全区，内容独立滚动，footer 不遮挡内容。previewChrome 仅用于对照 Figma，不提供真实微信容器功能。MenuCell 接收本地 IconName、label、onClick，保持 56px 行高与 18px 图标。TabBar 接收 items、active、onSelect，不自动改变路由。

## Button
主按钮统一使用 color.background.brand.bold（Light #2878E8 / Dark #409EFF），不提供 hover 状态，按下复用同一语义族的 pressed，不自行换成更深品牌色阶。
variant: primary / secondary / ghost / soft / outline / text，默认 primary；soft 为辅助色、outline 为线框、text 为品牌文字按钮。页面次要操作优先使用 soft（品牌浅底 + 品牌文字，Light/Dark 使用语义映射），包括筛选/选择弹层的重置/取消、页面重试及常规次要按钮（2026-10-21 用户确认）。secondary 保留白底中性描边作为显式例外，ghost 仍为轻量操作；不是将 secondary API 全局重新定义为浅蓝。默认 md 统一为 40px 视觉高、至少 40px 点击热区、8px 圆角、16px/24px 字号行高 / 400 字重；sm 为同高的紧凑文字版，lg 保留 52px，仅在明确业务需要时使用，不作为常用默认规格。
tone: brand / danger / warning；shape: default / round / square（默认保持项目圆角）。支持 block 通栏、icon（本地图标名称）、iconOnly（必须提供 icon 和 aria-label），loading/loadingText。加载时保留按钮颜色并显示旋转图形，阻止重复点击，不触发提交；设置 loading=false 后恢复。支持 ref 和标准原生 button 属性。disabled 与 loading 分开表达，减少动效时停止旋转。
对照 [Arco Mobile Button 文档](https://arco.design/mobile/react/arco-design/pc/#/components/button) 与 Figma 34:3824 的样式、形状与状态；2026-10-13 的 44px 默认高度已被 2026-10-20 用户最新确认的 40px 视觉基线替代；圆角 8px、400 字重保留；2026-10-22 默认字号已从 15px 迁移为 16px/24px。主、次、辅助色、线框及普通通栏/弹窗主按钮共用此规格；round/square 仍为显式特殊形状。项目沿用主题蓝，不引入 Arco 运行时。类型颜色仅应用在 primary、soft、outline、text 上，secondary/ghost 保留中性语义。
支持标准 button 属性。封装 Base UI Button；禁用不可操作，焦点可见，pressed 有反馈。默认 type=button，表单提交需显式指定 type=submit。

## Icon
name 使用 ssx-design 的 icon-names.generated.ts 类型，size: xs/sm/base/md/lg。label 为独立含义图标的可访问名称；装饰图标省略 label。点击区域由外层控件负责。

## Checkbox / CheckboxGroup

用户 2026-10-20 最后指定的标记尺寸来源为 [Arco checkbox-input 48:7862](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/Arco-Design-Mobile-Components--Community-?node-id=48-7862)，覆盖此前 TDesign 24px 标记基线。只调整该节点定义的标记几何与勾的状态表现；列表行与卡片沿用前一版布局。颜色继续消费项目 --color-* 语义色，勾使用用户指定的 Arco 581:10712 组件 SVG（selection-check），均通过本地 Icon；不引入第三方运行时。2026-10-20 追加：纯勾样式（variant="check"）的勾改用与单选列表一致的 ssx-design check 图标，不再使用 selection-check；半选横线改为 CSS 几何横线与勾笔画对齐。

- Checkbox：label 必填；可选 description、value、checked、onChange(checked)、indeterminate、disabled、readOnly、parent、variant（circle / square / check / card）、placement（left / right）、hideLabel、name。组内使用 value，独立使用 checked/onChange；不混用两种受控来源。description 自动关联 aria-describedby。
- CheckboxGroup：label、value:string[]、onChange(value)、children；可选 allValues、disabled、layout（vertical / horizontal / cards / card-row）。封装 Base UI CheckboxGroup，提供多选数组与组语义，不自动持久化。
- 全选：组声明 allValues，父项传 parent；使用 Base UI 的 checked / mixed / unchecked 联动。allValues 只列可操作项；动态业务需由页面提供可选范围，不能擅自包含禁用项。
- 标记槽位 20 × 20px，圆形可见外径 18px（内缩 1px），方形可见边长 16px（内缩 2px）、圆角 2px；圆形与方形恢复为底色叠加专用组件勾（selection-check），基础勾槽位 16px；纯勾槽位 16px，使用与单选列表一致的 ssx-design check 图标；不再使用上一版整枚 check-circle-fill。半选横线不再使用 ssx-design minus 图标（原 16px 内 12.7 × 1.3px，与勾的笔画粗细不一致），改为与勾同笔画的几何横线：基础与纯勾 10 × 2px、卡片角标 9 × 2px、横向卡片 8 × 2px，1px 圆角，颜色继承 currentColor。标记在 24px 文字行内上下各 2px 居中，文字间距 8px；单行 56px（上下各 16px、正文 16px / 24px），说明 14px / 22px、与标题间距 4px；多行自然增高，标记对齐首行顶部。
- placement 控制左右；circle 为默认，square 为 2px 圆角，check 为仅勾或半选横线、无底色边框，未选中仍显示中性浅灰勾，选中显示系统品牌色。horizontal 自动换行，长文案完整显示。
- card：6px 圆角、1.5px 选中边框、16px 内容内距；卡片间距 12px。带一行说明时高 82px，长内容自然增高；左上角勾选角标 28px（横向卡片 24px）。不使用固定高度裁切文字。
- 全行可点，独立 hideLabel 的根元素保持 20px，通过 .touch-target 透明伪元素扩展至少 40 × 40px，禁止撑大 flex 占位或负 margin；相邻独立标记需预留热区间距。
- 选中使用 color.background.brand.bold，半选横线与完整勾区分；禁用未选使用中性禁用语义色，已选使用系统品牌色淡化，不能改变值；readOnly 保留焦点、不可修改。Space 切换，Tab 独立聚焦，focus-visible 可见，无 hover。
- 仅新增公共组件与预览；SheetSelectionList 的草稿确认、人员列表批量操作等业务流程不自动迁移。组件预览所有状态仅存内存。

横向卡片多选尺寸（2026-10-21 用户确认）：CheckboxGroup layout=card-row 的单项最小视觉高 40px（单行文字），左右内边距 14.5px、上下 6.5px、含 1.5px 边框；40px 热区由 .touch-target 透明伪元素提供，不参与 flex 排版。长文本自然增高，不固定裁切。仅组件预览横向卡片组使用此组合，已迁移；垂直说明卡片与普通多选行保持现有尺寸。


## Toggle
label: string，checked: boolean，onChange(value: boolean)；可选 disabled、readOnly、showText、content: none/text/icon、size: sm/md/lg（默认 md）、loading、id、name。封装 Base UI Switch。showText 兼容已有调用，显式 content 优先；文字与图标位于滑块内，不改变轨道尺寸。

| 尺寸 | 轨道宽 × 高 | 滑块直径 | 四周内缩 | 文字 / 加载图标 |
| --- | --- | --- | --- | --- |
| sm | 39 × 24px | 18px | 3px | 12 / 15px |
| md（默认） | 45 × 28px | 21px | 3.5px | 14 / 17px |
| lg | 52 × 32px | 24px | 4px | 16 / 20px |

尺寸依据：用户于 2026-10-20 指定的 [TDesign Switch 25306:19394](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/TDesign-for-mobile--Community-?node-id=25306-19394)，覆盖此前 Arco 40 × 24px 基线。只参考几何与状态表现，颜色继续消费本项目 --color-* 语义变量，不引入 TDesign 运行时、色板或整张 SVG 开关。

开启使用 color.background.brand.bold，关闭使用 color.background.neutral.bold.disabled；滑块使用 color.background.inverse，文字/图标使用品牌或禁用语义色。禁用和加载沿用系统品牌色淡化与中性表面，明暗主题均可用。开关勾叉按用户指定的 [Arco 581:10712](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/Arco-Design-Mobile-Components--Community-?node-id=581-10712) 原始 16 × 16px SVG，通过 Icon selection-check / selection-close 显示，三种开关尺寸共用 16px 勾叉；加载图标通过本地 Icon loading 使用用户提供的渐变圆环（2026-10-21），保留既有尺寸。

Toggle 自带 .touch-target，绝对定位透明伪元素将热区扩至至少 40 × 40px，根元素保持轨道实际尺寸，不设置占位热区 或负 margin。调用方需保证相邻控件热区不重叠；组件预览行至少 40px、横向间距 24px。

disabled 不可切换；readOnly 保留焦点但不可切换。loading 保留当前 checked、显示滑块内加载图标、aria-busy=true，暂时只读防重复；由调用方结束加载或提交结果，不自行模拟后端成功。支持 Space、焦点可见和减少动效；无 hover。组件预览展示三种尺寸、基础/文字/图标、开关两态、禁用、只读和可结束的内存加载示例。

## Badge
count?: number（默认 0）、max?: number（默认 99）、dot?: boolean、bordered?: boolean、showZero?: boolean、label?: string、children?: ReactNode。红点 8px，数字高 16px、12px/500 字号，胶囊圆角；描边为 1px 白色，增加到 10px/18px。超过 max 显示 max+，默认 0 隐藏，showZero 可显示 0。负数按 0、非有限数字按 0、小数向下取整。传 children 时叠放在右上角；徽标不拦截点击，外层按钮负责交互与触控区。默认无障碍标签保留完整未读数量，可用 label 指定业务含义。
参考 [Arco Mobile Badge 35:5980](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=35-5980)，复用本项目危险色与主题语义变量，不引入 Arco 运行时。

## Cell / CellGroup
参考 [TDesign Mobile Cell 25074:19290](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/?node-id=25074-19290)，保留既有 Arco 基础组件的公开调用兼容。Cell 接收 label、description、overline、leading、value、arrow、multiline，补充 required 与 media（avatar 默认 / image）。required 星号置于标题右侧，间隔 4px，提供“必填”读屏说明；仅表示字段要求，校验与选择行为由调用者处理，不自动新增业务规则。

已确认尺寸仍优先：基础单行最小 56px（含分隔线）、左右 16px、装饰图形 18px、图标槽 24px、头像 32px、图标与文字间距 8px；正文 16/24。TDesign 补充的候选组合基线：标题/说明间隔 4px，说明 14/22，上下各 16px，双行自然高 82px；多行说明不再缩至 12px，不硬凑旧 74/90px。默认 description 单行省略，multiline 时换行；overline 为 12/20，多行内容自然增高。说明行前置图标/头像与标题顶端对齐，尾部操作垂直居中。media=image 将 leading 中的图片展示为 48px、圆角 8px 缩略图；头像默认 32px 不批量放大。

value 可组合本地 Badge、文字等展示内容，最大 45%，避免挤出标题；不为徽标另造状态 API。传 onClick 时使用原生 button，支持 disabled、键盘和按下反馈；control 插槽用于 Toggle 等独立控件，与 onClick/disabled 互斥，保持非按钮容器，禁止嵌套交互控件。leading/value 只放展示内容；禁用行的标题、说明和装饰图片共同弱化。

CellGroup 接收 children、可选 label 及 variant=card（默认圆角）/block（通栏无圆角）；分组只决定容器样式，外边距由页面决定。统一背景与左右各缩进 16px 的行内分隔线，末行无线。当前全部调用点为组件预览：已有 7 个基础样例，新增 4 个必填/图文样例与 3 个通栏样例；均是内存反馈。业务 MenuCell 保留既有行布局，本次没有迁移人员列表或表单字段。

迁移状态：基础 Cell/CellGroup 已为 Recommended；required、media、block 及 TDesign 说明组合先作为候选扩展，待真实页面验证后再升格，不据预览重复注册新公共组件。输入/选择表单的标签列、值排版与校验状态仍见下方混排审查。

## Popover
封装 Base UI Popover；trigger 为本地按钮 ReactElement，content 为说明内容。appearance: light/dark，placement: top/top-start/top-end/bottom/bottom-start/bottom-end；可选 closable、action（label/onClick/style: button 或 text），open/onOpenChange 可受控。不依赖 hover，支持点击外部、重复点击触发器、Escape 关闭，关闭回焦。定位支持碰撞避让、12px 视口边距，六种位置为优先位置，空间不足时可自动翻转。
参考 [Arco Mobile popover 45:2873](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=45-2873)，4px 圆角、14px/20px 文字、12×8px 内容边距、14×6px 箭头。白/黑外观使用专用语义 token，不随页面主题互换；白色操作按钮使用项目主题蓝。带操作或关闭时保留 44px 触控尺寸，因此气泡高度随操作增大。轻量、非模态，不替代确认对话框。action 执行后关闭气泡。

## BottomSheet
open: boolean，onOpenChange(value: boolean)，title: string，description?: string，children: ReactNode，footer?: ReactNode，header?: ReactNode，className?: string，finalFocus?: RefObject<HTMLElement|null>。
封装 Base UI Drawer，支持滑动、遮罩、关闭按钮和 Escape；子级负责草稿/确认逻辑。外部触发器通过 finalFocus 明确回焦。
最大 85dvh；手机全宽，桌面最大 560px；统一 16px / 24px / 500 居中标题、18px 关闭图标、40px 关闭触控区、16px 水平内容边距。内容区域独立滚动，footer 位于滚动区域之外，操作和安全区保持可见；操作区使用 SheetActions（单按钮全宽、双按钮等宽）。隐藏滚动条但保留触摸、滚轮和键盘滚动；包含 VirtualKeyboardProvider。
文字标题与说明必须有意义；滚动与手势在真机检查后再声明兼容通过。

## InfoDialog
居中说明弹窗，封装 Base UI Dialog。open、onOpenChange、title、children、finalFocus；311px 宽、16px 圆角，短屏内容可滚动。底部「知道了」关闭，支持遮罩和 Escape，焦点限制在弹窗内并回到外部触发器。用于仅收款使用说明。
可通过 className 与 footer 配置页面专用宽度和操作区；不传 footer 时保持「知道了」。收费管家开通弹窗宽 340px，窄屏按左右 16px 边距收缩。

## ActionSheet
参考 [Arco Mobile ActionSheet 99:10696](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=99-10696)，保留本项目语义色和共享遮罩。顶部圆角 8px、动作文字 16px / 400 / 1.4、16px 行内边距、行间 1px 细线、底部取消与动作组间隔 8px。没有右上角关闭图标、拖动条或可见标题栏；title 作为可访问标题隐藏，可选 description 显示 14px / 20px 说明。

封装 Base UI Drawer，Props 为 open、onOpenChange、title、description?、actions、cancelText?（默认取消）、finalFocus?。ActionSheetAction 为 label、disabled?、danger?，以及 href（可选 onSelect）或 onSelect 回调二选一。href 链接保持原生导航，回调动作在页面执行；选择有效动作后关闭，不维护选中状态。危险动作仅提供语义危险色，是否先确认由业务决定；示例删除仅为内存反馈。禁用项使用原生 disabled 按钮，不渲染可导航链接、不触发回调。标签自然换行，长列表只滚动动作区，取消固定并避让安全区。

支持遮罩、Escape、滑动关闭和回焦；动作面板作为 InfoDialog 的子组件嵌套时，取消返回父弹窗。共享 sheet-viewport 将动作面板和遮罩裁切在微信应用区域内，现有客服电话 href 调用兼容。组件预览提供基础、带说明、危险/禁用、长内容四个示例。

## Loading / PullToRefresh（2026-10-21 候选扩展）
参考 [TDesign Mobile Loading 25154:20821](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/?node-id=25154-20821)。Loading 支持 variant=spinner/dots/text，size=sm/md/lg 对应 24/28/32px 图标、12/20、14/22、16/24 文字；横向图文间距小/中 6px、大 8px，纵向统一 6px。三点默认 8px 圆点、8px 间距（sm 共 40px），随 size 成比例变化。颜色只用项目语义变量，spinner 和自定义 icon 使用本地 IconName；不照抄参考图的品牌蓝。tone=brand/subtle/inherit；layout=horizontal/vertical；text 为可见文字，纯图标通过 label（默认“加载中”）保持读屏名称。status=error 时显示失败说明、可选 onRetry；重试开始/结束由调用者负责。减少动效时停止旋转与闪烁，仍保留可见图形和文字。不将单元格 18px 图形规则套到加载状态上。

PullToRefresh 绑定已有滚动容器 scrollRef，不包裹内容，不更换业务滚动层。刷新指示器必须位于页面固定顶部栏下方：意向客户放 Search 后、数量栏前；学员放分类 Tab 后、数量栏前。下拉与刷新时顶部栏保持原位，数量/批量操作栏随列表内容下移；不能把指示器统一放在搜索/Tab 之前。onRefresh(signal) 返回 Promise，resolve 后完成、reject 后失败；AbortSignal 在卸载时取消任务。disabled 可阻止触发；successText 可明确模拟反馈。仅在容器顶部开始识别单指向下手势；横向、向上、多指、取消手势与原生输入区域不触发。桌面预览支持鼠标拖动；另有键盘可聚焦的“刷新当前页面”入口，聚焦后显示 40px 操作，不常驻占高。

刷新提示区背景保持透明，沿用所在内容区底色，不单独使用 page 色制造与列表的色差（2026-10-21 用户确认）。共享调整同步六个业务页和组件演示，不改页面各自背景 token。

候选几何与行为：下拉位移采用 0.5 阻尼，64px 显示位移为释放阈值，最大 96px；刷新中状态区 56px、完成/失败保留 1200ms 后收起。未达到阈值直接回弹。任务进行中不重复发起；指示器不扩大页面外壳边界，不改变 Search/Tab 的既定吸顶策略。失败可再次下拉或用键盘入口重试；不重载浏览器、不清空业务筛选或编辑草稿。后续真机验证后才能将这些手势参数升格为正式规范。

迁移记录：Loading 已用于组件预览、刷新指示器及学员页 state=loading。组件预览有成功/失败刷新演示与完成计数。MobilePage 提供可选 onRefresh、refreshDisabled、refreshSuccessText；children 可用函数接收 refreshIndicator，在页面固定顶部栏之后显式插入；没有业务固定栏时继续使用默认首部位置。首页、我的、学员、意向客户、出勤率 v1/v2 六个调用点已接入 src/preview/simulateRefresh.ts（700ms 演示），只显示“模拟刷新完成”，不请求生产接口、不重建或回滚已编辑的模拟数据。意向客户批量模式、两页无权限状态禁用刷新；权限、原失败示例、搜索、排序、Tab 与本地修改保持。按钮、Toggle 和 Toast 保留各自加载尺寸和交互，现已统一通过 Icon loading 使用用户提供的渐变圆环（见 iconography.md）；不强制改为 Loading 的 24/28/32px 布局。

## Toast
参考 [TDesign Mobile Toast 25169:19856](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/?node-id=25169-19856)。文字 14px / 22px / 400、6px 圆角；纯文字与横向图标提示上下 16px、左右 24px，横向图标 24px；纵向图标提示四边 24px、图标 32px。图文间隔 8px。单行纯文字高 54px、单行横向图标高 56px、单行纵向图标高 110px；不将表单单元格的 56px 或 18px 图标规则套在 Toast 上。

颜色沿用 --color-toast-surface / --color-toast-text，Light/Dark 都保持现有 80% 黑底白字，不照抄 TDesign 的 90% 背景。状态图标由本地 Icon 的 check-circle / close-circle / exclamation-circle / loading 提供；loading 已覆盖为用户提供的白/蓝角度渐变圆环，尺寸仍为横向 24px / 纵向 32px；通用图标通过 IconName 传入，例如 cloud-download。旧 public/components/toast 资产留存，当前渲染不再调用，不引入新图标库。

ToastProvider 已接入应用根；useToast 从 src/components/ui/useToast.ts 导入，showToast({ message, type, duration, layout, icon })。type 为 text（默认）/success/error/warning/loading；layout 为 horizontal/vertical，默认 vertical，兼容既有图标上下排布；纯文字不产生图标占位。icon 可传本地 IconName，覆盖状态默认图标；默认无需手动传 icon。

默认普通提示 2000ms，loading 为 0（主动关闭），duration 可覆盖；closeToast() 关闭当前提示。空文字仅允许 loading，屏幕阅读器仍播报“加载中”；重复触发替换当前提示并重置计时，替换时同步清除旧布局和图标配置。非模态、不拦截触摸、不移动焦点；Base UI 负责消息播报和计时，失败消息优先播报。居中显示并保留视口至少 24px 边距；正文约十个汉字宽，建议内容最多三行，超长内容仍完整换行，不用省略号隐藏错误原因；复杂说明应由业务选用说明弹窗。加载旋转尊重减少动效。

迁移记录：共享文字排版、间距和圆角同步组件预览、首页、学员管理及意向客户管理的全部 useToast 调用点；既有业务消息、计时和回调不改。组件预览新增横/纵四种状态、自定义图标、纯加载组合。横向布局和自定义图标是本次候选扩展，目前由预览验证，业务调用仍沿用既有默认形式；没有新接后端或制造下载业务。

## PreviewStatusBar
仅为桌面手机外壳中的组件预览展示静态 9:41、信号和电量；54px 高，为灵动岛预留空间。工作区手机外壳通过 chrome=status 启用，无外壳和独立手机地址不携带该参数。深色主题反转原始状态栏素材以保持可读。

## Radio / RadioGroup
按用户 2026-10-20 最新指定的 [Arco .radio-input 578:10673](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/Arco-Design-Mobile-Components--Community-?node-id=578-10673) 校准：20 × 20px 占位、18px 可见圆形外径，与 Checkbox circle 的占位和外径一致；选中圆点保持 12px，8px 图文间距、16px/400/1.4 文字。默认 dot 圆点；variant=list 为右侧无圆圈的独立勾，仅已选项显示；原 check 圆圈对勾仅保留兼容，新增单选流程不采用。主题蓝继承本项目，不使用 Arco 品牌色。标记按选中状态动态绘制，禁用背景与文字使用项目语义 token。variant=list 的勾使用 ssx-design check 图标并取主色 --color-icon-brand（与多选纯勾一致），不再使用文本可用级品牌色 --color-text-brand-accessible；选中行文字仍用 --color-text-brand-accessible 保证对比度。Root 自带 .touch-target，将 20px 根元素的命中区扩展至至少 40 × 40px；独立标记不占位 44px、不使用负 margin，示例相邻标记间距 24px；普通文字行随 --layout-touch-target 使用 40px 最小排版空间。长文字换行并与首行对齐。
RadioGroup 接收 label、value、onChange、children，以及 name/disabled/readOnly/required/className；Radio 接收 value、label、variant、disabled、hideLabel、className、onSelect（选项被点击时触发，可用于再次点击当前项后关闭即时选择弹层）。必须放在 RadioGroup 内，组内 value 唯一；hideLabel 仍以 label 提供可访问名称。封装 Base UI Radio/RadioGroup，支持键盘箭头切换与焦点样式；禁用不可切换。选择弹层采用该组件，取消保留旧选择，确认提交草稿。

## ProductTabBar
首页和「我的」共同使用的产品导航，封装 TabBar，统一 home-1-fill / user-3-fill 图标和活动状态。active 为 home/my；切换保持 theme/role/chrome/payment 等参数，清理报表返回来源 from，重复点击当前标签不重置页面。工作台功能图标占位不影响底部导航。



## 微信预览外壳
WechatPreviewHeader 显示时间状态栏、关闭按钮、title、当前域名及更多图标；关闭图标保留外观，实际操作为应用内返回；没有历史时返回首页并保留 theme/role/chrome，不退出项目预览。WechatPreviewHistory 显示本次预览路由的后退/前进，首次打开时隐藏，出现历史后按可用方向启用；首页和「我的」显式设置 previewHistory=false，即使已有历史也不显示底部前进/后退栏，保留透明 Home 指示条。PreviewHistoryProvider 在路由根部记录本应用 history key；报表明细使用 view=detail/group 路由参数以支持浏览历史。两者仅由 MobilePage 的 previewChrome 启用；手机链接不含 chrome=wechat，业务页面不重复绘制微信导航。更多仅为外观占位，不模拟微信原生菜单能力。

## Collapse / CollapseItem
封装 Base UI Accordion，参考 Arco component/item 44:1825。基础标题 16px/400/24px、单行总高 56px（包含分隔线）、左右 16px、上下 16px，内容 14px/20px、12px 内边距；触控至少 40px。列表式分隔、卡片式 8px 圆角及 12px 组间距。
Collapse 接收 children、label、variant:list/card、value/defaultValue（string[]）、onChange、multiple（默认 false）、disabled、className。CollapseItem 接收唯一 value、title、children、leading、suffix、summary、disabled、arrow:down/right、triggerLabel、className、triggerClassName。title/leading/suffix 仅展示，不嵌套交互控件；summary 独立于触发按钮，保持可见，children 为可折叠内容。受控与非受控二选一，组内 value 唯一。
原生按钮支持 Enter/Space、可见焦点及禁用；Base UI 管理 aria-expanded、aria-controls 与面板关联。内容自动高度过渡，减少动效时关闭过渡；关闭时卸载内容，业务需保留的数据放在上层。
出勤率使用 card 变体，统计摘要常驻、详细统计折叠；受控单项展开，日期/筛选/维度切换仍由页面清空展开值。

微信外观预览中，弹层和居中对话框的遮罩/定位范围避让模拟顶部 98px、底部 Home 34px（有浏览历史时含 44px 浏览导航及 1px 分隔线，共 79px）。这些边界只在 with-preview-chrome 页面生效；手机独立页面使用正常全视口和真实安全区。

公共 sheet-viewport 与 info-dialog-viewport 裁切溢出内容：底部弹层在入场、退出和拖动过程中均不会越过应用视口覆盖微信外壳；遮罩也只位于同一应用视口。

单选弹层两种模式：即时单选使用 list，点击立即生效并关闭，无取消/确定 footer；关闭或遮罩不修改值。需要确认的单选使用 dot，操作草稿，确定才提交，取消保留原值。多选流程不受此规则改动。

## 上拉浮层内容组合 · 2026-10-15

BottomSheet 继续统一外壳、微信视口边界、动画、焦点恢复和滚动锁定。标题统一 16px / 24px、500，内容区左右 16px，操作区固定；业务内容不另设嵌套滚动容器。取消出勤页的 16px 标题覆盖与页面选项样式。

`src/components/ui/SheetContent.tsx` 提供以下组合，不维护业务草稿或主动关闭：
- SheetSelectionList：label、options（value/label/disabled）、value。单选使用 onChange、可选 onReselect（再次点击当前项）；indicator=list 为右侧勾的即时单选，indicator=dot 为需确认单选。multiple=true 时 value 为 string[]，使用 onToggle，由调用者处理全部、互斥和至少一项等规则。选项行最小 48px（2026-10-21 用户确认，取代 44px；弹层单选/多选列表单元格统一 48px，与排序弹层一致；chip 网格 SheetChoiceGroup 为 40px（2026-10-21 用户更新））、15px / 24px，长名称自然换行，无 hover；多选选中无底色块，使用强调文字和右勾，单选 list 只显示右勾。
- SheetChoiceGroup：label、options、value:string[]、onToggle、hint/error；选项文字统一 14px/22px（2026-10-23 用户确认），与 DateRangeFields 快捷项共用 .sheet-choice-option 样式，36px 单行视觉高度、至少40px热区；未选中可用项背景使用 --color-background-neutral-subtle（2026-10-21 用户要求较原 subtlest 加深一阶），选中保留品牌浅底/边框，禁用保留 subtlest/disabled 文字；两列选择块，自动关联组标题和说明，错误播报；校验保留在页面。
- SheetActions：primary 必填、secondary 可选，每项含 label/onClick/disabled；一个按钮全宽，两个按钮等宽排列。通过 BottomSheet.footer 传入。

四种实例分别为即时单选、确认多选、分组筛选、日期表单；日期字段和快捷时段仍由业务页组合。无底部按钮的即时单选点击提交并关闭；其他模式关闭不提交。组件预览补齐即时单选、多选和分组筛选示例，确认单选继续使用圆点。

### 上拉浮层操作规范 · 用户确认 2026-10-15
- 筛选：重置 / 确认。重置仅修改草稿，确认提交。
- 即时单选：无 footer，点击提交并关闭；已选项右侧独立勾。
- 需确认单选：取消 / 确认，使用圆点标记；取消不提交。
- 多选：取消 / 确认；取消、关闭、遮罩均不提交，不使用“重置”替代取消。
- 公共标题 16px / 24px / 500；关闭使用 Icon md（18px），外围点击区域保持 40 × 40px。
- 日期表单仍可按用途只放“确认”；本次不改变既有快捷时段行为。

## WheelPicker · 滚轮选择器

公开入口 `src/components/ui/WheelPicker.tsx`，本地原生滚动和 CSS scroll-snap 封装，不依赖新增图标或第三方 UI 库。用于短标签、有序、有限数量的单项选择；班级/课程搜索、多选及筛选继续使用列表或选择块。

API：label 为组名称；columns 为 `{key,label,options,disabled?}[]`；options 为 `{value,label,disabled?}[]`；value:string[] 按列对应，onChange(next:string[]) 返回当前组合。每列 key/value 唯一，正常状态由调用方传入有效、未禁用的值；空列显示暂无选项。每列为带可见标题的 listbox，选项提供 aria-selected/aria-disabled；方向键跳过禁用项，Home/End 到首尾有效项；点击和原生滚动可选择，停止后居中吸附。44px 行高、5 行可见、16px 普通字体、400 字重；中间两条细线标记选中行，整列上下使用语义表面色渐隐，默认隐藏可见列标题但保留可访问名称，showLabels=true 可展示 12px/20px 列标签，色彩使用语义 token，无 hover 和自动循环。

WheelPicker 本体不包含按钮，只更新传入的受控值；内联使用可即时更新。放入 BottomSheet 的弹窗示例使用草稿，由 Picker 的顶部操作栏提供取消/确认，确认才提交，取消/遮罩/Escape 不提交。多列独立选择；联动选项和下级值重置由调用者负责，组件不内置日期或地区规则。示例包括禁用项的单列时长、两列时间、省市联动，均为弹窗草稿确认模式。组件预览仅内存模拟。

滚轮的局部纵向滚动是选择交互本身，不是另套一个内容列表；隐藏滚动条，保留触摸、滚轮与键盘操作。组件不做惯性/3D 仿真，不加载网络字体。真机 iOS/Android 惯性、微信 Drawer 手势与屏幕阅读器需单独验收，桌面仿真不代表通过。

即时单选 list 与多选列表的选中勾统一使用本地 Icon check / sm（14px），20px 居中标记槽位及 text-brand-accessible 语义色，不再使用 CSS 描边绘制单选勾；确认单选 dot 不变。

## Dialog · 通用对话框

参考 [Arco Mobile Dialog 120:11252](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=120-11252)。`src/components/ui/Dialog.tsx` 组合现有 InfoDialog 和 Button，不新增第二套 Portal/遮罩/焦点逻辑；原有 InfoDialog 和收费管家自定义外观保持兼容。

Props：open、onOpenChange、title、children、variant?（ios 默认 / android / custom）、actions?、actionLayout?（horizontal / vertical）、finalFocus?。不传 actions 默认“知道了”，建议 1–3 项；多于两项自动纵向，自定义外观始终纵向。DialogAction 为 label、onSelect?、closeOnSelect?（默认 true）、disabled?、loading?、danger?。取消项不放业务回调，确认项显式放回调；选中执行回调后关闭，closeOnSelect=false 可保留弹窗，异步状态由调用方通过 loading 控制。组件不内置接口或删除操作。

视觉：270px 宽并受容器约束；iOS 顶角 8px，内容 20px×16px，17px/500/1.4 标题、15px/400/1.4 居中正文、4px 标题正文间距，底部 16px 操作文字及细线。Android 4px 顶角、24px 水平内边距、17px Regular 标题与正文左对齐，按钮靠右。custom 8px 顶角、圆角实心主按钮和可选弱按钮。颜色使用本项目语义变量，不采用 Arco 品牌蓝。按钮触控至少 40px，因此 Android 文本按钮和 custom 按钮高度遵循项目移动端底线，未缩成旧稿的纯文字行高。

长正文独立滚动，按钮固定；支持 Escape、遮罩关闭、焦点限制/恢复，微信预览沿用应用区域裁切。无 hover。组件预览提供稿中七种按钮/外观组合及长内容示例；状态仅在内存。真机软键盘与屏幕阅读器另行验收。

## Picker · 经典滚轮弹窗（2026-10-15 用户澄清）

参考 [Arco Mobile Picker 130:12122](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=130-12122)。不要把它做成默认 BottomSheet 标题栏＋底部操作区：经典结构是顶部左取消、中标题、右确认，下面直接为 220px 滚轮视图，无拖动条、右上关闭图标、说明段落或底部按钮。4px 顶角，标题按用户移动端弹层规则保持 16px（选中稿为 15px），操作文字 15px、触控 44px。选中行无底色块和加粗，两条细分隔线贯通各列；上/下透明度渐变复用语义 surface，适配 Light/Dark。

`src/components/ui/Picker.tsx` 组合 BottomSheet 的 header 插槽与 WheelPicker。Props：open、onOpenChange、title、columns、value（草稿）、onChange、onConfirm、confirmDisabled?、finalFocus?。调用方在打开时复制正式值到草稿，负责联动与提交；取消、遮罩、Escape 仅关闭。Picker 不内部复制草稿，以便业务校验和联动。BottomSheet 的 header 插槽替换默认拖动条/标题栏，同时保留隐藏 Drawer.Title 作为可访问名称；其他浮层不传此插槽，原布局不变。微信视口边界、滚动锁定、裁切动画和回焦仍共用。

## PopoverMenu · 气泡菜单

来源：[Ant Design Mobile 气泡菜单页 4:99](https://www.figma.com/design/oYpPxX1OgLSbDfjaucWhBU/Ant-Design-Mobile?node-id=4-99)，具体黑/白状态节点 233:12394、233:12530。原稿为双倍尺寸，映射为最小宽 145px、8px 圆角、最小 51px 操作行、16px/24px 普通文字、20px 图标与 8px 图文间距（2026-10-22 用户更新），分隔线从文字起点开始。深色背景 90% 黑，浅色沿用白气泡语义表面；按下态、边线与阴影使用语义色及混色。图标使用本项目 Icon；稿内灰色方块是图标占位，不作为图标资源。深色图标归一为单色，避免原矢量固定灰色在深背景上不可读。

公开入口 `src/components/ui/PopoverMenu.tsx`，封装已安装的 Base UI Menu，区别于说明型 Popover。Props：label（菜单可访问名）、trigger（本地按钮）、actions、appearance?（dark 默认 / light）、placement?（默认 bottom-end，支持 top/top-start/top-end/bottom/bottom-start/bottom-end）、open?、onOpenChange?。每项含唯一 key、label、icon?（IconName）、dot?、disabled?、onSelect?。动作触发回调后关闭，不表示持久选中状态。红点附带“有新消息”可访问名称。

只点击/键盘打开，无 hover 状态或遮罩；外部点击和 Escape 关闭，执行后回到触发按钮，边缘自动避让。Base UI 管理 roving focus 与键盘字符导航；禁用项允许获得焦点供读屏识别，但 Enter/点击不执行、不关闭。正文长名称换行，菜单滚动隐藏滚动条。

原始箭头与红点 SVG 保存于 public/components/popover-menu；红点继续按 0.5 比例在包装槽内显示，约 10px（深色含白描边 12px）。2026-10-22 箭头改为 14×6px CSS 三角，使用与面板一致的 --menu-surface；根据实际 data-side 朝向锚点，放在面板外侧，不叠加半透明 SVG 形成深色缺口。原箭头 SVG 仅保留为参考资产，无临时资源地址运行依赖。浅深色菜单、纯文字/图标/红点禁用与六种定位示例位于组件预览。业务示例只更新内存反馈，不调用真实扫码/通讯功能。

## SideDrawer
本地封装 Base UI Drawer。open/onOpenChange、title、children、footer、finalFocus；从右侧进入，最大 420px、窄屏 88% 宽。复用 BottomSheet 的产品视口边界、遮罩、焦点、键盘避让和滚动区，底部操作固定。意向客户与学员管理筛选共用，样式位于 SideDrawer.css；不改变 BottomSheet 默认行为。

## Search 搜索框

本地 `src/components/ui/Search.tsx`，由学员管理与意向客户两页共用。参考 [TDesign Search 25328:19716](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/?node-id=25328-19716) 的基础方形款实例 27771:32133（2026-10-20 读取设计上下文与截图）。只参考尺寸与组合，不引入 TDesign 依赖、字体、主题蓝或图标资产。

- 外层 Search 整组高 56px、左右 16px；内部输入区高 36px、上下各 10px（2026-10-21 用户更新，取代此前 40px）、左右 12px、圆角 6px。搜索图标与清除图标沿用当前 16px，清除使用本地 close-circle-fill 实心圆底叉号，文字 16px / 24px / Regular 400，图标与文字间距沿用当前 8px。
- `value`、`onValueChange(value)`、`label` 为必填；可传 `placeholder`、`clearLabel`（默认“清除搜索”）、`actions`、`className`。无障碍名称由 label 提供，占位文字不替代名称。
- 输入即时回传，不新增提交/取消流程；非空显示清除按钮，清除后回焦输入。正常、聚焦、输入状态共用几何；焦点描边、文本、底色消费本项目语义 token，无 hover。
- 清除及配套图标操作保留至少 40×40px 命中区，40px 热区比 36px 输入区上下各延伸 2px，仍在外层 56px 范围内。搜索本体用原生受控 input，未直接使用 Base UI。
- actions 是排序/筛选等配套操作槽，不将其业务状态和回调搬进 Search；外层给操作组预留 8px 间距。操作采用现有 36px 布局槽并通过 .touch-target 扩到 40px，垂直居中，不据此撑高搜索整组。
- sticky、业务筛选、分类 Tab、数量栏由页面控制；组件不接接口，不修改路由。两页的排序/筛选按钮及资源保持原调用，搜索及清除图标统一使用本地 Icon。
- “搜索框”指整个 Search 组合；“输入区”指内部 36px 灰底区域。该组件采用新参考稿的 56px，取代此前顶部 48px 决定；当前两页的第二层分类 Tab 为 48px、数量栏为 40px；独立第一层 Tab 则为 56px，页面组合细则见 page-patterns.md。不是通用表单 Input 默认高 48px 的全局替换。
- 弹层首行复用（2026-10-21 统一）：Search 作为 `.sheet-content` 的首个直接子元素时，内容区取消额外 12px 顶部内边距，Search 行高 48px、输入区 36px（上下各 6px），左右使用内容区既有 16px 留白，Search 不重复增加水平内边距。搜索与紧随的选项列表不额外叠加间隔。由公共弹层 CSS 统一识别，不再使用页面级负 margin 或高度补丁；非首行 Search 和页面顶部 56px Search 保持各自布局。已核对中心名称、主责任人及出勤率 v1/v2 班级/课程搜索；原有 sticky/滚动、选择与清空回焦行为不变。
- 组件预览提供可输入、清除和回焦的示例；两个业务列表验证带 actions 的组合。更换图形、居中/圆形外观、取消按钮等扩展未在本次引入。

Search 颜色修正（2026-10-20）：搜索图标、占位文字和清除图标共用 `--color-search-placeholder`，对应参考稿的 40% 中性色（Light 黑色 40%，Dark 白色 40%）；已输入文字继续 `--color-text`。禁止借用正文辅助色，或为搜索框改写全局 text.placeholder。此为占位提示色，不宣称达到正文文字对比度。

底部操作区统一（2026-10-20）：页面底栏与弹层底栏同属一套几何，样式集中在 `src/styles/product.css` 的共享块（`.product-footer` / `.sheet-footer` / `.prospect-footer`），暂不封装组件，等待多种组合稳定后再决定是否组件化。按钮统一使用公共 Button 的 40px 默认高度；单行动作区高 56px（上下各 8px），safe-area 与微信 Home 指示器叠加在 56px 之外，不挤占内容高度；分隔线用 `inset 0 1px` 阴影绘制，不占布局高度。多行动作区（如批量操作）不套固定 56px，按内容自然增高，行间距 8px。横向留白默认 12px，弹层覆写 `--footer-padding-inline: 16px`。组合变体：`.product-footer--row` 横向排列，`.product-footer-actions` 为按钮栅格（默认两列，`--single` / `--triple` 切换列数）。通过 touch-target 保留至少 40px 命中范围。

Button 40px 基线（2026-10-20）：md/sm 视觉高度 40px，24px 行高配上下各 7px 内边距及 1px 边框；sm 仅紧凑文字与水平留白。组件默认添加 .touch-target，用绝对定位透明伪元素扩展至少 40px 点击范围，不参与 flex 布局，调用者无需额外包裹或重复设置热区。纯图标按钮同步 40×40px。lg 保留 52px，Picker 工具栏与 Dialog/Popover 专属操作行仍遵循其显式组合尺寸。共享调用点已检索；不修改回调、加载和禁用行为。


## Input（候选 API，TDesign 输入框参考基线）

本地入口 `src/components/ui/Input.tsx`，封装 Base UI Input；页面不直接导入底层库。参考 [TDesign Mobile Input 25427:20369](https://www.figma.com/design/Bfd7IgvXOOyyD7q2ComKCT/?node-id=25427-20369)，只参考布局和尺寸，颜色沿用本项目语义 token，字重使用 400/500，不复制参考稿 600。横排、垂直、标签外置为字段布局，和页面顶部导航 56/48/40 层级无关；Search 仍是独立搜索组合。

- 受控 `value: string` / `onValueChange(value)`；`label` 必填，默认关联原生 input。`hideLabel` 只视觉隐藏，保留可访问名称。`required` 原生必填，星号统一跟在标题右侧、间隔 4px，标题左端与非必填行对齐（2026-10-21 用户确认）；`optional` 为选填文字，和 required 同时传入时以 required 为准。
- `layout`: horizontal 默认基础行 56px，左右各 16px，标签 81px，标签到输入区间隔 16px；文字 16/24。长标签及说明自然增高，不截断。`vertical` 为基础 86px，标签 14/22、间隔 8px、输入 16/24。`external` 标签 12/20、间隔 8px，输入区域 48px、圆角 6px、左右 16px；它细化原有通用表单 48px 基线，不改变 Search 输入区 36px。
- `description` 12/20，横排/垂直间隔 4px，外置间隔 8px，通过 aria-describedby 关联。`status`: default / success / warning / error，图标和说明共同表达，error 设置 aria-invalid；状态由调用方传入，不自行验证业务数据。
- `clearable` 清空受控值并恢复焦点；`type=password` 提供显隐切换。禁用和只读均不允许改值，只读可聚焦、复制和查看密码。可传原生 `name` / `autoComplete` / `inputMode` / `maxLength` / `readOnly` / `disabled` 等属性。
- `leadingIcon: IconName` 为字段含义图标，位于标题左侧，图形 18px、与标题间隔 8px；`prefix` / `suffix` 是输入值的前后缀，组合文本、本地 Icon 或本地 Button；电话、验证码、金额、数量属于组合示例，不注册为业务组件。多图标间隔保证 40px 热区不重叠；状态及密码图标视觉 18px；清除图标为 18px，使用更浅的 --color-icon-placeholder，保留 24px 布局槽与 40px 热区。状态图标使用本地 check / exclamation / close 无圆底图形。扩大点击热区使用 .touch-target，不增大 flex 布局盒。示例内发送验证码按钮参考稿视觉 28px、圆角 6px、文字 14/22，热区仍 40px，仅是 Input 内紧凑操作的候选特例，公共 Button 默认 40px 保持不变。

迁移记录：组件预览“名称”字段已使用 external Input；新增输入框示例覆盖三种布局。Search、意向客户编辑表单、出勤率日期等现有业务字段暂未迁移；后续按字段校验、键盘及提交语义逐项核对。当前 API 为 Candidate，待真实业务表单验证后再升级 Recommended。短信/后端校验未接入，验证码按钮只显示本地演示反馈；真机软键盘、安全区和自动填充另验收。


## Input 与选择型 Cell 的表单混排审查（2026-10-21）

共同项：本地入口、语义颜色、左右 16px、主标签 16/24、可见标签、禁用与键盘支持；交互不同：Input 编辑文本，选择 Cell 整行触发选择器，control Cell 承载独立开关，不可为了外观统一而改成嵌套按钮。

| 对照项 | Input horizontal 当前实现 | Cell 当前实现 | 审查结论 |
| --- | --- | --- | --- |
| 基础行 | 56px | 56px | 2026-10-21 与折叠标题统一 |
| 标签与值 | 标签 81px，间隔 16px，值左对齐 | 标签占剩余空间，值右对齐且最大 45% | 通用 Cell 布局不适合直接对齐表单输入列 |
| 值字号 | 16/24 | 14/20 | 表单混排存在字号差异 |
| 辅助说明 | 12/20，基础行增加 24px；错误说明关联输入 | 14/22，标题间隔 4px，上下 16px，双行 82px；默认单行省略 | 通用信息行与字段说明职责不同 |
| 状态 | 必填、选填、成功/警示/错误、只读/禁用 | disabled、required 标记；无字段校验 API | 不能宣称表单字段状态已统一 |
| 分隔线 | 1px，左右各缩进 16px | 1px，左右各缩进 16px | 2026-10-21 已按用户要求统一 |

候选（未实施、未确认为正式规范）：为表单选择行增加显式布局模式，优先对齐横排 Input 的 56px、81px 标签、16px 间隔、16/24 值字号；通用导航/信息 Cell 保留其右对齐语义。确认字段说明、必填、错误及外置/垂直布局需求后再确定 API，不因两个示例就抽取 FormField。标签列、值字号和字段状态仍只审查和记录，尚未迁移业务表单；基础单行高度与分隔线已按后续用户要求统一。

40px 最小热区迁移：layout.touchTarget 源 token 与 .touch-target fallback 已改为 40px；依赖 token 的 Button/Toggle/Radio/Checkbox/Input 小操作与公共 icon-button 随之更新。显式 44px 的微信外壳、滚轮、旧业务字段等实际布局尺寸不因“最低值降低”而批量缩小。筛选 chip 单行最小 40px、上下 7px（含 1px 边框），长文字自然增高；已覆盖学员、意向客户、出勤率 v1/v2 与组件预览的 SheetChoiceGroup 调用点。SheetSelectionList 与排序列表仍是另行确认的 48px。


### Input / Cell 分隔线与聚焦（2026-10-21 用户确认）

Input 横排/垂直行及 Cell 共享 FieldDivider.css：分隔线为 --color-border-lighter、1px，左右各缩进 16px，绝对定位且不影响行高。CellGroup 可连续组合 Input 与 Cell，按最终子项隐藏末行分隔线；输入示例组同样隐藏末线。已覆盖本地 Input 示例与 Cell 示例；外置标签的框式输入不额外绘制下划线。

Input 聚焦时只显示输入光标，普通分隔线保持原色/粗细，不使用品牌色下划线或焦点阴影；框式输入同样不增加品牌色聚焦边框，错误边框保留状态色。清除/密码按钮及可点击 Cell 的键盘焦点提示保留。其他表单混排差异仍按上方候选清单处理，本次没有调整行高、字号、标签列或选择行为。

Search 36px 迁移（2026-10-21）：已通过共享组件同步组件预览、学员管理、意向客户、出勤率 v1/v2 浮层搜索。外层 56px、列表滚动策略、排序/筛选操作和搜索清空回焦行为保持原定义；本次只改变内部几何与清除图形。

折叠标题高度统一（2026-10-21）：普通单行 Collapse 标题在收起/展开时均为 56px，与横排 Input、基础 Cell 一致；左右 16px，上下 16px、文字 16/24，分隔线绘于内部底边并左右缩进 16px。列表末项收起时无线，不因有无线或展开态新增 1px。多行标题自然增高；带常驻 summary 的卡片高度包含额外摘要，不强制整卡 56px。出勤率 v1/v2 的专用统计标题覆写与无分隔线布局保留；已更新组件预览的 list/card 与基础 Cell。

单元格图标（2026-10-21 用户确认）：Cell、Input 字段、Collapse 标题和 MenuCell 中的装饰图形统一 18×18px，使用本地 Icon/md 与 CellIcons.css 槽位约束；前置、尾部状态、说明和箭头均适用。Cell 的 24px 前置槽保留，头像 32px、Toggle/Radio/Checkbox 控件、40px 点击热区及 56px 单行高度不随图形缩放。已迁移组件预览、我的功能菜单和出勤率 v1/v2 折叠标题中的图标，不改搜索及普通页面导航图标。

选填文字行盒修正（2026-10-21）：Input 的 12px 选填标签使用自身 line-height:1，保持与主标签基线对齐；不能直接继承主标签固定 24px 行高，否则大小字体的行内盒会共同撑高单行（本次浏览器复现 58px，用户截图为 57.5px）。只修正小字行盒，不用固定行高裁切长标签/说明。现有基础、必填、选填、前后缀及只读/禁用单行核对为 56px；说明/长标签 80px、垂直基础 86px、带说明 110px 等按组合自然增高。

字段图标位置迁移（2026-10-21）：账号示例由输入区 prefix 改为 leadingIcon="user"，图标放标题左侧。+86 国家码保留输入前缀，元/个等保留值后缀；密码显隐/状态/清除仍在输入区尾部。新增标题图标槽随横排/垂直/外置标签行高居中，不扩大单行高度，未迁移原生业务表单。

筛选选择块背景迁移（2026-10-21）：共享 SheetChoiceGroup 未选中背景从 neutral.subtlest 改为 neutral.subtle，Light/Dark 均使用主题映射，不改全局 token 值。已覆盖学员管理、意向客户、出勤率 v1/v2 和组件预览，40px 高度、选中/禁用和选择行为保留。

底栏空提示占位修正（2026-10-21）：客户筛选和批量修改曾在 .sheet-footer 中一直输出空错误段落，零高段落仍形成 8px flex gap，使单行动作区成为 64px；现仅在实际出错时渲染提示。标准无提示底栏仍是 40px 按钮 + 上下各 8px = 56px，安全区另加；有真实错误说明或多行操作时按内容增高，不能裁切提示来凑 56px。BottomSheet/SideDrawer 的所有 footer 调用点逐项核对；Picker 使用顶部工具栏，Dialog/InfoDialog/ActionSheet 的专用操作行保持各自规范，不将它们计作 SheetActions 标准工具栏已迁移。

次要按钮迁移（2026-10-21）：SheetActions 的 secondary 操作统一使用 Button soft，同步客户/学员筛选、中心/责任人选择、批量修改、两版出勤率及组件示例弹层；页面普通次要入口、重试及组件示例触发器改为 soft。Button 示例将“次要操作”展示为浅蓝，并单列“中性描边按钮”保留样式说明。平台 Dialog、ActionSheet、Picker 文字操作和 Popover 深色面板中的白底动作保留专用语义；报表蓝色头部覆盖保持。此次不改默认主按钮、危险操作、筛选 chip、尺寸或业务回调。

出勤率统计时段组合（2026-10-21，V/I 已迁移）：v1/v2 原共用页面级 AttendancePeriodFields；本轮已与客户筛选共同迁移至候选 DateRangeFields，复用本地 Button、Icon 与 WheelPicker。初始本月（月初至今天）；本月/上月（完整自然月）/最近30天（含今天）仅填充弹层草稿，明确选中态，确认才应用。起止日期始终显示；点击日期展开年/月/日滚轮，切换编辑开始/结束日期时保留另一端，滚轮修改日期后快捷项不选中。月末与闰日按目标月份收敛；起始晚于结束时提示并保留草稿，关闭/遮罩/Escape 不提交。两版已迁移，当前仅页面内存状态；其他业务日期字段未迁移，滚轮触摸与 WebView 待真机验收。

统计时段重置（2026-10-21，V/I/D）：用户确认保留“点击具体日期展开滚轮”的自定义入口，不额外增加自定义按钮。两版出勤率弹层底栏增加浅蓝底“重置”，只将草稿恢复为本月（月初至今天），清除日期错误并收起滚轮，弹层保持打开；确认后才应用，关闭不提交重置。底栏仍高 56px、按钮高 40px；其他日期场景不受影响。

### DateRangeFields · 候选共享日期区间字段（2026-10-21）

公开入口 src/components/ui/DateRangeFields.tsx。在出勤率 v1/v2 和客户筛选三个时间条件核对后抽取，Candidate；不把仅有两个场景的组合直接标为 Recommended。Props：today（调用方本地 ISO 日期）、period（本月/上月/最近30天/自定义/null）、value（[开始,结束] ISO 日期，支持空端点）、onChange(period,value)。只管理当前编辑端点与滚轮展开，不包含弹层、提交或重置；调用方重置时通过 key 重建来收起滚轮。日期运算和摘要位于 src/lib/date-range.ts，避免共享 UI 依赖出勤率业务目录。

快捷项高 40px，日期按钮高 48px、图标 18px；点击具体日期展开年月日滚轮，空端点初次点击以 today 填入该端点，另一端仍可为空，显示“请选择”。滚动修改置为自定义，月份/年份变化时截断无效月末日；控件空值与标题可访问名称同步。颜色使用语义 token，保留 Light/Dark。

业务差异：出勤率默认本月，重置恢复本月，必须两端都有日期；客户筛选默认不限，重置清空当前字段两端，允许单边界筛选。客户子弹层“确认”只回填父筛选草稿，关闭/遮罩/Escape 不回填；父筛选“确定”才应用，父关闭不应用。反向区间在子弹层提示并保留草稿。底栏共用 56px SheetActions 与 40px 按钮。

已迁移：两版出勤率统计时段；客户下次跟进/录入/上次沟通时间改为 56px Cell 选择行；客户号码归属地、备注改用横排 Input、可清空、白底及内置分隔线，长标签使用页面作用域 96px 标签槽；可配置文本/单日期字段改用现有 external Input。未迁移：其他业务日期字段、元数据单日期滚轮；组件预览暂未新增独立日期示例。真机键盘、滚轮与 WebView 仍待验收。

客户日期摘要数字对齐（2026-10-21，V/D）：三个时间条件的摘要启用 tabular-nums，保持现有 12px/18px、字体族及补零格式。摘要列在当前客户单元格内放宽可用宽度，360px 下仍单行右对齐、无溢出；该宽度覆写仅用于日期列，不改变公共 Cell 的默认值槽宽度和其他字段排版。

客户筛选文本字段样式回退（2026-10-21 用户确认，V/D）：号码归属地、客户备注信息恢复标题在上、浅灰底输入区在下的原外观；继续复用本地 Input external，页面作用域设置 14px 标签、44px 输入区、8px 水平内边距，保留输入值及清空行为。此项覆盖前述这两个字段的横排迁移记录；公共 Input、时间选择单元格、等宽日期摘要及弹层搜索留白保持。

气泡菜单页面使用规则（2026-10-22 用户确认，V/D）：页面中由锚点按钮触发的小型操作菜单优先使用带箭头 PopoverMenu，默认渲染箭头并随碰撞避让后的实际方向定位。图标 20px、文字 16px/24px，图文间距 8px；有图标的分隔线对齐文字起点（20px 内边距 + 20px 图标 + 8px 间距）。已同步全部组件预览样例及学员信息积分入口；回调、禁用项、键盘与关闭回焦不变，未将说明 Popover、整屏筛选或 ActionSheet 全局替换成菜单。

2026-10-22 V/D 迁移：公共 Button 默认 md/lg 字号 16px、24px 行高，保留 sm 14px 与场景显式字号；SheetChoiceGroup 和 DateRangeFields 快捷项共用 .sheet-choice-option 的 16px/24px 样式，覆盖客户、学员、两版出勤率与组件预览。客户批量修改已使用 Cell/CellGroup，56px 行含缩进分隔线、18px 箭头；客户筛选 14px 小标题统一 Regular 400。各页回调和业务数据保持。

2026-10-22 SheetActions 扩展：primary 可选 tone=brand/danger/warning，直接透传本地 Button，默认品牌不变；减积分确认使用 danger。secondary 继续 soft。核对既有28处引用，只有积分减分主确认传入 danger，其他调用点无行为或配色迁移。

## BottomSheet 模式试行（2026-10-22）

新增 mode?: selection/editor（默认selection）、onCloseRequest?: () => void。selection显示横杠、支持下滑关闭；editor不显示横杠、不启动下滑关闭手势，默认标题区56px。搜索框不等于编辑表单。mode不自动判断脏状态；有onCloseRequest时，关闭按钮/遮罩/Escape/平台关闭请求委托页面，页面决定直接关闭或使用本地Dialog确认。正常提交直接更新open，不触发放弃提示。自定义header仍由调用方负责。

已迁移加减积分主表单及新增规则为editor，规则库保持selection；积分项非空即为主草稿，新建表单与初始字段比较。其他既有BottomSheet与SideDrawer未批量迁移，保留原语义。新API先在积分流程试行，不据此宣称所有编辑弹层均已保护。

叠加确认（2026-10-22试行）：Dialog/InfoDialog可选stacked=true，将确认遮罩提至父modal层，确认viewport为modal+1；积分放弃确认使用此模式，普通Dialog默认不变，避免遮罩在父Drawer下面无法压暗表单。

2026-10-22 PopoverMenu：action支持可选danger，使用--color-text-danger；只对意向客户批量删除启用，其他菜单项保持原外观。

2026-10-22 Dialog次要动作（用户确认）：ios/android多动作的非主动作采用--color-text，末项主动作保持品牌色；custom首项主按钮、其余次要动作采用正文色。danger动作仍危险红，disabled保留禁用色。此次作用于Dialog共享样式，不改变SheetActions浅蓝底次要按钮。

2026-10-22 弹层导航返回（用户确认，V）：本地Button text配left图标，sheet-nav-back采用二级文字色color-text-subtle、二级图标色color-icon-subtle、14px文字/16px图标、图文间距4px、40px热区；已迁移积分新增规则与客户批量修改选择头部，普通文字操作不受影响。

2026-10-22 更新：BottomSheet选择/编辑规则已获用户确认，后续遵循sheet-interactions.md。selection带横杠可下滑，editor无横杠且禁止下滑；有返回则不同时显示关闭。选择内新增属于新编辑任务第一层，但有明确返回来源时可用返回，积分新增规则按此执行。此前“试行/保留右上关闭”的历史记录以本更新为准；其他页面未完成迁移，不能宣称已全部执行。

2026-10-22 按钮校验基线补充（用户确认）：表单未完成不作为默认禁用理由，主按钮可点，点击后校验并阻止无效提交，通过字段/区域警告和必要Toast解释，定位首个问题。提交中、防重复、权限或不存在有效业务对象可保留限制并说明。底层Button disabled保留，组件预览禁用示例保留。已迁移积分确认、客户批量修改保存和无选中客户的批量动作；学员信息无效学员时有明确说明，保留禁用。

2026-10-22 BottomSheet叠层外壳：嵌套子Drawer打开时通过data-nested-drawer-open隐藏父sheet的绘制并禁止其指针事件，父表单不卸载，关闭后恢复其原高度、草稿和滚动。只显示当前层的标题和圆角，不露出父层半截标题。居中Dialog确认不触发该Drawer状态，父表单仍在遮罩下显示。

2026-10-22 单选导航补充（用户确认，D，待迁移）：编辑BottomSheet打开的字段单选仍是selection，保留横杠/下滑，左上使用sheet-nav-back“图标＋返回”、右侧等宽空槽，不显示关闭；独立选择任务无父编辑路径时可使用取消。返回只取消当前单选，不放弃父编辑；详见sheet-interactions.md。客户批量修改状态/校区等调用尚未迁移，本条不表示组件API或页面已经变更。

2026-10-22 单选返回已迁移（V/I）：BottomSheet新增onBack?: () => void，使用默认标题头时替换为左上本地Button返回、居中标题及右侧等宽空槽，selection横杠/下滑不变；返回逻辑由调用方负责。自定义header仍由调用方管理。客户批量修改状态/校区已接入，返回恢复字段焦点与父草稿；其余调用未传入时保持关闭入口。此记录覆盖前述该场景待迁移状态。

## Stepper · 积分候选组合（2026-10-22）

本地候选 src/components/ui/Stepper.tsx，组合Input/Button/Icon；用于积分主编辑分值和新增规则默认分值两个场景，暂不注册为Recommended。参考用户指定Arco Figma 507mHwo2qlL72kbftlM9Qi / 594:11445；用户明确要求参考尺寸，视觉按钮28×28、输入40×28、2px间距，主体100px，单位另置，16px加减图标、15px数字。该紧凑按钮28px尺寸为本场景用户指定例外，不改公共Button的40px底线。外层横排输入行仍56px，颜色仅使用本项目语义token。

每次增减1、保留已有小数部分，最小0；空值显示灰色0占位，点击加号得到1，手输支持两位小数。0/空值仍由积分业务提交校验拒绝，不自动当有效分值。现有规则按预设值显示，允许扣成负余额的业务规则不变。无新增Arco依赖；只复用项目精确匹配的加减号图标，不将Figma图片用于界面。

2026-10-23 积分调用迁移（V/I/D，已完成）：主编辑固定分值改为只读Cell，不限分值改为40px浅底Input；Stepper目前仅保留新增规则默认分值场景，继续为候选，不升为Recommended。覆盖上述主编辑Stepper调用记录，不将本页40px输入尺寸推广为全局输入规范。

2026-10-23 V/I/D：积分页新增规则默认分值已由Stepper迁移为本地Input，后缀“分”。Stepper不再用于积分业务页，仍为候选组件，不升级为Recommended。

2026-10-23 · DateRangeFields 候选 API 增加可选 presets（DateRangePreset[]），省略时仍为本月/上月/最近30天。AI沟通筛选单独配置不限时间、今天、昨天、本周、最近 7 天、最近 30 天、最近 1 年、本月；复用原起止日期与滚轮，不改出勤率/客户筛选的快捷项。日期按调用方本地日期进行日历运算，本周为周一至今天，最近7/30/365日含今天，最近1年按365日；本月保持月初至今天。

2026-10-23 用户确认统一（V/D，覆盖此前40px/16px快捷块规格）：SheetChoiceGroup与DateRangeFields快捷项同为36px最小视觉高、14px/22px Regular文字、10px网格间距、水平4px/垂直6px内边距（含1px边框），上下扩展热区至至少40px；长标签自然增高，列数由场景保留。共享CSS统一，不再由意向客户/AI局部复制尺寸。已迁移学员、意向客户、AI阶段/日期、出勤率v1/v2与BottomSheetExamples；日期输入仍48px，日期快捷项默认内容/各页业务回调不变，Candidate日期组件级别不变。

## ListEnd · 候选公共列表结束提示（2026-10-23）

公开入口src/components/ui/ListEnd.tsx。默认文案“这是我的底线”，children可覆盖，支持标准p属性与className。12px/20px Regular、color.text.subtlest、居中、16px内边距，无背景、图标及业务逻辑。由调用方在非空列表全部加载后渲染，不替代空状态、加载/错误或“加载更多”，不主动播报为live状态。已对照并迁移沟通记录、学员、意向客户三处；学员保留原底部安全留白。分页出勤列表未迁移；候选API不因复用次数自动升级为Recommended。

## Tabs · 候选内容页签（2026-10-26）

公开入口 `src/components/ui/Tabs.tsx`，与底部主导航 `TabBar` 分开。Props：items（value、ReactNode label、可选稳定id、panelId）、value、onValueChange、label；size=secondary/primary分别48/56px，layout=stretch/content等分/按内容排列，indicator=fixed/label分别24×3px居中线/文字宽底边。支持标准div属性及ref，业务数量可放入label；当前页面提供稳定id并用其标注对应tabpanel。

组件负责role/tablist/tab、aria-selected/controls、单一tabIndex=0、左右键循环及Home/End自动激活和焦点切换；使用组件内ref，不通过全局document查找。页面负责受控状态、内容与panel、业务计数、背景、边距和sticky。只使用语义色；允许页面以--tabs-text/active-text/active-weight/item-padding/indicator-radius保留已确认的文字与下划线差异，不将偶然的页面CSS升级为统一视觉规则。

已迁移：学员分类（数量、小字号计数与Medium选中）、客户详情分类（等分、Regular选中、渐变及原有72px展开行为）、AI记录内容（靠左、按文字宽下划线）。三处均保留48px、原路由与键盘交互，未重写滚动逻辑。底部TabBar继续使用主导航语义；Tabs无路由、数据请求或吸顶实现，也不自动把内容包成新滚动区。Candidate状态待后续API评审。

2026-10-26 · Tabs组件展示补齐（V/I）：/mobile组件预览的介绍下方增加TabsExamples，提供48px等分含数量、56px独立首层、文字宽下划线三组可交互实例；多个实例独立受控，面板有可访问名称，示例覆盖自动ID及焦点隔离。不影响业务页或组件Candidate状态。

2026-10-26 · Tabs指示线动效（V）：由各项独立线改为单一共享指示线，以220ms transform/width过渡追随选中项；保留固定24×3px及文字宽两种规格，ResizeObserver校准容器/文字宽变化，首次直接定位，连续切换从当前位置衔接；减少动态效果时关闭过渡。指示线不拦截点击，不新增布局高度或改变页面sticky。


2026-10-26 已确认：BottomSheet selection 下滑关闭只从顶部横杠/标题区域起手。公共封装的正文、描述、底栏统一标记 swipe-ignore，正文滚到顶部也不触发关闭。editor 仍整层禁用；自定义 header 属于顶部区，内部交互控件继续遵循组件本身的手势保护。
