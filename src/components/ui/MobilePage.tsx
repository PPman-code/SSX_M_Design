import type { ReactNode } from 'react';

export function MobilePage({ title, previewChrome = false, children, footer, className = '' }: {
  title: string; previewChrome?: boolean; children: ReactNode; footer?: ReactNode; className?: string;
}) {
  const assets = `${import.meta.env.BASE_URL}preview/wechat/`;
  return <div className={`product-page ${previewChrome ? 'with-preview-chrome' : ''} ${className}`}>
    {previewChrome && <div className="preview-chrome" aria-hidden="true">
      <div className="preview-system-status"><img src={`${assets}time.svg`} width="25.615" height="10.343" alt="" /><img src={`${assets}status.svg`} width="66.601" height="24" alt="" /></div>
      <div className="preview-wechat-nav"><span><img src={`${assets}close.svg`} width="13.059" height="13.059" alt="" /></span><span>{title}</span><span><img src={`${assets}more.svg`} width="20" height="4" alt="" /></span></div>
    </div>}
    <main className="product-scroll" aria-label={title}>{children}</main>
    {footer}
    {previewChrome && <div className="preview-home-indicator" aria-hidden="true"><span /></div>}
  </div>;
}
