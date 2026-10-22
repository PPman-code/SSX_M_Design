export type DateRange = [string, string];
export type DateRangePreset = '本月' | '上月' | '最近30天';
export type DateRangePeriod = DateRangePreset | '自定义';
export const dateRangePresets: DateRangePreset[] = ['本月', '上月', '最近30天'];

/** Calendar-only arithmetic; callers provide their own local ISO day. */
export function rangeForPreset(period: DateRangePreset, today: string): DateRange {
  const [year, month, day] = today.split('-').map(Number);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  if (period === '最近30天') return [iso(new Date(Date.UTC(year, month - 1, day - 29))), today];
  if (period === '本月') return [`${today.slice(0, 8)}01`, today];
  return [iso(new Date(Date.UTC(year, month - 2, 1))), iso(new Date(Date.UTC(year, month - 1, 0)))];
}

export function periodForRange(value: DateRange, today: string): DateRangePeriod | null {
  if (!value[0] && !value[1]) return null;
  return dateRangePresets.find(period => {
    const range = rangeForPreset(period, today);
    return range[0] === value[0] && range[1] === value[1];
  }) ?? '自定义';
}

export function dateRangeLabel([start, end]: DateRange): string {
  const format = (date: string) => date.replaceAll('-', '/');
  if (!start && !end) return '不限';
  if (!end) return `${format(start)} 起`;
  if (!start) return `截至 ${format(end)}`;
  return `${format(start)}–${format(end)}`;
}
