import { localDay } from '../../prospective-students/v1/model';
import type { DateRangePeriod } from '../../../lib/date-range';
import type { Communication } from './model';
export type HistoryFilter = { dates: [string, string]; datePeriod: DateRangePeriod | null; includeOutbound: boolean; stages: string[] };
export const emptyHistoryFilter = (): HistoryFilter => ({ dates: ['', ''], datePeriod: '不限时间', includeOutbound: true, stages: ['售前'] });
export function matchesHistory(item: Pick<Communication, 'createdAt' | 'stage' | 'outbound'>, filter: HistoryFilter) {
  const date = localDay(new Date(item.createdAt));
  return (!filter.dates[0] || date >= filter.dates[0]) && (!filter.dates[1] || date <= filter.dates[1])
    && (filter.includeOutbound || !item.outbound) && (!filter.stages.length || filter.stages.includes(item.stage ?? '售前'));
}
