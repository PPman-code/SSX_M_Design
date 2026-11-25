import { Icon } from '../../../components/ui/Icon';
import { TabBar } from '../../../components/ui/TabBar';
import './workbench-navigation.css';

export type WorkbenchView = 'home' | 'mine';

export function WorkbenchNavigation({ view, onChange, onAira }: { view: WorkbenchView; onChange: (view: WorkbenchView) => void; onAira: () => void }) {
  return <div className="workbench-navigation"><TabBar<WorkbenchView | 'aira'> label="工作台导航" active={view} items={[
    { id: 'home', label: '首页', marker: <span className="workbench-nav-marker"><Icon name="app-tab-home" size="lg" /></span> },
    { id: 'aira', label: 'AIRA', marker: <span className="workbench-aira-mark" aria-hidden="true">
      <Icon name="app-tab-aira" size="lg" />
    </span> },
    { id: 'mine', label: '我的', marker: <span className="workbench-nav-marker"><Icon name="app-tab-mine" size="lg" /></span> },
  ]} onSelect={id => id === 'aira' ? onAira() : onChange(id)} /></div>;
}
