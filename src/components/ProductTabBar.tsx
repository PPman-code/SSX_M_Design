import { useNavigate, useSearchParams } from 'react-router-dom';
import { TabBar } from './ui/TabBar';

const items = [{ id: 'home', label: '首页', icon: 'home-1-fill' }, { id: 'my', label: '我的', icon: 'user-3-fill' }] as const;

export function ProductTabBar({ active }: { active: 'home' | 'my' }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  return <TabBar items={items} active={active} onSelect={(id) => {
    if (id === active) return;
    const next = new URLSearchParams(params);
    next.delete('from'); next.delete('view'); next.delete('group');
    navigate(`/pages/${id}/v1?${next}`);
  }} />;
}
