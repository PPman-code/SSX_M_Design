import { Tabs } from '../../../components/ui/Tabs';
import { useCommunicationNavigation } from './useCommunicationNavigation';
import { useState } from 'react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { MobilePage } from '../../../components/ui/MobilePage';
import { PopoverMenu } from '../../../components/ui/PopoverMenu';
import { useToast } from '../../../components/ui/useToast';
import { AudioPreview } from './AudioPreview';
import { PageTitle } from './common';
import { activeRecord, canView, clockTime, dateTime, pendingRecord, statusLabels, type AIRecord } from './model';
import { deleteRecord, editRecord, processRecord, useCommunications } from './store';
import './ai-communication.css';

export function PendingRecordsPage() {
  const { params, actor, go } = useCommunicationNavigation();
  const { records, storageError } = useCommunications();
  const [deleting, setDeleting] = useState<AIRecord | null>(null);
  const pending = records.filter(record => params.get('state') !== 'forbidden' && record.customerId === params.get('customer') && pendingRecord(record, actor));
  const { showToast } = useToast();
  return <MobilePage title="待处理 AI 记录" className="ai-page ai-pending-page" previewChrome={params.get('chrome') === 'wechat'}>
    <PageTitle title="待处理 AI 记录" />
    <p className="ai-list-count">共 {pending.length} 条待处理 · 仅自己可见</p>
    <div className="ai-pending-list">{pending.map(record => {
      const view = () => go(record.status === 'transcribing' || record.status === 'summarizing' ? 'ai-recording' : 'ai-record', { record: record.id });
      return <article className="ai-pending-card" key={record.id}>
        <button className="ai-pending-main" onClick={view}><h2>{record.title}</h2><p><span>{dateTime(record.createdAt)} · {clockTime(record.duration)}</span><span className={`ai-status ai-status--${record.status}`}>{record.status === 'failed' ? `${record.failedStage === 'transcribing' ? '转写' : '总结'}失败，请重试` : statusLabels[record.status]}</span></p></button>
        <PopoverMenu label={`记录操作：${record.title}`} trigger={<Button className="ai-pending-more" variant="text" icon="more" iconOnly aria-label={`更多：${record.title}`} />} actions={[{ key: 'view', label: '查看', icon: 'eye', onSelect: view }, { key: 'delete', label: '删除', icon: 'a-delete-oneshanchu1', danger: true, onSelect: () => setDeleting(record) }]} />
      </article>;
    })}</div>
    {!pending.length && <div className="ai-empty"><Icon name="check-circle" size="lg" /><h2>暂无待处理记录</h2><p>新的 AI 记录处理完成后，会保留在这里。</p></div>}
    {storageError && <p className="ai-error" role="alert">本地存储失败，请检查可用空间后重试。</p>}

    <Dialog open={!!deleting} onOpenChange={open => { if (!open) setDeleting(null); }} title="删除 AI 记录？" actions={[{ label: '取消' }, { label: '删除', danger: true, onSelect: () => { if (deleting && !deleteRecord(deleting.id, actor)) showToast({ message: '删除失败，请检查可用空间后重试' }); } }]}><p>录音、转写和 AI 总结将被永久删除。删除后无法恢复。</p></Dialog>
  </MobilePage>;
}

