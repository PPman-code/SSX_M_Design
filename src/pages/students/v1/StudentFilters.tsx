import { useRef, useState, type RefObject } from 'react';
import { SideDrawer } from '../../../components/ui/SideDrawer';
import { SheetActions, SheetChoiceGroup, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Search } from '../../../components/ui/Search';
import { Input } from '../../../components/ui/Input';
import { DateRangeFields } from '../../../components/ui/DateRangeFields';
import { dateRangeLabel, periodForRange, type DateRange, type DateRangePeriod } from '../../../lib/date-range';
import { defaultFilters, type StudentFilters as FilterValue } from './model';
import { studentFilterOptions } from './student-filter-data';
import './student-filters.css';

const selections = [
  ['campuses', '校区名称', studentFilterOptions.campuses],
  ['classes', '班级名称', studentFilterOptions.classes],
  ['teachers', '班级任课老师', studentFilterOptions.teachers],
] as const;
type SelectionKey = typeof selections[number][0];
const dates = [['lastDate', '沟通时间'], ['birthDate', '出生日期'], ['birthday', '生日']] as const;
type DateKey = typeof dates[number][0];
const numbers = [['quantityRange', '剩余数量'], ['tuitionRange', '剩余学费（元）']] as const;

export function StudentFilters({ value, onApply, open, onOpenChange, finalFocus }: {
  value: FilterValue; onApply: (filters: FilterValue) => void; open: boolean; onOpenChange: (open: boolean) => void;
  finalFocus: RefObject<HTMLButtonElement | null>;
}) {
  const [draft, setDraft] = useState(() => structuredClone(value));
  const [error, setError] = useState('');
  const [invalidNumber, setInvalidNumber] = useState('');
  const [selection, setSelection] = useState<SelectionKey | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const [dateKey, setDateKey] = useState<DateKey | null>(null);
  const [dateDraft, setDateDraft] = useState<DateRange>(['', '']);
  const [datePeriod, setDatePeriod] = useState<DateRangePeriod | null>(null);
  const [dateError, setDateError] = useState('');
  const [dateResetKey, setDateResetKey] = useState(0);
  const dateTrigger = useRef<HTMLButtonElement>(null);
  const [today] = useState(() => { const day = new Date(); return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`; });
  const field = selections.find(([key]) => key === selection);
  const options = field?.[2].filter(option => option.includes(query.trim())) ?? [];
  function openSelection(key: SelectionKey) {
    trigger.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    setSelection(key); setSelected([...draft[key]]); setQuery('');
  }
  function row(key: SelectionKey) {
    const [, label] = selections.find(([value]) => value === key)!;
    const values = draft[key];
    return <Cell key={key} label={label} value={values.length > 1 ? `已选 ${values.length} 项` : values[0] || '不限'} arrow onClick={() => openSelection(key)} />;
  }
  function openDate(key: DateKey) {
    dateTrigger.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    setDateKey(key); setDateDraft([...draft[key]]); setDatePeriod(key === 'birthday' ? null : periodForRange(draft[key], today));
    setDateError(''); setDateResetKey(current => current + 1);
  }
  function dateRow(key: DateKey) {
    const [, label] = dates.find(([value]) => value === key)!;
    const range = draft[key];
    const summary = key === 'birthday' && range.some(Boolean) ? `${range[0]?.slice(5).replace('-', '/') || '不限'} 至 ${range[1]?.slice(5).replace('-', '/') || '不限'}` : dateRangeLabel(range);
    return <Cell key={key} label={label} value={range.some(Boolean) ? <span className="student-filter-date-summary">{summary}</span> : '不限'} arrow onClick={() => openDate(key)} />;
  }
  function apply() {
    for (const [key, label] of numbers) {
      const [min, max] = draft[key];
      if ([min, max].some(value => value.trim() && !Number.isFinite(Number(value))) || min.trim() && max.trim() && Number(min) > Number(max)) {
        setError(`${label}：请输入有效数值，最低值不能大于最高值`); setInvalidNumber(key);
        document.getElementById(`student-filter-${key}-min`)?.focus(); return;
      }
    }
    onApply(structuredClone(draft)); onOpenChange(false);
  }
  function confirmDate() {
    if (!dateKey) return;
    if (dateKey !== 'birthday' && dateDraft[0] && dateDraft[1] && dateDraft[0] > dateDraft[1]) { setDateError('开始日期不能晚于结束日期'); return; }
    setDraft(previous => ({ ...previous, [dateKey]: [...dateDraft] })); setDateKey(null);
  }
  return <SideDrawer title="筛选学员" open={open} onOpenChange={onOpenChange} finalFocus={finalFocus} footer={<>{error && <p className="student-filter-error" role="alert">{error}</p>}<SheetActions secondary={{ label: '重置', onClick: () => { setDraft(defaultFilters()); setError(''); setInvalidNumber(''); } }} primary={{ label: '确定', onClick: apply }} /></>}>
    <section className="student-filter-group">
      <SheetChoiceGroup label="查看学员范围" options={[{ value: 'all', label: '全部学员' }, { value: 'self', label: '自己名下学员' }]} value={[draft.scope]} onToggle={scope => setDraft(previous => ({ ...previous, scope: scope as FilterValue['scope'] }))} />
      <div className="student-filter-cells"><CellGroup label="学员归属筛选">{row('campuses')}{row('classes')}{row('teachers')}</CellGroup></div>
    </section>
    <section className="student-filter-group"><h3>学员信息</h3>
      <SheetChoiceGroup label="学员性别" options={[{ value: '', label: '不限' }, { value: 'male', label: '男' }, { value: 'female', label: '女' }]} value={[draft.gender]} onToggle={gender => setDraft(previous => ({ ...previous, gender: gender as FilterValue['gender'] }))} />
      <SheetChoiceGroup label="学员状态" options={['不限', '在读', '退学', '停课', '试听', '休学'].map(value => ({ value, label: value }))} value={draft.statuses.length ? draft.statuses : ['不限']} onToggle={value => setDraft(previous => ({ ...previous, statuses: value === '不限' ? [] : previous.statuses.includes(value) ? previous.statuses.filter(item => item !== value) : [...previous.statuses, value] }))} />
    </section>
    <section className="student-filter-group"><h3>数量与学费</h3>{numbers.map(([key, label]) => <fieldset className="student-filter-number" key={key}><legend>{label}</legend><div className="student-filter-number-fields">{(['最低值', '最高值'] as const).map((part, index) => <Input key={part} id={`student-filter-${key}-${index ? 'max' : 'min'}`} label={`${label}${part}`} hideLabel layout="external" inputMode="decimal" placeholder={part} value={draft[key][index]} status={invalidNumber === key ? 'error' : 'default'} onValueChange={value => { setDraft(previous => { const range: [string, string] = [...previous[key]]; range[index] = value; return { ...previous, [key]: range }; }); setError(''); setInvalidNumber(''); }} />)}<span aria-hidden="true">—</span></div></fieldset>)}</section>
    <section className="student-filter-group"><h3>课程条件</h3>{([['periods', '期段'], ['courseTypes', '类型']] as const).map(([key, label]) => <SheetChoiceGroup key={key} label={label} options={['不限', ...studentFilterOptions[key]].map(value => ({ value, label: value }))} value={draft[key].length ? draft[key] : ['不限']} onToggle={value => setDraft(previous => ({ ...previous, [key]: value === '不限' ? [] : previous[key].includes(value) ? previous[key].filter(item => item !== value) : [...previous[key], value] }))} />)}</section>
    <section className="student-filter-group"><h3>时间条件</h3><div className="student-filter-cells"><CellGroup label="学员时间筛选">{dates.map(([key]) => dateRow(key))}</CellGroup></div></section>
    <BottomSheet className="student-filter-selector" open={selection !== null} onOpenChange={next => { if (!next) setSelection(null); }} title={`选择${field?.[1] ?? ''}`} finalFocus={trigger} footer={<SheetActions secondary={{ label: '取消', onClick: () => setSelection(null) }} primary={{ label: '确定', onClick: () => { if (selection) setDraft(previous => ({ ...previous, [selection]: [...selected] })); setSelection(null); } }} />}>
      <Search label={`搜索${field?.[1] ?? ''}`} placeholder={`搜索${field?.[1] ?? ''}`} value={query} onValueChange={setQuery} />
      <SheetSelectionList multiple label={`${field?.[1] ?? ''}选项`} options={[{ value: '__all__', label: '不限' }, ...options.map(value => ({ value, label: value }))]} value={selected.length ? selected : ['__all__']} onToggle={value => setSelected(current => value === '__all__' ? [] : current.includes(value) ? current.filter(item => item !== value) : [...current, value])} />
      {query.trim() && !options.length && <p className="student-filter-empty" role="status">没有匹配的选项</p>}
    </BottomSheet>
    <BottomSheet className={`student-filter-date-selector${dateKey === 'birthday' ? ' student-birthday-selector' : ''}`} open={dateKey !== null} onOpenChange={next => { if (!next) setDateKey(null); }} title={dates.find(([key]) => key === dateKey)?.[1] ?? ''} finalFocus={dateTrigger} footer={<SheetActions secondary={{ label: '重置', onClick: () => { setDateDraft(['', '']); setDatePeriod(null); setDateError(''); setDateResetKey(current => current + 1); } }} primary={{ label: '确认', onClick: confirmDate }} />}>
      {dateKey === 'birthday' && <p className="student-filter-hint">请选择生日的起止月日。</p>}
      <DateRangeFields key={dateResetKey} precision={dateKey === 'birthday' ? 'month-day' : 'date'} today={today} period={datePeriod} value={dateDraft} presets={dateKey === 'birthday' || dateKey === 'birthDate' ? [] : undefined} onChange={(period, value) => { setDatePeriod(period); setDateDraft(value); setDateError(''); }} />
      {dateError && <p className="student-filter-error" role="alert">{dateError}</p>}
    </BottomSheet>
  </SideDrawer>;
}
