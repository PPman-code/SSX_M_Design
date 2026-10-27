/** Screenshot-based demo data. No inventory, account, order or payment API is connected. */
export const courseDetail = {
  name: '2026秋季·少儿艺术成长套餐',
  coverUrl: `${import.meta.env.BASE_URL}mock/courses/package-cover.png`,
  price: 3199.01,
  originalPrice: 13199,
  cartCount: 3,
};
export type BundleKind = 'course' | 'class' | 'goods';
export type SeatLayout = { rows: number; columns: number; available: readonly string[] };
export const compactSeatLayout: SeatLayout = { rows: 4, columns: 5, available: ['1-1', '1-2', '2-2', '2-3', '3-1', '3-3', '4-4', '4-5'] };
export const largeSeatLayout: SeatLayout = { rows: 8, columns: 10, available: Array.from({ length: 80 }, (_, index) => `${Math.floor(index / 10) + 1}-${index % 10 + 1}`).filter((_, index) => index % 5 !== 3) };
export type BundleGood = { id: string; name: string; price: number };
export type BundleItem = { specifications: readonly string[]; roomName?: string; seatLayout?: SeatLayout; requiresSeat: boolean; goodsOptions?: readonly BundleGood[]; kinds: BundleKind[]; id: string; name: string; coverUrl?: string; className?: string; summary: string; price?: number };
export const bundleItems: readonly BundleItem[] = [
  { specifications: ['20课时', '30课时'], requiresSeat: true, kinds: ['course'], id: 'music-1', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, name: '少儿声乐启蒙课', className: '声乐启蒙·周六提高班', summary: '3-1　20小时', price: 2000 },
  { specifications: ['20课时'], requiresSeat: true, kinds: ['class'], id: 'music-2', name: '小小歌唱家·周末合唱班', summary: '3-3' },
  { specifications: ['10课时', '20课时'], requiresSeat: true, kinds: ['class'], id: 'presentation-class', name: '小小主持人·周日表达班', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, roomName: '星光校区·301阶梯教室', seatLayout: largeSeatLayout, summary: '10课时 / 20课时' },
  { specifications: ['10课时'], requiresSeat: false, goodsOptions: [
    { id: 'shaker', name: '节奏练习沙锤', price: 100 },
    { id: 'scarf', name: '舞台表演丝巾', price: 39 },
    { id: 'workbook', name: '音乐律动练习册', price: 29.9 },
  ], kinds: ['course', 'goods'], id: 'football', coverUrl: `${import.meta.env.BASE_URL}mock/courses/stage-course.png`, name: '音乐律动与舞台表现课（含练习道具）', className: '舞台表现·周六基础班', summary: '1套道具　10课时', price: 1000 },
  { specifications: ['16课时'], requiresSeat: true, kinds: ['class', 'goods'], id: 'choir-with-goods', name: '童声合唱·舞台实践班（含演出用品）', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, roomName: '星光校区·202合唱教室', summary: '16课时 · 演出用品', goodsOptions: [
    { id: 'choir-folder', name: '合唱谱夹', price: 35 },
    { id: 'choir-scarf', name: '演出领巾', price: 29 },
    { id: 'choir-workbook', name: '视唱练耳练习册', price: 39.9 },
  ] },
];
export const formatCourseAmount = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 2 });

export const hasDirectSeatEntry = (item: BundleItem) => item.kinds.includes('class') && item.requiresSeat && item.specifications.length === 1 && !item.goodsOptions?.length;
