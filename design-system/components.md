# 组件规范

## 首个业务页面组件

MobilePage 接收 title、children、footer 和 previewChrome；真实页面使用浏览器安全区，内容独立滚动，footer 不遮挡内容。previewChrome 仅用于对照 Figma，不提供真实微信容器功能。MenuCell 接收本地 IconName、label、onClick，保持 56px 行高与 24px 图标。TabBar 接收 items、active、onSelect，不自动改变路由。

## Button
主按钮统一使用 color.background.brand.bold（Light #2878E8 / Dark #409EFF），不提供 hover 状态，按下复用同一语义族的 pressed，不自行换成更深品牌色阶。
variant: primary / secondary / ghost / soft / outline / text，默认 primary；soft 为辅助色、outline 为线框、text 为品牌文字按钮。原有 secondary 仍为白底中性描边，ghost 仍为轻量操作。默认 md 统一为 44px 高、8px 圆角、15px 字号 / 400 字重；sm 为同高的紧凑文字版，lg 保留 52px，仅在明确业务需要时使用，不作为常用默认规格。
tone: brand / danger / warning；shape: default / round / square（默认保持项目圆角）。支持 block 通栏、icon（本地图标名称）、iconOnly（必须提供 icon 和 aria-label），loading/loadingText。加载时保留按钮颜色并显示旋转图形，阻止重复点击，不触发提交；设置 loading=false 后恢复。支持 ref 和标准原生 button 属性。disabled 与 loading 分开表达，减少动效时停止旋转。
对照 [Arco Mobile Button 文档](https://arco.design/mobile/react/arco-design/pc/#/components/button) 与 Figma 34:3824 的样式、形状与状态；2026-10-13 用户结合 ssx-v10.11.2 的按钮密度，确认默认 44px 高、8px 圆角、15px 字号 / 400 字重。主、次、辅助色、线框及普通通栏/弹窗主按钮共用此规格；round/square 仍为显式特殊形状。项目沿用主题蓝，不引入 Arco 运行时。类型颜色仅应用在 primary、soft、outline、text 上，secondary/ghost 保留中性语义。
支持标准 button 属性。封装 Base UI Button；禁用不可操作，焦点可见，pressed 有反馈。默认 type=button，表单提交需显式指定 type=submit。

## Icon
name 使用 ssx-design 的 icon-names.generated.ts 类型，size: xs/sm/base/md/lg。label 为独立含义图标的可访问名称；装饰图标省略 label。点击区域由外层控件负责。

## Toggle
label: string，checked: boolean，onChange(value: boolean)；可选 disabled、readOnly、showText、id、name。封装 Base UI Switch，基础轨道 40 × 24px，滑块 20px、边距 2px；触控区 44 × 44px。showText 显示「开／关」，轨道宽 44px、触控区 48 × 44px。disabled 不可切换；readOnly 保留焦点但不可切换；支持键盘 Space、焦点可见和减少动效。开启沿用项目主题蓝，禁用按同一品牌色淡化，滑块保持白色。
几何及状态参考 [Arco Mobile switch-android 547:9522](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=547-9522)，不引入 Arco 运行时。组件预览展示开启、关闭、禁用开启、禁用关闭及相应文字版本。

## Badge
count?: number（默认 0）、max?: number（默认 99）、dot?: boolean、bordered?: boolean、showZero?: boolean、label?: string、children?: ReactNode。红点 8px，数字高 16px、12px/500 字号，胶囊圆角；描边为 1px 白色，增加到 10px/18px。超过 max 显示 max+，默认 0 隐藏，showZero 可显示 0。负数按 0、非有限数字按 0、小数向下取整。传 children 时叠放在右上角；徽标不拦截点击，外层按钮负责交互与触控区。默认无障碍标签保留完整未读数量，可用 label 指定业务含义。
参考 [Arco Mobile Badge 35:5980](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=35-5980)，复用本项目危险色与主题语义变量，不引入 Arco 运行时。

## Cell / CellGroup
参考 [Arco Mobile component/item 158:11007](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=158-11007)。Cell 接收 label，支持 description、overline、leading、value、arrow、multiline。基础行最小高 54px，说明行 74px，多行自然撑高、最小 90px；左右 16px、图标槽位 24px（头像 32px）、图标与文字间距 8px，垂直居中；正文 16px、说明 14px，多行辅助标记 12px。默认 description 单行省略，multiline 时换行；value 限制到 45% 避免挤出标题。
传 onClick 时使用原生 button，支持 disabled、键盘和按下反馈；control 插槽用于 Toggle 等独立控件，与 onClick/disabled 互斥，保持非按钮容器，禁止嵌套交互控件。leading/value 只放展示内容。CellGroup 接收 children 与可选 label，统一背景、圆角和缩进分隔线，最后一行无分隔线。既有业务 MenuCell 保持原稿尺寸，不随基础 Cell 更新而改变。

## Popover
封装 Base UI Popover；trigger 为本地按钮 ReactElement，content 为说明内容。appearance: light/dark，placement: top/top-start/top-end/bottom/bottom-start/bottom-end；可选 closable、action（label/onClick/style: button 或 text），open/onOpenChange 可受控。不依赖 hover，支持点击外部、重复点击触发器、Escape 关闭，关闭回焦。定位支持碰撞避让、12px 视口边距，六种位置为优先位置，空间不足时可自动翻转。
参考 [Arco Mobile popover 45:2873](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=45-2873)，4px 圆角、14px/20px 文字、12×8px 内容边距、14×6px 箭头。白/黑外观使用专用语义 token，不随页面主题互换；白色操作按钮使用项目主题蓝。带操作或关闭时保留 44px 触控尺寸，因此气泡高度随操作增大。轻量、非模态，不替代确认对话框。action 执行后关闭气泡。

## BottomSheet
open: boolean，onOpenChange(value: boolean)，title: string，description?: string，children: ReactNode，footer?: ReactNode，header?: ReactNode，className?: string，finalFocus?: RefObject<HTMLElement|null>。
封装 Base UI Drawer，支持滑动、遮罩、关闭按钮和 Escape；子级负责草稿/确认逻辑。外部触发器通过 finalFocus 明确回焦。
最大 85dvh；手机全宽，桌面最大 560px；统一 16px / 24px / 500 居中标题、18px 关闭图标、44px 关闭触控区、16px 水平内容边距。内容区域独立滚动，footer 位于滚动区域之外，操作和安全区保持可见；操作区使用 SheetActions（单按钮全宽、双按钮等宽）。隐藏滚动条但保留触摸、滚轮和键盘滚动；包含 VirtualKeyboardProvider。
文字标题与说明必须有意义；滚动与手势在真机检查后再声明兼容通过。

## InfoDialog
居中说明弹窗，封装 Base UI Dialog。open、onOpenChange、title、children、finalFocus；311px 宽、16px 圆角，短屏内容可滚动。底部「知道了」关闭，支持遮罩和 Escape，焦点限制在弹窗内并回到外部触发器。用于仅收款使用说明。
可通过 className 与 footer 配置页面专用宽度和操作区；不传 footer 时保持「知道了」。收费管家开通弹窗宽 340px，窄屏按左右 16px 边距收缩。

## ActionSheet
参考 [Arco Mobile ActionSheet 99:10696](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=99-10696)，保留本项目语义色和共享遮罩。顶部圆角 8px、动作文字 16px / 400 / 1.4、16px 行内边距、行间 1px 细线、底部取消与动作组间隔 8px。没有右上角关闭图标、拖动条或可见标题栏；title 作为可访问标题隐藏，可选 description 显示 14px / 20px 说明。

封装 Base UI Drawer，Props 为 open、onOpenChange、title、description?、actions、cancelText?（默认取消）、finalFocus?。ActionSheetAction 为 label、disabled?、danger?，以及 href（可选 onSelect）或 onSelect 回调二选一。href 链接保持原生导航，回调动作在页面执行；选择有效动作后关闭，不维护选中状态。危险动作仅提供语义危险色，是否先确认由业务决定；示例删除仅为内存反馈。禁用项使用原生 disabled 按钮，不渲染可导航链接、不触发回调。标签自然换行，长列表只滚动动作区，取消固定并避让安全区。

支持遮罩、Escape、滑动关闭和回焦；动作面板作为 InfoDialog 的子组件嵌套时，取消返回父弹窗。共享 sheet-viewport 将动作面板和遮罩裁切在微信应用区域内，现有客服电话 href 调用兼容。组件预览提供基础、带说明、危险/禁用、长内容四个示例。

## Toast
参考 Figma Arco Mobile Toast 97:12379，黑色 80% 背景、白字、4px 圆角、16px/400/1.4 文字、16px 内边距；状态图标 24px，与文字间距 8px。原始图标保存在 public/components/toast。Light/Dark 均保持深色提示。
ToastProvider 已接入应用根；useToast 从 src/components/ui/useToast.ts 导入，页面调用 useToast().showToast({ message, type, duration })，type 为 text（默认）/success/error/warning/loading。默认普通提示 2000ms，loading 为 0（主动关闭），duration 可覆盖；closeToast() 关闭当前提示。空文字仅允许 loading；重复触发替换当前提示并重置计时。非模态、不拦截触摸、不移动焦点；Base UI 负责消息播报和计时，失败消息优先播报。居中显示，窄屏自然换行并保留 24px 边距；加载旋转尊重减少动效。

## PreviewStatusBar
仅为桌面手机外壳中的组件预览展示静态 9:41、信号和电量；54px 高，为灵动岛预留空间。工作区手机外壳通过 chrome=status 启用，无外壳和独立手机地址不携带该参数。深色主题反转原始状态栏素材以保持可读。

## Radio / RadioGroup
参考 Arco Figma .radio-input 68:10176 与 radio 68:10139：20px 标记、8px 图文间距、16px/400/1.4 文字。默认 dot 圆点；variant=list 为右侧无圆圈的独立勾，仅已选项显示；原 check 圆圈对勾仅保留兼容，新增单选流程不采用。主题蓝继承本项目，不使用 Arco 品牌色。标记按选中状态动态绘制，禁用背景与文字使用项目语义 token。触控至少 44px，长文字换行并与首行对齐。
RadioGroup 接收 label、value、onChange、children，以及 name/disabled/readOnly/required/className；Radio 接收 value、label、variant、disabled、hideLabel、className、onSelect（选项被点击时触发，可用于再次点击当前项后关闭即时选择弹层）。必须放在 RadioGroup 内，组内 value 唯一；hideLabel 仍以 label 提供可访问名称。封装 Base UI Radio/RadioGroup，支持键盘箭头切换与焦点样式；禁用不可切换。选择弹层采用该组件，取消保留旧选择，确认提交草稿。

## ProductTabBar
首页和「我的」共同使用的产品导航，封装 TabBar，统一 home-1-fill / user-3-fill 图标和活动状态。active 为 home/my；切换保持 theme/role/chrome/payment 等参数，清理报表返回来源 from，重复点击当前标签不重置页面。工作台功能图标占位不影响底部导航。



## 微信预览外壳
WechatPreviewHeader 显示时间状态栏、关闭按钮、title、当前域名及更多图标；关闭图标保留外观，实际操作为应用内返回；没有历史时返回首页并保留 theme/role/chrome，不退出项目预览。WechatPreviewHistory 显示本次预览路由的后退/前进，首次打开时隐藏，出现历史后按可用方向启用。PreviewHistoryProvider 在路由根部记录本应用 history key；报表明细使用 view=detail/group 路由参数以支持浏览历史。两者仅由 MobilePage 的 previewChrome 启用；手机链接不含 chrome=wechat，业务页面不重复绘制微信导航。更多仅为外观占位，不模拟微信原生菜单能力。

## Collapse / CollapseItem
封装 Base UI Accordion，参考 Arco component/item 44:1825。基础标题 16px/400/22px、左右 16px、上下 16px，内容 14px/20px、12px 内边距；触控至少 44px。列表式分隔、卡片式 8px 圆角及 12px 组间距。
Collapse 接收 children、label、variant:list/card、value/defaultValue（string[]）、onChange、multiple（默认 false）、disabled、className。CollapseItem 接收唯一 value、title、children、leading、suffix、summary、disabled、arrow:down/right、triggerLabel、className、triggerClassName。title/leading/suffix 仅展示，不嵌套交互控件；summary 独立于触发按钮，保持可见，children 为可折叠内容。受控与非受控二选一，组内 value 唯一。
原生按钮支持 Enter/Space、可见焦点及禁用；Base UI 管理 aria-expanded、aria-controls 与面板关联。内容自动高度过渡，减少动效时关闭过渡；关闭时卸载内容，业务需保留的数据放在上层。
出勤率使用 card 变体，统计摘要常驻、详细统计折叠；受控单项展开，日期/筛选/维度切换仍由页面清空展开值。

微信外观预览中，弹层和居中对话框的遮罩/定位范围避让模拟顶部 98px、底部 Home 34px（有浏览历史时含 44px 浏览导航及 1px 分隔线，共 79px）。这些边界只在 with-preview-chrome 页面生效；手机独立页面使用正常全视口和真实安全区。

公共 sheet-viewport 与 info-dialog-viewport 裁切溢出内容：底部弹层在入场、退出和拖动过程中均不会越过应用视口覆盖微信外壳；遮罩也只位于同一应用视口。

单选弹层两种模式：即时单选使用 list，点击立即生效并关闭，无取消/确定 footer；关闭或遮罩不修改值。需要确认的单选使用 dot，操作草稿，确定才提交，取消保留原值。多选流程不受此规则改动。

## 上拉浮层内容组合 · 2026-10-15

BottomSheet 继续统一外壳、微信视口边界、动画、焦点恢复和滚动锁定。标题统一 16px / 24px、500，内容区左右 16px，操作区固定；业务内容不另设嵌套滚动容器。取消出勤页的 16px 标题覆盖与页面选项样式。

`src/components/ui/SheetContent.tsx` 提供以下组合，不维护业务草稿或主动关闭：
- SheetSelectionList：label、options（value/label/disabled）、value。单选使用 onChange、可选 onReselect（再次点击当前项）；indicator=list 为右侧勾的即时单选，indicator=dot 为需确认单选。multiple=true 时 value 为 string[]，使用 onToggle，由调用者处理全部、互斥和至少一项等规则。选项行最小 44px、15px / 24px，长名称自然换行，无 hover；多选选中无底色块，使用强调文字和右勾，单选 list 只显示右勾。
- SheetChoiceGroup：label、options、value:string[]、onToggle、hint/error；两列选择块，自动关联组标题和说明，错误播报；校验保留在页面。
- SheetActions：primary 必填、secondary 可选，每项含 label/onClick/disabled；一个按钮全宽，两个按钮等宽排列。通过 BottomSheet.footer 传入。

四种实例分别为即时单选、确认多选、分组筛选、日期表单；日期字段和快捷时段仍由业务页组合。无底部按钮的即时单选点击提交并关闭；其他模式关闭不提交。组件预览补齐即时单选、多选和分组筛选示例，确认单选继续使用圆点。

### 上拉浮层操作规范 · 用户确认 2026-10-15
- 筛选：重置 / 确认。重置仅修改草稿，确认提交。
- 即时单选：无 footer，点击提交并关闭；已选项右侧独立勾。
- 需确认单选：取消 / 确认，使用圆点标记；取消不提交。
- 多选：取消 / 确认；取消、关闭、遮罩均不提交，不使用“重置”替代取消。
- 公共标题 16px / 24px / 500；关闭使用 Icon md（18px），外围点击区域保持 44 × 44px。
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

视觉：270px 宽并受容器约束；iOS 顶角 8px，内容 20px×16px，17px/500/1.4 标题、15px/400/1.4 居中正文、4px 标题正文间距，底部 16px 操作文字及细线。Android 4px 顶角、24px 水平内边距、17px Regular 标题与正文左对齐，按钮靠右。custom 8px 顶角、圆角实心主按钮和可选弱按钮。颜色使用本项目语义变量，不采用 Arco 品牌蓝。按钮触控至少 44px，因此 Android 文本按钮和 custom 按钮高度遵循项目移动端底线，未缩成旧稿的纯文字行高。

长正文独立滚动，按钮固定；支持 Escape、遮罩关闭、焦点限制/恢复，微信预览沿用应用区域裁切。无 hover。组件预览提供稿中七种按钮/外观组合及长内容示例；状态仅在内存。真机软键盘与屏幕阅读器另行验收。

## Picker · 经典滚轮弹窗（2026-10-15 用户澄清）

参考 [Arco Mobile Picker 130:12122](https://www.figma.com/design/507mHwo2qlL72kbftlM9Qi/?node-id=130-12122)。不要把它做成默认 BottomSheet 标题栏＋底部操作区：经典结构是顶部左取消、中标题、右确认，下面直接为 220px 滚轮视图，无拖动条、右上关闭图标、说明段落或底部按钮。4px 顶角，标题按用户移动端弹层规则保持 16px（选中稿为 15px），操作文字 15px、触控 44px。选中行无底色块和加粗，两条细分隔线贯通各列；上/下透明度渐变复用语义 surface，适配 Light/Dark。

`src/components/ui/Picker.tsx` 组合 BottomSheet 的 header 插槽与 WheelPicker。Props：open、onOpenChange、title、columns、value（草稿）、onChange、onConfirm、confirmDisabled?、finalFocus?。调用方在打开时复制正式值到草稿，负责联动与提交；取消、遮罩、Escape 仅关闭。Picker 不内部复制草稿，以便业务校验和联动。BottomSheet 的 header 插槽替换默认拖动条/标题栏，同时保留隐藏 Drawer.Title 作为可访问名称；其他浮层不传此插槽，原布局不变。微信视口边界、滚动锁定、裁切动画和回焦仍共用。

## PopoverMenu · 气泡菜单

来源：[Ant Design Mobile 气泡菜单页 4:99](https://www.figma.com/design/oYpPxX1OgLSbDfjaucWhBU/Ant-Design-Mobile?node-id=4-99)，具体黑/白状态节点 233:12394、233:12530。原稿为双倍尺寸，映射为最小宽 145px、8px 圆角、51px 行高、15px/21px 普通文字、24px 图标与 8px 图文间距，分隔线从文字起点开始。深色背景 90% 黑，浅色沿用白气泡语义表面；按下态、边线与阴影使用语义色及混色。图标使用本项目 Icon；稿内灰色方块是图标占位，不作为图标资源。深色图标归一为单色，避免原矢量固定灰色在深背景上不可读。

公开入口 `src/components/ui/PopoverMenu.tsx`，封装已安装的 Base UI Menu，区别于说明型 Popover。Props：label（菜单可访问名）、trigger（本地按钮）、actions、appearance?（dark 默认 / light）、placement?（默认 bottom-end，支持 top/top-start/top-end/bottom/bottom-start/bottom-end）、open?、onOpenChange?。每项含唯一 key、label、icon?（IconName）、dot?、disabled?、onSelect?。动作触发回调后关闭，不表示持久选中状态。红点附带“有新消息”可访问名称。

只点击/键盘打开，无 hover 状态或遮罩；外部点击和 Escape 关闭，执行后回到触发按钮，边缘自动避让。Base UI 管理 roving focus 与键盘字符导航；禁用项允许获得焦点供读屏识别，但 Enter/点击不执行、不关闭。正文长名称换行，菜单滚动隐藏滚动条。

原始箭头与红点 SVG 保存于 public/components/popover-menu，保留根宽高与路径，按 0.5 比例在包装槽内显示，无临时资源地址运行依赖。深色红点/箭头及浅色箭头根尺寸 24×24，浅色红点 20×20；显示红点约 10px（深色含白描边 12px），箭头旋转方形约 17px 对角宽。浅深色菜单、纯文字/图标/红点禁用与六种定位示例位于组件预览。业务示例只更新内存反馈，不调用真实扫码/通讯功能。
