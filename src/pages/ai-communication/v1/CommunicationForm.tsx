import { useCommunicationNavigation } from './useCommunicationNavigation';
import { useRef, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Cell, CellGroup } from '../../../components/ui/Cell';
import { Toggle } from '../../../components/ui/Toggle';
import { CommunicationContentField } from './CommunicationContentField';
import { CommunicationDatePicker } from './CommunicationDatePicker';
import { MobilePage } from '../../../components/ui/MobilePage';
import { SheetSelectionList } from '../../../components/ui/SheetContent';
import { createCustomers, localDay } from '../../prospective-students/v1/model';
import { PageTitle } from './common';
import { submitCommunication, updateCommunication, useCommunications } from './store';
import './ai-communication.css';

export function CommunicationForm() {
  const { params, actor, go } = useCommunicationNavigation();
  const { records, communications } = useCommunications();
  const existing = communications.find(item => item.id === params.get('communication'));
  const editing = params.has('communication');
  const readOnly = !!existing && existing.creator !== actor;
  const record = records.find(item => item.id === (existing?.aiId ?? params.get('record')) && (item.creator === actor || !!existing) && item.status === 'ready');
  const customer = createCustomers().find(item => item.id === (existing?.customerId ?? record?.customerId ?? params.get('customer')));
  const ai = !editing && params.has('record');
  const allowed = params.get('state') !== 'forbidden' && !!customer && (editing ? !!existing && existing.customerId === customer.id : !ai || !!record && !record.communicationId);
  const title = existing ? readOnly ? '查看沟通记录' : '修改沟通记录' : '添加沟通记录';
  const initial = existing?.content ?? record?.summary ?? '';
  const [content, setContent] = useState(initial);
  const [result, setResult] = useState(existing?.result ?? '有效沟通');
  const [mode, setMode] = useState(existing?.mode ?? '');
  const [nextMode, setNextMode] = useState(existing?.nextMode ?? '');
  const [nextDate, setNextDate] = useState(existing?.nextDate ?? '');
  const [promisedVisit, setPromisedVisit] = useState(existing?.promisedVisit ?? false);
  const [visitDate, setVisitDate] = useState(existing?.visitDate ?? '');
  const [dateTarget, setDateTarget] = useState<'next' | 'visit'>('next');
  const [dateOpen, setDateOpen] = useState(false);
  const [dateDraft, setDateDraft] = useState(localDay());
  const [choice, setChoice] = useState<'result' | 'mode' | 'nextMode' | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);
  const attempts = useRef(0);
  async function submit() {
    if (!allowed || readOnly || busy.current || !customer) return;
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
    if (existing) {
      if (!updateCommunication(existing.id, actor, { content, result, mode, nextMode, nextDate, promisedVisit, visitDate: promisedVisit ? visitDate : '' })) {
        busy.current = false; setSaving(false); setError('保存失败，请检查本地存储后重试'); return;
      }
      go('customer-info', { communication: null, record: null }, { replace: true }); return;
    }
    const id = submitCommunication({ customerId: customer.id, creator: actor, content, result, mode, nextMode, nextDate, promisedVisit, visitDate: promisedVisit ? visitDate : '', source: record ? 'ai' : 'manual', aiId: record?.id });
    if (!id) { busy.current = false; setSaving(false); setError('提交失败，请检查本地存储后重试'); return; }
    busy.current = false; setSaving(false);
    go('communication-form', { communication: id, record: null }, { replace: true });
  }
  const labels = { result: '沟通情况', mode: '沟通类型', nextMode: '下次跟进类型' };
  const choices = choice === 'result' ? ['有效沟通', '无效沟通'] : ['未选择', '电话', '微信', '面谈', '其他'];
  return <MobilePage title={title} className="ai-page" previewChrome={params.get('chrome') === 'wechat'} footer={allowed && !readOnly ? <footer className="product-footer">{error && <p className="ai-error" role="alert">{error}</p>}<Button block loading={saving} loadingText={existing ? '保存中' : '提交中'} onClick={submit}>{existing ? '保存' : '提交'}</Button></footer> : undefined}>
    <PageTitle title={title} />
    {!allowed ? <div className="ai-empty"><h2>{record?.communicationId ? '该 AI 记录已提交' : '无法添加沟通记录'}</h2><p>请从客户主页或自己的 AI 记录重新进入。</p>{record?.communicationId && <Button onClick={() => go('communication-form', { communication: record.communicationId! })}>查看沟通记录</Button>}</div> : <>
      <p className="ai-form-person"><span className="ai-form-student">关联学员 <strong>{customer?.name}</strong></span>{(record || existing?.source === 'ai') && <span className="ai-form-source">来源：AI 实时记录</span>}</p>
      <div className="ai-form-fields"><CellGroup variant="block"><Cell disabled={readOnly} label="沟通情况" required value={result} arrow onClick={() => setChoice('result')} /><Cell disabled={readOnly} label="沟通类型" value={mode || '请选择'} arrow onClick={() => setChoice('mode')} /><Cell label="承诺到访" control={<Toggle disabled={readOnly} label="承诺到访" checked={promisedVisit} onChange={setPromisedVisit} />} />{promisedVisit && <Cell disabled={readOnly} label="到访日期" value={visitDate ? visitDate.replaceAll('-', '/') : '请选择'} arrow onClick={() => { setDateTarget('visit'); setDateDraft(visitDate || localDay()); setDateOpen(true); }} />}<Cell disabled={readOnly} label="下次跟进类型" required value={nextMode || '请选择'} arrow onClick={() => setChoice('nextMode')} /><Cell disabled={readOnly} label="下次跟进日期" value={nextDate ? nextDate.replaceAll('-', '/') : '待定'} arrow onClick={() => { setDateTarget('next'); setDateDraft(nextDate || localDay()); setDateOpen(true); }} /></CellGroup></div>
      <CommunicationContentField readOnly={readOnly} value={content} onChange={setContent} aiRecord={record ? { title: record.title, disabled: saving, onView: () => go('ai-record', { record: record.id }) } : undefined} invalid={!!error && (!content.trim() || Array.from(content).length > 1000)} />
      {record && !existing && <p className="ai-form-note">已填入 AI 总结，请核对后提交。其他字段需自行选择，AI 不会推断填写。</p>}
      {existing?.source === 'ai' && !record && <p className="ai-muted ai-deleted-note">原始 AI 记录已删除，已提交的沟通内容与来源保留。</p>}
    </>}
    <CommunicationDatePicker onPending={dateTarget === 'next' ? () => setNextDate('') : undefined} title={dateTarget === 'visit' ? '到访日期' : '下次跟进日期'} open={dateOpen} onOpenChange={setDateOpen} value={dateDraft} onChange={setDateDraft} today={localDay()} onConfirm={() => dateTarget === 'visit' ? setVisitDate(dateDraft) : setNextDate(dateDraft)} />
    <BottomSheet open={choice !== null} onOpenChange={open => { if (!open) setChoice(null); }} title={choice ? labels[choice] : '选择'}><SheetSelectionList label={choice ? labels[choice] : '选择'} options={choices.map(value => ({ value, label: value }))} value={choice === 'result' ? result : (choice === 'mode' ? mode : nextMode) || '未选择'} onChange={value => { const next = value === '未选择' ? '' : value; if (choice === 'result') setResult(next); else if (choice === 'mode') setMode(next); else setNextMode(next); setChoice(null); }} onReselect={() => setChoice(null)} /></BottomSheet>
  </MobilePage>;
}

export function CommunicationDetailPage() { return <CommunicationForm />; }
