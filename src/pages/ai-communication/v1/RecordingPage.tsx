import { RecordingWaveform } from './RecordingWaveform';
import { RecordingStatusPill } from './RecordingStatusPill';
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
import { PageTitle } from './common';
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
  return <MobilePage title={processing ? '正在整理沟通' : 'AI 实时记录'} className="ai-page ai-recording-page" previewChrome={params.get('chrome') === 'wechat'} footer={record && working ? <footer className="product-footer ai-recording-footer"><RecordingStatusPill paused={record.status === 'paused'} /><RecordingWaveform paused={record.status === 'paused'} /><div className="ai-record-actions"><span className="ai-record-timer" role="timer" aria-live="off">{clockTime(record.duration)}</span><Button className="ai-record-toggle" shape="round" aria-label={record.status === 'paused' ? '继续录音' : '暂停录音'} onClick={() => pauseRecord(record.id, actor, record.status !== 'paused')}>{record.status === 'paused' ? <Icon name="mic-ai-fill" size="lg" /> : <Icon name="pause-mini-fill" size="lg" />}</Button><Button variant="secondary" shape="round" className="ai-record-finish" onClick={() => { if (!online) showToast({ message: '没有网络，请检查网络设置' }); else setConfirmEnd(true); }}>结束录音</Button></div></footer> : undefined}>
    <PageTitle title={processing ? "正在整理沟通" : "AI 实时记录"} />
    {!record ? <div className="ai-empty"><h2>记录不存在或暂无查看权限</h2></div> : <>
      {working ? <>
        <div className="ai-record-identity"><span className="ai-avatar">{customer?.avatar ? <img src={customer.avatar} alt="" /> : record.customerName[0]}</span><div><h2>关联学员：{record.customerName}</h2><p>记录人：{record.creator}</p></div><Button variant="text" className="ai-record-minimize" onClick={backToCustomer}>收起<Icon name="down" size="sm" /></Button></div>
        {!online && <p role="alert" className="ai-warning">网络已断开，继续录音，实时转写暂停。恢复网络后请手动结束。</p>}
        <section className="ai-live-content"><h2>实时转写<span>Ai 识别可能存在偏差</span></h2>{!record.segments.length && <p className="ai-muted">正在聆听，沟通内容将在这里呈现…</p>}{record.segments.map((segment, index) => <div className="ai-live-segment" key={index}><p><b>{record.speakers[segment.speaker]}</b><span>{clockTime(segment.at)}</span></p><div>{segment.text}</div></div>)}</section>
      </> : <div className="ai-processing"><div className="ai-processing-art"><Icon name="mic-ai-fill" size="lg" /></div><h2>{record.status === 'failed' ? '处理失败，请重试' : record.status === 'interrupted' ? '录音已中断' : '正在整理这次沟通'}</h2><p>{clockTime(record.duration)}</p>{processing && <div className="ai-process-steps"><p><span className="ai-step-icon"><Icon name="check" size="md" /></span>已关联学员：{record.customerName}</p><p data-current={record.status === 'transcribing'}><span className="ai-step-icon">{record.status === 'transcribing' ? <Loading tone="inherit" /> : <Icon name="check" size="md" />}</span>{record.status === 'transcribing' ? '正在完成转写' : '录音与转写已保留'}</p><p data-current={record.status === 'summarizing'}><span className="ai-step-icon">{record.status === 'summarizing' ? <Loading tone="inherit" /> : <span className="ai-step-dot" />}</span>{record.status === 'summarizing' ? '正在生成沟通总结…' : '等待生成沟通总结'}</p></div>}
        {record.status === 'failed' && <><p>已有内容保留，将从失败环节重新处理。</p><Button onClick={finish}>重新处理</Button></>}
        {record.status === 'interrupted' && <><p>已保存的转写片段在待处理中，不会自动恢复录音。</p><Button onClick={() => go('ai-record', { record: record.id })}>查看中断记录</Button></>}
        <Button variant={processing ? 'primary' : 'text'} className="ai-processing-back" onClick={() => go('customer-info', { customer: record.customerId, record: null })}>返回学员，稍后查看</Button>
      </div>}
      {storageError && <p role="alert" className="ai-error">本地存储失败，记录已停止，请检查可用空间。</p>}

    </>}
    <Dialog open={confirmEnd} onOpenChange={setConfirmEnd} title="结束本次沟通记录？" actions={[{ label: '继续记录' }, { label: '结束记录', onSelect: finish }]}><p>结束后将补齐完整转写，并生成 AI 总结。你可以确认后再提交沟通记录。</p></Dialog>
    <span className="sr-only" role="status">{record && statusLabels[record.status]}</span>
  </MobilePage>;
}
