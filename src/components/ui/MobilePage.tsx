import { useRef, type ReactNode } from 'react';
import { WechatPreviewHeader, WechatPreviewHistory } from './WechatPreviewChrome';
import { PullToRefresh } from './PullToRefresh';

export function MobilePage({ title, previewChrome = false, previewHistory = true, children, footer, className = '', onRefresh, refreshDisabled, refreshSuccessText }: {
  title: string; previewChrome?: boolean; previewHistory?: boolean; children: ReactNode | ((refreshIndicator: ReactNode) => ReactNode); footer?: ReactNode; className?: string;
  onRefresh?: (signal: AbortSignal) => Promise<void>; refreshDisabled?: boolean; refreshSuccessText?: string;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const refreshIndicator = onRefresh ? <PullToRefresh scrollRef={scrollRef} onRefresh={onRefresh} disabled={refreshDisabled} successText={refreshSuccessText} /> : null;
  return <div className={`product-page ${previewChrome ? 'with-preview-chrome' : ''} ${className}`}>
    {previewChrome && <WechatPreviewHeader title={title} />}
    <main ref={scrollRef} className="product-scroll" aria-label={title}>
      {typeof children === 'function' ? children(refreshIndicator) : <>{refreshIndicator}{children}</>}
    </main>
    {footer}
    {previewChrome && previewHistory && <WechatPreviewHistory />}
    {previewChrome && <div className="preview-home-indicator" aria-hidden="true"><span /></div>}
  </div>;
}
