export type DateRange = [string, string];
export type DateRangePreset = '本月' | '上月' | '最近30天' | '不限时间' | '今天' | '昨天' | '本周' | '最近 7 天' | '最近 30 天' | '最近 1 年';
export type DateRangePeriod = DateRangePreset | '自定义';
export const dateRangePresets: DateRangePreset[] = ['本月', '上月', '最近30天'];

/** Calendar-only arithmetic; callers provide their own local ISO day. */
export function rangeForPreset(period: DateRangePreset, today: string): DateRange {
  const [year, month, day] = today.split('-').map(Number);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  if (period === '不限时间') return ['', ''];
  if (period === '今天') return [today, today];
  if (period === '昨天') { const yesterday = iso(new Date(Date.UTC(year, month - 1, day - 1))); return [yesterday, yesterday]; }
  if (period === '本周') { const offset = (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7; return [iso(new Date(Date.UTC(year, month - 1, day - offset))), today]; }
  if (period === '最近 7 天') return [iso(new Date(Date.UTC(year, month - 1, day - 6))), today];
  if (period === '最近 1 年') return [iso(new Date(Date.UTC(year, month - 1, day - 364))), today];
  if (period === '最近30天' || period === '最近 30 天') return [iso(new Date(Date.UTC(year, month - 1, day - 29))), today];
  if (period === '本月') return [`${today.slice(0, 8)}01`, today];
  return [iso(new Date(Date.UTC(year, month - 2, 1))), iso(new Date(Date.UTC(year, month - 1, 0)))];
}

export function periodForRange(value: DateRange, today: string, presets: readonly DateRangePreset[] = dateRangePresets): DateRangePeriod | null {
  if (!value[0] && !value[1]) return presets.includes('不限时间') ? '不限时间' : null;
  return presets.find(period => {
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
