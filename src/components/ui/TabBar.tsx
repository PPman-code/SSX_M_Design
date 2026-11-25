import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

export function TabBar<Id extends string>({ items, active, onSelect, label = '主导航' }: {
  items: readonly ({ id: Id; label: string } & ({ icon: IconName } | { marker: ReactNode }))[];
  active: Id; onSelect: (id: Id) => void; label?: string;
}) {
  return <nav className="product-tabbar" aria-label={label}>{items.map((item) => <button type="button" key={item.id}
    className={active === item.id ? 'selected' : ''} aria-current={active === item.id ? 'page' : undefined}
    onClick={() => onSelect(item.id)}>{'icon' in item ? <Icon name={item.icon} size="lg" /> : item.marker}<span>{item.label}</span></button>)}</nav>;
}
