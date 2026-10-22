export const businessPages = [{
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
}] as const;

/** Historical versions retained for direct-route review, omitted from active navigation. */
export const archivedBusinessPages = [{
  id: 'attendance', name: '出勤率报表', version: '1.0', status: '历史留存', route: '/pages/attendance/v1',
  audience: '班主任 / 老师 / 学管师',
  description: '按维度汇总出勤率，支持下钻课次明细。',
  figmaUrl: '',
}] as const;
