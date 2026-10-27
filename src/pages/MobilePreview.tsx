import { TabsExamples } from '../components/TabsExamples';
import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PreviewStatusBar } from '../components/ui/PreviewStatusBar';
import { Search } from '../components/ui/Search';
import { Input } from '../components/ui/Input';
import { InputExamples } from '../components/InputExamples';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { SheetActions } from '../components/ui/SheetContent';
import { Toggle } from '../components/ui/Toggle';
import { ToggleExamples } from '../components/ToggleExamples';
import { Badge } from '../components/ui/Badge';
import { CellExamples } from '../components/CellExamples';
import { PopoverExamples } from '../components/PopoverExamples';
import { PopoverMenuExamples } from '../components/PopoverMenuExamples';
import { Radio, RadioGroup } from '../components/ui/Radio';
import { CheckboxExamples } from '../components/CheckboxExamples';
import { RadioExamples } from '../components/RadioExamples';
import { LoadingExamples } from '../components/LoadingExamples';
import { ToastExamples } from '../components/ToastExamples';
import { BottomSheetExamples } from '../components/BottomSheetExamples';
import { WheelPickerExamples } from '../components/WheelPickerExamples';
import { ActionSheetExamples } from '../components/ActionSheetExamples';
import { DialogExamples } from '../components/DialogExamples';
import { CollapseExamples } from '../components/CollapseExamples';
import { ButtonExamples } from '../components/ButtonExamples';
import { Icon } from '../components/ui/Icon';

export function MobilePreview() {
  const [params] = useSearchParams();
  const previewStatus = params.get('chrome') === 'status';
  const [reminders, setReminders] = useState(true);
  const [badgeCount, setBadgeCount] = useState(2);
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selection, setSelection] = useState('默认');
  const [draft, setDraft] = useState(selection);
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  function openSelection() { setDraft(selection); setOpen(true); }
  return (
    <div className={`mobile-page ${previewStatus ? 'with-component-status' : ''}`}>
      {previewStatus && <PreviewStatusBar />}
      <header className="mobile-header">
        <Link to="/" target="_top" className="icon-button" aria-label="返回工作区"><Icon name="left" size="lg" /></Link>
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

        <TabsExamples />

        <ButtonExamples />

        <section aria-labelledby="search-title" className="demo-section">
          <div className="section-heading"><h2 id="search-title">搜索框 Search</h2><span>输入与清除</span></div>
          <Search label="搜索示例" placeholder="输入关键词" value={searchQuery} onValueChange={setSearchQuery} />
        </section>

        <InputExamples />

        <section aria-labelledby="form-title" className="demo-section">
          <div className="section-heading"><h2 id="form-title">输入与选择</h2><span>轻触体验</span></div>
          <div className="demo-card form-card">
            <Input label="名称" layout="external" value={name} onValueChange={setName} placeholder="输入名称，试试手感" autoComplete="off" description="输入字号 16px，标签保持可见" />
            <div className="cell"><div><span>接收提醒</span><small>体验开关的状态反馈</small></div><Toggle label="接收提醒" checked={reminders} onChange={setReminders} /></div>
            <button ref={trigger} className="cell cell-button" onClick={openSelection}><span>选择示例</span><span className="cell-value">{selection}<Icon name="right" /></span></button>
          </div>
        </section>

        <section aria-labelledby="switches-title" className="demo-section">
          <div className="section-heading"><h2 id="switches-title">开关</h2><span>24 / 28 / 32px · 40px 热区</span></div>
          <ToggleExamples />
        </section>

        <section aria-labelledby="badges-title" className="demo-section">
          <div className="section-heading"><h2 id="badges-title">徽标</h2><span>红点 · 数字 · 描边</span></div>
          <div className="demo-card badge-examples">
            <div className="badge-samples"><span>默认</span><span>白色描边</span><Badge dot /><Badge dot bordered /><Badge count={2} /><Badge count={2} bordered /><Badge count={123} /><Badge count={123} bordered /></div>
            <div className="badge-attached"><Badge count={badgeCount} bordered><Button variant="soft" aria-label="消息" onClick={() => setBadgeCount(0)}><Icon name="chat-1-line" />消息</Button></Badge><Badge dot bordered><span className="badge-icon-sample"><Icon name="user-3-fill" size="lg" label="个人中心" /></span></Badge></div>
            <div className="badge-demo-actions"><Button variant="ghost" size="sm" onClick={() => setBadgeCount((count) => count + 1)}>增加数量</Button><Button variant="ghost" size="sm" onClick={() => setBadgeCount(100)}>超过上限</Button><Button variant="ghost" size="sm" onClick={() => setBadgeCount(0)}>清空数量</Button></div>
            <p className="badge-demo-note">点击消息清空未读数量，0 时隐藏徽标。</p>
          </div>
        </section>

        <CellExamples />

        <CollapseExamples />
        <PopoverExamples />
        <PopoverMenuExamples />
        <BottomSheetExamples />
        <WheelPickerExamples />
        <ActionSheetExamples />
        <DialogExamples />
        <LoadingExamples />
        <ToastExamples />
        <RadioExamples />
        <CheckboxExamples />

        <section aria-labelledby="states-title" className="demo-section">
          <div className="section-heading"><h2 id="states-title">状态表达</h2><span>颜色 + 文字</span></div>
          <div className="demo-card state-pills"><span className="state-pill success">已完成</span><span className="state-pill warning">待处理</span><span className="state-pill danger">需重试</span></div>
        </section>
        <p className="mobile-note">这是组件交互示例，输入与选择仅在当前页面保留。</p>
        <Link className="text-link mobile-handoff" to="/handoff" target="_top">查看设计规范 <Icon name="right" /></Link>
      </main>
      <BottomSheet open={open} onOpenChange={setOpen} title="选择展示方式" description="取消会保留原选择，确认后更新页面。" finalFocus={trigger} footer={<SheetActions secondary={{ label: '取消', onClick: () => setOpen(false) }} primary={{ label: '确认', onClick: () => { setSelection(draft); setOpen(false); } }} />}>
        <RadioGroup className="radio-list" label="展示方式" name="density" value={draft} onChange={setDraft}>
          {['紧凑', '默认', '宽松'].map((option) => <Radio key={option} className="radio-option" value={option} label={option} />)}
        </RadioGroup>
      </BottomSheet>
    </div>
  );
}
