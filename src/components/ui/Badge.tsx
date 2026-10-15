import type { ReactNode } from 'react';

interface Props {
  count?: number;
  max?: number;
  dot?: boolean;
  bordered?: boolean;
  showZero?: boolean;
  label?: string;
  children?: ReactNode;
}

export function Badge({ count = 0, max = 99, dot = false, bordered = false, showZero = false, label, children }: Props) {
  const value = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const limit = Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 99;
  const visible = dot || value > 0 || showZero;
  const badge = visible ? <span className={`badge ${dot ? 'badge--dot' : ''} ${bordered ? 'badge--bordered' : ''}`} role="img" aria-label={label || (dot ? '有新消息' : `${value} 条未读消息`)}>{!dot && <span aria-hidden="true">{value > limit ? `${limit}+` : value}</span>}</span> : null;
  return children != null ? <span className="badge-anchor">{children}{badge}</span> : badge;
}
