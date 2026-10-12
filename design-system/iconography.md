# 图标

继承 w1-design / 5225620 的本地 SVG 快照（PC 归档版本 2026-10-08，导入日期 2026-10-12）。
public/iconfont/ 保存 sprite 和目录；src/components/ui/Icon/ 是公开入口。保留原有名称、currentColor 和 AIRA 特例。来源哈希见 tokens/sources/pc-import-manifest.json。

页面只使用 Icon，不拼接 Symbol ID。默认 md=18px，主要移动端导航可用 lg=24px；点击区域独立扩到 44px。
说明入口统一问号，移动端点击展开，不能只靠 Tooltip 悬停。警告才用感叹号。
装饰图标不传 label；独立含义图标提供中文 label。按钮可通过自身 aria-label 命名。
新增图标从同一资产库获取，人工验证后更新 sprite、JSON 和名称类型；当前无自动图标导入脚本。
