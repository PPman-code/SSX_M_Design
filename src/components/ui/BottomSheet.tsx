import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode, RefObject } from 'react';
import { Icon } from './Icon';

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  finalFocus?: RefObject<HTMLElement | null>;
}
export function BottomSheet({ open, onOpenChange, title, description, children, finalFocus }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Viewport className="sheet-viewport">
            <Drawer.Popup className="sheet" finalFocus={finalFocus}>
              <div className="sheet-handle" aria-hidden="true" />
              <div className="sheet-heading">
                <Drawer.Title>{title}</Drawer.Title>
                <Drawer.Close className="icon-button" aria-label="关闭弹层"><Icon name="close" size="lg" /></Drawer.Close>
              </div>
              {description && <Drawer.Description className="sheet-description">{description}</Drawer.Description>}
              <Drawer.Content className="sheet-content">{children}</Drawer.Content>
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
