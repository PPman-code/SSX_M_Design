import { CommunicationCard } from './CommunicationCard';
import { useCustomerStickyHeader } from './useCustomerStickyHeader';
import { Tabs } from '../../../components/ui/Tabs';
import { useCommunicationNavigation } from './useCommunicationNavigation';
import { useEffect, useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { RecordingScenarios } from './RecordingScenarios';
import { SheetActions } from '../../../components/ui/SheetContent';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { CustomerHistoryFilters } from './CustomerHistoryFilters';
import { emptyHistoryFilter, matchesHistory } from './history-filter';
import { Button } from '../../../components/ui/Button';
import { MobilePage } from '../../../components/ui/MobilePage';
import { Icon } from '../../../components/ui/Icon';
import { Dialog } from '../../../components/ui/Dialog';
import { useToast } from '../../../components/ui/useToast';
import { createCustomers } from '../../prospective-students/v1/model';
import { activeRecord, pendingRecord } from './model';
import { openCommunicationSample, seedScenario, startRecord, useCommunications } from './store';
import { createCommunicationSamples } from './communication-samples';
import { PageTitle } from './common';
import { ListEnd } from '../../../components/ui/ListEnd';
import './ai-communication.css';

export function CustomerInfoPage() {
  const { params, actor, go } = useCommunicationNavigation();
  const { showToast } = useToast();
  const state = useCommunications();
  const customer = createCustomers().find(item => item.id === params.get('customer'));
  const [startOpen, setStartOpen] = useState(false);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [startError, setStartError] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [tab, setTab] = useState('沟通记录');
  const [historyFilter, setHistoryFilter] = useState(emptyHistoryFilter);
  const active = state.records.find(activeRecord);
  const currentRecording = active?.creator === actor && active.customerId === customer?.id ? active : undefined;
  const recordingLabel = currentRecording ? currentRecording.status === 'paused' ? 'AI 记录暂停' : 'AI 记录中' : 'AI 实时记录';
  const pending = state.records.filter(record => record.customerId === customer?.id && pendingRecord(record, actor));
  const communications = state.communications.filter(item => item.customerId === customer?.id && matchesHistory(item, historyFilter));
  const samples = createCommunicationSamples(customer?.id ?? '').filter(item => !state.communications.some(saved => saved.id === item.id) && matchesHistory(item, historyFilter));
  const forbidden = params.get('state') === 'forbidden';
  const { headerRef, markerRef, pinned: tabsStuck } = useCustomerStickyHeader(!!customer && !forbidden, customer?.id);
  const scenario = params.get('scenario') ?? '';
  useEffect(() => { if (customer && !forbidden) seedScenario(customer.id, customer.name, actor, scenario); }, [customer?.id, customer?.name, actor, scenario, forbidden]); // eslint-disable-line react-hooks/exhaustive-deps
  function openRecorder() {
    if (active) {
      if (currentRecording) go('ai-recording', { customer: currentRecording.customerId, record: currentRecording.id });
      else setConflictOpen(true);
    } else { setStartError(''); setStartOpen(true); }
  }
  function begin() {
    if (!customer) return;
    if (!navigator.onLine || params.get('start') === 'offline') { setStartError('没有网络，请检查网络设置'); return; }
    if (params.get('mic') === 'denied') { setStartError('请开启麦克风权限后重试'); return; }
    if (active && (active.customerId !== customer.id || active.creator !== actor)) { setStartOpen(false); setConflictOpen(true); return; }
    const record = startRecord(customer.id, customer.name, actor);
    if (!record) { setStartError('本地存储不可用，未开始记录，请检查可用空间'); return; }
    setStartOpen(false); go('ai-recording', { customer: record.customerId, record: record.id });
  }
  return <MobilePage title={tabsStuck && customer && !forbidden ? customer.name : "意向客户信息"} className="ai-page ai-customer-page" previewChrome={params.get('chrome') === 'wechat'} footer={customer && !forbidden && tab === '沟通记录' ? <footer className="ai-entry-footer">
    <Button className="ai-start-button" data-recording={currentRecording?.status === 'recording' || undefined} variant="soft" shape="round" aria-label={recordingLabel} onClick={openRecorder}><span>{currentRecording?.status === 'recording' ? <span className="ai-recording-wave" aria-hidden="true"><i /><i /><i /></span> : <Icon name="mic-ai-fill" size="base" />} {recordingLabel}<small>{currentRecording ? '点击可以进入录制页面' : '记录与家长的沟通过程'}</small></span></Button>
    <Button shape="round" onClick={() => go('communication-form', { record: null, communication: null })}>添加沟通记录</Button>
  </footer> : undefined}>
    <PageTitle title="意向客户信息" />
    {!customer || forbidden ? <div className="ai-empty"><Icon name="info-circle" size="lg" /><h2>{forbidden ? '暂无客户查看权限' : '未找到客户'}</h2><p>请从意向客户管理进入</p></div> : <>
      <button className="ai-customer-card ai-customer-profile" onClick={() => setInfoOpen(true)} aria-label="查看客户资料"><span className="ai-avatar">{customer.avatar ? <img src={customer.avatar} alt="" /> : customer.name[0]}</span><div><h2>{customer.name} {customer.gender && <span className={`ai-gender ai-gender--${customer.gender}`} aria-label={customer.gender === 'male' ? '男' : '女'}><Icon name={customer.gender === 'male' ? 'man' : 'woman'} size="xs" /></span>}</h2><p>录入时间：{customer.inputDate}</p></div><Icon name="right" size="base" /></button>
      <div ref={markerRef} className="ai-tabs-sentinel" aria-hidden="true" />
      <div ref={headerRef} className="ai-customer-navigation"><div className="ai-customer-actions" aria-label="客户业务操作">{([['转正式学员', 'zhuanzhengshixueyuan'], ['转试听学员', 'zhuanshitingxueyuan'], ['取消转化', 'quxiaozhuanhua']] as const).map(([label, icon]) => <Button key={label} variant="text" size="sm" icon={icon} onClick={() => showToast({ message: `${label}请在现有业务系统中办理` })}>{label}</Button>)}</div>
      <Tabs className="ai-customer-tabs" data-stuck={tabsStuck || undefined} label="客户详情分类" value={tab} onValueChange={setTab} items={['沟通记录', '试听记录', '优惠券', '意向课程'].map((label, index) => ({ value: label, label, id: `customer-tab-${index}`, panelId: 'customer-history-panel' }))} />
      {tab === '沟通记录' && pending.length > 0 && <div className="ai-pending-dock"><button className="ai-pending-entry" onClick={() => pending.length === 1 ? go('ai-record', { record: pending[0].id }) : go('ai-pending', { record: null })}><span><Icon name="mic-ai-fill" size="base" /> AI 记录 · {pending.length} 条待处理</span><Icon name="right" size="base" /></button></div>}
      </div>
      <div id="customer-history-panel" role="tabpanel" aria-labelledby={`customer-tab-${['沟通记录', '试听记录', '优惠券', '意向课程'].indexOf(tab)}`}>
      {tab === '沟通记录' ? <div className="ai-customer-content">
        <CustomerHistoryFilters value={historyFilter} onChange={setHistoryFilter} />
        {state.storageError && <p role="alert" className="ai-error">本地存储失败，记录已暂停，请检查可用空间。</p>}
        {communications.map(item => <CommunicationCard key={item.id} item={item} onEdit={() => go('communication-form', { communication: item.id, record: null })} onViewAI={item.aiId ? () => go('ai-record', { record: item.aiId! }) : undefined} />)}
        {samples.map(item => <CommunicationCard key={item.id} item={item} onEdit={() => { if (openCommunicationSample(item)) go('communication-form', { communication: item.id, record: null }); else showToast({ message: '本地存储不可用，请检查后重试' }); }} />)}
        {!samples.length && !communications.length && <div className="ai-empty"><h2>暂无符合条件的沟通记录</h2><Button variant="soft" onClick={() => setHistoryFilter(emptyHistoryFilter())}>清除筛选</Button></div>}
        {(samples.length > 0 || communications.length > 0) && <ListEnd />}
      </div> : <div className="ai-empty"><h2>{tab}</h2><p>该业务请在现有系统中查看，本次新增 AI 沟通记录。</p></div>}
      </div>
      <BottomSheet open={infoOpen} onOpenChange={setInfoOpen} title="客户资料"><CellGroup variant="block"><Cell label="姓名" value={customer.name} /><Cell label="客户状态" value={customer.status} /><Cell label="主责任人" value={customer.owner} /><Cell label="联系电话" value={params.get('phone') === 'masked' ? customer.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : customer.phone} /><Cell label="所属校区" value={customer.campus} /><Cell label="公立学校" value={customer.school} /><Cell label="意向课程" value={customer.custom.course} /></CellGroup></BottomSheet>
    </>}
    <BottomSheet open={startOpen} onOpenChange={setStartOpen} title="开启 AI 沟通记录" className="ai-editor-sheet ai-start-sheet" description="实时记录沟通，结束后自动提炼要点，由你确认后提交。" footer={<>{startError && <p className="ai-error" role="alert">{startError}</p>}<p className="ai-start-student"><span>关联学员：</span><strong>{customer?.name}</strong></p><SheetActions primary={{ label: '开始记录', onClick: begin }} /></>}>
      <RecordingScenarios />
      <ol className="ai-start-reminder"><li>开始前请告知对方并取得同意。</li><li>手机尽量靠近双方，确保收音清晰。</li><li>同一手机通话时无法保证完整收音。</li></ol>
    </BottomSheet>
    <Dialog open={conflictOpen} onOpenChange={setConflictOpen} title={active?.creator === actor ? '已有录音未结束' : '设备正在录音'} actions={active?.creator === actor ? [{ label: '取消' }, { label: active.status === 'paused' ? '返回录音' : '继续录音', onSelect: () => go('ai-recording', { customer: active.customerId, record: active.id }) }] : [{ label: '知道了' }]}>
      <p>{active?.creator === actor ? `${active.customerName} · ${active.status === 'paused' ? '录音已暂停' : '录音中'}` : `${active?.creator ?? '其他老师'}正在为${active?.customerName ?? '其他学员'}录音`}</p>
      <p>{active?.creator === actor ? '开启新记录前，请先结束这条录音。' : '请由原记录人结束后再试。'}</p>
    </Dialog>
  </MobilePage>;
}
