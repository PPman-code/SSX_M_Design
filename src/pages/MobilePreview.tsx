import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PreviewStatusBar } from '../components/ui/PreviewStatusBar';
import { Button } from '../components/ui/Button';
import { BottomSheet } from '../components/ui/BottomSheet';
import { SheetActions } from '../components/ui/SheetContent';
import { Toggle } from '../components/ui/Toggle';
import { Badge } from '../components/ui/Badge';
import { Cell, CellGroup } from '../components/ui/Cell';
import { PopoverExamples } from '../components/PopoverExamples';
import { PopoverMenuExamples } from '../components/PopoverMenuExamples';
import { Radio, RadioGroup } from '../components/ui/Radio';
import { RadioExamples } from '../components/RadioExamples';
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
  const [switchStates, setSwitchStates] = useState([true, false, true, false]);
  const [badgeCount, setBadgeCount] = useState(2);
  const [cellNotifications, setCellNotifications] = useState(true);
  const [cellFeedback, setCellFeedback] = useState('');
  const [name, setName] = useState('');
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

        <ButtonExamples />

        <section aria-labelledby="form-title" className="demo-section">
          <div className="section-heading"><h2 id="form-title">输入与选择</h2><span>轻触体验</span></div>
          <div className="demo-card form-card">
            <label className="field"><span>名称</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="输入名称，试试手感" autoComplete="off" /><small>输入字号 16px，标签保持可见</small></label>
            <div className="cell"><div><span>接收提醒</span><small>体验开关的状态反馈</small></div><Toggle label="接收提醒" checked={reminders} onChange={setReminders} /></div>
            <button ref={trigger} className="cell cell-button" onClick={openSelection}><span>选择示例</span><span className="cell-value">{selection}<Icon name="right" /></span></button>
          </div>
        </section>

        <section aria-labelledby="switches-title" className="demo-section">
          <div className="section-heading"><h2 id="switches-title">开关</h2><span>24px · 44px 触控区</span></div>
          <div className="demo-card toggle-examples">
            {[false, true].map((showText) => <div className="toggle-example-group" key={String(showText)}><h3>{showText ? '带文字' : '基础开关'}</h3><div className="toggle-example-pair">{[true, false].map((initial, index) => { const stateIndex = (showText ? 2 : 0) + index; const label = `${showText ? '文字' : '基础'}${initial ? '开启' : '关闭'}示例`; return <Toggle key={label} label={label} checked={switchStates[stateIndex]} showText={showText} onChange={(checked) => setSwitchStates((previous) => previous.map((value, item) => item === stateIndex ? checked : value))} />; })}</div><div className="toggle-example-pair">{[true, false].map((checked) => <Toggle key={String(checked)} label={`${showText ? '文字' : '基础'}禁用${checked ? '开启' : '关闭'}`} checked={checked} disabled showText={showText} />)}<span>禁用</span></div></div>)}
          </div>
        </section>

        <section aria-labelledby="badges-title" className="demo-section">
          <div className="section-heading"><h2 id="badges-title">徽标</h2><span>红点 · 数字 · 描边</span></div>
          <div className="demo-card badge-examples">
            <div className="badge-samples"><span>默认</span><span>白色描边</span><Badge dot /><Badge dot bordered /><Badge count={2} /><Badge count={2} bordered /><Badge count={123} /><Badge count={123} bordered /></div>
            <div className="badge-attached"><Badge count={badgeCount} bordered><Button variant="secondary" aria-label="消息" onClick={() => setBadgeCount(0)}><Icon name="chat-1-line" />消息</Button></Badge><Badge dot bordered><span className="badge-icon-sample"><Icon name="user-3-fill" size="lg" label="个人中心" /></span></Badge></div>
            <div className="badge-demo-actions"><Button variant="ghost" size="sm" onClick={() => setBadgeCount((count) => count + 1)}>增加数量</Button><Button variant="ghost" size="sm" onClick={() => setBadgeCount(100)}>超过上限</Button><Button variant="ghost" size="sm" onClick={() => setBadgeCount(0)}>清空数量</Button></div>
            <p className="badge-demo-note">点击消息清空未读数量，0 时隐藏徽标。</p>
          </div>
        </section>

        <section aria-labelledby="cells-title" className="demo-section">
          <div className="section-heading"><h2 id="cells-title">单元格</h2><span>基础行 · 内容组合</span></div>
          <CellGroup label="单元格示例">
            <Cell label="基础单元格" />
            <Cell label="带图标与详情" leading={<Icon name="question-circle" size="md" />} value="查看说明" arrow onClick={() => setCellFeedback('已点击详情单元格')} />
            <Cell label="用户名称" leading={<img src={`${import.meta.env.BASE_URL}pages/my/v1/avatar.png`} alt="用户头像" />} arrow onClick={() => setCellFeedback('已点击头像单元格')} />
            <Cell label="消息通知" control={<Toggle label="单元格消息通知" checked={cellNotifications} onChange={setCellNotifications} />} />
            <Cell label="标题与说明" description="辅助说明用于补充当前选项的信息" />
            <Cell label="多行信息" overline="辅助标题" description="这里展示补充说明，长文本会自然换行，保持内容完整。" multiline value={<span className="cell-detail-stack"><span>详细信息</span><span>辅助信息</span></span>} arrow onClick={() => setCellFeedback('已点击多行单元格')} />
            <Cell label="暂不可用" value="未开放" arrow disabled onClick={() => setCellFeedback('不应触发禁用行')} />
          </CellGroup>
          {cellFeedback && <p className="cell-demo-feedback" role="status">{cellFeedback}</p>}
        </section>

        <CollapseExamples />
        <PopoverExamples />
        <PopoverMenuExamples />
        <BottomSheetExamples />
        <WheelPickerExamples />
        <ActionSheetExamples />
        <DialogExamples />
        <ToastExamples />
        <RadioExamples />

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
