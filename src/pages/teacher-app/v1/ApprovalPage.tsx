import { useId, useState } from 'react';
import { Icon } from '../../../components/ui/Icon';
import { Tabs } from '../../../components/ui/Tabs';
import { AppPage } from './AppPage';
import './approval-page.css';

type ApprovalTab = 'pending' | 'processed' | 'cc' | 'mine';

const approvalTabItems = [
  { value: 'pending', label: '待处理' },
  { value: 'processed', label: '已处理' },
  { value: 'cc', label: '抄送我的' },
  { value: 'mine', label: '我的申请' },
] as const;

const tabStatusCopy: Record<ApprovalTab, { title: string; description: string }> = {
  pending: { title: '待处理审批（1）', description: '审批列表与详情暂未接入，仅作页面与页签状态占位。' },
  processed: { title: '暂无已处理记录', description: '已审批通过或驳回的记录将在此展示。' },
  cc: { title: '暂无抄送记录', description: '抄送给我的审批单将在此展示。' },
  mine: { title: '暂无我的申请', description: '我发起的审批申请将在此展示。' },
};

export function ApprovalPage({ preview, onBack, onSearch }: { preview: boolean; onBack: () => void; onSearch: () => void }) {
  const id = useId();
  const [tab, setTab] = useState<ApprovalTab>('pending');
  const current = tabStatusCopy[tab];
  const items = approvalTabItems.map(item => ({ ...item, id: `${id}-tab-${item.value}`, panelId: `${id}-panel-${item.value}` }));

  return <AppPage title="审批" preview={preview} backIcon="left" backLabel="返回首页" onBack={onBack}
    actions={<button type="button" className="app-page-icon-button" aria-label="搜索审批" onClick={onSearch}><Icon name="search" /></button>}
    scrollKey={`approval-${tab}`}>
    <div className="approval-tabs-bar">
      <Tabs label="审批分类" items={items} value={tab} onValueChange={setTab} />
    </div>
    <div className="approval-status" id={`${id}-panel-${tab}`} role="tabpanel" aria-labelledby={`${id}-tab-${tab}`}>
      <span className="approval-status-art" aria-hidden="true">
        <img className="approval-status-image" src={`${import.meta.env.BASE_URL}illustrations/empty/guanzai-empty.png`} width="108" height="108" alt="" />
      </span>
      <h2>{current.title}</h2>
      <p>{current.description}</p>
    </div>
  </AppPage>;
}
