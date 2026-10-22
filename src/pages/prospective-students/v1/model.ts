export type Customer = {
  id: string; name: string; gender?: 'male' | 'female'; phone: string; avatar?: string;
  status: string; owner: string; level: number | null; lastDate: string; nextDate: string; inputDate: string;
  campus: string; school: string; grade: string; source: string; tags: string[]; region: string; remark: string;
  custom: Record<string, string | string[]>; subordinate: boolean;
};
export const statuses = ['跟进中', '待邀约', '转化成功', '体验课报名', '已流失'];
export const editableStatuses = ['跟进中', '待邀约', '已流失'];
export const campuses = ['北京乐博', '上海乐博'];
export const owners = ['刘亦菲', '王老师'];
export function localDay(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function dateLabel(value: string, follow = false, today = localDay()) {
  if (!value) return follow ? '待定' : '';
  const day = value.slice(0, 10);
  if (follow && day === today) return '今天';
  const [year, month, date] = day.split('-').map(Number);
  const currentYear = Number(today.slice(0, 4));
  // 规范标准：跨当前自然年（无论过去还是未来）显示年份，当年仅显示月日
  return `${year !== currentYear ? `${year}年` : ''}${month}月${date}日`;
}
export function createCustomers(): Customer[] {
  const today = localDay();
  const currentYear = Number(today.slice(0, 4));
  const nextYear = currentYear + 1;
  const names = ['廖小龙', '王五五', '李孝利', '黎晓露', '陈小雨', '张子涵', '林依诺', '赵梓萱', '周嘉豪', '孙奕鸣'];
  const phones = [
    '13219717182', '15623459876', '14152363623', '13800138000', '13900139000',
    '18612345678', '17798765432', '13567891234', '15811223344', '19988776655'
  ];
  return names.map((name, i) => ({
    id: `customer-${i + 1}`, name, gender: i % 2 === 0 ? 'male' : 'female', phone: phones[i],
    status: statuses[i % statuses.length],
    owner: i === 4 || i === 7 ? owners[1] : owners[0],
    level: [4, 3, null, 1, 3, 5, 4, 3, null, 2][i],
    lastDate: i === 3 ? '' : `${today.slice(0, 8)}${String(Math.max(1, Number(today.slice(8)) - i - 1)).padStart(2, '0')}`,
    nextDate: i === 0 ? today : i === 1 ? `${today.slice(0, 8)}22` : i === 4 ? `${today.slice(0, 8)}23` : i === 5 ? `${nextYear}-01-05` : '',
    inputDate: `${today.slice(0, 4)}-09-${String(25 - (i % 10)).padStart(2, '0')}`,
    campus: campuses[i % 2],
    school: ['实验小学', '育才小学', '第一小学', '实验小学', '育才小学', '光明小学', '外国语附小', '第二实验小学', '朝阳外国语', '师范附小'][i],
    grade: ['一年级', '二年级', '三年级', '四年级', '幼小衔接'][i % 5],
    source: ['线上咨询', '朋友推荐', '到店咨询', '地推活动', '转介绍'][i % 5],
    tags: i % 2 ? ['重点跟进'] : ['新客户'],
    region: i % 2 ? '上海' : '北京',
    remark: i === 5 ? '跨年跟进需求' : i % 2 ? '希望周末上课' : '',
    custom: { course: i % 2 ? '美术' : '编程', experience: ['零基础', '学过一点', '有基础'][i % 3], goals: i % 2 ? ['兴趣', '表达'] : ['长期系统学习'], contactTime: i % 2 ? '工作日上午' : '工作日晚上（家长下班后联系）', notes: i % 2 ? '希望周末安排课程' : '', budget: '3000' },
    subordinate: i === 4 || i === 8,
  }));
}
export type Filters = {
  scope: 'self' | 'subordinates' | 'all'; campus: string[]; owner: string[]; status: string[]; level: string[];
  grade: string[]; source: string[]; tags: string[]; region: string; remark: string; custom: Record<string, string | string[]>;
  nextDate: [string, string]; inputDate: [string, string]; lastDate: [string, string];
};
export const emptyFilters = (): Filters => ({ scope: 'all', campus: [], owner: [], status: [], level: [], grade: [], source: [], tags: [], region: '', remark: '', custom: {}, nextDate: ['', ''], inputDate: ['', ''], lastDate: ['', ''] });
export const sortOptions = [{ key: 'name', label: '姓名' }, { key: 'inputDate', label: '录入时间' }, { key: 'nextDate', label: '跟进时间' }, { key: 'lastDate', label: '沟通时间' }, { key: 'level', label: '意向级别' }] as const;
export type SortKey = typeof sortOptions[number]['key'];
export function invalidDateRange(filters: Filters) {
  return (['nextDate', 'inputDate', 'lastDate'] as const).some(key => filters[key][0] && filters[key][1] && filters[key][0] > filters[key][1]);
}
export function selectCustomers(customers: Customer[], query: string, filters: Filters, sort: SortKey, descending: boolean) {
  const multiple = ['campus', 'owner', 'status', 'level', 'grade', 'source', 'tags'] as const;
  return customers.filter(customer => {
    // Preview identity only; production must use authorized ownership metadata.
    const own = customer.owner === owners[0] && !customer.subordinate;
    if (filters.scope === 'self' && !own) return false;
    if (filters.scope === 'subordinates' && !own && !customer.subordinate) return false;
    if (query && ![customer.name, customer.phone, customer.school].some(value => value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))) return false;
    if (multiple.some(key => filters[key].length && !filters[key].some(value => key === 'tags' ? customer.tags.includes(value) : String(customer[key] ?? '') === value))) return false;
    if (filters.region && !customer.region.includes(filters.region)) return false;
    if (filters.remark && !customer.remark.includes(filters.remark)) return false;
    if (Object.entries(filters.custom).some(([key, expected]) => {
      if (!expected.length) return false;
      const actual = customer.custom[key];
      return Array.isArray(expected) ? !expected.some(value => Array.isArray(actual) ? actual.includes(value) : actual === value) : typeof actual !== 'string' || !actual.includes(expected);
    })) return false;
    return (['nextDate', 'inputDate', 'lastDate'] as const).every(key => {
      const [start, end] = filters[key]; const value = customer[key].slice(0, 10);
      return !start && !end || !!value && (!start || value >= start) && (!end || value <= end);
    });
  }).sort((a, b) => {
    const av = a[sort]; const bv = b[sort];
    if (av == null || av === '') return bv == null || bv === '' ? 0 : 1;
    if (bv == null || bv === '') return -1;
    const result = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv), 'zh-CN', { numeric: true });
    return descending ? -result : result;
  });
}

export type CustomField = { key: string; label: string; type: 'text' | 'single' | 'multiple' | 'date' | 'number'; presentation?: 'inline' | 'selector'; options?: string[] };
/** Preview configuration, replaced by authorized server field metadata during integration. */
export const customFields: CustomField[] = [
  { key: 'course', label: '意向课程', type: 'multiple', options: ['编程', '美术'] },
  { key: 'experience', label: '学习基础', type: 'single', presentation: 'inline', options: ['零基础', '学过一点', '有基础'] },
  { key: 'goals', label: '家长期望通过课程重点培养的能力与学习目标', type: 'multiple', presentation: 'inline', options: ['兴趣', '提升逻辑思维与独立解决问题的能力', '表达', '参加校内外科技创新活动并完成作品展示', '长期系统学习'] },
  { key: 'contactTime', label: '方便联系的时间', type: 'single', options: ['工作日上午', '工作日晚上（家长下班后联系）', '周末或节假日，联系前请先发消息确认'] },
  { key: 'notes', label: '其他需要提前了解的学习情况与家长补充说明', type: 'text' },
  { key: 'budget', label: '预计课程预算（元）', type: 'number' },
];
