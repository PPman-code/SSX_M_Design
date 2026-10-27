# 家长端课程详情 QA · 2026-10-26

final result: passed

## 对照证据

源图：/var/folders/wy/jrxbbp_52pz_phl7pcp2zwcr0000gn/T/codex-clipboard-37f6bbb6-c271-465f-94ac-e89dc7dc213d.jpg（1080×2346）。实现截图：outputs/parent-course-detail-top.png、outputs/parent-course-detail-390.png、outputs/parent-course-detail-dark.png（390×844 CSS像素，DPR1）；另测360/375/430宽。已打开源图和浏览器截图，按390宽换算内容比例核对；微信外壳不同，不比较外壳。用户要求沿用项目规范，封面及缺失图标先占位，不以素材还原作为本轮验收项。

## 五项核对

- 字体：系统中文字体；标题18px、售价24px、课程15px、规格14px、辅助12px；窄屏允许名称换行。
- 布局：4:3封面、价格、3项套餐、固定底栏；最后一项可滚动至底栏上方，无水平溢出。
- 颜色：语义变量；warning用于价格/班级，brand用于规格/购买；已检查浅深色截图。
- 图片：封面及购物车缺失图标占位符合用户授权，后续替换；已有图标复用本地Icon。
- 内容：标题、销售价/原价、班级、规格、价格及数量按截图录入。价格、套餐及底栏区域在390px截图可清晰核对，另检查滚动后第三项无底栏遮挡。

## 交互与结论

本地收藏、套餐详情弹层、购买待补提示及家长端项目切换有自动化覆盖。首页/购物车/购买流程等待后续需求，无生产接口。无待修复P0/P1/P2发现；素材占位属本轮明确边界。真机微信未测。此结论只覆盖本页。

---

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

合并前追加视觉修正：积分卡片最后一个输入单元格隐藏自身底线，仅保留卡片外框；中间分隔线保留，行高仍56px。浅色390px实测末行::after为none，中间行为正常分隔线；截图 /private/tmp/points-last-divider-hidden.png。追加后pnpm check/build及2项加减入口回归通过。

课程详情底栏回归：初次遗漏无历史栏时34px模拟Home避让，用户指出按钮落入Home区域。已在页面局部补充安全区变量，预览总高90px（56+34），独立页仍56px加真实安全区；四屏宽回归验证所有按钮底边均在Home区域上方。

2026-10-26规格提示更新：已打开outputs/parent-course-detail-390.png核对三个项目默认提示及底栏安全区；自动化覆盖取消不回填、确定后仅回填当前项目、独立页面和四屏宽布局。

2026-10-26图文套餐布局核对：新参考为/var/folders/wy/jrxbbp_52pz_phl7pcp2zwcr0000gn/T/codex-clipboard-32178ab7-43e0-45b7-bbe9-62ee9a675b75.png，左右分别为未选/已选示意。已打开outputs/parent-course-detail-390.png、parent-course-detail-selected.png、parent-course-detail-dark.png检查：64×48缩略图占位、15px课程名、12px类型/规格按钮、20px价格、24px条目间距，均使用语义颜色。保留现有课程数据，未选¥--；无报名日期来源不补造，缺价继续--。6项页面测试及390宽交互复测通过，无待修复P0/P1/P2，真机未测。

2026-10-26后续视觉微调：已移除条目缩略图；整行Button触发选择，右侧为32px纯展示标签“选择规格”，无额外热区。已核对outputs/parent-course-detail-390.png，名称左对齐、价格/类型与右侧标签均无重叠，四屏宽和选择交互共6项测试通过。

2026-10-26类型图标：已核对本地Iconfont元数据及浅深色浏览器截图，套餐名称前分别复用xuanke1（课）、xuanban1（班）、xuanwu（物），18px/4px间距；保留原始彩色图形。混合条目展示两枚图标，无横向溢出，6项页面回归通过。

## 2026-10-26 规格与座位交互核对

参考：用户图三/var/folders/wy/jrxbbp_52pz_phl7pcp2zwcr0000gn/T/codex-clipboard-82f8bc2b-56b0-4292-b0eb-348495306a69.png；座位空态及选中态图一图二分别为codex-clipboard-4b6b0512-cd77-4f31-8f42-68b4accc32b8.jpg及codex-clipboard-330da453-178c-4e0b-b17f-2ed37db031ed.jpg（同一临时目录）。

