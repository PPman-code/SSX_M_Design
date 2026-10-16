import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { PhoneAccess } from '../components/PhoneAccess';
import { DevicePreview } from '../components/DevicePreview';
import { WorkspaceConfig } from '../components/WorkspaceConfig';
import { PreviewSettings } from '../components/PreviewSettings';
import { archivedBusinessPages, businessPages } from '../page-registry';
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
  const [previewLocation, setPreviewLocation] = useState<{ pathname: string; search: string } | null>(null);
  const currentPage = previewLocation ? [...businessPages, ...archivedBusinessPages].find((page) => page.route === previewLocation.pathname) : selectedPage;
  const currentParams = previewLocation ? new URLSearchParams(previewLocation.search) : params;
  const currentPageName = currentPage?.id.startsWith('attendance') && currentParams.get('view') === 'detail' ? '上课明细' : currentPage?.name;
  function updatePreviewConfig(key: 'role' | 'payment', value: string) {
    if (currentPage?.id === selectedPage?.id && !currentParams.has('view') && !currentParams.has('from')) {
      setParams((previous) => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); return next; });
    } else {
      document.querySelector('iframe')?.contentWindow?.postMessage({ type: 'ssx-preview-config', key, value }, window.location.origin);
    }
  }
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin || event.source !== document.querySelector('iframe')?.contentWindow) return;
      if (event.data?.type === 'ssx-preview-location' && typeof event.data.pathname === 'string' && typeof event.data.search === 'string') {
        setPreviewLocation({ pathname: event.data.pathname, search: event.data.search });
        return;
      }
      if (event.data?.type !== 'ssx-preview-close') return;
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
      <div className="sidebar-bottom">
        <Button variant="ghost" size="sm" block onClick={onToggleTheme} aria-label={mode === 'light' ? '切换到深色' : '切换到浅色'} aria-pressed={mode === 'dark'}>{mode === 'light' ? '深色预览' : '浅色预览'}</Button>
        <div className="sidebar-footer"><span className="status-dot" />本地设计项目<small>SSX Mobile Design · v0.1.0</small></div>
      </div>
    </aside>

    <div className="workspace-main">
      <main className="workspace-content" hidden={handoff}>
        <div className="workspace-heading"><div><span className="eyebrow">DESIGN FOUNDATION / 01</span><h1>移动端设计工作区</h1><p>延续智校的视觉语言，为移动端建立更自然的体验。</p></div><span className="status-badge">初始基线 · 待业务验证</span></div>
        <div className="workspace-columns">
          <section className="preview-panel" aria-label="页面预览">
            <div className="preview-toolbar"><PreviewSettings width={width} onWidthChange={setWidth} shell={deviceShell} onShellChange={setDeviceShell} showChrome={Boolean(selectedPage)} previewChrome={previewChrome} onPreviewChromeChange={setPreviewChrome} /><div className="preview-links">{selectedPage?.figmaUrl ? <a className="text-link" href={selectedPage.figmaUrl} target="_blank" rel="noreferrer">Figma 原稿 <Icon name="launch" /></a> : null}<a href={`#${directRoute}`} target="_blank" rel="noreferrer" className="text-link">独立打开 <Icon name="launch" /></a><Button variant="text" size="sm" onClick={() => setPhoneOpen(true)}>手机预览 <Icon name="launch" /></Button></div></div>
            <div className="preview-stage">
              <div className="device-scroll"><DevicePreview title={selectedPage ? `移动端${selectedPage.name}页面预览` : '移动端组件预览'} src={`./#${iframeRoute}`} width={width} height={selectedPage ? 858 : 700} shell={deviceShell} /></div>
              <p className="preview-caption">真实页面 · 可点击交互 · 支持手机访问</p>
            </div>
          </section>
          {selectedPage && currentPage && <aside className="page-config-panel" aria-label="当前页面配置"><WorkspaceConfig key={currentPage.id} pageId={currentPage.id} pageName={`${currentPageName} · ${currentPage.version}`} paymentEnabled={currentParams.get('payment') === 'enabled'} onPaymentChange={(enabled) => updatePreviewConfig('payment', enabled ? 'enabled' : '')} role={currentParams.get('role') ?? ''} onRoleChange={(next) => updatePreviewConfig('role', next && next !== 'headmaster' ? next : '')} /></aside>}
        </div>
      </main>
      {handoff && <Handoff mode={mode} />}
    </div>
    <PhoneAccess open={phoneOpen} onOpenChange={setPhoneOpen} route={selectedPage ? directRoute : undefined} />
  </div>;
}
