import { Icon } from '../../../components/ui/Icon';
import type { BundleItem, BundleKind } from './course-data';

const bundleKinds = {
  course: { icon: 'xuanke1', label: '课程' },
  class: { icon: 'xuanban1', label: '班级' },
  goods: { icon: 'xuanwu', label: '物品' },
} as const satisfies Record<BundleKind, { icon: string; label: string }>;

export function BundleItemName({ item }: { item: Pick<BundleItem, 'name' | 'kinds'> }) {
  return <span className="parent-bundle-name">
    <span className="parent-bundle-kind-icons">
      {item.kinds.map(kind => <Icon key={kind} name={bundleKinds[kind].icon} size="md" label={bundleKinds[kind].label} />)}
    </span>
    <span>{item.name}</span>
  </span>;
}
