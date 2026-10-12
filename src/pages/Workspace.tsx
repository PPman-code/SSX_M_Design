import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PhoneAccess } from '../components/PhoneAccess';
import { DevicePreview } from '../components/DevicePreview';
import { mobileRules } from '../design-data';
import { businessPages } from '../page-registry';

export function Workspace({ mode, onToggleTheme }: { mode: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [params, setParams] = useSearchParams();
  const selectedPage = businessPages.find((page) => page.id === params.get('page'));
  const [width, setWidth] = useState(390);
  const [previewChrome, setPreviewChrome] = useState(true);
  const [deviceShell, setDeviceShell] = useState(true);
  const directRoute = selectedPage ? `${selectedPage.route}?theme=${mode}` : `/mobile?theme=${mode}`;
  const iframeRoute = `${directRoute}${selectedPage && previewChrome ? '&chrome=wechat' : ''}`;
  const [phoneOpen, setPhoneOpen] = useState(false);
  return <div className="workspace">
    <aside className="sidebar">
      <Link to="/" className="brand"><img className="brand-mark" src={`${import.meta.env.BASE_URL}brand/wone-logo.png`} alt="智校" /><span>智校设计<span className="brand-sub">MOBILE WORKSPACE</span></span></Link>
      <div className="sidebar-group-label">设计工作区</div>
      <nav aria-label="工作区导航"><Link className={`nav-item ${!selectedPage ? 'active' : ''}`} to={`/?theme=${mode}`} aria-current={!selectedPage ? 'page' : undefined}><Icon name="apps" />组件预览<span className="nav-count">01</span></Link><Link className="nav-item" to="/handoff"><Icon name="list" />设计规范与交付</Link></nav>
      <div className="sidebar-group-label pages-label">业务页面 <span>{businessPages.length}</span></div>
      <nav aria-label="业务页面">{businessPages.map((page) => <Link key={page.id} className={`nav-item ${selectedPage?.id === page.id ? 'active' : ''}`} to={`/?page=${page.id}&theme=${mode}`} aria-current={selectedPage?.id === page.id ? 'page' : undefined}><Icon name="user" />{page.name}<span className="nav-count">{page.version}</span></Link>)}</nav>
      <div className="sidebar-footer"><span className="status-dot" />本地设计项目<small>SSX Mobile Design · v0.1.0</small></div>
    </aside>

    <div className="workspace-main">
      <header className="workspace-toolbar"><span>智校 <span className="breadcrumb-slash">/</span> 移动端设计</span><div className="toolbar-actions"><Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label={mode === 'light' ? '切换到深色' : '切换到浅色'}>{mode === 'light' ? '深色预览' : '浅色预览'}</Button><Button size="sm" onClick={() => setPhoneOpen(true)}>手机预览 <Icon name="launch" /></Button></div></header>
      <main className="workspace-content">
        <div className="workspace-heading"><div><span className="eyebrow">DESIGN FOUNDATION / 01</span><h1>移动端设计工作区</h1><p>延续智校的视觉语言，为移动端建立更自然的体验。</p></div><span className="status-badge">初始基线 · 待业务验证</span></div>
        <div className="workspace-columns">
          <section className="preview-panel" aria-label="页面预览">
            <div className="preview-toolbar"><span className="preview-title"><span className="status-dot" />{selectedPage ? `${selectedPage.name} · ${selectedPage.version}` : '组件预览'}</span><a href={`#${directRoute}`} target="_blank" rel="noreferrer" className="text-link">独立打开 <Icon name="launch" /></a></div>
            <div className="preview-stage">
              <div className="width-selector" aria-label="预览宽度">{[360, 375, 390, 430].map((value) => <button type="button" key={value} aria-pressed={width === value} onClick={() => setWidth(value)}>{value}</button>)}<span>px</span></div>
              <div className="page-preview-options"><div className="shell-selector" role="group" aria-label="预览外壳"><button type="button" aria-pressed={deviceShell} onClick={() => setDeviceShell(true)}>手机外壳</button><button type="button" aria-pressed={!deviceShell} onClick={() => setDeviceShell(false)}>无外壳</button></div>{selectedPage && <label><input type="checkbox" checked={previewChrome} onChange={(event) => setPreviewChrome(event.target.checked)} />微信外观预览</label>}</div>
              <div className="device-scroll"><DevicePreview title={selectedPage ? `移动端${selectedPage.name}页面预览` : '移动端组件预览'} src={`./#${iframeRoute}`} width={width} height={selectedPage ? 858 : 700} shell={deviceShell} /></div>
              <p className="preview-caption">真实页面 · 可点击交互 · 支持手机访问</p>
            </div>
          </section>

          <aside className="spec-panel" aria-label="设计说明">
            {selectedPage && <section className="spec-card"><span className="eyebrow">BUSINESS PAGE / {selectedPage.version}</span><h2>{selectedPage.name} · {selectedPage.status}</h2><p>使用角色：{selectedPage.audience}</p><p>{selectedPage.description}</p><a className="text-link" href={selectedPage.figmaUrl} target="_blank" rel="noreferrer">查看 Figma 原稿 <Icon name="launch" /></a><p>当前实现本页视觉与入口反馈；下级页面、真实收款及接口尚未接入。</p><button type="button" className="text-link page-link-button" onClick={() => setParams((previous) => { previous.delete('page'); return previous; })}>返回组件预览</button></section>}

            <section className="spec-card"><span className="eyebrow">MOBILE FIRST</span><h2>为小屏幕重新设定</h2><p>保留品牌与设计语言，调整操作密度和交互方式。</p><div className="metric-list">{mobileRules.map((rule) => <div className="metric" key={rule.name}><div><span>{rule.name}</span><small>{rule.note}</small></div><strong>{rule.value}<small>{rule.unit}</small></strong></div>)}</div></section>
            <section className="spec-card"><h2>与 PC 一脉相承</h2><ul className="inheritance-list"><li><Icon name="check" />品牌色与状态语义</li><li><Icon name="check" />字体、字重和图标资产</li><li><Icon name="check" />可追溯的设计变量</li></ul><Link className="text-link" to="/handoff">查看规范与来源 <Icon name="right" /></Link></section>
            <div className="work-note"><Icon name="question-circle" /><p>{selectedPage ? '本页按 Figma 原稿制作，当前为设计草稿。真机与下级流程待验收。' : '组件示例与业务页面独立管理；从左侧切换到“我的”页面。'}</p></div>
          </aside>
        </div>
      </main>
    </div>
    <PhoneAccess open={phoneOpen} onOpenChange={setPhoneOpen} route={selectedPage ? directRoute : undefined} />
  </div>;
}
