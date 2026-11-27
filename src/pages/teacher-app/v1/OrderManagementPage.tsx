import { useId, useRef, useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { ListEnd } from '../../../components/ui/ListEnd';
import { PopoverMenu } from '../../../components/ui/PopoverMenu';
import { Search } from '../../../components/ui/Search';
import { SheetActions, SheetSelectionList } from '../../../components/ui/SheetContent';
import { Tabs } from '../../../components/ui/Tabs';
import { Tag, type TagTone } from '../../../components/ui/Tag';
import { useToast } from '../../../components/ui/useToast';
import { AppPage } from './AppPage';
import { BusinessDataAira } from './BusinessData';
import { demoOrders, orderCampuses, type DemoOrder, type OrderStatus } from './order-demo';
import './order-management.css';

const statusLabels: Record<OrderStatus, { label: string; tone: TagTone }> = {
  unpaid: { label: '未付款', tone: 'warning' },
  paid: { label: '已付款', tone: 'success' },
  closed: { label: '已关闭', tone: 'neutral' },
  expired: { label: '已失效', tone: 'neutral' },
};
const statusTabs = ['all', 'closed', 'paid', 'expired'] as const;
const paymentOptions = [
  { value: 'all', label: '全部' },
  { value: 'outstanding', label: '待收款' },
  { value: 'settled', label: '已结清' },
];
const currency = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });
const maker = '李老师';

type OrderTab = typeof statusTabs[number];
type OrderAction = 'details' | 'payment' | 'contract';

function canCollect(order: DemoOrder) {
  return (order.status === 'unpaid' || order.status === 'paid') && order.received < order.due;
}

function OrderCard({ order, onAction }: { order: DemoOrder; onAction: (action: OrderAction) => void }) {
  const status = statusLabels[order.status];
  const products = order.products.join(' | ');
  return <article className="order-card" aria-label={`${order.student}的订单`}>
    <div className="order-card-heading">
      <div>
        <p className="order-number">订单编号：{order.number}</p>
        <h2>{order.student} <span>({order.studentNumber})</span></h2>
      </div>
      <Tag tone={status.tone} size="lg">{status.label}</Tag>
    </div>
    <div className="order-products">
      <span title={products}>{products}</span>
      {order.products.length > 1 && <small>共{order.products.length}项</small>}
    </div>
    <dl className="order-amounts">
      <div><dt>应收</dt><dd>{currency.format(order.due)}</dd></div>
      {order.status === 'paid' && <div><dt>实收</dt><dd>{currency.format(order.received)}</dd></div>}
      {order.status === 'paid' && canCollect(order) && <div className="order-balance"><dt>欠交</dt><dd>{currency.format(order.due - order.received)}</dd></div>}
    </dl>
    <div className="order-card-footer">
      <span>制单人：{maker}</span>
      <div className="order-card-actions">
        {order.status === 'unpaid' && <PopoverMenu label="订单操作"
          trigger={<Button variant="outline" iconOnly icon="more" aria-label={`${order.student}的更多订单操作`} />}
          actions={[{ key: 'details', label: '查看订单', icon: 'bill-line', onSelect: () => onAction('details') }]} />}
        {order.status === 'paid' && <Button variant="soft" onClick={() => onAction('contract')}>{order.hasContract ? '查看合同' : '生成合同'}</Button>}
        {canCollect(order) && <Button onClick={() => onAction('payment')}>去收款</Button>}
      </div>
    </div>
  </article>;
}

