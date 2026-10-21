import { useRef, useState } from 'react';
import { Picker } from './ui/Picker';
import { Button } from './ui/Button';
import { type WheelColumn } from './ui/WheelPicker';

const cities: Record<string, string[]> = { 广东: ['广州', '深圳', '珠海'], 浙江: ['杭州', '宁波', '温州'], 江苏: ['南京', '苏州', '无锡'] };
const options = (values: string[]) => values.map(value => ({ value, label: value }));
type Mode = 'single' | 'time' | 'linked';
const labels: Record<Mode, string> = { single: '单列滚轮', time: '多列滚轮', linked: '联动滚轮' };

export function WheelPickerExamples() {
  const [mode, setMode] = useState<Mode>('single');
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<Record<Mode, string[]>>({ single: ['30分钟'], time: ['09时', '30分'], linked: ['广东', '深圳'] });
  const [draft, setDraft] = useState<string[]>([]);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const columns: WheelColumn[] = mode === 'single' ? [{ key: 'duration', label: '时长', options: options(['15分钟', '30分钟', '45分钟', '60分钟', '90分钟', '120分钟']).map(option => ({ ...option, disabled: option.value === '45分钟' })) }]
    : mode === 'time' ? [{ key: 'hour', label: '小时', options: options(Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}时`)) }, { key: 'minute', label: '分钟', options: options(Array.from({ length: 12 }, (_, i) => `${String(i * 5).padStart(2, '0')}分`)) }]
      : [{ key: 'province', label: '省份', options: options(Object.keys(cities)) }, { key: 'city', label: '城市', options: options(cities[draft[0]] ?? []) }];
  return <section className="demo-section" aria-labelledby="wheel-demo-title">
    <div className="section-heading"><h2 id="wheel-demo-title">滚轮选择器</h2><span>单列 · 多列 · 联动</span></div>
    <div className="demo-card stack">
      {(['single', 'time', 'linked'] as const).map(item => <Button key={item} variant="soft" onClick={event => { trigger.current = event.currentTarget; setDraft([...values[item]]); setMode(item); setOpen(true); }}>{labels[item]}</Button>)}
      <p className="sheet-demo-caption">已选时长：{values.single.join('')}</p>
      <p className="sheet-demo-caption">已选时间：{values.time.join(' ')}</p>
      <p className="sheet-demo-caption">已选地区：{values.linked.join(' / ')}</p>
    </div>
    <p className="sheet-demo-caption">单列示例中 45分钟为禁用项；支持滚动、点击和键盘方向键。</p>
    <Picker open={open} onOpenChange={setOpen} title={labels[mode]} finalFocus={trigger}
      columns={columns} value={draft} onChange={next => setDraft(mode === 'linked' && next[0] !== draft[0] ? [next[0], cities[next[0]][0]] : next)}
      onConfirm={() => setValues(current => ({ ...current, [mode]: [...draft] }))} />
  </section>;
}
