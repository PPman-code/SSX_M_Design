import { Icon, type IconName } from './Icon';
import './Loading.css';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'text';
  layout?: 'horizontal' | 'vertical';
  text?: string;
  label?: string;
  tone?: 'brand' | 'subtle' | 'inherit';
  icon?: IconName;
  status?: 'loading' | 'error';
  onRetry?: () => void;
}

export function Loading({ size = 'sm', variant = 'spinner', layout = 'horizontal', text, label = '加载中', tone = 'brand', icon = 'loading', status = 'loading', onRetry }: LoadingProps) {
  const message = text || (status === 'error' ? '加载失败' : variant === 'text' ? label : undefined);
  return <span className={`ssx-loading ssx-loading--${size} ssx-loading--${layout} ssx-loading--${tone}`} role="status" aria-live="polite" data-state={status}>
    {status === 'loading' && variant !== 'text' && <span className="ssx-loading-graphic" aria-hidden="true">
      {variant === 'dots' ? <span className="ssx-loading-dots"><i /><i /><i /></span> : <Icon name={icon} className="ssx-loading-spinner" />}
    </span>}
    {message ? <span className="ssx-loading-text">{message}</span> : <span className="sr-only">{label}</span>}
    {status === 'error' && onRetry && <button type="button" className="ssx-loading-retry touch-target" onClick={onRetry}>重试</button>}
  </span>;
}
