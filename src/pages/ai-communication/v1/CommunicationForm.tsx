import { useCommunicationNavigation } from './useCommunicationNavigation';
import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { Input } from '../../../components/ui/Input';
import { MobilePage } from '../../../components/ui/MobilePage';
import { SheetSelectionList } from '../../../components/ui/SheetContent';
import { createCustomers, localDay } from '../../prospective-students/v1/model';
import { PageTitle, PrototypeNote } from './common';
import { dateTime } from './model';
import { submitCommunication, useCommunications } from './store';
import './ai-communication.css';

export function CommunicationForm() {
  const { params, actor, go } = useCommunicationNavigation();
  const { records } = useCommunications();
  const record = records.find(item => item.id === params.get('record') && item.creator === actor && item.status === 'ready');
  const customer = createCustomers().find(item => item.id === (record?.customerId ?? params.get('customer')));
  const ai = params.has('record');
  const allowed = params.get('state') !== 'forbidden' && !!customer && (!ai || !!record && !record.communicationId);
  const initial = record?.summary ?? '';
  const [content, setContent] = useState(initial);
  const [result, setResult] = useState('有效沟通');
  const [mode, setMode] = useState('');
  const [nextMode, setNextMode] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [choice, setChoice] = useState<'result' | 'mode' | 'nextMode' | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const attempts = useRef(0);
  async function submit() {
    if (!allowed || busy.current || !customer) return;
    if (!content.trim()) { setError('请输入沟通内容'); return; }
    if (Array.from(content).length > 1000) { setError('沟通内容不能超过1000字，请编辑后提交，不会自动截断'); return; }
    if (!result) { setError('请选择沟通情况'); return; }
    if (nextDate && nextDate < localDay()) { setError('下次跟进日期不能小于今天'); return; }
    if (!navigator.onLine) { setError('没有网络，请检查网络设置'); return; }
    busy.current = true; setSaving(true); setError('');
    await new Promise(resolve => setTimeout(resolve, 350));
    attempts.current++;
    if (params.get('save') === 'error' && attempts.current === 1) {
      busy.current = false; setSaving(false); setError('提交失败，请重试。当前填写内容已保留。'); return;
    }
    const id = submitCommunication({ customerId: customer.id, creator: actor, content, result, mode, nextMode, nextDate, source: record ? 'ai' : 'manual', aiId: record?.id });
    if (!id) { busy.current = false; setSaving(false); setError('提交失败，请检查本地存储后重试'); return; }
    go('communication-detail', { communication: id, record: null }, { replace: true });
  }
  const labels = { result: '沟通情况', mode: '沟通类型', nextMode: '下次跟进类型' };
  const choices = choice === 'result' ? ['有效沟通', '无效沟通'] : ['未选择', '电话', '微信', '面谈', '其他'];
  return <MobilePage title="添加沟通记录" className="ai-page" previewChrome={params.get('chrome') === 'wechat'} footer={allowed ? <footer className="product-footer">{error && <p className="ai-error" role="alert">{error}</p>}<Button block loading={saving} loadingText="提交中" onClick={submit}>提交</Button></footer> : undefined}>
    <PageTitle title="添加沟通记录" />
    {!allowed ? <div className="ai-empty"><h2>{record?.communicationId ? '该 AI 记录已提交' : '无法添加沟通记录'}</h2><p>请从客户主页或自己的 AI 记录重新进入。</p>{record?.communicationId && <Button onClick={() => go('communication-detail', { communication: record.communicationId! })}>查看沟通记录</Button>}</div> : <>
      <p className="ai-form-person">关联学员 <strong>{customer?.name}</strong>{record && <span>来源：AI 实时记录</span>}</p>
      <div className="ai-form-fields"><CellGroup variant="block"><Cell label="沟通情况" required value={result} arrow onClick={() => setChoice('result')} /><Cell label="沟通类型" value={mode || '请选择'} arrow onClick={() => setChoice('mode')} /><Cell label="下次跟进类型" value={nextMode || '请选择'} arrow onClick={() => setChoice('nextMode')} /><Input label="下次跟进日期" type="date" value={nextDate} min={localDay()} onValueChange={setNextDate} /></CellGroup></div>
      <div className="ai-content-field"><label htmlFor="communication-content">沟通内容 <span aria-hidden="true">*</span></label><textarea aria-label="沟通内容" id="communication-content" aria-required="true" aria-invalid={!!error && (!content.trim() || Array.from(content).length > 1000)} value={content} onChange={event => setContent(event.target.value)} placeholder="请输入沟通内容" rows={12} /><p className={Array.from(content).length > 1000 ? 'ai-error' : 'ai-muted'}>{Array.from(content).length} / 1000</p></div>
      {record && <p className="ai-form-note">已填入 AI 总结，请核对后提交。其他字段需自行选择，AI 不会推断填写。</p>}<PrototypeNote />
    </>}
    <BottomSheet open={choice !== null} onOpenChange={open => { if (!open) setChoice(null); }} onBack={() => setChoice(null)} title={choice ? labels[choice] : '选择'}><SheetSelectionList label={choice ? labels[choice] : '选择'} options={choices.map(value => ({ value, label: value }))} value={choice === 'result' ? result : (choice === 'mode' ? mode : nextMode) || '未选择'} onChange={value => { const next = value === '未选择' ? '' : value; if (choice === 'result') setResult(next); else if (choice === 'mode') setMode(next); else setNextMode(next); setChoice(null); }} onReselect={() => setChoice(null)} /></BottomSheet>
  </MobilePage>;
}

export function CommunicationDetailPage() {
  const { params, go } = useCommunicationNavigation();
  const { records, communications } = useCommunications();
  const item = communications.find(communication => communication.id === params.get('communication'));
  const customer = createCustomers().find(person => person.id === item?.customerId);
  const record = records.find(record => record.id === item?.aiId);
  return <MobilePage title="沟通记录详情" className="ai-page" previewChrome={params.get('chrome') === 'wechat'}>
    <PageTitle title="沟通记录详情" />
    {!item || params.get('state') === 'forbidden' ? <div className="ai-empty"><h2>记录不存在或暂无查看权限</h2></div> : <div className="ai-formal-detail"><h2>{customer?.name}的沟通记录</h2><p className="ai-muted">{dateTime(item.createdAt)} · {item.creator}</p><span className="ai-source-tag">{item.source === 'ai' ? '来源：AI 实时记录' : '来源：手动添加'}</span><section><h3>沟通内容</h3><p className="ai-content-text">{item.content}</p></section><CellGroup variant="block"><Cell label="沟通情况" value={item.result} /><Cell label="沟通类型" value={item.mode || '未选择'} /><Cell label="下次跟进类型" value={item.nextMode || '未选择'} /><Cell label="下次跟进日期" value={item.nextDate || '待定'} /></CellGroup>
      {record && <div className="ai-linked-record"><div><IconLabel /> <strong>{record.title}</strong><p>{record.creator} · 录音时长 {Math.floor(record.duration / 60)}分{record.duration % 60}秒</p></div><Button variant="text" onClick={() => go('ai-record', { record: record.id })}>查看 AI 记录</Button></div>}
      {item.source === 'ai' && !record && <p className="ai-muted ai-deleted-note">原始 AI 记录已删除，已提交的沟通内容与来源保留。</p>}<PrototypeNote />
    </div>}
  </MobilePage>;
}
function IconLabel() { return <span className="ai-source-mark">AI</span>; }
