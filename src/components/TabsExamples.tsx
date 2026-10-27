import { useId, useState } from 'react';
import { Tabs } from './ui/Tabs';
import './TabsExamples.css';

type ExampleItem = { value: string; label: string; count?: number };
function TabsExample({ title, label, items, size = 'secondary', layout = 'stretch', indicator = 'fixed' }: {
  title: string;
  label: string;
  items: readonly ExampleItem[];
  size?: 'primary' | 'secondary';
  layout?: 'stretch' | 'content';
  indicator?: 'fixed' | 'label';
}) {
  const [value, setValue] = useState(items[0].value);
  const panelId = useId();
  const selected = items.find(item => item.value === value)!;
  return <div className="tabs-example">
    <h3>{title}</h3>
    <div className="tabs-example-frame">
      <Tabs label={label} size={size} layout={layout} indicator={indicator} value={value} onValueChange={setValue} items={items.map(item => ({ value: item.value, panelId, label: <>{item.label}{item.count != null && <span className="tabs-example-count"> ({item.count})</span>}</> }))} />
      <div className="tabs-example-panel" role="tabpanel" id={panelId} aria-label={`${selected.label}内容`}>当前：{selected.label}{selected.count != null && ` · ${selected.count} 条`}</div>
    </div>
  </div>;
}
export function TabsExamples() {
  return <section className="demo-section" aria-labelledby="tabs-title">
    <div className="section-heading"><h2 id="tabs-title">标签页 Tabs</h2><span>等分 · 层级 · 内容宽度</span></div>
    <TabsExample title="等分页签 · 48px" label="等分页签示例" items={[{ value: 'all', label: '全部' }, { value: 'follow', label: '待沟通', count: 2 }, { value: 'arrears', label: '欠费', count: 1 }, { value: 'birthday', label: '生日', count: 1 }]} />
    <TabsExample title="独立首层 · 56px" label="首层页签示例" size="primary" items={[{ value: 'communication', label: '沟通记录' }, { value: 'trial', label: '试听记录' }, { value: 'courses', label: '意向课程' }]} />
    <TabsExample title="按内容排列 · 文字宽下划线" label="内容宽度页签示例" layout="content" indicator="label" items={[{ value: 'summary', label: 'AI 总结' }, { value: 'transcript', label: '完整转写' }]} />
  </section>;
}
