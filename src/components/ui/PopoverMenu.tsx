import { Menu } from '@base-ui/react/menu';
import type { ReactElement } from 'react';
import { Icon, type IconName } from './Icon';
import type { PopoverPlacement } from './Popover';

export interface PopoverMenuAction {
  key: string;
  label: string;
  icon?: IconName;
  dot?: boolean;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}
interface Props {
  label: string;
  trigger: ReactElement;
  actions: readonly PopoverMenuAction[];
  appearance?: 'light' | 'dark';
  placement?: PopoverPlacement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const assets = `${import.meta.env.BASE_URL}components/popover-menu`;

export function PopoverMenu({ label, trigger, actions, appearance = 'dark', placement = 'bottom-end', open, onOpenChange }: Props) {
  const [side, alignment] = placement.split('-');
  const align = alignment === 'start' || alignment === 'end' ? alignment : 'center';
  return <Menu.Root modal={false} open={open} onOpenChange={onOpenChange}>
    <Menu.Trigger render={trigger} openOnHover={false} />
    <Menu.Portal>
      <Menu.Positioner className="popover-menu-positioner" side={side === 'top' ? 'top' : 'bottom'} align={align} sideOffset={9} collisionPadding={12} arrowPadding={12}>
        <Menu.Popup className={`popover-menu popover-menu--${appearance}`} aria-label={label} finalFocus>
          <Menu.Arrow className="popover-menu-arrow" />
          <div className="popover-menu-list">
            {actions.map(action => <Menu.Item key={action.key} className="popover-menu-item" label={action.label} data-danger={action.danger || undefined} disabled={action.disabled} onClick={action.onSelect} closeOnClick>
              {action.icon && <span className="popover-menu-icon"><Icon name={action.icon} /></span>}
              <span className="popover-menu-label">{action.label}</span>
              {action.dot && <span className="popover-menu-dot" role="img" aria-label="有新消息"><img src={`${assets}/${appearance}-dot.svg`} alt="" width={appearance === 'dark' ? 24 : 20} height={appearance === 'dark' ? 24 : 20} /></span>}
            </Menu.Item>)}
          </div>
        </Menu.Popup>
      </Menu.Positioner>
    </Menu.Portal>
  </Menu.Root>;
}
