import { useRef, useState } from 'react';
import { BottomSheet } from './ui/BottomSheet';
import { Button } from './ui/Button';
import { SheetActions, SheetChoiceGroup, SheetSelectionList } from './ui/SheetContent';

export function BottomSheetExamples() {
  const [mode, setMode] = useState<'basic' | 'selection' | 'long' | 'instant' | 'multiple' | 'filter' | null>(null);
  const [selected, setSelected] = useState('默认');
  const [draft, setDraft] = useState(selected);
  const [multiple, setMultiple] = useState(['默认']);
  const [multipleDraft, setMultipleDraft] = useState(multiple);
  const [filters, setFilters] = useState(['临加学员']);
  const [filterDraft, setFilterDraft] = useState(filters);
  const labels = { basic: '基础弹层', selection: '选择弹层', long: '长内容弹层', instant: '即时单选', multiple: '多选列表', filter: '分组筛选' };
  const options = ['紧凑', '默认', '宽松'].map(value => ({ value, label: value }));
  const toggle = (values: string[], value: string) => values.includes(value) ? values.filter(item => item !== value) : [...values, value];
  const trigger = useRef<HTMLButtonElement | null>(null);
  const title = `${labels[mode ?? 'basic']}示例`;
  return <section className="demo-section" aria-labelledby="sheet-demo-title">
    <div className="section-heading"><h2 id="sheet-demo-title">弹出层</h2><span>统一外壳 · 固定操作区</span></div>
    <div className="demo-card stack">
      {(['basic', 'selection', 'instant', 'multiple', 'filter', 'long'] as const).map(value => <Button key={value} variant="secondary" onClick={event => { trigger.current = event.currentTarget; setDraft(selected); setMultipleDraft(multiple); setFilterDraft(filters); setMode(value); }}>{labels[value]}</Button>)}
      <p className="sheet-demo-caption">当前选择：{selected}</p><p className="sheet-demo-caption">多选结果：{multiple.join('、') || '无'}</p>
    </div>
    <BottomSheet open={mode !== null} onOpenChange={open => { if (!open) setMode(null); }} title={title} finalFocus={trigger}
      footer={mode === 'instant' ? undefined : mode === 'selection' ? <SheetActions secondary={{ label: '取消', onClick: () => setMode(null) }} primary={{ label: '确认', onClick: () => { setSelected(draft); setMode(null); } }} />
        : mode === 'multiple' ? <SheetActions secondary={{ label: '取消', onClick: () => setMode(null) }} primary={{ label: '确认', onClick: () => { setMultiple(multipleDraft); setMode(null); } }} />
        : mode === 'filter' ? <SheetActions secondary={{ label: '重置', onClick: () => setFilterDraft([]) }} primary={{ label: '确认', onClick: () => { setFilters(filterDraft); setMode(null); } }} />
        : <SheetActions primary={{ label: '知道了', onClick: () => setMode(null) }} />}>
      {mode === 'selection' ? <SheetSelectionList label="弹层示例选项" options={options} value={draft} onChange={setDraft} indicator="dot" />
        : mode === 'instant' ? <SheetSelectionList label="即时单选示例" options={options} value={selected} onChange={value => { setSelected(value); setMode(null); }} onReselect={() => setMode(null)} />
        : mode === 'multiple' ? <SheetSelectionList multiple label="多选示例" options={options} value={multipleDraft} onToggle={value => setMultipleDraft(current => toggle(current, value))} />
        : mode === 'filter' ? <SheetChoiceGroup label="学员范围" options={['试听学员', '临加学员', '临调学员', '补课学员'].map(value => ({ value, label: value }))} value={filterDraft} onToggle={value => setFilterDraft(current => toggle(current, value))} hint="确认后提交，关闭时不提交。" />
        : mode === 'long' ? <div className="sheet-demo-rows">{Array.from({ length: 24 }, (_, i) => <p key={i}>内容条目 {i + 1} · 上下滚动查看，底部操作保持可见。</p>)}</div>
          : <p className="sheet-demo-copy">用于承载说明、选择或表单。标题和底部操作保持固定，内容区域独立滚动；关闭后回到打开弹层的按钮。</p>}
    </BottomSheet>
  </section>;
}
