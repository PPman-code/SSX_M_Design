import { Toggle } from './ui/Toggle';
import { archivedBusinessPages, businessPages } from '../page-registry';

interface Props {
  pageId?: string;
  pageName?: string;
  classMultiple?: boolean;
  showRemainingSeats?: boolean;
  onClassMultipleChange?: (enabled: boolean) => void;
  onShowRemainingSeatsChange?: (enabled: boolean) => void;
  paymentEnabled: boolean;
  onPaymentChange: (enabled: boolean) => void;
  onVersionChange: (route: string) => void;
}

export function WorkspaceConfig({ pageId, pageName, paymentEnabled, onPaymentChange, onVersionChange, classMultiple = false, showRemainingSeats = true, onClassMultipleChange, onShowRemainingSeatsChange }: Props) {
  const current = [...businessPages, ...archivedBusinessPages].find((page) => page.id === pageId);
  const versions = [...archivedBusinessPages, ...businessPages].filter((page) => page.name === current?.name);
  return <section className="workspace-config" aria-label="页面配置">
    <div className="config-heading"><h2>页面配置</h2><div className="config-page-version"><span>{pageName || '组件预览'}</span>{versions.length > 1 && <select aria-label="页面版本" value={current?.route} onChange={(event) => onVersionChange(event.target.value)}>{versions.map((page) => <option key={page.id} value={page.route}>{page.version}</option>)}</select>}</div></div>
    {pageId === 'parent-course-detail' && <div className="config-toggles">
      <div className="config-toggle-row"><span>班级多选</span><Toggle label="班级多选" checked={classMultiple} onChange={onClassMultipleChange} /></div>
      <div className="config-toggle-row"><span>剩余席位</span><Toggle label="剩余席位" checked={showRemainingSeats} onChange={onShowRemainingSeatsChange} /></div>
    </div>}
    {pageId === 'my'  && <details className="config-group" open><summary>页面状态 <span>设计模拟</span></summary><label className="config-field">收费管家状态<select value={paymentEnabled ? 'enabled' : 'unavailable'} onChange={(event) => onPaymentChange(event.target.value === 'enabled')}><option value="unavailable">未开通</option><option value="enabled">已开通</option></select></label></details>}
  </section>;
}
