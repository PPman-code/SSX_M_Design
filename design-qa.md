# 学员加积分原型 QA · 2026-10-22

final result: passed

## 验收口径

源为用户本轮四张加积分原型；后续两条直接指令优先：使用系统规范和本地组件、弹层内不需要加减积分 Tab。原型用于流程与字段，非逐像素复刻。因此默认弹层关闭/SheetActions、56px 横排 Input/Cell、48px 多选列表右勾、40px 选项以及必填标记右置均为有意适配。

## 同状态可视对照

已将源空态/新增规则与本次实际截图裁去外部背景、统一宽度放入同一比较图并打开检查：
`/private/tmp/student-points-reference-comparison.jpg`。

实际状态截图：
- `/private/tmp/student-points-empty-light.jpg`
- `/private/tmp/student-points-library-light.jpg`
- `/private/tmp/student-points-create-light.jpg`
- `/private/tmp/student-points-filled-light.jpg`
- `/private/tmp/student-points-filled-dark.jpg`
- `/private/tmp/student-points-create-dark.jpg`

源中“许星澄”替换为所点击的真实本地样本身份“金灿灿”；128分为模拟初始值。源分值/规则均保留，已选示例按实际选择生成合计，不复制图片中与可见条目不一致的示例总数。

## 结果

- 没有加减 Tab，没有手画控件、独立字体或图标库；复用 BottomSheet、Button、Cell、Input、SheetChoiceGroup、SheetSelectionList、Search、SheetActions。
- 初始态禁用确认；规则库搜索、多选和新增入口完整；新增表单必填、固定/不限分值、保存自动勾选完整。
- 选中后回填分值与原因，支持修改/移除；合计按整数百分之一分计算，取消不影响余额，只有主确认修改本页内存余额。
- 实测输入行56px、底部工具栏56px；360px深色无横向溢出，输入和底部按钮未遮挡；多项内容可滚动至合计，底栏独立固定。
- 已移除初版自定义头部/模式切换/新Textarea，按用户说明改用既有系统组件；没有阻塞级 P0/P1/P2 差异。
- 28项相关浏览器回归通过（入口/菜单、360/390/430px明暗主题、嵌套草稿、校验、十进制合计、模拟提交和键盘回焦）。pnpm check/build通过。

## 限制

无后端、无持久化；余额和新增规则均为页面生命周期内模拟状态。减分、清零及学员正文不在本轮范围。真机键盘、微信WebView、安全区和触摸未验收，桌面浏览器验证不构成设备兼容结论。

## 减分增量验收 · 2026-10-22

final result: passed

- 源为用户新增三张减分原型；继续遵循系统组件、无弹层内Tab的最新指令，复用原加分流程，无新控件外观。
- 已打开实际减分库、新增减分规则和减分合计截图，并将原型新增表单与实现统一宽度放在 `/private/tmp/student-subtract-comparison.jpg` 对照。原型左侧返回/大输入框有意替换为既有BottomSheet/56px Input/SheetActions，必填右置。
- 实际证据：`/private/tmp/student-subtract-library-light.jpg`、`/private/tmp/student-subtract-create-light.jpg`、`/private/tmp/student-subtract-filled-light.jpg`、`/private/tmp/student-subtract-filled-dark.jpg`。
- 加减规则库分离，默认迟到−1/未带学习用品−2；新增/搜索/多选/编辑/移除/取消复用加分草稿策略；主确认danger颜色来自系统语义变量，无物理色覆盖。
- 用户明确允许负余额，128扣129后为−1已通过测试；输入仍填正数，业务提交带负号，避免双重取负。
- 33项相关回归通过，覆盖360/390/430px、Light/Dark、独立及微信预览、加分回归和标准底栏。实测深色360px无横向溢出，输入56px、底栏56px、确认按钮40px/16px。
- 模拟状态、无持久化、清零待设计及真机未测的边界保持。没有阻塞级P0/P1/P2差异。

## 积分底栏左侧合计 · 2026-10-22

final result: passed

按用户本轮截图与文字要求：主弹层删除底部取消及内容区合计卡片，底栏左侧固定合计、右侧确认；无选项时左侧提示选择积分项。右上关闭及Escape仍取消草稿。规则库取消/新增返回保持。

已核对实际截图 `/private/tmp/points-footer-left-light.jpg`，实测工具栏56px；27项积分/入口回归通过，含左/右位置断言、主弹层无取消、内容区无重复合计、关闭后余额不变及加减分流程。pnpm check/build通过，真机未测。

