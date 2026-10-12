# 移动端交互

- 操作有 pressed、focus-visible、disabled；hover 仅增强鼠标体验，不承载唯一入口。
- 弹层使用本地 BottomSheet 封装 Base UI Drawer；有标题、关闭入口、遮罩、滚动锁定和焦点恢复。
- 有确认按钮的选择器保留草稿；取消、遮罩或关闭不提交，确认才更新外部摘要。
- 输入 16px 起，合适的 inputmode/autocomplete；标签始终可见，占位文字不替代标签。
- 高度使用 dvh，底部预留 env(safe-area-inset-bottom)，滚动区 min-height:0；固定操作区必须有内容避让。
- 底部弹层含表单时使用 VirtualKeyboardProvider，并真机验证键盘出现/消失与焦点滚动。
- 列表刷新、分页或加载更多需明确边界，不默认全量下载；提交防重复，失败保留输入并可重试。
- 初始化示例只有内存状态，不宣称已保存到服务端。
- 尊重 prefers-reduced-motion；拖动关闭必须同时有可点击的关闭入口。
