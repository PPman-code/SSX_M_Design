interface Props {
  pageId?: string;
  pageName?: string;
  paymentEnabled: boolean;
  onPaymentChange: (enabled: boolean) => void;
  role?: string;
  onRoleChange?: (role: string) => void;
}

export function WorkspaceConfig({ pageId, pageName, paymentEnabled, onPaymentChange, role, onRoleChange }: Props) {
  return <section className="workspace-config" aria-label="页面配置">
    <div className="config-heading"><h2>页面配置</h2><span>{pageName || '组件预览'}</span></div>
    {pageId?.startsWith('attendance') && <details className="config-group" open><summary>统计身份 <span>设计模拟</span></summary><label className="config-field">当前身份<select value={role || 'headmaster'} onChange={(event) => onRoleChange?.(event.target.value)}><option value="headmaster">班主任</option><option value="teacher">老师</option><option value="manager">学管师</option><option value="principal">校长（无报表权限）</option></select></label></details>}
    {pageId === 'my' && <details className="config-group" open><summary>页面状态 <span>设计模拟</span></summary><label className="config-field">收费管家状态<select value={paymentEnabled ? 'enabled' : 'unavailable'} onChange={(event) => onPaymentChange(event.target.value === 'enabled')}><option value="unavailable">未开通</option><option value="enabled">已开通</option></select></label></details>}
  </section>;
}
