import type { ReactNode, RefObject } from 'react';
import { InfoDialog } from './InfoDialog';
import { Button } from './Button';

export interface DialogAction {
  label: string;
  onSelect?: () => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}
interface Props {
  stacked?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  variant?: 'buttons' | 'ios' | 'android' | 'custom';
  actions?: readonly DialogAction[];
  actionLayout?: 'horizontal' | 'vertical';
  finalFocus?: RefObject<HTMLElement | null>;
}

/** Uses the existing local modal for portal, focus, scrolling and preview boundaries. */
export function Dialog({ open, onOpenChange, title, children, variant = 'ios', actions, actionLayout, finalFocus, stacked = false }: Props) {
  const items = actions?.length ? actions : [{ label: '知道了' }];
  const vertical = variant === 'custom' || actionLayout === 'vertical' || items.length > 2;
  return <InfoDialog stacked={stacked} open={open} onOpenChange={onOpenChange} title={title} finalFocus={finalFocus} className={`dialog dialog--${variant}`}
    footer={<div className={`dialog-actions ${vertical ? 'dialog-actions--vertical' : ''}`}>
      {items.map((action, index) => <Button key={index} variant={variant === 'buttons' ? index === items.length - 1 ? 'primary' : 'soft' : variant === 'custom' && index === 0 ? 'primary' : 'text'} shape={variant === 'custom' ? 'round' : 'default'}
        className={`dialog-action ${!action.danger && (variant === 'custom' ? index > 0 : index < items.length - 1) ? 'dialog-action--secondary' : ''}`} tone={action.danger ? 'danger' : 'brand'} disabled={action.disabled} loading={action.loading}
        onClick={() => { action.onSelect?.(); if (action.closeOnSelect !== false) onOpenChange(false); }}>{action.label}</Button>)}
    </div>}>
    {children}
  </InfoDialog>;
}
