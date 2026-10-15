import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ReactElement, ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export type PopoverPlacement = 'top' | 'top-start' | 'top-end' | 'bottom' | 'bottom-start' | 'bottom-end';
interface Props {
  trigger: ReactElement;
  content: ReactNode;
  appearance?: 'light' | 'dark';
  placement?: PopoverPlacement;
  closable?: boolean;
  action?: { label: string; onClick: () => void; style?: 'button' | 'text' };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Popover({ trigger, content, appearance = 'light', placement = 'top', closable = false, action, open, onOpenChange }: Props) {
  const [side, alignment] = placement.split('-');
  const align = alignment === 'start' || alignment === 'end' ? alignment : 'center';
  return <BasePopover.Root open={open} onOpenChange={onOpenChange}>
    <BasePopover.Trigger render={trigger} />
    <BasePopover.Portal>
      <BasePopover.Positioner className="popover-positioner" side={side === 'bottom' ? 'bottom' : 'top'} align={align} sideOffset={8} collisionPadding={12} arrowPadding={12}>
        <BasePopover.Popup className={`popover popover--${appearance}`} aria-label="气泡提示">
          <BasePopover.Arrow className="popover-arrow" />
          <BasePopover.Description render={<div />} className="popover-content">{content}</BasePopover.Description>
          {action && <BasePopover.Close render={<Button variant={appearance === 'dark' ? 'secondary' : 'primary'} size="sm" className={`popover-action ${action.style === 'text' ? 'popover-action--text' : ''}`} onClick={action.onClick}>{action.label}</Button>} />}
          {closable && <><span className="popover-divider" aria-hidden="true" /><BasePopover.Close className="popover-close" aria-label="关闭气泡"><Icon name="close" size="sm" /></BasePopover.Close></>}
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  </BasePopover.Root>;
}
