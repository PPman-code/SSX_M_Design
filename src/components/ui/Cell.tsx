import type { ReactNode } from 'react';
import { Icon } from './Icon';
import './CellIcons.css';
import './FieldDivider.css';

interface ContentProps {
  label: string;
  description?: string;
  overline?: string;
  leading?: ReactNode;
  value?: ReactNode;
  arrow?: boolean;
  multiline?: boolean;
  required?: boolean;
  media?: 'avatar' | 'image';
}
type Props = ContentProps & (
  | { control: ReactNode; onClick?: never; disabled?: never }
  | { control?: never; onClick?: () => void; disabled?: boolean }
);

export function Cell({ label, description, overline, leading, value, arrow = false, multiline = false, required = false, media = 'avatar', control, onClick, disabled = false }: Props) {
  const className = `base-cell field-divider ${description ? 'base-cell--description' : ''} ${multiline || overline ? 'base-cell--multiline' : ''} ${media === 'image' ? 'base-cell--image' : ''}`;
  const content = <span className="base-cell-inner">
    {leading && <span className="base-cell-leading">{leading}</span>}
    <span className="base-cell-labels">{overline && <span className="base-cell-overline">{overline}</span>}<span className="base-cell-label">{label}{required && <><span className="base-cell-required" aria-hidden="true">*</span><span className="sr-only"> 必填</span></>}</span>{description && <span className="base-cell-description">{description}</span>}</span>
    {value != null && <span className="base-cell-value">{value}</span>}
    {control != null && <span className="base-cell-control">{control}</span>}
    {arrow && <span className="base-cell-arrow"><Icon name="right" size="md" /></span>}
  </span>;
  return onClick ? <button type="button" className={className} onClick={onClick} disabled={disabled}>{content}</button> : <div className={className}>{content}</div>;
}

export function CellGroup({ children, label, variant = 'card' }: { children: ReactNode; label?: string; variant?: 'card' | 'block' }) {
  return <div className={`cell-group cell-group--${variant}`} role={label ? 'group' : undefined} aria-label={label}>{children}</div>;
}
