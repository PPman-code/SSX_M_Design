# 组件注册表

Recommended 表示推荐复用的工程 API；移动端视觉基线仍需业务页评审。

| 组件 | 用途 | 状态 | 公开入口 |
| --- | --- | --- | --- |
| Button | 主要、次要、轻量操作 | Recommended | src/components/ui/Button.tsx |
| Icon | 本地 SVG 图标 | Recommended | src/components/ui/Icon/index.ts |
| Toggle | 开关选择 | Recommended | src/components/ui/Toggle.tsx |
| BottomSheet | 底部选择与信息弹层 | Recommended | src/components/ui/BottomSheet.tsx |
| MobilePage | 满屏滚动、安全区、底部区域与可选微信外观预览 | Recommended | src/components/ui/MobilePage.tsx |
| MenuCell | 带图标与箭头的功能入口 | Recommended | src/components/ui/MenuCell.tsx |
| TabBar | 底部主导航，当前项由页面控制 | Recommended | src/components/ui/TabBar.tsx |

详细 API 见 components.md。原生 input/label/fieldset/radio 作为受控基础元素可在当前工具示例使用；进入第二个真实业务页面前按需要封装共享字段组件。
