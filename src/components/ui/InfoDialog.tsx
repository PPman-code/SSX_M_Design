import { Dialog } from '@base-ui/react/dialog';
import type { ReactNode, RefObject } from 'react';

interface Props {
  stacked?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: ReactNode;
  finalFocus?: RefObject<HTMLElement | null>;
  className?: string;
  footer?: ReactNode;
}

export function InfoDialog({ open, onOpenChange, title, children, finalFocus, className = '', footer, stacked = false }: Props) {
  return <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Backdrop forceRender={stacked} className={`info-dialog-backdrop ${stacked ? 'info-dialog-backdrop--stacked' : ''}`} />
      <Dialog.Viewport className={`info-dialog-viewport ${stacked ? 'info-dialog-viewport--stacked' : ''}`}>
        <Dialog.Popup className={`info-dialog ${className}`} finalFocus={finalFocus}>
          <div className="info-dialog-content">
            <Dialog.Title className="info-dialog-title">{title}</Dialog.Title>
            <Dialog.Description render={<div />} className="info-dialog-description">{children}</Dialog.Description>
          </div>
          {footer ?? <Dialog.Close className="info-dialog-confirm">知道了</Dialog.Close>}
        </Dialog.Popup>
      </Dialog.Viewport>
    </Dialog.Portal>
  </Dialog.Root>;
}
