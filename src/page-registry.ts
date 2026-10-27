const teacherBusinessPages = [{
  id: 'home', name: '首页', version: 'v1', status: '设计草稿', route: '/pages/home/v1',
  audience: '老师 / 班主任 / 学管师', description: '待办事项、常用功能、报表中心与今日课表；图标暂以色块占位。',
  figmaUrl: 'https://www.figma.com/design/hoN0voWKmRtnWBPuzMw1yB/?node-id=4195-60284',
}, {
  id: 'my', name: '我的', version: 'v1', status: '设计草稿', route: '/pages/my/v1',
  audience: '班主任',
  description: '个人信息、报名收款及常用功能入口。',
  figmaUrl: 'https://www.figma.com/design/lrjKupwY2XZhLxCijHNkr9/?node-id=6001-2456',
}, {
  id: 'attendance-v2', name: '出勤率报表', version: '1.1', status: '设计草稿', route: '/pages/attendance/v2',
  audience: '班主任 / 老师 / 学管师',
  description: '复制自 v1 的独立版本，包含汇总报表、筛选与课次明细。',
  figmaUrl: '',
}, {
  id: 'prospective-students', name: '意向客户管理', version: '1.0', status: '设计草稿', route: '/pages/prospective-students/v1',
  audience: '招生顾问 / 客户责任人', description: '客户列表、搜索、排序、筛选及批量管理；本地模拟，业务流程待对接。',
  figmaUrl: 'https://www.figma.com/design/hoN0voWKmRtnWBPuzMw1yB/?node-id=4300-74914',
}, {
  id: 'students', name: '学员管理', version: '1.0', status: '设计草稿', route: '/pages/students/v1',
  audience: '老师 / 班主任 / 学管师', description: '学员列表、分类页签、搜索、排序及筛选；本地模拟数据。',
  figmaUrl: 'https://www.figma.com/design/hoN0voWKmRtnWBPuzMw1yB/?node-id=4300-74914',
}, {
  id: 'student-info', name: '学员信息', version: '1.0', status: '设计草稿', route: '/pages/student-info/v1',
  audience: '老师 / 班主任 / 学管师', description: '页面骨架，仅实现加减积分菜单入口，正文和后续操作待设计。',
  figmaUrl: '',
}, ...[
  ['customer-info', '意向客户信息'], ['ai-recording', 'AI 实时记录'], ['ai-pending', '待处理 AI 记录'], ['ai-record', 'AI 记录详情'], ['communication-form', '添加沟通记录'], ['communication-detail', '沟通记录详情'],
].map(([id, name]) => ({ id, name, version: '1.0', status: '设计草稿', route: `/pages/${id}/v1`, audience: '招生顾问 / 客户责任人', description: 'AI 沟通记录交互演示；收音、转写和总结为模拟。', figmaUrl: '' }))] as const;

/** Parent-facing work starts directly at course detail; preceding flows are intentionally absent. */
export const parentBusinessPages = [{
  id: 'parent-course-detail', name: '课程详情', version: 'v1', status: '设计草稿', route: '/pages/parent-course-detail/v1',
  audience: '家长', description: '基于用户截图的课程套餐详情，含4:3封面占位、套餐项目与底部操作；收藏为本地状态，购买及前置页面待补充。', figmaUrl: '',
}] as const;
export const businessPages = [...teacherBusinessPages, ...parentBusinessPages] as const;
export const previewProjects = [
  { id: 'teacher', name: '教师端项目', entryPageId: 'home', icon: 'user' },
  { id: 'parent', name: '家长端项目', entryPageId: 'parent-course-detail', icon: 'user-group' },
] as const;
export function projectForPage(pageId: string) { return parentBusinessPages.some(page => page.id === pageId) ? 'parent' : 'teacher'; }

/** Historical versions retained for direct-route review, omitted from active navigation. */
export const archivedBusinessPages = [{
  id: 'attendance', name: '出勤率报表', version: '1.0', status: '历史留存', route: '/pages/attendance/v1',
  audience: '班主任 / 老师 / 学管师',
  description: '按维度汇总出勤率，支持下钻课次明细。',
  figmaUrl: '',
}] as const;
