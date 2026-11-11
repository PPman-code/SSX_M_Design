/** Screenshot-based demo data. No inventory, account, order or payment API is connected. */
export const courseDetail = {
  name: '2026秋季·少儿艺术成长套餐',
  coverUrl: `${import.meta.env.BASE_URL}mock/courses/package-cover.png`,
  cartCount: 3,
};
export type BundleKind = 'course' | 'class' | 'goods';
export type SeatLayout = { rows: number; columns: number; available: readonly string[] };
export const compactSeatLayout: SeatLayout = { rows: 4, columns: 5, available: ['1-1', '1-2', '2-2', '2-3', '3-1', '3-3', '4-4', '4-5'] };
export const largeSeatLayout: SeatLayout = { rows: 8, columns: 10, available: Array.from({ length: 80 }, (_, index) => `${Math.floor(index / 10) + 1}-${index % 10 + 1}`).filter((_, index) => index % 5 !== 3) };
export type BundleGood = { id: string; name: string; price?: number };
type BundleSpecification = { label: string; price: number; originalPrice: number };
export type BundleItem = { specifications: readonly [BundleSpecification, ...BundleSpecification[]]; roomName?: string; seatLayout?: SeatLayout; requiresSeat: boolean; goodsOptions?: readonly BundleGood[]; includesGoods?: boolean; kinds: BundleKind[]; id: string; name: string; coverUrl?: string; className?: string; summary: string };
type SelectedBundleClass = { classId: string; className: string; seat: string };
export type BundleSelection = SelectedBundleClass & { classes?: SelectedBundleClass[]; specification: string; goods?: string[] };
export const bundleItems: readonly BundleItem[] = [
  { specifications: [{ label: '20课时', price: 2000, originalPrice: 6000 }, { label: '30课时', price: 3000, originalPrice: 9000 }], requiresSeat: true, kinds: ['course'], id: 'music-1', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, name: '少儿声乐启蒙课', className: '声乐启蒙·周六提高班', summary: '3-1　20小时' },
  { specifications: [{ label: '20课时', price: 0.01, originalPrice: 6000 }], requiresSeat: true, kinds: ['class'], id: 'music-2', name: '小小歌唱家·周末合唱班', summary: '3-3' },
  { specifications: [{ label: '10课时', price: 399, originalPrice: 699 }, { label: '20课时', price: 599, originalPrice: 999 }], requiresSeat: true, kinds: ['class'], id: 'presentation-class', name: '小小主持人·周日表达班', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, roomName: '星光校区·301阶梯教室', seatLayout: largeSeatLayout, summary: '10课时 / 20课时' },
  { specifications: [{ label: '10课时', price: 1000, originalPrice: 1500 }, { label: '20课时', price: 1800, originalPrice: 2700 }], requiresSeat: false, goodsOptions: [
    { id: 'shaker', name: '节奏练习沙锤', price: 100 },
    { id: 'scarf', name: '舞台表演丝巾', price: 39 },
    { id: 'workbook', name: '音乐律动练习册', price: 29.9 },
  ], kinds: ['course', 'goods'], id: 'football', coverUrl: `${import.meta.env.BASE_URL}mock/courses/stage-course.png`, name: '音乐律动与舞台表现课（含练习道具）', className: '舞台表现·周六基础班', summary: '1套道具　10课时' },
  { specifications: [{ label: '16课时', price: 799, originalPrice: 1099 }], requiresSeat: true, kinds: ['class', 'goods'], id: 'choir-with-goods', name: '童声合唱·舞台实践班（含演出用品）', coverUrl: `${import.meta.env.BASE_URL}mock/courses/vocal-course.png`, roomName: '星光校区·202合唱教室', summary: '16课时 · 演出用品', includesGoods: true, goodsOptions: [
    { id: 'choir-folder', name: '合唱谱夹' },
    { id: 'choir-scarf', name: '演出领巾' },
    { id: 'choir-workbook', name: '视唱练耳练习册' },
  ] },
];

export const exampleBundleSelections: Record<string, BundleSelection> = {
  'music-1': { specification: '20课时', classId: 'class-1', className: '声乐启蒙·周六基础班', seat: '2-3' },
  'music-2': { specification: '20课时', classId: 'music-2', className: '', seat: '3-3' },
  'presentation-class': { specification: '20课时', classId: 'presentation-class', className: '', seat: '3-5' },
  football: { specification: '10课时', classId: 'class-1', className: '舞台表现·周六基础班', seat: '', goods: ['shaker', 'scarf'] },
  'choir-with-goods': { specification: '16课时', classId: 'choir-with-goods', className: '', seat: '1-2', goods: ['choir-folder', 'choir-scarf', 'choir-workbook'] },
};

export const formatCourseAmount = (amount: number) => amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
export const formatBundleGood = (good: BundleGood) => good.price == null ? good.name : `${good.name} ¥${formatCourseAmount(good.price)}`;
export function getSelectedBundleGoods(item: BundleItem, selectedIds: readonly string[] = []) {
  const goods = item.goodsOptions ?? [];
  return item.includesGoods ? goods : goods.filter(good => selectedIds.includes(good.id));
}

export function getBundleItemPrices(item: BundleItem, specification?: string, selectedGoods?: readonly string[]) {
  const option = item.specifications.find(value => value.label === specification)
    ?? item.specifications.reduce((lowest, value) => value.price < lowest.price ? value : lowest);
  const goodsCents = getSelectedBundleGoods(item, selectedGoods).reduce((sum, good) => sum + Math.round((good.price ?? 0) * 100), 0);
  return {
    saleCents: Math.round(option.price * 100) + goodsCents,
    originalCents: Math.round(option.originalPrice * 100) + goodsCents,
  };
}

export function getPackagePrices(selections: Readonly<Record<string, BundleSelection>> = {}) {
  let saleCents = 0;
  let originalCents = 0;
  for (const item of bundleItems) {
    const choice = selections[item.id];
    const prices = getBundleItemPrices(item, choice?.specification, choice?.goods);
    saleCents += prices.saleCents;
    originalCents += prices.originalCents;
  }
  return { saleCents, originalCents };
}

export const hasDirectSeatEntry = (item: BundleItem) => item.kinds.includes('class') && item.requiresSeat && item.specifications.length === 1 && !item.goodsOptions?.length;
