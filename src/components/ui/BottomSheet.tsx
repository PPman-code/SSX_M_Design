import { Drawer } from '@base-ui/react/drawer';
import type { ReactNode, RefObject } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface Props {
  mode?: 'selection' | 'editor';
  onBack?: () => void;
  onCloseRequest?: () => void;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  className?: string;
  finalFocus?: RefObject<HTMLElement | null>;
}
export function BottomSheet({ open, onOpenChange, title, description, children, footer, header, className = '', finalFocus, mode = 'selection', onCloseRequest, onBack }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={(next, details) => {
      if (!next && mode === 'editor' && details.reason === 'swipe') { details.cancel(); return; }
      if (!next && onCloseRequest) { details.cancel(); onCloseRequest(); return; }
      onOpenChange(next);
    }} swipeDirection="down">
      <Drawer.Portal>
        <Drawer.Backdrop className="sheet-backdrop" />
        <Drawer.VirtualKeyboardProvider>
          <Drawer.Viewport className="sheet-viewport">
            <Drawer.Popup data-base-ui-swipe-ignore={mode === 'editor' ? '' : undefined} className={`sheet sheet--${mode} ${footer != null ? 'sheet--with-footer' : ''} ${className}`} finalFocus={finalFocus}>
              {header != null ? <>
                <Drawer.Title className="sr-only">{title}</Drawer.Title>
                {header}
              </> : <>
                {mode === 'selection' && <div className="sheet-handle" aria-hidden="true" />}
                <div className={`sheet-heading ${onBack ? 'sheet-heading--back' : ''}`}>
                  {onBack && <Button className="sheet-nav-back" variant="text" icon="left" onClick={onBack}>返回</Button>}
                  <Drawer.Title>{title}</Drawer.Title>
                  {onBack ? <span aria-hidden="true" /> : <Drawer.Close className="icon-button" aria-label="关闭弹层"><Icon name="close" size="md" className="sheet-close-icon" /></Drawer.Close>}
                </div>
              </>}
              {description && <Drawer.Description data-base-ui-swipe-ignore="" className="sheet-description">{description}</Drawer.Description>}
              <Drawer.Content data-base-ui-swipe-ignore="" className="sheet-content">{children}</Drawer.Content>
              {footer != null && <div data-base-ui-swipe-ignore="" className="sheet-footer">{footer}</div>}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
