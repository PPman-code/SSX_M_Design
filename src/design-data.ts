export const mobileRules = [
  { name: '设计宽度', value: '390', unit: 'px', note: '检查 360 / 375 / 390 / 430px' },
  { name: '标准按钮', value: '44', unit: 'px', note: '默认圆角 8px、字号 15px、字重 400；输入框保持 48px' },
  { name: '触控区域', value: '44', unit: 'px', note: '最小点击区域，图标可更小' },
  { name: '正文字号', value: '16', unit: 'px', note: '正文与输入，行高 24px' },
] as const;
export const componentCatalog = [
  { name: 'Button', label: '按钮', detail: '默认 44px 高 / 8px 圆角 / 15px 字号 / 400 字重；统一样式与状态' },
  { name: 'Icon', label: '图标', detail: 'ssx-design · 185 个本地 SVG 图标' },
  { name: 'Radio / RadioGroup', label: '单选', detail: '圆点确认 / 列表勾选即时生效；禁用与键盘切换' },
  { name: 'Toggle', label: '开关', detail: 'Base UI 行为，独立触控区域' },
  { name: 'Badge', label: '徽标', detail: '红点 / 数字 / 99+；支持描边与右上角叠放' },
  { name: 'Cell / CellGroup', label: '基础单元格', detail: '基础 / 头像 / 控件 / 标题说明 / 多行信息' },
  { name: 'Toast', label: '轻提示', detail: '文字 / 成功 / 失败 / 警告 / 加载；单条替换' },
  { name: 'Collapse / CollapseItem', label: '折叠面板', detail: '基础列表 / 卡片摘要；单项或多项展开' },
  { name: 'PopoverMenu', label: '气泡菜单', detail: '深 / 浅；图标 / 红点 / 禁用；六种位置与键盘操作' },
  { name: 'Popover', label: '气泡提示', detail: '白 / 黑；六种位置；关闭 / 按钮 / 文本操作' },
  { name: 'BottomSheet', label: '底部弹层', detail: '统一标题 / 内容滚动 / 固定底部操作；手势关闭与安全区' },
  { name: 'MobilePage', label: '页面布局', detail: '独立滚动、安全区与可选微信外观' },
  { name: 'MenuCell', label: '功能入口', detail: '56px 行高；本地图标与箭头' },
  { name: 'TabBar', label: '底部导航', detail: '固定底部；页面控制当前项' },
] as const;
