import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { SideDrawer } from '../../../components/ui/SideDrawer';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { DateRangeFields } from '../../../components/ui/DateRangeFields';
import { dateRangeLabel, periodForRange, type DateRange, type DateRangePeriod } from '../../../lib/date-range';
import { Search } from '../../../components/ui/Search';
import { SheetActions, SheetChoiceGroup, SheetSelectionList } from '../../../components/ui/SheetContent';
import { campuses, customFields as previewCustomFields, emptyFilters, invalidDateRange, localDay, owners, statuses } from './model';
import type { CustomField, Filters } from './model';

const dateConditions = [['nextDate', '下次跟进时间'], ['inputDate', '录入时间'], ['lastDate', '上次沟通时间']] as const;
type DateCondition = typeof dateConditions[number][0];

const choices = [
  ['status', '客户状态', statuses], ['level', '意向级别', ['1', '2', '3', '4']],
  ['grade', '年级', ['一年级', '二年级', '三年级']], ['source', '招生来源', ['线上咨询', '朋友推荐', '到店咨询']],
  ['tags', '客户标签', ['新客户', '重点跟进']],
] as const;
export function CustomerFilters({ value, onApply, open, onOpenChange, finalFocus, customFields = previewCustomFields }: {
  value: Filters; onApply: (value: Filters) => void; open: boolean; onOpenChange: (open: boolean) => void;
  finalFocus: RefObject<HTMLButtonElement | null>; customFields?: CustomField[];
}) {
  const [draft, setDraft] = useState<Filters>(() => structuredClone(value));
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<'campus' | 'owner'>('campus');
  const [fieldSelection, setFieldSelection] = useState<{ key: string; label: string; options: readonly string[]; multiple: boolean; custom?: boolean } | null>(null);
  const [fieldSelected, setFieldSelected] = useState<string[]>([]);
  const [fieldQuery, setFieldQuery] = useState('');
  const fieldTrigger = useRef<HTMLButtonElement>(null);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [today] = useState(localDay);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateKey, setDateKey] = useState<DateCondition>('nextDate');
  const [dateDraft, setDateDraft] = useState<DateRange>(['', '']);
  const [datePeriod, setDatePeriod] = useState<DateRangePeriod | null>(null);
  const [dateError, setDateError] = useState('');
  const [dateResetKey, setDateResetKey] = useState(0);
  const dateRows = useRef<HTMLDivElement>(null);
  const dateTrigger = useRef<HTMLButtonElement>(null);
  const dateLabel = dateConditions.find(([key]) => key === dateKey)![1];
  function openDate(key: DateCondition) {
    dateTrigger.current = dateRows.current?.querySelectorAll('button')[dateConditions.findIndex(([item]) => item === key)] ?? null;
    setDateKey(key); setDateDraft([...draft[key]]); setDatePeriod(periodForRange(draft[key], today));
    setDateError(''); setDateResetKey(current => current + 1); setDateOpen(true);
  }
  function resetDate() {
    setDateDraft(['', '']); setDatePeriod(null); setDateError(''); setDateResetKey(current => current + 1);
  }
  function confirmDate() {
    if (dateDraft[0] && dateDraft[1] && dateDraft[0] > dateDraft[1]) {
      setDateError('开始日期不能晚于结束日期'); return;
    }
    setDraft(previous => ({ ...previous, [dateKey]: [...dateDraft] }));
    setError(''); setDateOpen(false);
  }
  const selectionRows = useRef<HTMLDivElement>(null);
  const selectionTrigger = useRef<HTMLButtonElement>(null);
  function openSelection(key: 'campus' | 'owner') {
    selectionTrigger.current = selectionRows.current?.querySelectorAll('button')[key === 'campus' ? 0 : 1] ?? null;
    setSelected([...draft[key]]); setKeyword(''); setSelection(key); setSelectionOpen(true);
  }
  const selectionLabel = selection === 'campus' ? '中心名称' : '主责任人';
  const selectionOptions = (selection === 'campus' ? campuses : owners).filter(option => option.includes(keyword.trim()));
  function summary(values: string[]) { return values.length > 1 ? `已选 ${values.length} 项` : values[0] || '不限'; }
  function openField(field: NonNullable<typeof fieldSelection>, values: string[]) {
    fieldTrigger.current = document.activeElement instanceof HTMLButtonElement ? document.activeElement : null;
    setFieldSelection(field); setFieldSelected([...values]); setFieldQuery('');
  }
  function group(key: typeof choices[number][0]) {
    const [, label, options] = choices.find(item => item[0] === key)!;
    if (key !== 'level') return <div className="prospect-filter-select-row" key={key}><Cell label={label} value={summary(draft[key])} arrow onClick={() => openField({ key, label, options, multiple: key !== 'grade' }, draft[key])} /></div>;
    return <SheetChoiceGroup key={key} label={label} options={options.map(option => ({ value: option, label: `${option}心` }))} value={draft[key]} onToggle={option => setDraft(previous => ({ ...previous, [key]: previous[key].includes(option) ? [] : [option] }))} />;
  }
  return <SideDrawer title="筛选客户" open={open} onOpenChange={onOpenChange} finalFocus={finalFocus} footer={<>{error && <p role="alert" className="prospect-error">{error}</p>}<SheetActions secondary={{ label: '重置', onClick: () => { setDraft(emptyFilters()); setError(''); } }} primary={{ label: '确定', onClick: () => { if (invalidDateRange(draft)) { setError('开始日期不能晚于结束日期'); return; } onApply(draft); onOpenChange(false); } }} /></>}>
    <section className="prospect-filter-group"><div className="prospect-scope-choice"><SheetChoiceGroup label="查看客户范围" options={[{ value: 'self', label: '自己负责' }, { value: 'subordinates', label: '包含下属' }, { value: 'all', label: '所有人' }]} value={[draft.scope]} onToggle={scope => setDraft(previous => ({ ...previous, scope: scope as Filters['scope'] }))} /></div><div ref={selectionRows} className="prospect-ownership-cells"><CellGroup label="客户归属筛选"><Cell label="中心名称" value={draft.campus.length > 1 ? `已选 ${draft.campus.length} 个中心` : draft.campus[0] || '不限'} arrow onClick={() => openSelection('campus')} /><Cell label="主责任人" value={draft.owner[0] || '不限'} arrow onClick={() => openSelection('owner')} /></CellGroup></div></section>
    <section className="prospect-filter-group"><h3>客户信息</h3>{group('status')}{group('level')}{group('grade')}{group('source')}{group('tags')}</section>
    <section className="prospect-filter-group"><h3>时间条件</h3><div ref={dateRows} className="prospect-date-cells"><CellGroup label="客户时间筛选" variant="block">{dateConditions.map(([key, label]) => <Cell key={key} label={label} value={draft[key].some(Boolean) ? <span className="prospect-date-summary">{dateRangeLabel(draft[key])}</span> : '不限'} arrow onClick={() => openDate(key)} />)}</CellGroup></div></section>
    <section className="prospect-filter-group"><h3>更多条件</h3><Input className="prospect-filter-input" layout="external" label="号码归属地" value={draft.region} onValueChange={region => setDraft(previous => ({ ...previous, region }))} placeholder="请输入地区" clearable /><Input className="prospect-filter-input" layout="external" label="客户备注信息" value={draft.remark} onValueChange={remark => setDraft(previous => ({ ...previous, remark }))} placeholder="请输入关键词" clearable />{customFields.map(field => field.type === 'single' || field.type === 'multiple' ? field.presentation === 'inline' ? <SheetChoiceGroup key={field.key} label={field.label} options={(field.options ?? []).map(option => ({ value: option, label: option }))} value={Array.isArray(draft.custom[field.key]) ? draft.custom[field.key] as string[] : []} onToggle={option => setDraft(previous => { const current = Array.isArray(previous.custom[field.key]) ? previous.custom[field.key] as string[] : []; return { ...previous, custom: { ...previous.custom, [field.key]: current.includes(option) ? current.filter(item => item !== option) : field.type === 'single' ? [option] : [...current, option] } }; })} /> : <div className="prospect-filter-select-row" key={field.key}><Cell label={field.label} value={summary(Array.isArray(draft.custom[field.key]) ? draft.custom[field.key] as string[] : [])} arrow onClick={() => openField({ key: field.key, label: field.label, options: field.options ?? [], multiple: field.type === 'multiple', custom: true }, Array.isArray(draft.custom[field.key]) ? draft.custom[field.key] as string[] : [])} /></div> : <Input className={`prospect-custom-input ${field.type === 'date' ? 'prospect-custom-date' : ''}`} suffix={field.type === 'date' ? <Icon name="calendar" size="md" /> : undefined} key={field.key} label={field.label} layout="external" type={field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'} placeholder={field.type === 'date' ? undefined : field.type === 'number' ? '请输入数值' : '请输入关键词'} value={typeof draft.custom[field.key] === 'string' ? draft.custom[field.key] as string : ''} onValueChange={value => setDraft(previous => ({ ...previous, custom: { ...previous.custom, [field.key]: value } }))} clearable />)}</section>
    <BottomSheet className="prospect-ownership-selector" open={fieldSelection !== null} onOpenChange={next => { if (!next) setFieldSelection(null); }} title={`选择${fieldSelection?.label ?? ''}`} finalFocus={fieldTrigger}
      footer={<SheetActions secondary={{ label: '取消', onClick: () => setFieldSelection(null) }} primary={{ label: '确定', onClick: () => { if (!fieldSelection) return; const field = fieldSelection; setDraft(previous => field.custom ? { ...previous, custom: { ...previous.custom, [field.key]: [...fieldSelected] } } : { ...previous, [field.key]: [...fieldSelected] }); setFieldSelection(null); } }} />}>
      <Search label={`搜索${fieldSelection?.label ?? ''}`} placeholder={`搜索${fieldSelection?.label ?? ''}`} value={fieldQuery} onValueChange={setFieldQuery} />
      {fieldSelection?.multiple ? <SheetSelectionList multiple label={`${fieldSelection.label}选项`} options={[{ value: '__all__', label: '不限' }, ...fieldSelection.options.filter(option => option.includes(fieldQuery.trim())).map(option => ({ value: option, label: option }))]} value={fieldSelected.length ? fieldSelected : ['__all__']} onToggle={option => setFieldSelected(current => option === '__all__' ? [] : current.includes(option) ? current.filter(item => item !== option) : [...current, option])} />
        : <SheetSelectionList label={`${fieldSelection?.label ?? ''}选项`} indicator="dot" options={[{ value: '', label: '不限' }, ...(fieldSelection?.options ?? []).filter(option => option.includes(fieldQuery.trim())).map(option => ({ value: option, label: option }))]} value={fieldSelected[0] || ''} onChange={option => setFieldSelected(option ? [option] : [])} />}
      {fieldQuery.trim() && !fieldSelection?.options.some(option => option.includes(fieldQuery.trim())) && <p className="prospect-selection-empty" role="status">没有匹配的选项</p>}
    </BottomSheet>
    <BottomSheet open={dateOpen} onOpenChange={setDateOpen} title={dateLabel} finalFocus={dateTrigger}
      footer={<SheetActions secondary={{ label: '重置', onClick: resetDate }} primary={{ label: '确认', onClick: confirmDate }} />}>
      <DateRangeFields key={dateResetKey} today={today} period={datePeriod} value={dateDraft}
        onChange={(period, value) => { setDatePeriod(period); setDateDraft(value); setDateError(''); }} />
      {dateError && <p className="prospect-error" role="alert">{dateError}</p>}
    </BottomSheet>
    <BottomSheet className="prospect-ownership-selector" open={selectionOpen} onOpenChange={setSelectionOpen} title={`选择${selectionLabel}`} finalFocus={selectionTrigger} footer={<SheetActions secondary={{ label: '取消', onClick: () => setSelectionOpen(false) }} primary={{ label: '确定', onClick: () => { setDraft(previous => ({ ...previous, [selection]: selected })); setSelectionOpen(false); } }} />}>
      <Search label={`搜索${selectionLabel}`} placeholder={`搜索${selectionLabel}`} value={keyword} onValueChange={setKeyword} />
      {selection === 'campus' ? <SheetSelectionList multiple label="中心名称选项" options={[{ value: '__all__', label: '不限' }, ...selectionOptions.map(option => ({ value: option, label: option }))]} value={selected.length ? selected : ['__all__']} onToggle={option => setSelected(current => option === '__all__' ? [] : current.includes(option) ? current.filter(item => item !== option) : [...current, option])} />
        : <SheetSelectionList label="主责任人选项" indicator="dot" options={[{ value: '', label: '不限' }, ...selectionOptions.map(option => ({ value: option, label: option }))]} value={selected[0] || ''} onChange={option => setSelected(option ? [option] : [])} />}
      {keyword.trim() && !selectionOptions.length && <p className="prospect-selection-empty" role="status">没有匹配的选项</p>}
    </BottomSheet>
  </SideDrawer>;
}