实现证据：outputs/parent-course-specification.png、parent-course-seat-selected.png、parent-course-seat-dark.png、parent-course-detail-selected.png，390×844 CSS px/DPR1；四种宽度覆盖360/375/390/430。对照内容层级、规格/班级状态、4×5座位布局与讲台位置；微信外壳和原始图密度不同，不直接比较浏览器栏。

已核对规格与班级必选、已满班禁用、班级直达选座、不可选座位、选座确认回规格草稿及最终回填、取消保留原值。字体沿用项目系统字体与14/12px信息层级，18px类型图标；颜色均语义变量并检查Light/Dark。选中座位使用brand-bold、可选使用brand-subtle、禁用使用neutral；无椅子素材，按既有授权编号按钮占位。行内价格弱化为12px次要色，总价层级不变。无真实库存/排课/锁座。

最终结果：passed；7项相关回归、check/build通过。真机微信尚未验证。

2026-10-26套餐封面：用户图片codex-clipboard-ead5562d-0dcc-4544-90c0-f83d7475385c.png已原样复制到public/mock/courses/package-cover.png；4:3居中裁切、无拉伸。已核对outputs/parent-course-detail-top.png并移除通用首项安全区导致的34px空白，四屏宽测试确认图片已加载且填满容器。

2026-10-26套餐色块及已选信息调整：已核对outputs/parent-course-detail-selected.png和parent-course-detail-dark.png。单元格浅灰色块使用neutral-subtlest、8px圆角/12px内边距；右侧已选显示“修改”，规格/班级/座位在标题下按标签-值逐行排列，价格保持12px次要色。四屏宽布局与原选择回填/取消共7项测试通过，无新增交互，真机未测。

2026-10-26已选信息后续排版：已核对outputs/parent-course-detail-selected.png，班级上置一行，规格/座位/价格并列下一行；无价格不渲染，取消¥--占位。名称保留图标并单行省略。保持浅灰底和修改按钮，7项回归通过。

2026-10-26提交校验修正：先以确认按钮应可点击的回归复现失败，再移除本页规格/座位确定按钮的未填禁用。点击校验逐项字段提示及定位，保留已选草稿，不关闭。已检查outputs/parent-seat-validation.png，蓝色确定按钮与红色字段提示正常；7项回归通过，已满班和不可选座位仍禁用。仅本页迁移，真机未测。

2026-10-26规格层图文标题：已打开outputs/parent-course-specification-header.png核对，96×72（4:3）课程图片槽、16px课程名、14px弱化价格及右上40px关闭入口。课程图未提供使用明确占位，预留coverUrl；选座沿用原返回标题。7项回归及额外4:3/关闭取消验证通过，check/build通过，真机未测。

2026-10-26模拟名称更新：套餐及三个项目统一为秋季艺术成长主题，同步班级周末时段与星光校区教室名称；旧测试名称已检索移除。已核对outputs/parent-course-detail-top.png和parent-course-specification-header.png，长项目名仍单行省略，原价格和选择逻辑不变。9项详情/工作区回归通过；数据仍为本地模拟。

2026-10-26购买前校验：已核对outputs/parent-package-purchase-validation.png与parent-package-all-selected.png，缺项自动定位对应选择层且提示持续可见，全部已确认才通过。覆盖未选、部分已选、取消草稿、逐项补齐和完整通过，共8项回归。购买后续仍为本地待补状态；本页采用弹层描述/页面状态反馈，未修改共享Toast或声称其问题全局修复。真机未测。

2026-10-26课程物品多选与Toast校验：已核对outputs/parent-course-goods-multiple-light.png、parent-course-goods-multiple-dark.png、parent-seat-validation.png及主页面。第三项选班不选座，三条物品名称与价格可多选；确认回填、取消恢复及购买校验均验证。按用户后续要求所有缺项提示使用现有showToast，去掉本页行内错误文字；本地确认仍可点击。一次脚本误写本页CSS导致检查失败，已恢复并重新完成整页回归，9项测试及额外浅深色2项通过，check/build通过；共享Toast未修改，真机未测。

