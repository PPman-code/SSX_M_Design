import { useRef, useState } from 'react';
import { ActionSheet, type ActionSheetAction } from './ui/ActionSheet';
import { Button } from './ui/Button';

const labels = { basic: '基础动作面板', description: '带说明动作面板', states: '状态动作面板', long: '长内容动作面板' };
type Mode = keyof typeof labels;

export function ActionSheetExamples() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState('尚未操作');
  const trigger = useRef<HTMLButtonElement | null>(null);
  const actions: ActionSheetAction[] = mode === 'states'
    ? [{ label: '保存', onSelect: () => setResult('保存') }, { label: '暂不可用', disabled: true, onSelect: () => setResult('不可触发') }, { label: '删除', danger: true, onSelect: () => setResult('删除（仅演示）') }]
    : mode === 'long' ? Array.from({ length: 20 }, (_, i) => ({ label: i === 0 ? '较长的动作名称会自然换行，完整显示当前操作的内容' : `动作 ${i + 1}`, onSelect: () => setResult(`动作 ${i + 1}`) }))
      : ['操作一', '操作二'].map(label => ({ label, onSelect: () => setResult(label) }));
  return <section className="demo-section" aria-labelledby="action-sheet-demo-title">
    <div className="section-heading"><h2 id="action-sheet-demo-title">动作面板</h2><span>操作即执行 · 独立取消</span></div>
    <div className="demo-card stack">
      {(Object.keys(labels) as Mode[]).map(item => <Button key={item} variant="secondary" onClick={event => { trigger.current = event.currentTarget; setMode(item); }}>{labels[item]}</Button>)}
      <p className="sheet-demo-caption" role="status">动作结果：{result}</p>
    </div>
    <ActionSheet open={mode !== null} onOpenChange={open => { if (!open) setMode(null); }} title={labels[mode ?? 'basic']} description={mode === 'description' ? '请选择要执行的操作' : undefined} actions={actions} finalFocus={trigger} />
  </section>;
}
