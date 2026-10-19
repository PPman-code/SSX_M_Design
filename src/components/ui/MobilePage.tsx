import type { ReactNode } from 'react';
import { WechatPreviewHeader, WechatPreviewHistory } from './WechatPreviewChrome';

export function MobilePage({ title, previewChrome = false, previewHistory = true, children, footer, className = '' }: {
  title: string; previewChrome?: boolean; previewHistory?: boolean; children: ReactNode; footer?: ReactNode; className?: string;
}) {
  return <div className={`product-page ${previewChrome ? 'with-preview-chrome' : ''} ${className}`}>
    {previewChrome && <WechatPreviewHeader title={title} />}
    <main className="product-scroll" aria-label={title}>{children}</main>
    {footer}
    {previewChrome && previewHistory && <WechatPreviewHistory />}
    {previewChrome && <div className="preview-home-indicator" aria-hidden="true"><span /></div>}
  </div>;
}
