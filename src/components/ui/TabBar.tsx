import { Icon, type IconName } from './Icon';

export function TabBar({ items, active, onSelect }: {
  items: readonly { id: string; label: string; icon: IconName }[];
  active: string; onSelect: (id: string) => void;
}) {
  return <nav className="product-tabbar" aria-label="主导航">{items.map((item) => <button type="button" key={item.id}
    className={active === item.id ? 'selected' : ''} aria-current={active === item.id ? 'page' : undefined}
    onClick={() => onSelect(item.id)}><Icon name={item.icon} size="lg" /><span>{item.label}</span></button>)}</nav>;
}
