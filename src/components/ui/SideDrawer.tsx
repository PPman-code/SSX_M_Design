import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode, RefObject } from 'react';
import { Icon } from './Icon';
import './SideDrawer.css';

/** Product-viewport drawer; shares modal boundaries, focus and keyboard handling with BottomSheet. */
export function SideDrawer({ open, onOpenChange, title, children, footer, finalFocus }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; children: ReactNode;
  footer: ReactNode; finalFocus?: RefObject<HTMLElement | null>;
}) {
  return <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="right">
    <Drawer.Portal><Drawer.Backdrop className="sheet-backdrop" /><Drawer.VirtualKeyboardProvider>
      <Drawer.Viewport className="sheet-viewport side-drawer-viewport">
        <Drawer.Popup className="sheet side-drawer" finalFocus={finalFocus}>
          <div className="side-drawer-heading"><Drawer.Title>{title}</Drawer.Title><Drawer.Close className="icon-button" aria-label="关闭筛选"><Icon name="close" /></Drawer.Close></div>
          <Drawer.Content className="sheet-content">{children}</Drawer.Content>
          <div className="sheet-footer">{footer}</div>
        </Drawer.Popup>
      </Drawer.Viewport>
    </Drawer.VirtualKeyboardProvider></Drawer.Portal>
  </Drawer.Root>;
}