2026-10-26辅助标签留白修正：核对SSX-right原图viewBox和路径，16px图标左右各含约4.5px空白，导致右端视觉内边距偏大。改为14px并在本页用-4px水平margin补偿画布留白，24px高度、4px图文间隔、8px可见外侧留白保持。已核对outputs/parent-course-detail-top.png与parent-course-detail-selected.png，未选/修改均更紧凑；10项相关回归通过，未修改全局Icon。

2026-10-26 Iconfont192枚更新：输入/Users/zee/Downloads/download.zip，归档至design-assets/iconfont/ssx-design-5242145-2026-10-26-192.zip。对比规范化名称与SVG：新增5枚、移除heart/heart-fill两枚，保留187枚无图形变化；调用点均迁移，生成物/下载包同步。已核对outputs/parent-course-detail-top.png及parent-course-detail-dark.png，底栏正式商城/收藏/购物车图标24px、徽标与安全区正常。4项图标生成测试通过，check/build通过。

2026-10-26规格/物品自然宽度选择块：复用SheetChoiceGroup，页面局部flex-wrap，12px水平内边距，不等分撑满；物品名称价格在同一块中，保留多选/取消/确认回填。已核对outputs/parent-course-goods-multiple-light.png及parent-course-specification-header.png，课时紧凑排列、物品两列自然换行，浅深色与10项回归通过；未改共享组件的其他页面布局。

2026-10-26班级规格分流：新增多规格班级示例，单规格合唱班仍直接选座且保存默认20课时；多规格主持人班先选10/20课时、校验后进入座位页，返回与取消保留原提交边界，更换规格重新选座。已打开outputs/parent-multi-spec-class.png和parent-course-detail-top.png核对，4项数量与24px入口正确；13项相关回归、check/build通过，真机未测。

2026-10-26多规格班级选座入口移位：复用Cell/CellGroup将座位必选入口放在规格块下面，底部确定保持通用动作；选择座位确认回草稿并展示排座，规格层确定再提交。已核对outputs/parent-multi-spec-class.png，11项相关回归通过，单规格直接选座和物品场景不变。

2026-10-26座位图标与标注：用户download (1).zip仅新增frame，图标总数193，既有192枚无变更。已核对outputs/parent-course-seat-selected.png和parent-course-seat-dark.png，默认仅座位图标，选中上方显示3-3，禁用状态仅灰色图形无额外方块；32px图形/40px操作区、24px行间距容纳标注。测试覆盖切换编号、取消消失、确认回填；4项图标测试和13项相关浏览器测试、check/build通过，真机未测。

2026-10-26大教室：主持人班为8排10列80座（64座可选），小教室保持4排5列。已核对outputs/parent-large-classroom-360.png/390.png及parent-course-seat-selected.png；横向画布不撑宽页面，纵向正文可滚动，固定排号遮挡正确，右下8-10能选中/回填/重开定位，操作区至少40px。14项回归及额外3屏宽大教室复测、check/build通过，微信触摸真机未测。

### 2026-10-26 家长端选座手势（I）
- 座位图局部支持双指 0.5–2 倍缩放、拖动平移；选座步骤隐藏横杠并阻止下滑关闭，返回和确认边界保持。
- 15 项家长端 E2E 通过；另以 Chromium CDP 触摸输入验证 1.5 倍缩放及 2 倍上限、弹层保持打开、返回后恢复规格层横杠。
- 已查看放大截图，确认班级信息、图例、底部确认未缩放。360/375/390/430 浏览器回归通过；微信真机双指手感未测。

### 2026-10-26 放大后拖动失效修复（I/V）
- 新增真实浏览器触摸回归先复现：从座位图标拖动 90px 实际只滚动 10px。根因是子按钮捕获转交后的 lostpointercapture 冒泡错误清除地图跟踪。
- 修复后同用例横纵连续拖动均超过 60px，不误选、不关闭弹层；15 项家长端回归通过。
- 地图改为弹性填满信息与图例之间的剩余高度；检查放大截图及正文不额外滚动断言。真机未测。

