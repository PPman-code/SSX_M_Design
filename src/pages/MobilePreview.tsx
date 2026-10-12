import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { Toggle } from '../components/ui/Toggle';
import { Icon } from '../components/ui/Icon';

export function MobilePreview() {
  const [reminders, setReminders] = useState(true);
  const [name, setName] = useState('');
  const [selection, setSelection] = useState('默认');
  const [draft, setDraft] = useState(selection);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  function openSelection() { setDraft(selection); setOpen(true); }
  return (
    <div className="mobile-page">
      <header className="mobile-header">
        <Link to="/" target="_top" className="icon-button" aria-label="返回工作区"><Icon name="a-arrow-left" size="lg" /></Link>
        <h1>组件预览</h1>
        <span className="version-label">0.1</span>
      </header>
      <main className="mobile-content">
        <div className="mobile-intro">
          <span className="eyebrow">SSX / MOBILE</span>
          <h2>熟悉的设计，<br />更适合指尖。</h2>
          <p>沿用智校视觉基础，探索移动端的尺寸与交互。</p>
          <span className="status-badge">初始设计基线</span>
        </div>

        <section aria-labelledby="buttons-title" className="demo-section">
          <div className="section-heading"><h2 id="buttons-title">按钮</h2><span>48px · 标准高度</span></div>
          <div className="demo-card stack">
            <Button onClick={() => setFeedback('已触发主操作，仅为交互示例')}>主要操作</Button>
            <div className="button-pair">
              <Button variant="secondary" onClick={() => setFeedback('已触发次要操作，仅为交互示例')}>次要操作</Button>
              <Button disabled>暂不可用</Button>
            </div>
            {feedback && <p className="feedback" role="status">{feedback}</p>}
          </div>
        </section>

        <section aria-labelledby="form-title" className="demo-section">
          <div className="section-heading"><h2 id="form-title">输入与选择</h2><span>轻触体验</span></div>
          <div className="demo-card form-card">
            <label className="field"><span>名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="输入名称，试试手感" autoComplete="off" /><small>输入字号 16px，标签保持可见</small></label>
            <div className="cell"><div><span>接收提醒</span><small>体验开关的状态反馈</small></div><Toggle label="接收提醒" checked={reminders} onChange={setReminders} /></div>
            <button ref={trigger} className="cell cell-button" onClick={openSelection}><span>选择示例</span><span className="cell-value">{selection}<Icon name="a-arrow-right" /></span></button>
          </div>
        </section>

        <section aria-labelledby="states-title" className="demo-section">
          <div className="section-heading"><h2 id="states-title">状态表达</h2><span>颜色 + 文字</span></div>
          <div className="demo-card state-pills"><span className="state-pill success">已完成</span><span className="state-pill warning">待处理</span><span className="state-pill danger">需重试</span></div>
        </section>
        <p className="mobile-note">这是组件交互示例，输入与选择仅在当前页面保留。</p>
        <Link className="text-link mobile-handoff" to="/handoff" target="_top">查看设计规范 <Icon name="a-arrow-right" /></Link>
      </main>
      <BottomSheet open={open} onOpenChange={setOpen} title="选择展示方式" description="取消会保留原选择，确认后更新页面。" finalFocus={trigger}>
        <fieldset className="radio-list"><legend className="sr-only">展示方式</legend>
          {['紧凑', '默认', '宽松'].map((option) => <label key={option} className="radio-option"><span>{option}</span><input type="radio" name="density" value={option} checked={draft === option} onChange={() => setDraft(option)} /></label>)}
        </fieldset>
        <Button className="full-width" onClick={() => { setSelection(draft); setOpen(false); }}>确认选择</Button>
      </BottomSheet>
    </div>
  );
}
