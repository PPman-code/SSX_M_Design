import { useRef, useState } from 'react';
import type { RefObject } from 'react';
import { SideDrawer } from '../../../components/ui/SideDrawer';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Search } from '../../../components/ui/Search';
import { SheetActions, SheetChoiceGroup, SheetSelectionList } from '../../../components/ui/SheetContent';
import { campuses, customFields as previewCustomFields, emptyFilters, invalidDateRange, owners, statuses } from './model';
import type { CustomField, Filters } from './model';

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
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const selectionRows = useRef<HTMLDivElement>(null);
  const selectionTrigger = useRef<HTMLButtonElement>(null);
  function openSelection(key: 'campus' | 'owner') {
    selectionTrigger.current = selectionRows.current?.querySelectorAll('button')[key === 'campus' ? 0 : 1] ?? null;
    setSelected([...draft[key]]); setKeyword(''); setSelection(key); setSelectionOpen(true);
  }
  const selectionLabel = selection === 'campus' ? '中心名称' : '主责任人';
  const selectionOptions = (selection === 'campus' ? campuses : owners).filter(option => option.includes(keyword.trim()));
  function group(key: typeof choices[number][0]) {
    const [, label, options] = choices.find(item => item[0] === key)!;
    return <SheetChoiceGroup key={key} label={label} options={options.map(option => ({ value: option, label: key === 'level' ? `${option}心` : option }))} value={draft[key]} onToggle={option => setDraft(previous => ({ ...previous, [key]: previous[key].includes(option) ? previous[key].filter(item => item !== option) : ['owner', 'grade', 'level'].includes(key) ? [option] : [...previous[key], option] }))} />;
  }
  return <SideDrawer title="筛选客户" open={open} onOpenChange={onOpenChange} finalFocus={finalFocus} footer={<>{error && <p role="alert" className="prospect-error">{error}</p>}<SheetActions secondary={{ label: '重置', onClick: () => { setDraft(emptyFilters()); setError(''); } }} primary={{ label: '确定', onClick: () => { if (invalidDateRange(draft)) { setError('开始日期不能晚于结束日期'); return; } onApply(draft); onOpenChange(false); } }} /></>}>
    <section className="prospect-filter-group"><h3>查看客户范围及归属</h3><Checkbox className="prospect-check" variant="square" label="包含责任人下属的客户" checked={draft.includeSubordinates} onChange={checked => setDraft({ ...draft, includeSubordinates: checked })} /><div ref={selectionRows} className="prospect-ownership-cells"><CellGroup label="客户归属筛选"><Cell label="中心名称" value={draft.campus.length > 1 ? `已选 ${draft.campus.length} 个中心` : draft.campus[0] || '不限'} arrow onClick={() => openSelection('campus')} /><Cell label="主责任人" value={draft.owner[0] || '不限'} arrow onClick={() => openSelection('owner')} /></CellGroup></div></section>
    <section className="prospect-filter-group"><h3>客户信息</h3>{group('status')}{group('level')}{group('grade')}{group('source')}{group('tags')}<label className="prospect-field">号码归属地<input value={draft.region} onChange={event => setDraft({ ...draft, region: event.target.value })} placeholder="请输入地区" /></label><label className="prospect-field">客户备注信息<input value={draft.remark} onChange={event => setDraft({ ...draft, remark: event.target.value })} placeholder="请输入关键词" /></label></section>
    <section className="prospect-filter-group"><h3>时间条件</h3>{([['nextDate', '下次跟进时间'], ['inputDate', '录入时间'], ['lastDate', '上次沟通时间']] as const).map(([key, label]) => <fieldset className="prospect-date-range" key={key}><legend>{label}</legend><div>{([0, 1] as const).map(index => <input key={index} type="date" aria-label={`${label}${index === 0 ? '开始日期' : '结束日期'}`} value={draft[key][index]} onChange={event => { const range = [...draft[key]] as [string, string]; range[index] = event.target.value; setDraft({ ...draft, [key]: range }); setError(''); }} />)}</div></fieldset>)}</section>
    {customFields.length > 0 && <section className="prospect-filter-group"><h3>更多条件</h3>{customFields.map(field => field.type === 'single' || field.type === 'multiple' ? <SheetChoiceGroup key={field.key} label={field.label} options={(field.options ?? []).map(value => ({ value, label: value }))} value={Array.isArray(draft.custom[field.key]) ? draft.custom[field.key] as string[] : []} onToggle={value => setDraft(previous => { const current = previous.custom[field.key]; const selected = Array.isArray(current) ? current : []; return { ...previous, custom: { ...previous.custom, [field.key]: selected.includes(value) ? selected.filter(item => item !== value) : field.type === 'single' ? [value] : [...selected, value] } }; })} /> : <label className="prospect-field" key={field.key}>{field.label}<input type={field.type === 'date' ? 'date' : 'text'} value={typeof draft.custom[field.key] === 'string' ? draft.custom[field.key] as string : ''} onChange={event => setDraft({ ...draft, custom: { ...draft.custom, [field.key]: event.target.value } })} /></label>)}</section>}
    <BottomSheet className="prospect-ownership-selector" open={selectionOpen} onOpenChange={setSelectionOpen} title={`选择${selectionLabel}`} finalFocus={selectionTrigger} footer={<SheetActions secondary={{ label: '取消', onClick: () => setSelectionOpen(false) }} primary={{ label: '确定', onClick: () => { setDraft(previous => ({ ...previous, [selection]: selected })); setSelectionOpen(false); } }} />}>
      <Search label={`搜索${selectionLabel}`} placeholder={`搜索${selectionLabel}`} value={keyword} onValueChange={setKeyword} />
      {selection === 'campus' ? <SheetSelectionList multiple label="中心名称选项" options={[{ value: '__all__', label: '不限' }, ...selectionOptions.map(option => ({ value: option, label: option }))]} value={selected.length ? selected : ['__all__']} onToggle={option => setSelected(current => option === '__all__' ? [] : current.includes(option) ? current.filter(item => item !== option) : [...current, option])} />
        : <SheetSelectionList label="主责任人选项" indicator="dot" options={[{ value: '', label: '不限' }, ...selectionOptions.map(option => ({ value: option, label: option }))]} value={selected[0] || ''} onChange={option => setSelected(option ? [option] : [])} />}
      {keyword.trim() && !selectionOptions.length && <p className="prospect-selection-empty" role="status">没有匹配的选项</p>}
    </BottomSheet>
  </SideDrawer>;
}