### 2026-10-26 班级＋物品组合（B/I）
- 单规格且带物品时进入完整选择弹窗，规格默认选中；座位确认回填草稿，物品多选随最终确认保存，关闭不覆盖原值。无物品单规格班级保留直达选座。
- 新增第五个模拟项目和对应状态回归；套餐购买校验覆盖全部五项。查看组合弹窗截图，布局沿用既有选项组件。
- check/build 通过；家长端与工作区31项用例中28项首轮通过，3项因原“最后一行”定位修正后复跑通过。真机未测。

### 2026-10-26 公共弹层顶部拖拽边界（I）
- BottomSheet 正文、描述、底栏统一忽略 swipe，顶部横杠/标题继续支持选择层下滑取消；editor 全层禁止不变。筛选、日期、积分、课程选择等沿用封装，不改变各自确认和草稿边界。
- 浏览器触摸输入验证正文顶部向下拖动保持打开且 transform 为0，随后标题下拉正常关闭；23项课程及积分流程含Light/Dark回归通过，检查弹窗截图，未修改视觉尺寸。
- 真机触摸未验证。独立SideDrawer未改动。

### 2026-10-26 班级选择区64px（V）
- 名称/上课时间按钮基准高80→64px，两行gap6→4px，上下padding12→10px；选座附属区不变，长文案仍自然增高。
- 浏览器断言64px与4px通过，查看班级选择弹窗截图；16项课程回归通过。真机未测。

### 2026-10-26 班级选中描边（V）
- 班级卡片描边改为与规格选项一致的1px/color-border-brand-subtle；保持内容、圆角及选择交互。
- 浏览器断言选中卡片与规格选项border-color相同、边宽1px通过；3项相关浅深色流程回归通过，已查看弹窗截图。真机未测。

### 2026-10-26 JingBei数字字体与班级选中文字（V）
- 字体从用户本机复制到public/fonts/numeric，源文件不改；同源@font-face不含local()，仅原numeric消费点使用，不修改正文系统字体。
- 浏览器请求字体200/3016字节；Chrome平台字体接口确认主价格实际使用isCustomFont字体，非仅CSS声明。构建dist包含相同字体文件，已检查价格截图。
- 选中班级名称品牌蓝，时间不改；相关Light/Dark选择用例验证文字色与规格选项相同。未实测Windows电脑或真机。

### 2026-10-27 班级剩余名额与选座摘要（V/I）
- 名额移至时间/附加信息下方，文案剩余名额：x；附加信息模拟老师名称，未配置项不占空行。
- 选座行由未选择座位占位切换为座位x排x座，已选入口仅显示修改；两行信息仍64px基准，有新增字段自然增高。
- 16项课程回归通过，覆盖更换班级清空座位、取消与确认、0名额显示和缺省字段；检查选座摘要截图。真实后台配置及真机未接入/未验证。

### 2026-10-27 余位放标题右侧（V）
- 按最新示意将余位移至名称行右侧，文案剩余 x 席；老师与时间下一行，删除独立余位行，选座摘要不变。
- 3项相关浅深色选择回归通过，断言余位在标题右侧且同一行；已查看更新截图。真机未测。

### 2026-10-27 课程页面配置（B/I）
- 工作区新增班级多选/剩余席位两个本地Toggle，默认单选/显示余位；同源消息实时更新，不重载iframe。课程列表多选保存每班座位并逐个校验，固定班级项目不新增可选列表；关闭多选时首个班级生效。剩余开关不影响已满限制。
- 配置、课程、工作区33项回归通过，覆盖每班独立座位、取消草稿、切回单选、无座位课程多班及物品。补充“可多选/必选”联动后2项配置用例复跑通过。已查看面板与多选弹窗截图，真机未测。
- 配置是URL/内存预览状态，不接生产后台，不写localStorage；分享/独立打开使用当前预览参数，刷新工作区恢复入口URL参数。

### 2026-10-27 全量提交前验证
- pnpm check、pnpm build、pnpm test:icons通过（4项图标单元测试）。全量E2E共348项：首轮347通过，390px课程封面用例在图片解码前读取naturalWidth=0失败。
- 将该断言改为等待自然尺寸有效的expect.poll，不修改页面业务；课程详情与字体相关17项复跑全部通过。全量其余347项结果保留，未再次跑完整348项。
- 提交范围为当前全部源码、规范、测试与本地资源；不包含被忽略的node_modules、dist、截图输出与环境文件。不推送、不部署。
