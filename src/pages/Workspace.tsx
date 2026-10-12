import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PhoneAccess } from '../components/PhoneAccess';
import { mobileRules } from '../design-data';

export function Workspace({ mode, onToggleTheme }: { mode: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [width, setWidth] = useState(390);
  const [phoneOpen, setPhoneOpen] = useState(false);
  return <div className="workspace">
    <aside className="sidebar">
      <Link to="/" className="brand"><span className="brand-mark">智</span><span>智校设计<span className="brand-sub">MOBILE WORKSPACE</span></span></Link>
      <div className="sidebar-group-label">设计工作区</div>
      <nav aria-label="工作区导航"><Link className="nav-item active" to="/" aria-current="page"><Icon name="quanbudaohang" />组件预览<span className="nav-count">01</span></Link><Link className="nav-item" to="/handoff"><Icon name="shuqian1" />设计规范与交付</Link></nav>
      <div className="sidebar-group-label pages-label">业务页面 <span>0</span></div>
      <p className="sidebar-empty">尚未添加业务页面。<br />从第一个真实需求开始。</p>
      <div className="sidebar-footer"><span className="status-dot" />本地设计项目<small>SSX Mobile Design · v0.1.0</small></div>
    </aside>

    <div className="workspace-main">
      <header className="workspace-toolbar"><span>智校 <span className="breadcrumb-slash">/</span> 移动端设计</span><div className="toolbar-actions"><Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label={mode === 'light' ? '切换到深色' : '切换到浅色'}>{mode === 'light' ? '深色预览' : '浅色预览'}</Button><Button size="sm" onClick={() => setPhoneOpen(true)}>手机预览 <Icon name="arrow-right-up-line" /></Button></div></header>
      <main className="workspace-content">
        <div className="workspace-heading"><div><span className="eyebrow">DESIGN FOUNDATION / 01</span><h1>移动端设计工作区</h1><p>延续智校的视觉语言，为移动端建立更自然的体验。</p></div><span className="status-badge">初始基线 · 待业务验证</span></div>
        <div className="workspace-columns">
          <section className="preview-panel" aria-label="页面预览">
            <div className="preview-toolbar"><span className="preview-title"><span className="status-dot" />组件预览</span><a href={`#/mobile?theme=${mode}`} target="_blank" rel="noreferrer" className="text-link">独立打开 <Icon name="arrow-right-up-line" /></a></div>
            <div className="preview-stage">
              <div className="width-selector" aria-label="预览宽度">{[360, 375, 390, 430].map((value) => <button type="button" key={value} aria-pressed={width === value} onClick={() => setWidth(value)}>{value}</button>)}<span>px</span></div>
              <div className="device-scroll"><div className="device-frame"><iframe title="移动端组件预览" src={`./#/mobile?theme=${mode}`} style={{ width }} /></div></div>
              <p className="preview-caption">真实页面 · 可点击交互 · 支持手机访问</p>
            </div>
          </section>

          <aside className="spec-panel" aria-label="设计说明">
            <section className="spec-card"><span className="eyebrow">MOBILE FIRST</span><h2>为小屏幕重新设定</h2><p>保留品牌与设计语言，调整操作密度和交互方式。</p><div className="metric-list">{mobileRules.map((rule) => <div className="metric" key={rule.name}><div><span>{rule.name}</span><small>{rule.note}</small></div><strong>{rule.value}<small>{rule.unit}</small></strong></div>)}</div></section>
            <section className="spec-card"><h2>与 PC 一脉相承</h2><ul className="inheritance-list"><li><Icon name="check" />品牌色与状态语义</li><li><Icon name="check" />字体、字重和图标资产</li><li><Icon name="check" />可追溯的设计变量</li></ul><Link className="text-link" to="/handoff">查看规范与来源 <Icon name="a-arrow-right" /></Link></section>
            <div className="work-note"><Icon name="bangzhuzhongxin" /><p>当前为组件示例。真实业务页面会在这里逐步积累，移动端新增尺寸随页面评审完善。</p></div>
          </aside>
        </div>
      </main>
    </div>
    <PhoneAccess open={phoneOpen} onOpenChange={setPhoneOpen} />
  </div>;
}