export function RecordDetailPage() {
  const { params, actor, go } = useCommunicationNavigation();
  const state = useCommunications();
  const record = state.records.find(item => params.get('state') !== 'forbidden' && item.id === params.get('record') && canView(item, actor));
  const { showToast } = useToast();
  const [tab, setTab] = useState<'summary' | 'transcript'>('summary');
  const [position, setPosition] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState('title');
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [baseline, setBaseline] = useState('');
  const [editError, setEditError] = useState('');
  const [discard, setDiscard] = useState(false);
  const editable = record?.creator === actor;
  const dirty = draft !== baseline;
  function openEdit(key: string) {
    if (!record || !editable) return;
    const value = key === 'title' ? record.title : record.speakers[key];
    setDraft(value); setBaseline(value); setEditError(''); setEditing(key); setEditOpen(true);
  }
  function closeEdit() { if (dirty) setDiscard(true); else setEditOpen(false); }
  function saveEdit() {
    if (!record || !editing) return;
    if (!draft.trim()) { setEditError('请输入名称'); return; }
    if (editing === 'title' && Array.from(draft.trim()).length > 20) { setEditError('标题最多20字'); return; }
    if (!editRecord(record.id, actor, editing === 'title' ? { title: draft } : { speaker: editing, name: draft })) { setEditError('保存失败，请检查可用空间后重试'); return; }
    setEditOpen(false); showToast({ message: '已更新本次记录' });
  }
  function retry() {
    if (!navigator.onLine || params.get('network') === 'offline') { showToast({ message: '没有网络，请检查网络设置' }); return; }
    if (record && processRecord(record.id, actor)) go('ai-recording', { record: record.id });
    else showToast({ message: '本地存储失败，请检查可用空间后重试' });
  }
  const processing = record?.status === 'transcribing' || record?.status === 'summarizing';
  return <MobilePage title="AI 记录详情" className="ai-page ai-detail-page" previewChrome={params.get('chrome') === 'wechat'} footer={record && (record.status !== 'empty' || record.communicationId) ? <footer className="product-footer">
    {record.communicationId ? <Button block onClick={() => go('communication-form', { communication: record.communicationId! })}>查看沟通记录</Button>
      : record.status === 'ready' && editable ? <Button block onClick={() => go('communication-form', { record: record.id })}>生成沟通记录</Button>
      : editable && (record.status === 'failed' || record.status === 'interrupted') ? <Button block onClick={retry}>{record.status === 'failed' ? '重新处理' : '处理已保存片段'}</Button>
      : processing ? <Button block variant="soft" onClick={() => go('ai-recording', { record: record.id })}>查看处理进度</Button>
      : activeRecord(record) && editable ? <Button block onClick={() => go('ai-recording', { record: record.id })}>返回录音</Button>
      : <p className="ai-muted">未识别到有效沟通内容，无法生成沟通记录</p>}
  </footer> : undefined}>
    <PageTitle title="AI 记录详情" />
    {!record ? <div className="ai-empty"><Icon name="info-circle" size="lg" /><h2>记录不存在或暂无查看权限</h2><p>该记录可能已被删除，或尚未向你开放。</p></div> : <>
      <div className="ai-detail-header"><div className="ai-detail-title"><h2>{record.title}</h2>{editable && <Button className="ai-title-edit" variant="text" icon="pen" iconOnly aria-label="修改记录标题" onClick={() => openEdit('title')} />}{editable && !activeRecord(record) && <PopoverMenu label="AI 记录操作" trigger={<Button className="ai-pending-more" variant="text" icon="more" iconOnly aria-label="AI 记录操作" />} actions={[{ key: 'title', label: '修改标题', icon: 'pen', onSelect: () => openEdit('title') }, { key: 'delete', label: '删除 AI 记录', icon: 'a-delete-oneshanchu1', danger: true, onSelect: () => setDeleting(true) }]} />}</div><p className="ai-detail-meta"><span>{dateTime(record.createdAt)}</span><span>记录人：{record.creator}</span><span>关联学员：{record.customerName}</span></p><AudioPreview duration={record.duration} position={position} onPositionChange={setPosition} /></div>
      <Tabs className="ai-tabs" layout="content" indicator="label" label="AI 记录内容" value={tab} onValueChange={setTab} items={(['summary', 'transcript'] as const).map(key => ({ value: key, id: `ai-tab-${key}`, panelId: `ai-panel-${key}`, label: key === 'summary' ? 'AI 总结' : '完整转写' }))} />
      <section role="tabpanel" id={`ai-panel-${tab}`} aria-labelledby={`ai-tab-${tab}`} className="ai-detail-content">
        {tab === 'summary' ? record.summary ? <>{record.summary.split('\n\n').map((part, index) => { const [heading, ...body] = part.split('\n'); return <section key={heading} className={index === 0 ? 'ai-summary-core' : 'ai-summary-section'}><h3>{index === 0 && <Icon name="star-fill" size="sm" />}{heading}</h3><p>{body.join('\n')}</p></section>; })}<p className="ai-summary-notice">AI 根据沟通内容生成，请核对关键信息</p></> : <div className="ai-empty"><h2>{statusLabels[record.status]}</h2><p>{record.status === 'empty' ? <>未识别到有效内容，无法生成沟通记录。<br />请回听或删除本次记录。</> : '已有转写片段保留，可稍后处理。'}</p></div>
          : <><p className="ai-transcript-hint">点击文字定位回听{editable ? ' · 点击名称修改说话人' : ''}</p>{record.segments.map((segment, index) => <div className="ai-transcript-segment" key={index}><div><span className="ai-speaker-number">{segment.speaker}</span>{editable ? <Button variant="text" onClick={() => openEdit(segment.speaker)}>{record.speakers[segment.speaker]}<Icon name="pen" size="xs" /></Button> : <b>{record.speakers[segment.speaker]}</b>}<span className="ai-segment-time">{clockTime(segment.at)}</span></div><button className="ai-transcript-text" aria-label={`定位到 ${clockTime(segment.at)}`} onClick={() => setPosition(Math.min(record.duration, segment.at))}>{segment.text}</button></div>)}{!record.segments.length && <p className="ai-muted">暂无有效转写内容</p>}</>}
      </section>
    </>}
    <BottomSheet className="ai-editor-sheet" mode="editor" open={editOpen} onOpenChange={open => { if (!open) setEditOpen(false); }} onCloseRequest={closeEdit} title={editing === 'title' ? '修改标题' : '修改说话人'} footer={<Button block onClick={saveEdit}>{editing === 'title' ? '保存' : '保存并同步更新'}</Button>}>
      <p className="ai-edit-hint">{editing === 'title' ? '标题最多20字，不会由 AI 自动改名。' : '修改后，本次记录中该说话人的所有发言将同步更新。仅影响本次记录，不更新学员档案和 AI 总结。'}</p><Input layout="external" label={editing === 'title' ? '记录标题' : '说话人名称'} value={draft} onValueChange={setDraft} status={editError ? 'error' : 'default'} description={editError || undefined} />
    </BottomSheet>
    <Dialog stacked open={discard} onOpenChange={setDiscard} title="放弃本次修改？" actions={[{ label: '继续编辑' }, { label: '放弃修改', onSelect: () => setEditOpen(false) }]}><p>本次未保存的修改将被丢弃。</p></Dialog>
    <Dialog open={deleting} onOpenChange={setDeleting} title="删除 AI 记录？" actions={[{ label: '取消' }, { label: '删除', danger: true, onSelect: () => { if (!record) return; if (!deleteRecord(record.id, actor)) { showToast({ message: '删除失败，请检查可用空间后重试' }); return; } if (record.communicationId) go('communication-form', { communication: record.communicationId }); else go('customer-info', { record: null }); } }]}><p>录音、转写和 AI 总结将被永久删除。</p><p>{record?.communicationId ? '已提交的沟通记录将保留。' : '删除后无法恢复。'}</p></Dialog>
  </MobilePage>;
}
