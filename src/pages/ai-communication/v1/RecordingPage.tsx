import { useCommunicationNavigation } from './useCommunicationNavigation';
import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Dialog } from '../../../components/ui/Dialog';
import { Icon } from '../../../components/ui/Icon';
import { Loading } from '../../../components/ui/Loading';
import { MobilePage } from '../../../components/ui/MobilePage';
import { useToast } from '../../../components/ui/useToast';
import { clockTime, statusLabels } from './model';
import { createCustomers } from '../../prospective-students/v1/model';
import { pauseRecord, processRecord, useCommunications } from './store';
import { PageTitle, PrototypeNote } from './common';
import './ai-communication.css';

export function RecordingPage() {
  const { params, actor, go, backToCustomer } = useCommunicationNavigation();
  const { showToast } = useToast();
  const { records, storageError } = useCommunications();
  const record = records.find(item => params.get('state') !== 'forbidden' && item.id === params.get('record') && item.creator === actor);
  const customer = createCustomers().find(item => item.id === record?.customerId);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [online, setOnline] = useState(navigator.onLine && params.get('network') !== 'offline');
  useEffect(() => {
    function update() { setOnline(navigator.onLine && params.get('network') !== 'offline'); }
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, [params]);
  useEffect(() => {
    if (record?.status === 'ready' || record?.status === 'empty') go('ai-record', { record: record.id }, { replace: true });
  }, [record?.status, record?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const processing = record?.status === 'transcribing' || record?.status === 'summarizing';
  const working = record?.status === 'recording' || record?.status === 'paused';
  function finish() {
    if (!online) { showToast({ message: '没有网络，请检查网络设置' }); return; }
    if (record && !processRecord(record.id, actor)) showToast({ message: '本地存储失败，请检查可用空间' });
  }
  return <MobilePage title={processing ? '正在整理沟通' : 'AI 实时记录'} className="ai-page ai-recording-page" previewChrome={params.get('chrome') === 'wechat'} footer={record && working ? <footer className="product-footer"><div className="ai-record-actions"><Button variant="soft" onClick={() => pauseRecord(record.id, actor, record.status !== 'paused')}>{record.status === 'paused' ? '继续录音' : '暂停录音'}</Button><Button onClick={() => { if (!online) showToast({ message: '没有网络，请检查网络设置' }); else setConfirmEnd(true); }}>结束并生成总结</Button></div></footer> : undefined}>
    <PageTitle title={processing ? "正在整理沟通" : "AI 实时记录"} />
    {!record ? <div className="ai-empty"><h2>记录不存在或暂无查看权限</h2></div> : <>
      {working ? <>
        <div className="ai-record-identity"><span className="ai-avatar">{customer?.avatar ? <img src={customer.avatar} alt="" /> : record.customerName[0]}</span><div><h2>{record.customerName}</h2><p>关联学员 · 记录人 {record.creator}</p></div><Button variant="text" onClick={backToCustomer}>收起</Button></div>
        <div className="ai-recorder"><div className={`ai-record-state ${record.status === 'paused' ? 'is-paused' : ''}`}><span className="ai-record-dot" />{record.status === 'paused' ? '录音已暂停' : '正在录音 · 实时转写'}</div><p className="ai-record-timer">{clockTime(record.duration)}</p><div className={`ai-wave ${record.status === 'paused' ? 'is-paused' : ''}`} aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} style={{ height: `${10 + (i * 17 % 35)}px`, animationDelay: `${i * .09}s` }} />)}</div><p className="ai-muted">{record.status === 'paused' ? '点击继续录音，接着记录本次沟通' : '收起页面后，记录继续进行'}</p></div>
        {!online && <p role="alert" className="ai-warning">网络已断开，继续模拟录音，实时转写暂停。恢复网络后请手动结束。</p>}
        <section className="ai-live-content"><h2>实时转写<span>内容仅供参考</span></h2>{!record.segments.length && <p className="ai-muted">正在聆听，沟通内容将在这里呈现…</p>}{record.segments.map((segment, index) => <div className="ai-live-segment" key={index}><p><b>{record.speakers[segment.speaker]}</b><span>{clockTime(segment.at)}</span></p><div>{segment.text}</div></div>)}</section>
      </> : <div className="ai-processing"><div className="ai-processing-art"><Icon name="voice" size="lg" /></div><h2>{record.status === 'failed' ? '处理失败，请重试' : record.status === 'interrupted' ? '录音已中断' : '正在整理这次沟通'}</h2><p>{record.customerName} · {clockTime(record.duration)}</p>{processing && <div className="ai-process-steps"><p data-current={record.status === 'transcribing'}>{record.status === 'transcribing' ? <Loading /> : <Icon name="check-circle" size="md" />} 正在完成转写</p><p data-current={record.status === 'summarizing'}>{record.status === 'summarizing' ? <Loading /> : <span className="ai-step-dot" />} 正在生成 AI 总结</p></div>}
        {record.status === 'failed' && <><p>已有演示内容保留，将从失败环节重新处理。</p><Button onClick={finish}>重新处理</Button></>}
        {record.status === 'interrupted' && <><p>已保存的模拟片段在待处理中，不会自动恢复录音。</p><Button onClick={() => go('ai-record', { record: record.id })}>查看中断记录</Button></>}
        <Button variant="text" onClick={() => go('customer-info', { customer: record.customerId, record: null })}>返回学员，稍后查看</Button>
      </div>}
      {storageError && <p role="alert" className="ai-error">本地存储失败，模拟记录已停止，请检查可用空间。</p>}
      <PrototypeNote />
    </>}
    <Dialog open={confirmEnd} onOpenChange={setConfirmEnd} title="结束本次沟通记录？" actions={[{ label: '继续记录' }, { label: '结束记录', onSelect: finish }]}><p>结束后将补齐完整转写，并生成 AI 总结。你可以确认后再提交沟通记录。</p></Dialog>
    <span className="sr-only" role="status">{record && statusLabels[record.status]}</span>
  </MobilePage>;
}