export function OrderManagementPage({ preview, backLabel, onBack, onOpenAira }: {
  preview?: boolean;
  backLabel: string;
  onBack: () => void;
  onOpenAira: () => void;
}) {
  const { showToast } = useToast();
  const id = useId();
  const campusButton = useRef<HTMLButtonElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const controls = useRef<HTMLDivElement>(null);
  const [orders, setOrders] = useState(demoOrders);
  const [tab, setTab] = useState<OrderTab>('all');
  const [campus, setCampus] = useState('all');
  const [campusOpen, setCampusOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [draftPayment, setDraftPayment] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [detail, setDetail] = useState<{ action: OrderAction; number: string } | null>(null);

  const keyword = query.trim().toUpperCase();
  const matches = orders.filter(order =>
    (campus === 'all' || campus === order.campus) &&
    (!keyword || [order.student, order.studentNumber, order.phone].some(value => value.includes(keyword))) &&
    (paymentFilter === 'all' || (paymentFilter === 'outstanding' ? canCollect(order) : order.status === 'paid' && order.due === order.received)));
  const visibleOrders = tab === 'all' ? matches : matches.filter(order => order.status === tab);
  const selectedOrder = detail ? orders.find(order => order.number === detail.number) : undefined;
  const selectedCampus = orderCampuses.find(option => option.value === campus)?.label;

  function selectCampus(value: string) {
    setCampus(value);
    setCampusOpen(false);
  }

  function showOrderAction(order: DemoOrder, action: OrderAction) {
    if (action === 'contract' && !order.hasContract) {
      setOrders(current => current.map(item => item.number === order.number ? { ...item, hasContract: true } : item));
    }
    setDetail({ action, number: order.number });
  }

  function collectPayment(order: DemoOrder) {
    setOrders(current => current.map(item => item.number === order.number ? { ...item, received: item.due, status: 'paid' } : item));
    setDetail(null);
    showToast({ message: '模拟收款成功' });
  }

  function resetList() {
    setQuery('');
    setCampus('all');
    setPaymentFilter('all');
    setTab('all');
  }

  const detailTitle = detail?.action === 'payment' ? '订单收款' : detail?.action === 'contract' ? '合同预览' : '订单详情';

  return <AppPage title="订单管理" preview={preview} backLabel={backLabel} onBack={onBack}
    className="order-management" scrollKey="order-management"
    navTitle={<>
      <h1 className="sr-only">订单管理</h1>
      <Button ref={campusButton} className="order-campus-button" variant="text" aria-label={`切换校区：${selectedCampus}`}
        aria-haspopup="dialog" aria-expanded={campusOpen} onClick={() => setCampusOpen(true)}>
        <span>{selectedCampus}</span><Icon name="down" size="sm" />
      </Button>
    </>}
    actions={<button type="button" className="app-page-icon-button" aria-label="学员收费"
      onClick={() => showToast({ message: '学员收费功能请在现有业务系统中办理' })}>
      <Icon name="chart-pie-2-line" size="base" />
    </button>}
    footer={<BusinessDataAira onOpen={onOpenAira} />}>
    <div ref={controls} className="order-controls">
      <Search label="搜索学员订单" placeholder="搜索姓名/学号/手机号" value={query} onValueChange={setQuery}
        actions={<button ref={filterButton} type="button" className="icon-button touch-target order-filter-button"
          aria-label="筛选订单" aria-haspopup="dialog" aria-expanded={filterOpen} data-active={paymentFilter !== 'all' || undefined}
          onClick={() => { setDraftPayment(paymentFilter); setFilterOpen(true); }}>
          <Icon name="list-filter" size="base" />
        </button>} />
      <Tabs label="订单状态" value={tab} onValueChange={value => {
        setTab(value);
        controls.current?.parentElement?.scrollTo({ top: 0 });
      }} items={statusTabs.map(value => ({
        value,
        label: `${value === 'all' ? '全部' : statusLabels[value].label} (${value === 'all' ? matches.length : matches.filter(order => order.status === value).length})`,
        id: `${id}-tab-${value}`,
        panelId: `${id}-panel-${value}`,
      }))} />
    </div>
    {statusTabs.map(value => <section key={value} id={`${id}-panel-${value}`} role="tabpanel" aria-labelledby={`${id}-tab-${value}`} hidden={value !== tab}>
      {value === tab && <div className="order-list">
        {visibleOrders.length > 0 ? <>
          <ul className="order-cards">
            {visibleOrders.map(order => <li key={order.number}><OrderCard order={order} onAction={action => showOrderAction(order, action)} /></li>)}
          </ul>
          <ListEnd />
        </> : <div className="order-empty">
          <p>暂无符合条件的订单</p>
          <Button variant="soft" onClick={resetList}>重置筛选</Button>
        </div>}
      </div>}
    </section>)}

    <BottomSheet open={campusOpen} onOpenChange={setCampusOpen} title="选择校区" finalFocus={campusButton}>
      <SheetSelectionList label="校区" options={orderCampuses} value={campus} onChange={selectCampus} onReselect={selectCampus} />
    </BottomSheet>
    <BottomSheet open={filterOpen} onOpenChange={setFilterOpen} title="筛选订单" finalFocus={filterButton}
      footer={<SheetActions secondary={{ label: '重置', onClick: () => { setPaymentFilter('all'); setFilterOpen(false); } }}
        primary={{ label: '确定', onClick: () => { setPaymentFilter(draftPayment); setFilterOpen(false); } }} />}>
      <SheetSelectionList label="收款情况" options={paymentOptions} value={draftPayment} onChange={setDraftPayment} />
    </BottomSheet>
    <BottomSheet open={!!selectedOrder} onOpenChange={open => { if (!open) setDetail(null); }} title={detailTitle}
      description={detail?.action === 'payment' ? '模拟收款，仅更新当前页面的演示订单。' : detail?.action === 'contract' ? '订单合同示例' : undefined}
      footer={selectedOrder && detail?.action === 'payment' ? <SheetActions primary={{ label: '确认模拟收款', onClick: () => collectPayment(selectedOrder) }} /> : undefined}>
      {selectedOrder && <dl className="order-detail">
        <div><dt>订单编号</dt><dd>{selectedOrder.number}</dd></div>
        <div><dt>学员</dt><dd>{selectedOrder.student} ({selectedOrder.studentNumber})</dd></div>
        <div><dt>购买项目</dt><dd>{selectedOrder.products.join('、')}</dd></div>
        <div><dt>{detail?.action === 'payment' ? '本次收款' : '应收金额'}</dt>
          <dd>{currency.format(detail?.action === 'payment' ? selectedOrder.due - selectedOrder.received : selectedOrder.due)}</dd></div>
      </dl>}
    </BottomSheet>
  </AppPage>;
}
