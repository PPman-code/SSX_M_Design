import { useRef, useState } from 'react';
import { Button } from './ui/Button';
import { Dialog, type DialogAction } from './ui/Dialog';

const labels = { notice: '单按钮对话框', confirm: '双按钮对话框', stacked: '纵向操作对话框', androidNotice: 'Android 单按钮', androidConfirm: 'Android 双按钮', customNotice: '自定义单按钮', customConfirm: '自定义双按钮', long: '长内容对话框' };
type Mode = keyof typeof labels;

export function DialogExamples() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState('尚未操作');
  const trigger = useRef<HTMLButtonElement | null>(null);
  const titles: Record<Mode, string> = { notice: '提示', confirm: '确认操作', stacked: '选择操作', androidNotice: '提示', androidConfirm: '开启提醒', customNotice: '提示', customConfirm: '确认修改', long: '详细说明' };
  const confirm: DialogAction = { label: '确认', onSelect: () => setResult('已确认') };
  const cancel: DialogAction = { label: '取消' };
  const actions: DialogAction[] | undefined = mode === 'confirm' || mode === 'androidConfirm' ? [cancel, confirm]
    : mode === 'customConfirm' ? [confirm, cancel]
      : mode === 'stacked' ? ['选项一', '选项二', '选项三'].map(label => ({ label, onSelect: () => setResult(label) })) : undefined;
  const variant = mode?.startsWith('android') ? 'android' : mode?.startsWith('custom') ? 'custom' : 'ios';
  return <section className="demo-section" aria-labelledby="dialog-demo-title">
    <div className="section-heading"><h2 id="dialog-demo-title">对话框</h2><span>提示 · 确认 · 多操作</span></div>
    <div className="demo-card stack">
      {(Object.keys(labels) as Mode[]).map(item => <Button key={item} variant="secondary" onClick={event => { trigger.current = event.currentTarget; setMode(item); }}>{labels[item]}</Button>)}
      <p className="sheet-demo-caption" role="status">对话框结果：{result}</p>
    </div>
    <Dialog open={mode !== null} onOpenChange={open => { if (!open) setMode(null); }} title={titles[mode ?? 'notice']} actions={actions} variant={variant} finalFocus={trigger}>
      {mode === 'long' ? Array.from({ length: 20 }, (_, i) => <p key={i}>说明条目 {i + 1}</p>)
        : <p>{variant === 'android' ? '这是多行内容的说明文字。请阅读提示后选择是否继续，操作仅用于组件演示。' : '我是主体的单行内容，默认中心对齐。'}</p>}
    </Dialog>
  </section>;
}
