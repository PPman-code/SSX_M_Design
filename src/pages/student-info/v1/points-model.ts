export type PointsOperation = 'add' | 'subtract';
export interface PointsRule { id: string; name: string; points: string; reason: string; unlimited: boolean }
export interface PointsEntry { id: string; points: string; reason: string }
export const initialPointsRules: PointsRule[] = [
  { id: 'class', name: '课堂表现积极', points: '3', reason: '', unlimited: false },
  { id: 'homework', name: '按时完成作业', points: '2', reason: '', unlimited: false },
  { id: 'practice', name: '课后练习优秀', points: '5', reason: '', unlimited: false },
  { id: 'other', name: '其他奖励', points: '', reason: '', unlimited: true },
];
export const initialSubtractRules: PointsRule[] = [
  { id: 'late', name: '迟到', points: '1', reason: '', unlimited: false },
  { id: 'supplies', name: '未带学习用品', points: '2', reason: '', unlimited: false },
];
// Decimal amounts are accumulated in hundredths to avoid 0.1 + 0.2 artifacts.
export function pointsInCents(value: string): number | null {
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value.trim())) return null;
  const num = Number(value.trim());
  if (!Number.isFinite(num) || num <= 0) return null;
  const cents = Math.round(num * 100);
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}
export const formatPoints = (cents: number) => String(Number((cents / 100).toFixed(2)));
