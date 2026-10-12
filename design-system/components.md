# 组件规范

## 首个业务页面组件

MobilePage 接收 title、children、footer 和 previewChrome；真实页面使用浏览器安全区，内容独立滚动，footer 不遮挡内容。previewChrome 仅用于对照 Figma，不提供真实微信容器功能。MenuCell 接收本地 IconName、label、onClick，保持 56px 行高与 24px 图标。TabBar 接收 items、active、onSelect，不自动改变路由。

## Button
主按钮统一使用 color.background.brand.bold（Light #2878E8 / Dark #409EFF），悬停和按下分别复用同一语义族的 hovered/pressed，不自行换成更深品牌色阶。
variant: primary / secondary / ghost，默认 primary。size: sm / md / lg，对应 44 / 48 / 52px，默认 md。
支持标准 button 属性。封装 Base UI Button；禁用不可操作，焦点可见，pressed 有反馈。默认 type=button，表单提交需显式指定 type=submit。

## Icon
name 使用 ssx-design 的 icon-names.generated.ts 类型，size: xs/sm/base/md/lg。label 为独立含义图标的可访问名称；装饰图标省略 label。点击区域由外层控件负责。

## Toggle
label: string，checked: boolean，onChange(value: boolean)。封装 Base UI Switch，根触控区 52 × 44px，视觉轨道高 30px。

## BottomSheet
open: boolean，onOpenChange(value: boolean)，title: string，description?: string，children: ReactNode，finalFocus?: RefObject<HTMLElement|null>。
封装 Base UI Drawer，支持滑动、遮罩、关闭按钮和 Escape；子级负责草稿/确认逻辑。外部触发器通过 finalFocus 明确回焦。
最大 85dvh；手机全宽，桌面最大 560px；内容区域独立滚动；安全区填充；包含 VirtualKeyboardProvider。
文字标题与说明必须有意义；滚动与手势在真机检查后再声明兼容通过。
