import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Icon, type IconName } from '../../../components/ui/Icon';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';
import './app-page.css';
import './app-ambient.css';

/** Candidate shell. Navigation geometry awaits the App component design. */
export function AppPage({ title, navTitle, navLeading, solidNavOnScroll = false, showNavTitle = true, preview = false, previewStatus, background = 'surface', backIcon = 'left', backLabel = 'App 返回', onBack, actions, footer, onRefresh, children }: {
  title: string; preview?: boolean; background?: 'surface' | 'brand' | 'transparent';
  previewStatus?: ReactNode;
  showNavTitle?: boolean; navTitle?: ReactNode; navLeading?: ReactNode; solidNavOnScroll?: boolean;
  backIcon?: IconName | null; backLabel?: string; onBack: () => void; actions?: ReactNode; footer?: ReactNode; children: ReactNode;
  onRefresh?: (signal: AbortSignal) => Promise<void>;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const previous = document.title; document.title = title; return () => { document.title = previous; }; }, [title]);
  const assets = `${import.meta.env.BASE_URL}preview/wechat/`;
  return <div className={`product-page app-page ${preview ? 'app-page--preview' : ''}`}>
    <header className="app-page-top" data-background={background} data-scrolled={solidNavOnScroll && scrolled || undefined}>
      {preview && (previewStatus ?? <div className="preview-system-status" aria-hidden="true"><img src={`${assets}time.svg`} width="25.615" height="10.343" alt="" /><img src={`${assets}status.svg`} width="66.601" height="24" alt="" /></div>)}
      {(showNavTitle || navLeading || backIcon || actions) && <nav className={`app-page-nav ${navLeading ? 'app-page-nav--leading' : ''}`} aria-label="App 顶部导航">
        <div className="app-page-nav-side">{navLeading ?? (backIcon && <button type="button" className="app-page-icon-button" aria-label={backLabel} onClick={onBack}><Icon name={backIcon} /></button>)}</div>
        {showNavTitle ? (navTitle ?? <strong className="app-page-title">{title}</strong>) : <span aria-hidden="true" />}
        <div className="app-page-nav-side app-page-nav-actions">{actions}</div>
      </nav>}
    </header>
    <main ref={scrollRef} className="product-scroll" aria-label={title} onScroll={event => { if (solidNavOnScroll) setScrolled(event.currentTarget.scrollTop > 0); }}>
      {onRefresh && <PullToRefresh scrollRef={scrollRef} onRefresh={onRefresh} successText="模拟刷新完成" />}
      {children}
    </main>
    {footer}
    {preview && createPortal(<div className="preview-home-indicator app-home-indicator" aria-hidden="true"><span /></div>, document.body)}
  </div>;
}
