import { useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Icon } from '../../../components/ui/Icon';
import { dateRangeLabel, type DateRange, type DateRangePeriod, type DateRangePreset } from '../../../lib/date-range';
import { Button } from '../../../components/ui/Button';
import { DateRangeFields } from '../../../components/ui/DateRangeFields';
import { SheetActions, SheetChoiceGroup } from '../../../components/ui/SheetContent';
import { localDay } from '../../prospective-students/v1/model';
import { emptyHistoryFilter, type HistoryFilter } from './history-filter';
const presets: readonly DateRangePreset[] = ['不限时间', '今天', '昨天', '本周', '最近 7 天', '最近 30 天', '最近 1 年', '本月'];
export function CustomerHistoryFilters({ value, onChange }: { value: HistoryFilter; onChange: (next: HistoryFilter) => void }) {
  const [open, setOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [dates, setDates] = useState<DateRange>(value.dates);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<DateRangePeriod | null>('不限时间');
  const [resetKey, setResetKey] = useState(0);
  const today = localDay();
  function beginFilter() { setDraft({ ...value, dates: [...value.dates], stages: [...value.stages] }); setOpen(true); }
  function beginDate() { setPeriod(value.datePeriod); setResetKey(key => key + 1); setDates([...value.dates]); setError(''); setDateOpen(true); }
  function resetDate() { setDates(['', '']); setPeriod('不限时间'); setResetKey(key => key + 1); setError(''); }
  return <>
    <div className="ai-history-filter"><Button variant="text" size="sm" onClick={beginDate}>{value.dates.some(Boolean) ? (value.datePeriod && value.datePeriod !== '自定义' && value.datePeriod !== '不限时间' ? value.datePeriod : dateRangeLabel(value.dates)) : '不限日期'}<Icon name="caret-down" size="sm" /></Button><Button variant="text" size="sm" onClick={beginFilter}>筛选<Icon name="caret-down" size="sm" /></Button></div>
    <BottomSheet open={dateOpen} onOpenChange={setDateOpen} title="选择日期" footer={<>{error && <p role="alert" className="ai-error">{error}</p>}<SheetActions secondary={{ label: '重置', onClick: resetDate }} primary={{ label: '确定', onClick: () => { if (dates[0] && dates[1] && dates[0] > dates[1]) { setError('开始日期不能晚于结束日期'); return; } onChange({ ...value, dates, datePeriod: period }); setDateOpen(false); } }} /></>}>
      <DateRangeFields key={resetKey} today={today} presets={presets} period={period} value={dates} onChange={(nextPeriod, nextDates) => { setPeriod(nextPeriod); setDates(nextDates); }} />
    </BottomSheet>
    <BottomSheet className="ai-history-options-sheet" open={open} onOpenChange={setOpen} title="筛选沟通记录" footer={<SheetActions secondary={{ label: '重置', onClick: () => setDraft({ ...emptyHistoryFilter(), dates: value.dates }) }} primary={{ label: '确定', onClick: () => { onChange({ ...value, includeOutbound: draft.includeOutbound, stages: draft.stages }); setOpen(false); } }} />}>
      <div className="ai-stage-filter"><SheetChoiceGroup label="外呼沟通记录" options={[{ value: 'include', label: '包含' }, { value: 'exclude', label: '不包含' }]} value={[draft.includeOutbound ? 'include' : 'exclude']} onToggle={option => setDraft(current => ({ ...current, includeOutbound: option === 'include' }))} />
      <SheetChoiceGroup label="沟通阶段" options={['售前', '售后'].map(stage => ({ value: stage, label: stage }))} value={draft.stages} onToggle={stage => setDraft(current => ({ ...current, stages: current.stages.includes(stage) ? current.stages.filter(item => item !== stage) : [...current.stages, stage] }))} /></div>
    </BottomSheet>
  </>;
}
