import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode, RefObject } from 'react';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  className?: string;
  finalFocus?: RefObject<HTMLElement | null>;
}
export function BottomSheet({ open, onOpenChange, title, description, children, footer, header, className = '', finalFocus }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Viewport className="sheet-viewport">
            <Drawer.Popup className={`sheet ${footer != null ? 'sheet--with-footer' : ''} ${className}`} finalFocus={finalFocus}>
              {header != null ? <>
                <Drawer.Title className="sr-only">{title}</Drawer.Title>
                {header}
              </> : <>
                <div className="sheet-handle" aria-hidden="true" />
                <div className="sheet-heading">
                  <Drawer.Title>{title}</Drawer.Title>
                  <Drawer.Close className="icon-button" aria-label="关闭弹层"><Icon name="close" size="md" className="sheet-close-icon" /></Drawer.Close>
                </div>
              </>}
              {description && <Drawer.Description className="sheet-description">{description}</Drawer.Description>}
              <Drawer.Content className="sheet-content">{children}</Drawer.Content>
              {footer != null && <div className="sheet-footer">{footer}</div>}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