## BottomSheet 两种模式试行 · 2026-10-22

final result: passed（试行范围）

- I/V/D：本地 BottomSheet 增加 selection/editor 模式；selection 默认保留横杠及下滑关闭，editor 隐藏横杠并拦截下滑关闭。此次仅积分主表单和新增规则迁移到 editor，积分项选择仍用 selection，其他页面未迁移。
- 已选择积分项或填写未保存规则时，关闭、遮罩、Escape、返回统一触发“继续编辑 / 放弃修改”；继续保留草稿，放弃只退出相应层级。已保存规则不因关闭主表单而删除。未改动时直接退出，成功提交不触发提示。
- 嵌套确认显式渲染独立遮罩并提高层级，避免 Base UI 默认省略嵌套 backdrop 后父表单未压暗。普通 Dialog 行为保持。
- 18 项最终回归通过，覆盖 Light/Dark、主表单/规则表单关闭保护、实际浏览器触摸事件、默认选择弹层及 Dialog。静态检查及生产构建通过。
- 浏览器视觉证据：`/private/tmp/points-editor-no-handle.jpg`、`/private/tmp/points-unsaved-confirm-light.jpg`、`/private/tmp/points-unsaved-confirm-dark.jpg`。编辑标题栏56px、按钮及底栏沿用系统组件。
- 规则为本轮试行，尚非全页迁移完成；不含路由离开或刷新页面保护。无后端持久化，真机、微信 WebView 与软键盘未测。

## 积分项选择底栏 · 2026-10-22

V：加减共用选择弹层的数量从标题下移至56px底栏左侧，右侧保留确认选择，移除取消。已核对390px明暗主题，截图 `/private/tmp/points-selection-count-left.jpg`；360/390/430px布局、数量更新、关闭放弃选择草稿及加减流程通过相关回归。真机未测。

## 积分主弹层摘要精简 · 2026-10-22

V：复用 BottomSheet description 在标题下居中显示学员姓名及当前积分，删除内容区两行卡片。明暗主题390px视觉检查通过，证据 `/private/tmp/points-compact-student.jpg`；25项积分相关回归通过，覆盖360/390/430px及正负余额显示。真机未测。

## 积分内容平铺 · 2026-10-22

V：加减主表单和新增规则内容统一 surface 底色，去除列表卡片圆角及独立背景，新增规则使用本地 CellGroup block。明暗主题390px视觉检查通过，证据 `/private/tmp/points-flat-content.jpg`；25项相关回归、pnpm check/build通过。交互未改，真机未测。

## 积分规则前置圆形多选 · 2026-10-22

V：加减规则库使用本地 Checkbox circle/left，48px行节奏，移除右侧勾，数量实时更新。明暗主题390px视觉检查通过，证据 `/private/tmp/points-circle-selection.jpg`；25项相关回归及pnpm check/build通过，覆盖360/390/430px、创建自动选中、取消草稿与提交。真机未测。

## 新增规则顶部返回 · 2026-10-22

V/I：复用 BottomSheet header 与本地 Button/Icon，将返回从底栏移至56px导航头左侧，标题居中，底部通栏保存。明暗主题390px检查证据 `/private/tmp/points-rule-top-back.jpg`；保留右上关闭及原草稿保护，真机未测。

## 意向客户筛选紧凑项 · 2026-10-22

V：字段标题16px；平铺项14px/22px，单行36px，长内容自然增高，伪元素扩展40px热区，网格10px间距避免相邻重叠。仅意向客户筛选，分组说明保留辅助层级。390px明暗主题视觉核对，证据 `/private/tmp/customer-filter-compact.jpg`；29项列表/客户回归及pnpm check/build通过。真机未测。

## 筛选字段分组 · 2026-10-22

V：号码归属地、客户备注信息从客户信息移至更多条件，与自定义字段一起显示；无自定义扩展时仍保留这两项。实际390px布局证据 `/private/tmp/customer-more-fields.jpg`；输入及筛选逻辑保持，真机未测。

## 筛选选项收起为选择行 · 2026-10-22

I/V：仅意向级别平铺；客户状态、年级、来源、标签和自定义单多选采用56px Cell入口及可搜索BottomSheet。摘要不限/单项/已选N项，子确认回填草稿、父确认应用，原单多选保持。390px明暗视觉检查，证据 `/private/tmp/customer-filter-select-rows.jpg`。37项现有回归与2项新增明暗主题单选/多选/搜索/取消用例通过，pnpm check/build通过。模拟选项未包含分类元数据，真实分类未接入；真机未测。

