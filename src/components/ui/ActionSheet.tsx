import { Drawer } from '@base-ui/react/drawer';
import type { RefObject } from 'react';

export type ActionSheetAction = {
  label: string;
  disabled?: boolean;
  danger?: boolean;
} & ({ href: string; onSelect?: () => void } | { href?: never; onSelect: () => void });

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  actions: readonly ActionSheetAction[];
  cancelText?: string;
  finalFocus?: RefObject<HTMLElement | null>;
}

export function ActionSheet({ open, onOpenChange, title, description, actions, finalFocus, cancelText = '取消' }: Props) {
  return <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
    <Drawer.Portal>
      <Drawer.Backdrop className="sheet-backdrop" />
      <Drawer.Viewport className="sheet-viewport">
        <Drawer.Popup className="sheet action-sheet" finalFocus={finalFocus}>
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          <div className="action-sheet-options">
            {description && <Drawer.Description className="action-sheet-description">{description}</Drawer.Description>}
            {actions.map((action, index) => {
              const select = () => { action.onSelect?.(); onOpenChange(false); };
              return action.href && !action.disabled
                ? <a key={index} className="action-sheet-option" data-danger={action.danger || undefined} href={action.href} onClick={select}>{action.label}</a>
                : <button key={index} type="button" className="action-sheet-option" data-danger={action.danger || undefined} disabled={action.disabled} onClick={select}>{action.label}</button>;
            })}
          </div>
          <Drawer.Close className="action-sheet-cancel">{cancelText}</Drawer.Close>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.Portal>
  </Drawer.Root>;
}
