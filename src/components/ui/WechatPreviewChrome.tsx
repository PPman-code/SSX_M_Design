import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePreviewHistory } from '../PreviewHistory.context';
import { Icon } from './Icon';

export function WechatPreviewHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  const { canBack } = usePreviewHistory();
  const [params] = useSearchParams();
  const assets = `${import.meta.env.BASE_URL}preview/wechat/`;
  function back() {
    if (canBack) navigate(-1);
    else {
      const next = new URLSearchParams();
      for (const key of ['theme', 'role', 'chrome']) {
        const value = params.get(key);
        if (value) next.set(key, value);
      }
      navigate(`/pages/home/v1?${next}`, { replace: true });
    }
  }
  return <div className="preview-chrome">
    <div className="preview-system-status" aria-hidden="true"><img src={`${assets}time.svg`} width="25.615" height="10.343" alt="" /><img src={`${assets}status.svg`} width="66.601" height="24" alt="" /></div>
    <div className="preview-wechat-nav">
      <button type="button" className="preview-close" aria-label="微信顶部返回" onClick={back}><Icon name="close" size="md" /></button>
      <div className="preview-web-title"><strong>{title}</strong><span>{window.location.hostname}</span></div>
      <span className="preview-web-more" aria-hidden="true"><Icon name="more" size="md" /></span>
    </div>
  </div>;
}
export function WechatPreviewHistory() {
  const { hasHistory, canBack, canForward } = usePreviewHistory();
  const navigate = useNavigate();
  if (!hasHistory) return null;
  return <nav className="preview-history" aria-label="微信浏览导航">
    <button type="button" disabled={!canBack} aria-label="微信后退" onClick={() => navigate(-1)}><Icon name="left" size="lg" /></button>
    <button type="button" disabled={!canForward} aria-label="微信前进" onClick={() => navigate(1)}><Icon name="right" size="lg" /></button>
  </nav>;
}
