import { Icon, type IconName } from './Icon';

export function MenuCell({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return <button type="button" className="menu-cell" onClick={onClick}>
    <Icon name={icon} size="lg" /><span>{label}</span><span className="menu-cell-arrow"><Icon name="right" size="sm" /></span>
  </button>;
}
