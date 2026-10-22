# 组件注册表

Recommended 表示推荐复用的工程 API；移动端视觉基线仍需业务页评审。

| 组件 | 用途 | 状态 | 公开入口 |
| --- | --- | --- | --- |
| Button | 主要、次要、轻量操作 | Recommended | src/components/ui/Button.tsx |
| Input | 受控表单输入，横排 / 垂直 / 标签外置 | Candidate | src/components/ui/Input.tsx |
| DateRangeFields | 快捷时段、起止日期与内联年月日滚轮；提交与重置由调用方管理 | Candidate | src/components/ui/DateRangeFields.tsx |
| Search | 受控搜索输入及可选排序/筛选操作 | Recommended | src/components/ui/Search.tsx |
| Icon | 本地 SVG 图标 | Recommended | src/components/ui/Icon/index.ts |
| Radio / RadioGroup | 单项选择、圆点或对勾标记 | Recommended | src/components/ui/Radio.tsx |
| Checkbox / CheckboxGroup | 多项选择、全选半选、列表与卡片 | Recommended | src/components/ui/Checkbox.tsx |
| Toggle | 开关选择 | Recommended | src/components/ui/Toggle.tsx |
| Badge | 红点、未读数量与角标 | Recommended | src/components/ui/Badge.tsx |
| Cell / CellGroup | 基础列表行与分组；required/media/block 为候选扩展 | Recommended | src/components/ui/Cell.tsx |
| Loading | 环形、三点、文字与重试状态 | Candidate | src/components/ui/Loading.tsx |
| PullToRefresh | 顶部下拉刷新与异步状态；保留既有滚动层 | Candidate | src/components/ui/PullToRefresh.tsx |
| ToastProvider / useToast | 居中轻提示与异步加载反馈；横向/自定义图标为候选扩展 | Recommended | src/components/ui/Toast.tsx |
| Collapse / CollapseItem | 列表与卡片折叠，摘要常驻 | Recommended | src/components/ui/Collapse.tsx |
| PopoverMenu | 带箭头的深/浅色操作菜单，图标与红点 | Recommended | src/components/ui/PopoverMenu.tsx |
| Popover | 锚定式轻量提示与操作 | Recommended | src/components/ui/Popover.tsx |
| SheetSelectionList / SheetChoiceGroup / SheetActions | 上拉浮层的选择列表、分组选择与操作栏 | Recommended | src/components/ui/SheetContent.tsx |
| Picker | 顶部取消/标题/确认的经典滚轮弹窗 | Recommended | src/components/ui/Picker.tsx |
| WheelPicker | 单列、多列滚轮；禁用项与受控联动 | Recommended | src/components/ui/WheelPicker.tsx |
| BottomSheet | 底部选择与信息弹层 | Recommended | src/components/ui/BottomSheet.tsx |
| Dialog | 通用提示、确认、多操作与平台外观 | Recommended | src/components/ui/Dialog.tsx |
| InfoDialog | 居中使用说明与单按钮确认 | Recommended | src/components/ui/InfoDialog.tsx |
| ActionSheet | 底部动作选项与取消 | Recommended | src/components/ui/ActionSheet.tsx |
| WechatPreviewHeader / WechatPreviewHistory | 桌面项目预览中的微信顶部与浏览历史外壳 | Recommended | src/components/ui/WechatPreviewChrome.tsx |
| MobilePage | 满屏滚动、安全区、底部区域与可选微信外观预览 | Recommended | src/components/ui/MobilePage.tsx |
| MenuCell | 带图标与箭头的功能入口 | Recommended | src/components/ui/MenuCell.tsx |
| ProductTabBar | 首页与我的共用产品底部导航 | Recommended | src/components/ProductTabBar.tsx |
| TabBar | 底部主导航，当前项由页面控制 | Recommended | src/components/ui/TabBar.tsx |

详细 API 见 components.md。原生 input/label/fieldset/radio 作为受控基础元素可在当前工具示例使用；进入第二个真实业务页面前按需要封装共享字段组件。

意向客户列表新增 Recommended：SideDrawer（右侧筛选抽屉），公开入口 src/components/ui/SideDrawer.tsx；API 见 components.md。
