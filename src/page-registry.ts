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
  id: 'attendance-v2', name: '出勤率报表', version: 'v2', status: '设计草稿', route: '/pages/attendance/v2',
  audience: '班主任 / 老师 / 学管师',
  description: '复制自 v1 的独立版本，包含汇总报表、筛选与课次明细。',
  figmaUrl: '',
}] as const;

/** Historical versions retained for direct-route review, omitted from active navigation. */
export const archivedBusinessPages = [{
  id: 'attendance', name: '出勤率报表', version: 'v1', status: '历史留存', route: '/pages/attendance/v1',
  audience: '班主任 / 老师 / 学管师',
  description: '按维度汇总出勤率，支持下钻课次明细。',
  figmaUrl: '',
}] as const;
