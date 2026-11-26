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
  /** Node rendered after the title text, e.g. a promotional badge. Kept out of the accessible name by callers when decorative. */
  titleAddon?: ReactNode;
  description?: ReactNode;
  descriptionPlacement?: 'below-header' | 'under-title';
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  className?: string;
  finalFocus?: RefObject<HTMLElement | null>;
}
export function BottomSheet({ open, onOpenChange, title, titleAddon, description, descriptionPlacement = 'below-header', children, footer, header, className = '', finalFocus, mode = 'selection', onCloseRequest, onBack }: Props) {
  const descriptionElement = description ? <Drawer.Description data-base-ui-swipe-ignore="" className="sheet-description">{description}</Drawer.Description> : null;
  const descriptionUnderTitle = header == null && descriptionPlacement === 'under-title' && descriptionElement !== null;
  const titleElement = <Drawer.Title>{title}{titleAddon && <span className="sheet-title-addon">{titleAddon}</span>}</Drawer.Title>;

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
                <div className={`sheet-heading${onBack ? ' sheet-heading--back' : ''}${descriptionUnderTitle ? ' sheet-heading--with-description' : ''}`}>
                  {onBack && <Button className="sheet-nav-back" variant="text" icon="left" onClick={onBack}>返回</Button>}
                  {titleElement}
                  {!onBack && <Drawer.Close className="icon-button" aria-label="关闭弹层"><Icon name="close" size="md" className="sheet-close-icon" /></Drawer.Close>}
                  {descriptionUnderTitle && descriptionElement}
                </div>
              </>}
              {!descriptionUnderTitle && descriptionElement}
              <Drawer.Content data-base-ui-swipe-ignore="" className="sheet-content">{children}</Drawer.Content>
              {footer != null && <div data-base-ui-swipe-ignore="" className="sheet-footer">{footer}</div>}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.VirtualKeyboardProvider>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
