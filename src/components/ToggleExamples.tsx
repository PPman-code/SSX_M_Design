import { useState } from 'react';
import { Toggle } from './ui/Toggle';
import { Button } from './ui/Button';

export function ToggleExamples() {
  const [states, setStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const update = (label: string, checked: boolean) => setStates(previous => ({ ...previous, [label]: checked }));
  return <>
    <div className="demo-card toggle-examples">
      {(['none', 'text', 'icon'] as const).map((content, group) => <div className="toggle-example-group" key={content}>
        <h3>{['基础开关', '带文字', '带图标'][group]}</h3>
        <div className="toggle-example-pair">{[true, false].map(initial => {
          const label = `${['基础', '文字', '图标'][group]}${initial ? '开启' : '关闭'}示例`;
          return <Toggle key={label} label={label} content={content} checked={states[label] ?? initial} onChange={checked => update(label, checked)} />;
        })}</div>
      </div>)}
      <div className="toggle-example-group"><h3>禁用状态</h3>
        {(['none', 'text', 'icon'] as const).map((content, group) => <div className="toggle-example-pair" key={content}>{[true, false].map(checked => <Toggle key={String(checked)} label={`${['基础', '文字', '图标'][group]}禁用${checked ? '开启' : '关闭'}`} content={content} checked={checked} disabled />)}</div>)}
      </div>
      <div className="toggle-example-group"><h3>加载状态</h3><div className="toggle-example-pair">{[true, false].map(initial => {
        const label = `加载${initial ? '开启' : '关闭'}示例`;
        return <Toggle key={label} label={label} checked={states[label] ?? initial} loading={loading} onChange={checked => update(label, checked)} />;
      })}</div></div>
      <div className="toggle-example-group"><h3>只读状态</h3><div className="toggle-example-pair"><Toggle label="只读开启示例" checked readOnly /><Toggle label="只读关闭示例" checked={false} readOnly /></div></div>
      <Button variant="ghost" size="sm" onClick={() => setLoading(previous => !previous)}>{loading ? '结束开关加载' : '模拟开关加载'}</Button>
    </div>
    <div className="demo-card toggle-size-examples">{(['sm', 'md', 'lg'] as const).map((size, index) => {
      const label = `${['小号', '中号', '大号'][index]}开关`;
      return <div className="toggle-size-row" key={size}><span>{['Small · 39 × 24', 'Medium · 45 × 28', 'Large · 52 × 32'][index]}</span><Toggle label={label} size={size} checked={states[label] ?? true} onChange={checked => update(label, checked)} /></div>;
    })}</div>
  </>;
}