## 批量更多气泡菜单 · 2026-10-22

I/V：使用本地PopoverMenu替换ActionSheet，top-end箭头指向更多按钮，菜单外点击/Escape关闭。明暗主题390px视觉证据 `/private/tmp/customer-batch-popover.jpg`；修改与删除二次确认沿用原流程，真机未测。

## 时间条件默认值统一 · 2026-10-22

V：默认不限不再套日期摘要压缩样式；已选日期才使用12px/18px、等宽数字与60%值宽。390px默认视觉证据 `/private/tmp/customer-date-default-aligned.jpg`，日期范围回归覆盖默认14px、选中12px及窄屏无溢出。真机未测。

## 客户范围三个快捷项 · 2026-10-22

B/I/V：范围改为自己负责/包含下属/所有人，互斥且默认/重置所有人；移除下属复选，中心与主责任人仍可叠加。当前预览身份owners[0]刘亦菲，本人/下属/全部结果7/9/10，未接真实身份权限。明暗主题390px证据 `/private/tmp/customer-scope-options.jpg`。真机未测。

## 更多条件样式示例 · 2026-10-22

B/I/V：复用SheetChoiceGroup、Cell、Input、BottomSheet补齐预览，长短文案混合与长标签可直接评审。390px明暗截图 `/private/tmp/customer-custom-long-options.jpg`、`/private/tmp/customer-custom-input-examples.jpg`。长项自然增高，同排短项跟随网格高度；不等于已确立所有复杂自定义字段的最终排版。模拟字段与模拟客户值匹配，未接后端，真机未测。

## 筛选输入底色及日历图标 · 2026-10-22

V：自定义文本/数值/日期输入与号码归属地字段统一浅灰底44px，日历采用本地Icon与color-icon-placeholder，原生指示器透明但命中区保留。明暗主题390px视觉证据 `/private/tmp/customer-filled-inputs.jpg`；真机日期选择器与软键盘未验收。

## 四项批量操作确认 · 2026-10-22

I：本地Dialog确认转为正式/取消转化/新开班试听/跟班试听，打开时记录名称和选中人数，默认聚焦取消，关闭回原按钮；确认前不提示，确认后沿用模拟外部流程提示。390px明暗视觉证据 `/private/tmp/customer-batch-action-confirm.jpg`；真机未测。

## 批量修改选择器规范修正 · 2026-10-22

I/V：发现原列表已有复用，但搜索为手写label/input、头部独立flex和留白未跟随共享规范。改用本地Search，56px导航头、48px搜索区/36px输入、48px选项行；左上图标返回，移除同义取消，空搜索有提示。明暗主题390px证据 `/private/tmp/customer-batch-standard-selector.jpg`；真机未测。

## Dialog次要按钮文字色 · 2026-10-22

V：共享Dialog次要动作采用color-text，主动作品牌色，danger危险色、disabled禁用色保留；custom首项主按钮，其余为次要。明暗主题390px核对，证据 `/private/tmp/dialog-secondary-text-color.jpg`；SheetActions不变，真机未测。

## 弹层返回紧凑规格 · 2026-10-22

V：两处返回使用sheet-nav-back，最终用户规格文字14px、图标16px、gap4px、40px热区，分别color-text-subtle和color-icon-subtle。390px实测字体14px/图标16px/间距4px/高40px，明暗视觉检查，证据 `/private/tmp/sheet-back-neutral-compact.jpg`。真机未测。

## 批量修改恢复空选 · 2026-10-22

I：根因为状态/校区列表仅有实际值，空值不可达。增加常驻“不修改”选项，回填空字符串，保存逻辑沿用跳过空字段。实际390px入口证据 `/private/tmp/customer-batch-no-change.jpg`；新增明暗主题测试覆盖分别清空、保留另一个字段、全部清空禁用保存、搜索下仍可恢复、原客户状态保持。真机未测。

## 叠层修复与按钮校验检查 · 2026-10-22

I/V/D：共享BottomSheet使用已核对的Base UI data-nested-drawer-open状态隐藏父外壳，保持表单挂载；子层关闭恢复父高度和草稿，不露出两个圆角/半截标题。检查过25处BottomSheet声明，相关嵌套场景含积分、客户批量修改、筛选。Dialog为独立确认层，不受该Drawer状态影响。

