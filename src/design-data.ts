export const mobileRules = [
  { name: '设计宽度', value: '390', unit: 'px', note: '检查 360 / 375 / 390 / 430px' },
  { name: '标准控件', value: '48', unit: 'px', note: '按钮与输入，适应指尖操作' },
  { name: '触控区域', value: '44', unit: 'px', note: '最小点击区域，图标可更小' },
  { name: '正文字号', value: '16', unit: 'px', note: '正文与输入，行高 24px' },
] as const;
export const componentCatalog = [
  { name: 'Button', label: '按钮', detail: '主要 / 次要 / 轻量；44 / 48 / 52px' },
  { name: 'Icon', label: '图标', detail: '继承 w1-design 本地 SVG 图标' },
  { name: 'Toggle', label: '开关', detail: 'Base UI 行为，独立触控区域' },
  { name: 'BottomSheet', label: '底部弹层', detail: '手势关闭、焦点恢复与安全区' },
] as const;
