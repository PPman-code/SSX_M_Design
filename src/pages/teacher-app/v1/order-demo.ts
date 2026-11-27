export type OrderStatus = 'unpaid' | 'paid' | 'closed' | 'expired';

export interface DemoOrder {
  number: string;
  student: string;
  studentNumber: string;
  phone: string;
  campus: string;
  products: readonly string[];
  due: number;
  received: number;
  status: OrderStatus;
  hasContract: boolean;
}

const reading = '阅读写作';
const math = '数学思维';
const art = '创意美术';
const books = '阅读配套教材';
const vocal = '少儿声乐基础课程';

export const orderCampuses = [
  { value: 'all', label: '全部校区' },
  { value: 'east', label: '城东校区' },
  { value: 'south', label: '城南校区' },
  { value: 'west', label: '城西校区' },
];

const rows = [
  ['261127154000000001', '陈小宇', 'east', [reading], 960, 0, 'unpaid', false],
  ['261126102000000002', '周子涵', 'east', [math, art, books], 2616, 2616, 'paid', true],
  ['261125154000000003', '李沐阳', 'south', [books, reading, math], 1944, 1944, 'paid', false],
  ['261124102000000004', '王欣然', 'west', [vocal, math, art, books], 8076, 0, 'expired', false],
  ['261123154000000005', '张子墨', 'east', [reading, books], 1800, 900, 'paid', false],
  ['261122102000000006', '林可', 'south', [vocal, math, art], 5980, 5980, 'paid', true],
  ['261121154000000007', '王欣悦', 'west', [art], 1280, 0, 'closed', false],
  ['261120102000000008', '赵梓萱', 'east', [math, art, books], 3696, 3696, 'paid', false],
  ['261119154000000009', '刘思远', 'south', [reading], 1920, 1920, 'paid', false],
  ['261118102000000010', '郑家禾', 'west', [art, math, books], 3726, 0, 'expired', false],
  ['261117154000000011', '徐嘉宁', 'east', [vocal, books], 2160, 2160, 'paid', true],
  ['261116102000000012', '孙明轩', 'south', [math], 1600, 1600, 'paid', false],
  ['261115154000000013', '何思琪', 'west', [reading, art], 2560, 0, 'closed', false],
  ['261114102000000014', '杨子安', 'east', [vocal], 2400, 2400, 'paid', true],
  ['261113154000000015', '许佳乐', 'south', [reading, math], 3100, 3100, 'paid', false],
] as const;

export const demoOrders: DemoOrder[] = rows.map(([number, student, campus, products, due, received, status, hasContract], index) => ({
  number, student, campus, products, due, received, status, hasContract,
  studentNumber: `S${6801 + index}`,
  phone: `1700000${6801 + index}`,
}));