| 页面/流程 | 原问题 | 本轮状态 |
| --- | --- | --- |
| 加/减积分 | 未选项/分值非法时确认禁用 | 改为可点；区域警告+Toast，焦点定位选择入口或非法分值；无效提交不改变余额 |
| 新增积分规则 | 已可点但错误时不定位 | 补Toast与规则名称/分值焦点定位，原校验保留 |
| 客户批量修改 | 没设置字段时保存禁用 | 改为可点，提示至少设置一项并聚焦首字段；不提交空修改 |
| 客户批量动作/更多 | 无选中客户时全部禁用 | 改为可点提示先选客户；不打开确认或修改流程 |
| 客户空列表批量入口 | 无结果时入口禁用 | 可点解释没有可操作客户 |
| 学员信息无效学员 | 加减积分禁用 | 保留：对象不存在，已有原因说明与返回学员管理入口 |
| 学员列表/出勤率v1-v2 | 检查业务页disabled用法与现有日期校验 | 未发现因表单未填而禁用的同类写法；不表示已穷尽所有字段/权限/真机行为 |

明暗主题390px叠层与校验截图 `/private/tmp/sheet-single-shell.jpg`、`/private/tmp/points-click-validation.jpg`。58项既有相关回归通过；新增4项校验/叠层明暗用例通过。pnpm check/build通过。未接生产接口、真机软键盘/微信WebView未测；未提交或推送。


## 积分页面样式回归规范 · 2026-10-22

V：仅调整积分页面组合，不修改共享组件或业务。移除积分项边框卡片/灰底标题、学员摘要胶囊；输入恢复本地 Input 56px，添加项使用本地 Button soft/block 40px、16px/24px/400。标题16px/500、移除14px/400；字重采用语义字体变量，移除 brightness 按压覆盖。规则列表保留名称/分值分列及前置圆形多选，单行实测48px。旧测试的选项名称定位同步为当前分列的可访问名称。

pnpm check、pnpm build通过；29项相关E2E通过，最后列表留白调整后补跑390px浅色流程。浅色390px浏览器实测：输入56px、添加40px、选择行48px。截图 /private/tmp/points-standard-fixed.png、/private/tmp/points-standard-selector-fixed.png。既有相关自动测试含明暗主题，未做暗色全量人工检查；真机/软键盘未测。未提交、推送或部署。


## 编辑内单选返回迁移 · 2026-10-22

V/I/D：核对业务BottomSheet调用，客户批量修改状态/校区为本次符合范围的单选；筛选与排序不属于编辑内单选，积分规则库是多选，保持。共享可选onBack仅该场景启用，保留selection横杠和下滑；返回不回填、恢复父字段焦点。使用既有14px文字/16px图标/4px间距/40px热区。32项相关E2E通过（含既有明暗主题）；pnpm check/build通过。浅色390px截图 /private/tmp/customer-single-back.png；真机未测，未提交推送。

## 积分直接选择入口 · 2026-10-22

I/D：首次点击加分/减分直接显示独立selection（右上关闭），确认非空选择后打开editor。编辑中添加项则在父editor内打开带返回的selection；取消只丢选择草稿。空选确认可点且提示，空编辑仅在移除全部项后出现。新增规则及父编辑的放弃确认分别保留在当前Drawer任务上下文；修复拆分入口后Escape被父层重新响应的问题。

验证：检查和构建通过。首轮45项回归44通过，定位并修复一项Escape确认失败；修复后关闭保护与入口9项通过，补充独立选择中新建规则未保存保护后入口2项通过。既有测试通过真实“确认一项→移除全部”路径进入空编辑，不增加测试专用业务入口。浅色390px独立选择与编辑内选择截图 /private/tmp/points-entry-independent.png、/private/tmp/points-entry-editor-back.png。真机未测，未提交推送。

## 合并前最终验证 · 2026-10-22

pnpm check / pnpm build通过。完整E2E运行286项，281项通过；4项底栏脚本仍按旧弹窗查找现已迁移的气泡菜单，1项分值解析断言仍沿用放宽输入前的小数限制。同步测试定位与当前实现预期后，针对这5项复跑全部通过；未为通过测试更改业务数值逻辑。构建仍有既有大包体积提示，不阻断构建。当前变更不等于真机/软键盘验收，也未执行部署。
