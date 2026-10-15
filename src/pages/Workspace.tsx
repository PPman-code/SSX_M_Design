import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PhoneAccess } from '../components/PhoneAccess';
import { DevicePreview } from '../components/DevicePreview';
import { WorkspaceConfig } from '../components/WorkspaceConfig';
import { PreviewSettings } from '../components/PreviewSettings';
import { businessPages } from '../page-registry';
import { Handoff } from './Handoff';

export function Workspace({ mode, onToggleTheme }: { mode: 'light' | 'dark'; onToggleTheme: () => void }) {
  const [params, setParams] = useSearchParams();
  const handoff = useLocation().pathname === '/handoff';
  const selectedPage = businessPages.find((page) => page.id === (params.get('page') === 'attendance' ? 'attendance-v2' : params.get('page')));
  const [width, setWidth] = useState(390);
  const [previewChrome, setPreviewChrome] = useState(true);
  const [deviceShell, setDeviceShell] = useState(true);
  const paymentEnabled = params.get('payment') === 'enabled';
  const role = params.get('role') ?? '';
  const pageParams = [paymentEnabled ? 'payment=enabled' : '', role ? `role=${encodeURIComponent(role)}` : ''].filter(Boolean).join('&');
  const directRoute = selectedPage ? `${selectedPage.route}?theme=${mode}${pageParams ? `&${pageParams}` : ''}` : `/mobile?theme=${mode}`;
  const iframeRoute = `${directRoute}${selectedPage && previewChrome ? '&chrome=wechat' : !selectedPage && deviceShell ? '&chrome=status' : ''}`;
  const [phoneOpen, setPhoneOpen] = useState(false);
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== document.querySelector('iframe')?.contentWindow || event.data?.type !== 'ssx-preview-close') return;
      setParams((previous) => { const next = new URLSearchParams(previous); next.delete('page'); return next; });
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [setParams]);
  return <div className="workspace">
    <aside className="sidebar">
      <Link to="/" className="brand"><img className="brand-mark" src={`${import.meta.env.BASE_URL}brand/wone-logo.png`} alt="智校" /><span>智校设计<span className="brand-sub">MOBILE WORKSPACE</span></span></Link>
      <div className="sidebar-group-label">设计工作区</div>
      <nav aria-label="工作区导航"><Link className={`nav-item ${!selectedPage && !handoff ? 'active' : ''}`} to={`/?theme=${mode}`} aria-current={!selectedPage && !handoff ? 'page' : undefined}><Icon name="apps" />组件预览<span className="nav-count">01</span></Link><Link className={`nav-item ${handoff ? 'active' : ''}`} to={`/handoff?${params.toString()}`} aria-current={handoff ? 'page' : undefined}><Icon name="list" />设计规范与交付</Link><Link className={`nav-item ${selectedPage && !handoff ? 'active' : ''}`} to={`/?page=home&theme=${mode}`} aria-current={selectedPage && !handoff ? 'page' : undefined}><Icon name="user" />项目预览</Link></nav>
      <div className="sidebar-footer"><span className="status-dot" />本地设计项目<small>SSX Mobile Design · v0.1.0</small></div>
    </aside>

    <div className="workspace-main">
      <header className="workspace-toolbar"><span>智校 <span className="breadcrumb-slash">/</span> {handoff ? '设计规范与交付' : '移动端设计'}</span><div className="toolbar-actions">{handoff ? <Button variant="ghost" size="sm" onClick={onToggleTheme} aria-label={mode === 'light' ? '切换到深色' : '切换到浅色'}>{mode === 'light' ? '深色预览' : '浅色预览'}</Button> : <Button size="sm" onClick={() => setPhoneOpen(true)}>手机预览 <Icon name="launch" /></Button>}</div></header>
      <main className="workspace-content" hidden={handoff}>
        <div className="workspace-heading"><div><span className="eyebrow">DESIGN FOUNDATION / 01</span><h1>移动端设计工作区</h1><p>延续智校的视觉语言，为移动端建立更自然的体验。</p></div><span className="status-badge">初始基线 · 待业务验证</span></div>
        <div className="workspace-columns">
          <section className="preview-panel" aria-label="页面预览">
            <div className="preview-toolbar"><span className="preview-title"><span className="status-dot" />{selectedPage ? `${selectedPage.name} · ${selectedPage.version}` : '组件预览'}</span><div className="preview-links">{selectedPage?.figmaUrl ? <a className="text-link" href={selectedPage.figmaUrl} target="_blank" rel="noreferrer">Figma 原稿 <Icon name="launch" /></a> : null}<a href={`#${directRoute}`} target="_blank" rel="noreferrer" className="text-link">独立打开 <Icon name="launch" /></a></div></div>
            <div className="preview-stage">
              <PreviewSettings width={width} onWidthChange={setWidth} shell={deviceShell} onShellChange={setDeviceShell} showChrome={Boolean(selectedPage)} previewChrome={previewChrome} onPreviewChromeChange={setPreviewChrome} mode={mode} onToggleTheme={onToggleTheme} />
              <div className="device-scroll"><DevicePreview title={selectedPage ? `移动端${selectedPage.name}页面预览` : '移动端组件预览'} src={`./#${iframeRoute}`} width={width} height={selectedPage ? 858 : 700} shell={deviceShell} /></div>
              <p className="preview-caption">真实页面 · 可点击交互 · 支持手机访问</p>
            </div>
          </section>
          {selectedPage && <aside className="page-config-panel" aria-label="当前页面配置"><WorkspaceConfig key={selectedPage.id} pageId={selectedPage.id} pageName={`${selectedPage.name} · ${selectedPage.version}`} paymentEnabled={paymentEnabled} onPaymentChange={(enabled) => setParams((previous) => { if (enabled) previous.set('payment', 'enabled'); else previous.delete('payment'); return previous; })} role={role} onRoleChange={(next) => setParams((previous) => { if (next && next !== 'headmaster') previous.set('role', next); else previous.delete('role'); return previous; })} /></aside>}
        </div>
      </main>
      {handoff && <Handoff mode={mode} />}
    </div>
    <PhoneAccess open={phoneOpen} onOpenChange={setPhoneOpen} route={selectedPage ? directRoute : undefined} />
  </div>;
}
