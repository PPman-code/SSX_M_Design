import { Accordion } from '@base-ui/react/accordion';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

interface Props {
  children: ReactNode;
  label?: string;
  variant?: 'list' | 'card';
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}
export function Collapse({ children, label, variant = 'list', value, defaultValue, onChange, multiple = false, disabled = false, className = '' }: Props) {
  return <Accordion.Root className={`collapse collapse--${variant} ${className}`} role={label ? 'group' : undefined} aria-label={label} value={value} defaultValue={defaultValue} onValueChange={onChange} multiple={multiple} disabled={disabled}>{children}</Accordion.Root>;
}
interface ItemProps {
  value: string;
  title: ReactNode;
  children: ReactNode;
  leading?: ReactNode;
  suffix?: ReactNode;
  summary?: ReactNode;
  disabled?: boolean;
  arrow?: 'down' | 'right';
  triggerLabel?: string;
  className?: string;
  triggerClassName?: string;
}
export function CollapseItem({ value, title, children, leading, suffix, summary, disabled = false, arrow = 'down', triggerLabel, className = '', triggerClassName = '' }: ItemProps) {
  return <Accordion.Item value={value} disabled={disabled} className={`collapse-item ${className}`}>
    <Accordion.Header className="collapse-header">
      <Accordion.Trigger className={`collapse-trigger ${triggerClassName}`} aria-label={triggerLabel}>
        <span className="collapse-heading">{leading && <span className="collapse-leading">{leading}</span>}<span className="collapse-title">{title}</span>{suffix && <span className="collapse-suffix">{suffix}</span>}</span>
        <span className={`collapse-arrow collapse-arrow--${arrow}`} aria-hidden="true"><Icon name={arrow === 'right' ? 'right' : 'down'} size="sm" /></span>
      </Accordion.Trigger>
    </Accordion.Header>
    {summary != null && <div className="collapse-summary">{summary}</div>}
    <Accordion.Panel className="collapse-panel"><div className="collapse-panel-content">{children}</div></Accordion.Panel>
  </Accordion.Item>;
}
